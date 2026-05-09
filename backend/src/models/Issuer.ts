import mongoose, { Document, Schema } from 'mongoose';

export interface IIssuer extends Document {
  issuerId: string;
  name: string;
  did: string;
  walletAddress: string;
  publicKey: string;
  description: string;
  organizationType: string;
  contactEmail: string;
  location: string;
  logoUrl?: string;
  merkleRoot: string;
  rootVersion: number;
  txSignature?: string;
  credentialCount: number;
  revokedCount: number;
  complianceFrameworks: string[];
  createdAt: Date;
  updatedAt: Date;
}

const IssuerSchema = new Schema<IIssuer>(
  {
    issuerId:        { type: String, required: true, unique: true, index: true },
    name:            { type: String, required: true },
    did:             { type: String, required: true, unique: true },
    walletAddress:   { type: String, required: true, unique: true },
    publicKey:       { type: String, required: true },
    description:     { type: String, required: true },
    organizationType:{ type: String, default: 'Enterprise' },
    contactEmail:    { type: String },
    location:        { type: String },
    logoUrl:         { type: String },
    website:         { type: String },
    merkleRoot:      { type: String, default: '0'.repeat(64) },
    rootVersion:     { type: Number, default: 0 },
    txSignature:     { type: String },
    credentialCount: { type: Number, default: 0 },
    revokedCount:    { type: Number, default: 0 },
    complianceFrameworks: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Issuer = mongoose.model<IIssuer>('Issuer', IssuerSchema);
