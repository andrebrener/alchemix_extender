// scripts/index.js
async function main() {

    // Dai
    const daiHolderAddress = "0x28c6c06298d514db089934071355e5743bf21d60"

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [daiHolderAddress],
    });

    const daiHolder = await ethers.getSigner(daiHolderAddress);

    // DAI Contract
    const daiABI = [
      "event Approval(address indexed owner, address indexed spender, uint256 value)",
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function balanceOf(address account) external view returns (uint256)"
    ];
    const daiContract = new ethers.Contract('0x6b175474e89094c44da98b954eedeac495271d0f', daiABI, daiHolder);


    // Alchemist Contract
    const alchemistABI = [
      "function depositUnderlying(address yieldToken, uint256 amount, address recipient, uint256 minimumAmountOut) external returns (uint256 sharesIssued)",
      "event Deposit(address indexed sender, address indexed yieldToken, uint256 amount, address recipient)"
    ];

    const alchemistContractAddress = "0x5C6374a2ac4EBC38DeA0Fc1F8716e5Ea1AdD94dd";
    const alchemistContract = new ethers.Contract(alchemistContractAddress, alchemistABI);
  
    console.log("1. Approving contract to spend DAI to alchemist at:", alchemistContractAddress);
    await daiContract.connect(daiHolder).approve(alchemistContractAddress, 10000000000000);

    console.log("2. Depositing with address:", daiHolderAddress);

    const yieldToken = "0xdA816459F1AB5631232FE5e97a05BBBb94970c95";
    const amount = 100;

    await alchemistContract.connect(daiHolder).depositUnderlying(yieldToken, amount, daiHolderAddress, 0);

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });