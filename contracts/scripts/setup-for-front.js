// scripts/index.js
async function main() {
    // Set up an ethers contract, representing our deployed Box instance
    const address = "0x74Cf9087AD26D541930BaC724B7ab21bA8F00a27";

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

    // Metamask Address

    const metamaskAddress = "0x5d860534FDC6015Fb796C4057F0EcfEDb9a4B19d"

    // DAI Contract

    const daiABI = [
      "function transfer(address to, uint256 amount) external returns (bool)",
      "function balanceOf(address account) external view returns (uint256)"
    ];
    const daiContract = new ethers.Contract('0x6b175474e89094c44da98b954eedeac495271d0f', daiABI, daiHolder);

    // Alchemist Whitelist

    const alchemistWhitelistAdminAddress = "0x9e2b6378ee8ad2a4a95fe481d63caba8fb0ebbf9"
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [alchemistWhitelistAdminAddress],
    });

    const alchemistWhitelistAdmin = await ethers.getSigner(alchemistWhitelistAdminAddress);

  // Alchemist Whitelist Contract
  const alchemistWhitelistABI = [
    "event AccountAdded(address account)",
    "function add(address caller) external",
    "function isWhitelisted(address account) external view returns (bool)"
  ];
  const alchemistWhitelistContract = new ethers.Contract('0x78537a6CeBa16f412E123a90472C6E0e9A8F1132', alchemistWhitelistABI, alchemistWhitelistAdmin);
  
  console.log("1. Whitelisting contract with alchemist admin address:", alchemistWhitelistAdmin.address);

  await alchemistWhitelistContract.connect(alchemistWhitelistAdmin).add(address);

  const whitelistedAddress = await alchemistWhitelistContract.isWhitelisted(address);

  console.log("2. Contract Whitelisted:", whitelistedAddress);

  console.log("3. Sending ETH to Metamask account:", metamaskAddress);

  await daiHolder.sendTransaction({to: metamaskAddress, value: ethers.utils.parseEther("10")})

  console.log("5. Sending DAI to Metamask account:", metamaskAddress);

  await daiContract.connect(daiHolder).transfer(metamaskAddress, ethers.utils.parseEther("10000"));

  const DAIBalance = await daiContract.balanceOf(metamaskAddress);

  console.log("6. Metamask account DAI Balance:", DAIBalance.toString());
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });