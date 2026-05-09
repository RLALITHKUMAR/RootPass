import mongoose, { Document, Schema } from 'mongoose';

export type CredentialStatus = 'ACTIVE' | 'REVOKED';

export interface ICredential extends Document {
  credentialId: string;
  issuerId: string;
  issuerDid: string;
  subjectDid: string;
  subjectName: string;
  credentialType: string;
  credentialData: Record<string, unknown>;
  status: CredentialStatus;
  leafHash: string;
  merkleRoot: string;
  issuedAt: Date;
  expiryDate?: Date;
  revokedAt?: Date;
  txSignature?: string;
  revokeTxSignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CredentialSchema = new Schema<ICredential>(
  {
    credentialId:   { type: String, required: true, unique: true, index: true },
    issuerId:       { type: String, required: true, index: true },
    issuerDid:      { type: String, required: true },
    subjectDid:     { type: String, required: true },
    subjectName:    { type: String, required: true },
    credentialType: { type: String, required: true },
    credentialData: { type: Schema.Types.Mixed, default: {} },
    status:         { type: String, enum: ['ACTIVE', 'REVOKED'], default: 'ACTIVE' },
    leafHash:       { type: String, required: true },
    merkleRoot:     { type: String, required: true },
    issuedAt:       { type: Date, default: Date.now },
    expiryDate:     { type: Date },
    revokedAt:      { type: Date },
    txSignature:    { type: String },
    revokeTxSignature: { type: String },
  },
  { timestamps: true }
);

export const Credential = mongoose.model<ICredential>('Credential', CredentialSchema);
