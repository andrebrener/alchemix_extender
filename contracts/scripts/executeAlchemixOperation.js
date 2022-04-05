// scripts/index.js
async function main() {
    // Set up an ethers contract, representing our deployed Box instance
    const address = "0x66F625B8c4c635af8b74ECe2d7eD0D58b4af3C3d";
    const Extender = await ethers.getContractFactory("Extender");
    const extender = await Extender.attach(address);

    // Signers

    // Regular
    [user1, user2, user3] = await hre.ethers.getSigners(); 

    // Dai
    const daiHolderAddress = "0x28c6c06298d514db089934071355e5743bf21d60"

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [daiHolderAddress],
    });

    const daiHolder = await ethers.getSigner(daiHolderAddress);

    const collateralValue = 5000;
    const targetDebt = collateralValue / 4;

    // Execute Operation

    console.log("Executing Alchemix operation with address:", daiHolder.address);

    try {
      await extender.connect(daiHolder).executeAlchemixOperation(collateralValue, targetDebt);  
      const alBalance = await extender.contractDebtTokenBalance();
      console.log("alUSD Balance:", alBalance);
    } catch (error) {
      console.log(error)
    }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });