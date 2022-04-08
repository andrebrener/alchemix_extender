require('dotenv').config()

const { DEPLOYED_CONTRACT_ADDRESS } = process.env;

async function main() {
    // Set up an ethers contract, representing our deployed Box instance
    const Extender = await ethers.getContractFactory("Extender");
    const extender = await Extender.attach(DEPLOYED_CONTRACT_ADDRESS);

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

    // Alchemist Base Contract
    const alchemistBaseABI = [
      "function positions(address owner, address yieldToken) external view returns (uint256 shares, uint256 lastAccruedWeight)",
    ];
    const alchemistBaseContract = new ethers.Contract('0x5C6374a2ac4EBC38DeA0Fc1F8716e5Ea1AdD94dd', alchemistBaseABI, daiHolder);
    
    const collateralValue = 5000;

    // Execute Operation

    console.log("Depositing to Alchemix with contract");

    try {
      await extender.connect(daiHolder).contractDeposit(collateralValue);  
      const position = await alchemistBaseContract.positions(daiHolder.address, "0xdA816459F1AB5631232FE5e97a05BBBb94970c95");
      console.log("Position:", position);

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