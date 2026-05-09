import mongoose, { Document, Schema } from 'mongoose';

export interface IProof extends Document {
  proofId: string;
  credentialId: string;
  issuerId: string;
  leafHash: string;
  proof: string[];        // sibling hashes
  positions: number[];    // 0=left, 1=right
  root: string;
  rootVersion: number;
  valid: boolean;
  generatedAt: Date;
}

const ProofSchema = new Schema<IProof>(
  {
    proofId:      { type: String, required: true, unique: true },
    credentialId: { type: String, required: true, index: true },
    issuerId:     { type: String, required: true },
    leafHash:     { type: String, required: true },
    proof:        { type: [String], required: true },
    positions:    { type: [Number], required: true },
    root:         { type: String, required: true },
    rootVersion:  { type: Number, required: true },
    valid:        { type: Boolean, default: true },
    generatedAt:  { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Proof = mongoose.model<IProof>('Proof', ProofSchema);
