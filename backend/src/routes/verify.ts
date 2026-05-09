import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { Credential } from '../models/Credential';
import { Issuer } from '../models/Issuer';
import { Proof } from '../models/Proof';
import { VerificationLog } from '../models/VerificationLog';
import { verifyProof, computeLeafHash, buildMerkleTree, generateProof } from '../services/merkle';

const router = Router();

// ─── POST /verify ─────────────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('credentialId').isString().notEmpty(),
    body('verifierAddress').optional().isString(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { credentialId, verifierAddress } = req.body;

    try {
      // 1. Load credential
      const credential = await Credential.findOne({ credentialId });
      if (!credential) {
        res.status(404).json({
          success: false,
          result: 'NOT_FOUND',
          message: 'Credential not found',
        });
        return;
      }

      // 2. Load issuer (source of on-chain root)
      const issuer = await Issuer.findOne({ issuerId: credential.issuerId });
      if (!issuer) {
        res.status(404).json({ success: false, result: 'INVALID', message: 'Issuer not found' });
        return;
      }

      // 3. Recompute the current leaf hash from credential state
      const currentLeafHash = computeLeafHash(
        credential.credentialId,
        credential.subjectDid,
        credential.issuerDid,
        credential.status
      );

      // 4. Rebuild the Merkle tree from all issuer credentials to get proof
      const allCreds = await Credential.find({ issuerId: credential.issuerId }).lean();
      const leafHashes = allCreds.map((c) =>
        computeLeafHash(c.credentialId, c.subjectDid, c.issuerDid, c.status)
      );
      const { root: computedRoot, tree } = buildMerkleTree(leafHashes);
      const proofResult = generateProof(tree, currentLeafHash);

      // 5. Compare computed root against on-chain (issuer's stored) root
      const onChainRoot = issuer.merkleRoot;
      const rootMatch = computedRoot === onChainRoot;

      // 6. Determine final result
      const result =
        !rootMatch
          ? 'INVALID'
          : credential.status === 'REVOKED'
          ? 'REVOKED'
          : 'VALID';

      // 7. Log the verification
      await VerificationLog.create({
        logId: uuidv4(),
        credentialId,
        issuerId: credential.issuerId,
        verifierAddress: verifierAddress || 'anonymous',
        result,
        onChainRoot,
        computedRoot,
        rootMatch,
      });

      res.json({
        success: true,
        result,
        verifiedAt: new Date().toISOString(),
        hashFormula: 'SHA256(credentialId + subjectDid + issuerDid + status)',
        credential: {
          credentialId: credential.credentialId,
          subjectName: credential.subjectName,
          subjectDid: credential.subjectDid,
          issuerDid: credential.issuerDid,
          credentialType: credential.credentialType,
          status: credential.status,
          issuedAt: credential.issuedAt,
          revokedAt: credential.revokedAt,
        },
        proof: {
          leafHash: currentLeafHash,
          siblings: proofResult.proof,
          positions: proofResult.positions,
          computedRoot,
          onChainRoot,
          rootMatch,
        },
        issuer: {
          name: issuer.name,
          did: issuer.did,
          rootVersion: issuer.rootVersion,
          txSignature: issuer.txSignature,
          website: issuer.website || 'https://rootpass.app',
          isVerified: true, // We assume registered issuers on our platform are verified
        },
      });
    } catch (err: any) {
      console.error('[verify]', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

export default router;
