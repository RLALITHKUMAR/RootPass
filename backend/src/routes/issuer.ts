import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { Issuer } from '../models/Issuer';
import { serverWallet } from '../services/solana';

const router = Router();

// ─── POST /issuer/register ────────────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').isString().trim().notEmpty(),
    body('walletAddress').isString().trim().notEmpty(),
    body('description').isString().trim().notEmpty(),
    body('website').optional({ checkFalsy: true }).isURL(),
    body('organizationType').optional().isString().trim(),
    body('contactEmail').optional().isEmail().trim(),
    body('location').optional().isString().trim(),
    body('logoUrl').optional({ checkFalsy: true }).isURL(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { name, walletAddress, description, website, organizationType, contactEmail, location, logoUrl, complianceFrameworks } = req.body;

    try {
      const existing = await Issuer.findOne({ walletAddress });
      if (existing) {
        res.status(409).json({
          success: false,
          message: 'Issuer already registered with this wallet',
          issuer: existing,
        });
        return;
      }

      const issuerId = uuidv4();
      const did = `did:rootpass:${walletAddress.slice(0, 8)}:${issuerId.slice(0, 8)}`;

      const issuer = await Issuer.create({
        issuerId,
        name,
        did,
        walletAddress,
        publicKey: walletAddress,
        description,
        website,
        organizationType: organizationType || 'Enterprise',
        contactEmail,
        location,
        logoUrl,
        complianceFrameworks: Array.isArray(complianceFrameworks) ? complianceFrameworks : [],
        merkleRoot: '0'.repeat(64),
        rootVersion: 0,
      });

      res.status(201).json({ success: true, issuer });
    } catch (err: any) {
      console.error('[issuer/register]', err);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ─── GET /issuer/:id ──────────────────────────────────────────────────────────
router.get(
  '/:id',
  [param('id').isString().trim().notEmpty()],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const issuer = await Issuer.findOne({
        $or: [{ issuerId: req.params.id }, { walletAddress: req.params.id }],
      });
      if (!issuer) {
        res.status(404).json({ success: false, message: 'Issuer not found' });
        return;
      }
      res.json({ success: true, issuer });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ─── GET /issuer (list all) ───────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const issuers = await Issuer.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, issuers });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
