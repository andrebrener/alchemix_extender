# Alchemix Extender

Smart contracts and a Next.js front end for an Alchemix V2 self-repaying loan
helper. The `Extender` contract deposits collateral into Alchemix V2, mints
debt against the depositor's account, swaps the debt token for the underlying
on Curve, and forwards the proceeds to a chosen beneficiary.

> ⚠️ **Unaudited, experimental software. Use at your own risk.**
> This code moves real funds in DeFi protocols, has not been audited, and may
> contain bugs that result in total loss of funds. Do not use it with money you
> cannot afford to lose. No warranty of any kind is provided.

## What the app does

1. Deposits DAI in Alchemix V2
2. Mints alUSD from Alchemix V2
3. Swaps alUSD for DAI on Curve
4. Transfers DAI to a selected beneficiary

## Repository layout

- `contracts/` — Hardhat project with the `Extender` contract, interfaces,
  tests and scripts.
- `frontend/` — Next.js dApp front end.

## Prerequisites

- Node.js 16+
- An Alchemy (or other archive RPC) API key for mainnet forking

Alchemix V2 only allows whitelisted contracts (regular EOAs are allowed) to
interact with their contracts. For local development you must run against a
mainnet fork and whitelist the deployed contract in the Alchemix whitelist.

## Contracts: install, compile, test

```bash
cd contracts
npm install
cp .env.example .env   # fill in ALCHEMY_API_KEY, DEPLOYER_MNEMONIC, etc.
npx hardhat compile
npx hardhat test       # runs against a mainnet fork
```

## Deploy & run the dApp (local mainnet fork)

1. Install the contract dependencies (`cd contracts && npm install`).
2. Create the `.env` file from [`.env.example`](contracts/.env.example) and fill
   in the variables (RPC key, deployer mnemonic, etc.).
3. Start a local forked node:
   ```bash
   npx hardhat node
   ```
   (see [mainnet forking](https://hardhat.org/hardhat-network/guides/mainnet-forking.html))
4. Deploy the contract to localhost:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
5. Run [`scripts/setup-for-front.js`](contracts/scripts/setup-for-front.js) on
   localhost to set the whitelist and other setup.
6. Configure the front end: in `frontend/`, copy `.env.sample` to `.env.local`
   and set the deployed contract address and RPC values.
7. Start the front end:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
8. Open the app and enjoy :)

## License

MIT — see SPDX headers in the source files.
