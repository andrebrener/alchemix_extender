require('dotenv').config()

const { DEPLOYED_CONTRACT_ADDRESS } = process.env;

async function main() {
    // Set up an ethers contract, representing our deployed Box instance
    const address = "0xB377a2EeD7566Ac9fCb0BA673604F9BF875e2Bab";
    const Extender = await ethers.getContractFactory("Extender");
    const extender = await Extender.attach(DEPLOYED_CONTRACT_ADDRESS);

    try {
      token = await extender.getUnderlyingToken();  
      console.log(token)
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