## Alchemix Extender

Contracts & Front end.

What the app does:

1. Deposits DAI in Alchemix V2
2. Mints alUSD from Alchemix V2
3. Swaps alUSD for DAI in Curve
4. Transfers DAI to a selected beneficiary.

##### How to use

Alchemix V2 has a whitelist of contracts that are able to interact with their contract. So, for now we must use this app using a mainnet fork and whitelist ourselves in the Alchemix Whitelist contract.

1. Install hardhat & dependencies
2. Run local blockchain using [mainnet forking](https://hardhat.org/hardhat-network/guides/mainnet-forking.html)
3. Run [scripts/deploy](https://hardhat.org/hardhat-network/guides/mainnet-forking.html) in localhost
4. Create .env file and fill out their variables as [scripts/deploy](https://hardhat.org/hardhat-network/guides/mainnet-forking.html)
5. Run [scripts/setup-for-front](https://hardhat.org/hardhat-network/guides/mainnet-forking.html) in localhost to set
6. Levantar el front with `npm run dev`
7. Use the app & Enjoy :)
