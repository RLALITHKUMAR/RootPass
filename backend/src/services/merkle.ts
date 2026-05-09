import crypto from 'crypto';
import { MerkleTree } from 'merkletreejs';

// ─── Leaf Hashing ────────────────────────────────────────────────────────────

/** Deterministic leaf: hash(credentialId + subjectDid + issuerDid + status) */
export function computeLeafHash(
  credentialId: string,
  subjectDid: string,
  issuerDid: string,
  status: string
): string {
  const raw = `${credentialId}:${subjectDid}:${issuerDid}:${status}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

// ─── Tree builder ─────────────────────────────────────────────────────────────

function sha256(data: any): Buffer {
  return crypto.createHash('sha256').update(data).digest();
}

export interface MerkleResult {
  root: string;
  tree: MerkleTree;
  leaves: string[];
}

export function buildMerkleTree(leafHashes: string[]): MerkleResult {
  if (leafHashes.length === 0) {
    // Empty tree — root is all-zeros
    return {
      root: '0'.repeat(64),
      tree: new MerkleTree([], sha256, { sortPairs: true }),
      leaves: [],
    };
  }

  const leaves = leafHashes.map((h) => Buffer.from(h, 'hex'));
  const tree = new MerkleTree(leaves, sha256, { sortPairs: true });
  const root = tree.getRoot().toString('hex');

  return { root, tree, leaves: leafHashes };
}

// ─── Proof generation ────────────────────────────────────────────────────────

export interface MerkleProofResult {
  leafHash: string;
  proof: string[];      // sibling hashes (hex)
  positions: number[];  // 0 = left sibling, 1 = right sibling
  root: string;
  valid: boolean;
}

export function generateProof(
  tree: MerkleTree,
  leafHash: string
): MerkleProofResult {
  const leaf = Buffer.from(leafHash, 'hex');
  const rawProof = tree.getProof(leaf);
  const root = tree.getRoot().toString('hex');

  const proof: string[] = rawProof.map((p) => p.data.toString('hex'));
  const positions: number[] = rawProof.map((p) => (p.position === 'right' ? 1 : 0));

  const valid = tree.verify(rawProof, leaf, tree.getRoot());

  return { leafHash, proof, positions, root, valid };
}

// ─── Proof verification (standalone, no tree needed) ─────────────────────────

export function verifyProof(
  leafHash: string,
  proof: string[],
  positions: number[],
  expectedRoot: string
): boolean {
  let current: any = Buffer.from(leafHash, 'hex');

  for (let i = 0; i < proof.length; i++) {
    const sibling = Buffer.from(proof[i], 'hex');
    const pair =
      positions[i] === 1
        ? Buffer.concat([current, sibling])
        : Buffer.concat([sibling, current]);
    current = sha256(pair);
  }

  return current.toString('hex') === expectedRoot;
}
