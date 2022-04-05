async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);

    this.Extender = await hre.ethers.getContractFactory("Extender");
    this.extender = await this.Extender.deploy();
  
    console.log("Token address:", extender.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });