import mongoose, { Document, Schema } from 'mongoose';

export interface IVerificationLog extends Document {
  logId: string;
  credentialId: string;
  issuerId: string;
  verifierAddress?: string;
  result: 'VALID' | 'REVOKED' | 'INVALID' | 'NOT_FOUND';
  onChainRoot: string;
  computedRoot: string;
  rootMatch: boolean;
  timestamp: Date;
}

const VerificationLogSchema = new Schema<IVerificationLog>(
  {
    logId:           { type: String, required: true, unique: true },
    credentialId:    { type: String, required: true, index: true },
    issuerId:        { type: String, required: true },
    verifierAddress: { type: String },
    result:          { type: String, enum: ['VALID', 'REVOKED', 'INVALID', 'NOT_FOUND'], required: true },
    onChainRoot:     { type: String, required: true },
    computedRoot:    { type: String, required: true },
    rootMatch:       { type: Boolean, required: true },
    timestamp:       { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const VerificationLog = mongoose.model<IVerificationLog>('VerificationLog', VerificationLogSchema);
