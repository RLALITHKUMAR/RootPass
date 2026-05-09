# RootPass 🔐

**Decentralized Identity & Credential Revocation on Solana**

RootPass issues, verifies, and revokes credentials using Merkle-tree accumulators. Only a 32-byte Merkle root lives on-chain — zero personal data ever touches Solana.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                │
│   Landing · Dashboard · Issue · Verify · Revoke     │
└────────────────────┬───────────────┬────────────────┘
                     │               │
              REST API│          Phantom│Wallet
                     ▼               │
┌─────────────────────────────────── │ ──────────────┐
│              BACKEND (Express)      │               │
│   Merkle Engine · Solana Bridge     │               │
└───────────┬───────────┬────────────┘               │
            │           │                            │
    MongoDB Atlas   Solana Devnet ◄──────────────────┘
    (credentials)   (Merkle roots)
```

### On-Chain (Solana Devnet)
- Merkle root (32 bytes) per issuer
- Root version + timestamp
- Published via SPL Memo program

### Off-Chain (MongoDB)
- Full credential JSON
- Proof paths (sibling hashes)
- Revocation state
- Audit logs

---

## MVP Flows

| Flow | Description |
|------|-------------|
| Register Issuer | Wallet → DID → issuer record created |
| Issue Credential | Credential hashed → leaf added → Merkle root updated on Solana |
| Verify Credential | Proof recomputed → compared against on-chain root → VALID/REVOKED |
| Revoke Credential | Leaf status changes → tree rebuilt → new root on-chain |

---

## Merkle Design

```
Leaf = SHA256( credentialId + subjectDid + issuerDid + status )

Revocation:
  1. status changes ACTIVE → REVOKED
  2. Leaf hash changes (old proofs instantly invalid)
  3. Tree rebuilt → new root
  4. New root published on Solana
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Phantom Wallet (for live demo)

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI
npm install
npm run dev
# → http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev
# → http://localhost:3000
```

---

## API Reference

### Issuer
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/issuer/register` | Register a new issuer |
| GET | `/issuer/:id` | Get issuer by ID or wallet |
| GET | `/issuer` | List all issuers |

### Credential
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/credential/issue` | Issue a credential |
| POST | `/credential/revoke` | Revoke a credential |
| GET | `/credential/:id` | Get credential by ID |
| GET | `/credential/proof/:id` | Get latest proof |
| GET | `/credential` | List credentials |

### Verify
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/verify` | Verify a credential (returns VALID/REVOKED/INVALID) |

### Root
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/root/latest` | Latest on-chain Merkle roots |

---

## Demo Narrative

1. **Go to** `/register` → register "MIT University" with your wallet
2. **Go to** `/issue` → issue "University Degree" to Alice Johnson
3. **Go to** `/verify` → paste credential ID → see ✅ VERIFIED
4. **Go to** `/revoke` → revoke Alice's degree
5. **Go to** `/verify` → paste same ID → see ❌ REVOKED

The state transition from VERIFIED → REVOKED is the emotional core of the demo.

---

## Environment Variables

### Backend `.env`
```
PORT=4000
MONGODB_URI=mongodb+srv://...
SOLANA_RPC_URL=https://api.devnet.solana.com
ISSUER_PRIVATE_KEY=           # optional — ephemeral keypair used if blank
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

---

## Deployment

### Backend → Render / Railway
1. Push `backend/` to GitHub
2. Create a new Web Service on Render
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Set environment variables in Render dashboard

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. Import project on Vercel
3. Set `NEXT_PUBLIC_API_URL` to your Render backend URL
4. Deploy

---

## Security

- Private keys are **never** stored in the frontend
- All credential validation happens server-side
- On-chain root is the authoritative source of truth
- Rate limiting on all API endpoints
- Input sanitization via express-validator

---

## Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | Solana Devnet + SPL Memo |
| Smart Contract | Anchor (scaffold provided in `/program`) |
| Backend | TypeScript + Express.js |
| Merkle Engine | merkletreejs + SHA-256 |
| Database | MongoDB Atlas + Mongoose |
| Frontend | Next.js 14 + Tailwind CSS |
| Animations | Framer Motion |
| Icons | Lucide React |
| Wallet | Phantom (Solana Wallet Adapter) |

---

*Built for hackathon demo — Solana Devnet only. Do not use with real funds.*
