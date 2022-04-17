# Alchemix Extender

Contracts & Front end for the app.

### What the app does:

1. Deposits DAI in Alchemix V2
2. Mints alUSD from Alchemix V2
3. Swaps alUSD for DAI in Curve
4. Transfers DAI to a selected beneficiary.

### How to use it

Alchemix V2 only allows whitelisted contracts (regular EOAs are obviously allowed) to interact with their contract. So, for now we must use this app with a local mainnet fork and whitelist ourselves in the Alchemix Whitelist contract.

1. Install hardhat & dependencies
2. Run local blockchain using [mainnet forking](https://hardhat.org/hardhat-network/guides/mainnet-forking.html)
3. Run [scripts/deploy](https://github.com/andrebrener/alchemix_extender/blob/master/contracts/scripts/deploy.js) in localhost
4. Create .env file and fill out their variables as [scripts/deploy](https://github.com/andrebrener/alchemix_extender/blob/master/contracts/.env.example)
5. Run [scripts/setup-for-front](https://github.com/andrebrener/alchemix_extender/blob/master/contracts/scripts/setup-for-front.js) in localhost to set
6. Run the frontend with `npm run dev`
7. Use the app & Enjoy :)



This is unadited code and for experimental purposes. Use it at your own risk. 
