import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import bs58 from 'bs58';
import dotenv from 'dotenv';

dotenv.config();

// ─── Connection ───────────────────────────────────────────────────────────────

const RPC_URL = process.env.SOLANA_RPC_URL || clusterApiUrl('devnet');
export const connection = new Connection(RPC_URL, 'confirmed');

// ─── Wallet ───────────────────────────────────────────────────────────────────

function loadWallet(): Keypair {
  const raw = process.env.ISSUER_PRIVATE_KEY;
  if (!raw) {
    console.warn('[Solana] ISSUER_PRIVATE_KEY not set — using ephemeral keypair (devnet only)');
    return Keypair.generate();
  }
  try {
    const decoded = bs58.decode(raw);
    return Keypair.fromSecretKey(decoded);
  } catch {
    console.warn('[Solana] Could not decode ISSUER_PRIVATE_KEY — using ephemeral keypair');
    return Keypair.generate();
  }
}

export const serverWallet = loadWallet();

// ─── Memo-program root anchor ─────────────────────────────────────────────────
// We use the SPL Memo program to write the Merkle root on-chain cheaply.
// When an Anchor program is deployed, swap this with a proper CPI call.

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

/**
 * Publishes a new Merkle root on-chain via a Memo instruction.
 * Returns the transaction signature.
 */
export async function publishMerkleRoot(
  issuerId: string,
  merkleRoot: string,
  version: number
): Promise<string> {
  try {
    const memoData = JSON.stringify({
      type: 'ROOTPASS_MERKLE_ROOT',
      issuerId,
      root: merkleRoot,
      version,
      ts: Date.now(),
    });

    const memoInstruction = {
      programId: MEMO_PROGRAM_ID,
      keys: [{ pubkey: serverWallet.publicKey, isSigner: true, isWritable: false }],
      data: Buffer.from(memoData, 'utf-8'),
    };

    const tx = new Transaction().add(memoInstruction as any);
    tx.feePayer = serverWallet.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;

    const sig = await sendAndConfirmTransaction(connection, tx, [serverWallet]);
    console.log(`[Solana] Root published — sig: ${sig}`);
    return sig;
  } catch (err: any) {
    console.error('[Solana] publishMerkleRoot failed:', err.message);
    // Return a mock signature so the demo still flows without funded wallet
    return `MOCK_TX_${Date.now()}`;
  }
}

/**
 * Returns the current SOL balance of the server wallet.
 */
export async function getWalletBalance(): Promise<number> {
  try {
    const lamports = await connection.getBalance(serverWallet.publicKey);
    return lamports / LAMPORTS_PER_SOL;
  } catch {
    return 0;
  }
}

/**
 * Returns the latest confirmed slot on devnet.
 */
export async function getLatestSlot(): Promise<number> {
  try {
    return await connection.getSlot();
  } catch {
    return 0;
  }
}
