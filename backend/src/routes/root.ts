import { Router, Request, Response } from 'express';
import { Issuer } from '../models/Issuer';
import { getLatestSlot, serverWallet } from '../services/solana';

const router = Router();

// ─── GET /root/latest ─────────────────────────────────────────────────────────
router.get('/latest', async (_req: Request, res: Response): Promise<void> => {
  try {
    const issuers = await Issuer.find().sort({ rootVersion: -1 }).limit(10).lean();
    const slot = await getLatestSlot();

    res.json({
      success: true,
      slot,
      serverWallet: serverWallet.publicKey.toBase58(),
      roots: issuers.map((i) => ({
        issuerId: i.issuerId,
        issuerName: i.name,
        merkleRoot: i.merkleRoot,
        rootVersion: i.rootVersion,
        txSignature: i.txSignature,
        updatedAt: i.updatedAt,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
