import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { Credential } from '../models/Credential';
import { Issuer } from '../models/Issuer';
import { Proof } from '../models/Proof';
import {
  buildMerkleTree,
  computeLeafHash,
  generateProof,
} from '../services/merkle';
import { publishMerkleRoot } from '../services/solana';

const router = Router();

// ─── Helper: rebuild tree from all issuer credentials ────────────────────────
async function rebuildIssuerTree(issuerId: string) {
  const creds = await Credential.find({ issuerId }).lean();

  const leafHashes = creds.map((c) =>
    computeLeafHash(c.credentialId, c.subjectDid, c.issuerDid, c.status)
  );

  const { root, tree } = buildMerkleTree(leafHashes);
  return { root, tree, creds, leafHashes };
}

// ─── POST /credential/issue ───────────────────────────────────────────────────
router.post(
  '/issue',
  [
    body('issuerId').isString().notEmpty(),
    body('subjectDid').isString().notEmpty(),
    body('subjectName').isString().notEmpty(),
    body('credentialType').isString().notEmpty(),
    body('credentialData').optional().isObject(),
    body('expiryDate').optional({ checkFalsy: true }).isISO8601(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { issuerId, subjectDid, subjectName, credentialType, credentialData, expiryDate } = req.body;

    try {
      const issuer = await Issuer.findOne({ issuerId });
      if (!issuer) {
        res.status(404).json({ success: false, message: 'Issuer not found' });
        return;
      }

      const credentialId = uuidv4();
      const leafHash = computeLeafHash(credentialId, subjectDid, issuer.did, 'ACTIVE');

      // Save credential first (status=ACTIVE)
      const credential = await Credential.create({
        credentialId,
        issuerId,
        issuerDid: issuer.did,
        subjectDid,
        subjectName,
        credentialType,
        credentialData: credentialData || {},
        status: 'ACTIVE',
        leafHash,
        merkleRoot: 'PENDING', // filled below
        issuedAt: new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      });

      // Rebuild tree for this issuer
      const { root, tree, leafHashes } = await rebuildIssuerTree(issuerId);

      // Publish new root on-chain
      const newVersion = issuer.rootVersion + 1;
      const txSig = await publishMerkleRoot(issuerId, root, newVersion);

      // Update credential with real root
      credential.merkleRoot = root;
      credential.txSignature = txSig;
      await credential.save();

      // Update issuer root
      await Issuer.updateOne(
        { issuerId },
        {
          merkleRoot: root,
          rootVersion: newVersion,
          txSignature: txSig,
          $inc: { credentialCount: 1 },
        }
      );

      // Generate and store proof for this credential
      const thisLeafHash = computeLeafHash(credentialId, subjectDid, issuer.did, 'ACTIVE');
      const proofResult = generateProof(tree, thisLeafHash);

      await Proof.create({
        proofId: uuidv4(),
        credentialId,
        issuerId,
        leafHash: thisLeafHash,
        proof: proofResult.proof,
        positions: proofResult.positions,
        root,
        rootVersion: newVersion,
        valid: proofResult.valid,
      });

      res.status(201).json({
        success: true,
        credential,
        merkleRoot: root,
        rootVersion: newVersion,
        txSignature: txSig,
        proof: proofResult,
      });
    } catch (err: any) {
      console.error('[credential/issue]', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ─── POST /credential/revoke ──────────────────────────────────────────────────
router.post(
  '/revoke',
  [body('credentialId').isString().notEmpty()],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { credentialId } = req.body;

    try {
      const credential = await Credential.findOne({ credentialId });
      if (!credential) {
        res.status(404).json({ success: false, message: 'Credential not found' });
        return;
      }
      if (credential.status === 'REVOKED') {
        res.status(400).json({ success: false, message: 'Credential already revoked' });
        return;
      }

      const issuer = await Issuer.findOne({ issuerId: credential.issuerId });
      if (!issuer) {
        res.status(404).json({ success: false, message: 'Issuer not found' });
        return;
      }

      // Update credential status → REVOKED
      credential.status = 'REVOKED';
      credential.revokedAt = new Date();
      // New leaf hash with REVOKED status (invalidates old proofs)
      const newLeafHash = computeLeafHash(
        credential.credentialId,
        credential.subjectDid,
        credential.issuerDid,
        'REVOKED'
      );
      credential.leafHash = newLeafHash;
      await credential.save();

      // Rebuild tree for issuer with updated leaf
      const { root, tree } = await rebuildIssuerTree(credential.issuerId);

      // Publish new root on-chain
      const newVersion = issuer.rootVersion + 1;
      const txSig = await publishMerkleRoot(credential.issuerId, root, newVersion);

      credential.merkleRoot = root;
      credential.revokeTxSignature = txSig;
      await credential.save();

      // Update issuer
      await Issuer.updateOne(
        { issuerId: credential.issuerId },
        {
          merkleRoot: root,
          rootVersion: newVersion,
          txSignature: txSig,
          $inc: { revokedCount: 1 },
        }
      );

      // Store new proof for revoked leaf
      const proofResult = generateProof(tree, newLeafHash);
      await Proof.create({
        proofId: uuidv4(),
        credentialId,
        issuerId: credential.issuerId,
        leafHash: newLeafHash,
        proof: proofResult.proof,
        positions: proofResult.positions,
        root,
        rootVersion: newVersion,
        valid: proofResult.valid,
      });

      res.json({
        success: true,
        message: 'Credential revoked',
        credential,
        merkleRoot: root,
        rootVersion: newVersion,
        txSignature: txSig,
      });
    } catch (err: any) {
      console.error('[credential/revoke]', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ─── GET /credential/:id ──────────────────────────────────────────────────────
router.get(
  '/:id',
  [param('id').isString().notEmpty()],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const credential = await Credential.findOne({ credentialId: req.params.id });
      if (!credential) {
        res.status(404).json({ success: false, message: 'Credential not found' });
        return;
      }
      res.json({ success: true, credential });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ─── GET /credential/proof/:id ────────────────────────────────────────────────
router.get(
  '/proof/:id',
  [param('id').isString().notEmpty()],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const proof = await Proof.findOne({ credentialId: req.params.id }).sort({ createdAt: -1 });
      if (!proof) {
        res.status(404).json({ success: false, message: 'Proof not found' });
        return;
      }
      res.json({ success: true, proof });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ─── GET /credential (list) ───────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { issuerId, status } = req.query;
    const filter: Record<string, string> = {};
    if (issuerId) filter.issuerId = issuerId as string;
    if (status) filter.status = status as string;

    const credentials = await Credential.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, credentials });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
