require('dotenv').config()

const { DEPLOYED_CONTRACT_ADDRESS } = process.env;

async function main() {
    // Set up an ethers contract, representing our deployed Box instance
    const address = "0xB377a2EeD7566Ac9fCb0BA673604F9BF875e2Bab";
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

      // DAI Contract
      const daiABI = [
        "function balanceOf(address account) external view returns (uint256)"
      ];
      const daiContract = new ethers.Contract('0x6b175474e89094c44da98b954eedeac495271d0f', daiABI, daiHolder);


    // Transfer to self

    console.log("Transfering to contract from address:", daiHolder.address);

    try {
      await extender.connect(daiHolder)._transferTokensToSelf("0x6B175474E89094C44Da98b954EedeAC495271d0F", 50000);
      const balance = await daiContract.balanceOf(DEPLOYED_CONTRACT_ADDRESS);
      console.log("Contract balance:", balance.toString())
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