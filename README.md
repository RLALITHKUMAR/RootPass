# ⚡ RootPass
> **A Decentralized Identity & Credential Management Platform**

RootPass is a high-end, next-generation SaaS visual identity platform that leverages Merkle tree accumulators on the Ethereum blockchain (Sepolia) combined with off-chain metadata (MongoDB) to Issue, Verify, and Revoke digital credentials securely. It features a stunning holographic UI/UX called **PRISM**, providing a premium experience.

---

## 🚀 Features

- **Holographic PRISM UI**: 3D interactive credential cards using Framer Motion.
- **Web3 Identity Integration**: Secure authentication and issuance using Ethereum EVM Wallets (MetaMask, etc).
- **On-chain Trust Anchors**: Generates cryptographic Merkle proofs to verify credential validity without exposing raw metadata.
- **Real-time Live Issue Wizard**: Issue credentials instantly with live 3D preview of the credential card.
- **Zero-knowledge Compliance**: Display organizational compliance (ISO 27001, GDPR, HIPAA) safely alongside digital credentials.

## 🛠️ Technology Stack

- **Frontend:** Next.js (TypeScript), TailwindCSS, Framer Motion, Axios, Lucide Icons.
- **Backend:** Node.js, Express.js, TypeScript, MongoDB (Mongoose), Express Validator.
- **Web3 Layer:** Ethereum Smart Contracts, `ethers.js` (or `web3.js`) for on-chain anchoring and cryptographic Merkle tree generation.

## 📂 Project Structure

- `/frontend` - Next.js client application containing the PRISM design system and pages (Dashboard, Revoke, Issue, Register).
- `/backend` - Express.js API server handling business logic, MongoDB connection, and EVM interactions.

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster (or local MongoDB instance)
- EVM Wallet (e.g., MetaMask) for testing

### 1. Clone the repository
```bash
git clone https://github.com/RLALITHKUMAR/RootPass.git
cd RootPass
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `/backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
ETH_RPC_URL=https://rpc.sepolia.org
```
Run the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env.local` file in the `/frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_EVM_NETWORK=sepolia
```
Run the frontend:
```bash
npm run dev
```

## 🌐 Usage

1. **Register as an Issuer:** Navigate to `/register` and connect your web3 wallet to register your organizational profile.
2. **Issue Credentials:** Head to `/issue` to generate secure, cryptographically backed digital credentials with the live 3D PRISM card preview.
3. **Revocation Grid:** Check the `/revoke` page to inspect validity and simulate on-chain Merkle root state changes.

## 📄 License
MIT License
