const { expect } = require("chai");

describe("Extender", function () {
  beforeEach(async function () {
    [this.user1, this.user2, this.user3, this.admin] = await hre.ethers.getSigners();
    this.provider = hre.ethers.provider;

    this.Extender = await hre.ethers.getContractFactory("Extender");
    this.extender = await this.Extender.deploy();
    await this.extender.deployed();

    // Dai Holder
    this.daiHolderAddress = "0x28c6c06298d514db089934071355e5743bf21d60"

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [this.daiHolderAddress],
    });

    this.daiHolder = await ethers.getSigner(this.daiHolderAddress);
  });


  // Fails

  it("Should fail when executing with more than balance", async function () {
    expect(this.extender.executeOperation(100, 50)).to.be.revertedWith('Not enough balance');
  });

  it("Should fail when debt is more than collateral / 2", async function () {
    const collateral = 100;
    const targetDebt = (collateral / 2) + 1

    expect(this.extender.connect(this.daiHolder).executeOperation(collateral, targetDebt)).to.be.revertedWith('Debt greater than collateral value / 2');
  });

  // Set Parameters
  it("Should set new yield Token", async function () {
    const newYieldToken = "0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE"
    await this.extender.setYieldTokenAddress(newYieldToken);
    expect(await this.extender.yieldTokenAddress()).to.equal(newYieldToken);
  });

  it("Should fail when setting new yield Token not supported by alchemix", async function () {
    const newYieldToken = "0x28c6c06298d514db089934071355e5743bf21d60"
    expect(this.extender.setYieldTokenAddress(newYieldToken)).to.be.revertedWith('Yield Token not supported by Alchemix');
  });

  it("Should set new curve pool", async function () {
    const newCurvePool = hre.ethers.utils.getAddress("0x28c6c06298d514db089934071355e5743bf21d60");
    await this.extender.setCurvePool(newCurvePool);
    expect(await this.extender.curvePool()).to.equal(newCurvePool);
  });

  it("Should set new curve pool indexes", async function () {
    const newCurveInputIndex = 2
    const newCurveOutputIndex = 3
    await this.extender.setCurveIndexes(newCurveInputIndex, newCurveOutputIndex);
    expect(await this.extender.poolInputIndex()).to.equal(newCurveInputIndex);
    expect(await this.extender.poolOutputIndex()).to.equal(newCurveOutputIndex);
  });
});