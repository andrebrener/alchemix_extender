import { eth } from "state/eth"; // ETH state provider
import { ethers } from "ethers"; // Ethers
import { useEffect, useState } from "react"; // React
import { createContainer } from "unstated-next"; // State management

function useToken() {
  // Collect global ETH state
  const {
    address,
    provider,
  }: {
    address: string | null;
    provider: ethers.providers.Web3Provider | null;
  } = eth.useContainer();

  // Local state
  const [dataLoading, setDataLoading] = useState<boolean>(true); // Data retrieval status
  const [DAIBalance, setDAIBalance] = useState<string>(""); // DAI Balance
  const [alchemixAccount, setAlchemixAccount] = useState<{}>({}); // Alchemix account data
  // const [contractAllowedDAI, setContractAllowedDAI] = useState<boolean>(false); // If contract is allowed to spend DAI

  /**
   * Get contract
   * @returns {ethers.Contract} signer-initialized contract
   */
  const getContract = (): ethers.Contract => {
    return new ethers.Contract(
      // Contract address
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "",
      [
        // Execute Operation
        "function executeOperation(uint256 collateralValue, uint256 targetDebt, address finalRecipient, uint128 maxSlippage) external payable returns (bool)",
        "function yieldTokenAddress() public view returns (address) "
      ],
      // Get signer from authed provider
      provider?.getSigner()
    );
  };

    /**
   * Get DAI contract
   * @returns {ethers.Contract} signer-initialized contract
   */
     const getDAIContract = (): ethers.Contract => {
      return new ethers.Contract(
        // Contract address
        process.env.NEXT_PUBLIC_DAI_CONTRACT_ADDRESS ?? "",
        [
          // ERC20 BalanceOf
          "function balanceOf(address account) external view returns (uint256)",
          // Approve function
          "function approve(address spender, uint256 amount) external returns (bool)",
          // Allowance
          "function allowance(address owner, address spender) external view returns (uint256)"
        ],
        // Get signer from authed provider
        provider?.getSigner()
      );
    };

  /**
   * Get Alchemist contract
   * @returns {ethers.Contract} signer-initialized contract
   */
      const getAlchemistContract = (): ethers.Contract => {
        return new ethers.Contract(
          // Contract address
          process.env.NEXT_PUBLIC_ALCHEMIST_CONTRACT_ADDRESS ?? "",
          [
            // Get Account Positions
            "function positions(address owner, address yieldToken) external view returns (uint256 shares, uint256 lastAccruedWeight)",
            // Get Account info
            "function accounts(address owner) external view returns (int256 debt, address[] memory depositedTokens)",
            // Approve contract to Mint
            "function approveMint(address spender, uint256 amount) external",
            // Yield Token Params
            "function getYieldTokenParameters(address yieldToken) external view returns (uint8 decimals, address underlyingToken, address adapter, uint256 maximumLoss, uint256 balance, uint256 totalShares, uint256 expectedValue, uint256 accruedWeight, bool enabled)",
            // Underlying Tokens per Share
            "function getUnderlyingTokensPerShare(address yieldToken) external view returns (uint256)"
          ],
          // Get signer from authed provider
          provider?.getSigner()
        );
      };

  /**
   * Collects tokens for an address
   * @param {string} account to check
   * @returns {Promise<any[]>} list of token elements
   */
  const getAccountAlchemixInfo = async (account: string): Promise<{}> => {
    // Collect token contract
    const alchemist: ethers.Contract = getAlchemistContract();
    // Address Balance
    const accountInfo = await alchemist.accounts(account);

    // Contract
    const contract: ethers.Contract = getContract();

    const yieldTokenAddress = await contract.yieldTokenAddress();

    // const yieldTokenParams = await alchemist.getYieldTokenParameters(yieldTokenAddress);
    // console.log(yieldTokenParams)
    // const yieldTokensDeposited = yieldTokenParams[8].toString();

    const positions = await alchemist.positions(account, yieldTokenAddress)
    const yieldTokensDeposited = positions.shares.toString()
    
    const underlyingTokensPerShare = await alchemist.getUnderlyingTokensPerShare(yieldTokenAddress);

    const adjustedYieldTokensDeposited = ethers.utils.formatEther(yieldTokensDeposited);
    const adjustedDebt = ethers.utils.formatEther(accountInfo.debt.toString());
    const adjustedTokensPerShare = ethers.utils.formatEther(underlyingTokensPerShare.toString());

    const returnValue = {"debt": adjustedDebt, "yieldTokensDeposited": Number(adjustedYieldTokensDeposited).toFixed(1),
  "underlyingTokensDeposited": Number(adjustedYieldTokensDeposited) * Number(adjustedTokensPerShare)};
    return returnValue;
  };

  const getDAIBalance = async (account: string): Promise<string> => {
    // Collect token contract
    const daiContract: ethers.Contract = getDAIContract();
    // Address Balance
    const balance = await daiContract.balanceOf(account);
    const DAIBalance = ethers.utils.formatEther(balance.toString());
    // return DAIBalance;
    return Number(DAIBalance).toFixed(1).toString();
  };

  const getDAIAllowance = async (account: string): Promise<boolean> => {
    // Collect token contract
    const daiContract: ethers.Contract = getDAIContract();

    const spender = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";
    const allowanceValue = await daiContract.allowance(account, spender);
    return allowanceValue.toString().length > 0;
  };

  const DAIApproveContract = async (): Promise<void> => {
    // If not authenticated throw
    if (!address) {
      throw new Error("Not Authenticated");
    }
    // Collect DAI contract
    const daiContract: ethers.Contract = getDAIContract();
    // Get properly formatted address

    const spender = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";
    
    const formattedAddress: string = ethers.utils.getAddress(spender);

    // Try to set new message and refresh sync status
    try {
      const tx = await daiContract.approve(formattedAddress, ethers.utils.parseEther("10000000"));

      await tx.wait(1);
      await syncStatus();
    } catch (e) {
      console.error(`Error when approving spender in DAI: ${e}`);
    }
  };

  const AlchemistApproveMint = async (): Promise<void> => {
    // If not authenticated throw
    if (!address) {
      throw new Error("Not Authenticated");
    }
    // Collect contract
    const alchemistContract: ethers.Contract = getAlchemistContract();
    // Get properly formatted address

    const spender = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";
    
    const formattedAddress: string = ethers.utils.getAddress(spender);

    // Try to set new message and refresh sync status
    try {
      const tx = await alchemistContract.approveMint(formattedAddress, ethers.utils.parseEther("10000000"));
      await tx.wait(1);
      await syncStatus();
    } catch (e) {
      console.error(`Error when approving spender to mint in Alchemist: ${e}`);
    }
  };

  const executeOperation = async (collateralValue: number, targetDebt: number, beneficiary: string, maxSlippage: number): Promise<void> => {
    // If not authenticated throw
    if (!address) {
      throw new Error("Not Authenticated");
    }

    // Collect contract
    const contract: ethers.Contract = getContract();
    // Get properly formatted address
    const formattedBeneficiaryAddress: string = ethers.utils.getAddress(beneficiary);

    const adjustedCollateralValue = ethers.utils.parseEther(collateralValue.toString());

    const adjustedTargetDebt = ethers.utils.parseEther(targetDebt.toString());

    // Try to execute tx refresh sync status
    try {
      const tx = await contract.executeOperation(adjustedCollateralValue, adjustedTargetDebt, formattedBeneficiaryAddress, maxSlippage);
      await tx.wait(1);
      await syncStatus();
    } catch (e) {
      console.error(`Error when executing operation: ${e}`);
    }
  };

  /**
   * After authentication, update alchemix account info & DAI Balance
   */
  const syncStatus = async (): Promise<void> => {
    // Toggle loading
    setDataLoading(true);

    // Force authentication
    if (address) {
      // Collect number of tokens for address
      const DAIBalance = await getDAIBalance(address);
      setDAIBalance(DAIBalance);
      const accountInfo = await getAccountAlchemixInfo(address);
      setAlchemixAccount(accountInfo);
    }

    // Toggle loading
    setDataLoading(false);
  };

  // On load:
  useEffect(() => {
    syncStatus();
  }, [address]);

  return {
    dataLoading,
    DAIBalance,
    alchemixAccount,
    executeOperation,
    DAIApproveContract,
    getDAIBalance,
    AlchemistApproveMint
  };
}

// Create unstated-next container
export const token = createContainer(useToken);
