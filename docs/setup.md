# Setup Guide

## Prerequisites

- Node.js 18 or higher
- Git
- A wallet with some test MON (Monad testnet tokens)
- A Reclaim Protocol developer account (free)

## Step 1: Clone the Repository

```
git clone https://github.com/Amitk003/AegisP2P.git
cd AegisP2P
```

## Step 2: Smart Contracts

```
cd contracts
npm install
```

Create a `.env` file in the `contracts` folder:

```
PRIVATE_KEY=your_wallet_private_key
MONAD_TESTNET_RPC=https://testnet-rpc.monad.xyz
MONAD_MAINNET_RPC=https://mainnet-rpc.monad.xyz
RECLAIM_APP_ID=your_reclaim_app_id
RECLAIM_APP_SECRET=your_reclaim_app_secret
```

Compile the contracts:

```
npx hardhat compile
```

Run tests:

```
npx hardhat test
```

## Step 3: Frontend

```
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Step 4: Environment Variables

Copy `.env.example` to `.env` in both `contracts/` and `frontend/` folders and fill in the values.

## Important Notes

- Never commit your `.env` files
- Make sure your wallet has enough MON for gas fees
- The Reclaim proof generation works on mobile devices only
