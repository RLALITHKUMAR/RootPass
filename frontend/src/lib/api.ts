import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Issuer ───────────────────────────────────────────────────────────────────
export const registerIssuer = (data: Record<string, unknown>) =>
  api.post('/issuer/register', data).then((r) => r.data);

export const getIssuer = (id: string) =>
  api.get(`/issuer/${id}`).then((r) => r.data);

export const listIssuers = () =>
  api.get('/issuer').then((r) => r.data);

// ─── Credential ───────────────────────────────────────────────────────────────
export const issueCredential = (data: {
  issuerId: string;
  subjectDid: string;
  subjectName: string;
  credentialType: string;
  credentialData?: Record<string, unknown>;
  expiryDate?: string;
}) => api.post('/credential/issue', data).then((r) => r.data);

export const revokeCredential = (credentialId: string) =>
  api.post('/credential/revoke', { credentialId }).then((r) => r.data);

export const getCredential = (id: string) =>
  api.get(`/credential/${id}`).then((r) => r.data);

export const getCredentialProof = (id: string) =>
  api.get(`/credential/proof/${id}`).then((r) => r.data);

export const listCredentials = (params?: { issuerId?: string; status?: string }) =>
  api.get('/credential', { params }).then((r) => r.data);

// ─── Verify ───────────────────────────────────────────────────────────────────
export const verifyCredential = (data: {
  credentialId: string;
  verifierAddress?: string;
}) => api.post('/verify', data).then((r) => r.data);

// ─── Root ─────────────────────────────────────────────────────────────────────
export const getLatestRoot = () =>
  api.get('/root/latest').then((r) => r.data);

export default api;
