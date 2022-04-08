import { eth } from "state/eth"; // Global state: ETH
import { useState, useCallback } from "react"; // State management
import { token } from "state/contract-functions"; // Global state: Tokens
import Layout from "components/Layout"; // Layout wrapper
import styles from "styles/pages/Mint.module.scss"; // Page styles

export default function ExecuteOperation() {
  // Global ETH state
  const { address, unlock }: { address: string | null; unlock: Function } =
    eth.useContainer();
  // Global token state
  const {
    dataLoading,
    DAIBalance,
    DAIApproveContract,
    executeOperation,
    getDAIBalance,
    AlchemistApproveMint
  }: {
    dataLoading: boolean;
    DAIBalance: string;
    DAIApproveContract: Function;
    executeOperation: Function;
    getDAIBalance: Function;
    AlchemistApproveMint: Function;
  } = token.useContainer();
  // Local buttons loading
  const [approveButtonLoading, setApproveButtonLoading] = useState<boolean>(false);
  const [executeButtonLoading, setExecuteButtonLoading] = useState<boolean>(false);
  const [approveMintButtonLoading, setapproveMintButtonLoading] = useState<boolean>(false);
  // Local buttons disabled
  const [approveButtonDisabled, setApproveButtonDisabled] = useState<boolean>(false);
  const [approveMintButtonDisabled, setApproveMintButtonDisabled] = useState<boolean>(true);
  // const [executeButtonDisabled, setExecuteButtonDisabled] = useState<boolean>(true);
  
  // Inputs
  const [beneficiary, setBeneficiary] = useState("");
  const [beneficiaryDAIBalance, setBeneficiaryDAIBalance] = useState("");
  const [collateralValue, setCollateralValue] = useState("");
  const [targetDebt, setTargetDebt] = useState("");
  const [maxSlippage, setMaxSlippage] = useState("");

  const handleBeneficiaryChange = useCallback(
    async (event) => {
      const beneficiaryAddress = event.currentTarget.value
      setBeneficiary(beneficiaryAddress);
      const balance = await getDAIBalance(beneficiaryAddress);
      setBeneficiaryDAIBalance(balance);
    }, [getDAIBalance]);

  const handleCollateralValueChange = useCallback(
    (event) => {
      setCollateralValue(event.currentTarget.value);
    }, []);

  const handleTargetDebtChange = useCallback(
    (event) => {
      setTargetDebt(event.currentTarget.value);
    }, []);

  const handleMaxSlippageChange = useCallback(
    (event) => {
      setMaxSlippage(event.currentTarget.value);
    }, []);

  /**
   * Approve contract with local button loading
   */
  const approveContractWithLoading = async () => {
    setApproveButtonLoading(true); // Toggle
    await DAIApproveContract(); // Approve Contract
    setApproveButtonLoading(false); // Toggle
    setApproveButtonDisabled(true);
    setApproveMintButtonDisabled(false);
    };

      /**
   * Approve contract to mint from alchemist with local button loading
   */
  const approveContractMintingWithLoading = async () => {
    setapproveMintButtonLoading(true); // Toggle
    await AlchemistApproveMint(); // Approve Contract
    setapproveMintButtonLoading(false); // Toggle
    setApproveMintButtonDisabled(true);
    // setExecuteButtonDisabled(false); // Toggle
    };

    /**
   * Execute operation with local button loading
   */
     const executeOperationWithLoading = async () => {
      setExecuteButtonLoading(true); // Toggle
      await executeOperation(collateralValue, targetDebt, beneficiary, maxSlippage); // Execute Operation
      // setExecuteButtonLoading(false); // Toggle
    };

  return (
    <Layout>
      <div className={styles.mint}>
        {!address ? (
          // Not authenticated
          <div className={styles.card}>
            <h1>You are not authenticated.</h1>
            <p>Please connect with your wallet to start.</p>
            <button onClick={() => unlock()}>Connect Wallet</button>
          </div>
        ) : dataLoading ? (
          // Loading details about address
          <div className={styles.card}>
            <h1>Loading your info...</h1>
            <p>Please hold while we collect details about your address.</p>
          </div>
        ) : (
          // Mint your token
          <div className={styles.card}>
            <h1>Invest</h1>

            <div>Balance: {DAIBalance} DAI</div>
            <div>Beneficiary Balance: {beneficiaryDAIBalance} DAI</div>
            <div>
              
              <input className={styles.input}
                    name="beneficiary"
                    type="text"
                    placeholder="Insert Beneficiary"
                    onChange={(e) => {
                      handleBeneficiaryChange(e);
                    }}
                  />
              </div>
            <div>
              
            <input className={styles.input}
                  name="collateralValue"
                  type="text"
                  placeholder="Insert Collateral Value"
                  onChange={(e) => {
                    handleCollateralValueChange(e);
                  }}
                />
            </div>
            <div>
            <input className={styles.input}
              name="targetDebt"
              type="text"
              placeholder="Insert net investment"
              onChange={(e) => {
                handleTargetDebtChange(e);
              }}
            />
            </div>
            <div>
            <input className={styles.input}
              name="maxSlippage"
              type="text"
              placeholder="Insert max slippage"
              onChange={(e) => {
                handleMaxSlippageChange(e);
              }}
            />
            </div>

            <button onClick={approveContractWithLoading} disabled={approveButtonDisabled}>
              {approveButtonLoading ? "Approving..." : "Approve Contract to Spend your DAI"}
            </button>
            <button onClick={approveContractMintingWithLoading} disabled={approveMintButtonDisabled}>
              {approveMintButtonLoading ? "Approving..." : "Approve Contract to mint from Alchemix"}
            </button>
            <button onClick={executeOperationWithLoading} disabled={false}>
              {executeButtonLoading ? "Executing Transaction..." : "Invest"}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
