// scripts/index.js
async function main() {
    // Set up an ethers contract, representing our deployed Box instance
    const address = "0xB377a2EeD7566Ac9fCb0BA673604F9BF875e2Bab";
    const Extender = await ethers.getContractFactory("Extender");
    const extender = await Extender.attach(address);

    const daiHolder = await ethers.getSigner("0x208b82b04449cd51803fae4b1561450ba13d9510");

    try {
      balance = await extender.connect(daiHolder).ERC20BalanceOf(); 
      console.log(balance.toString())
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