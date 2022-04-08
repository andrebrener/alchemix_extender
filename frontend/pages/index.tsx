import { eth } from "state/eth"; // State container
import Layout from "components/Layout"; // Layout wrapper
import { useRouter } from "next/router"; // Routing
import styles from "styles/pages/Home.module.scss"; // Page styles
import { token } from "state/contract-functions"; // Global state: Tokens


// Setup project details
const heading: string = process.env.NEXT_PUBLIC_HEADING ?? "Some heading";
const description: string =
  process.env.NEXT_PUBLIC_DESCRIPTION ?? "Some description";

export default function Home() {
  // Routing
  const { push } = useRouter();
  // Authentication status
  const { address }: { address: string | null } = eth.useContainer();

  // Global token state
  const {alchemixAccount}: {
    alchemixAccount: Object;
  } = token.useContainer();

  return (
    <Layout>
      <div className={styles.home}>
        {/* Project logo */}
        {/* <div>
          <Image src="/logo.png" alt="Logo" width={250} height={250} priority />
        </div> */}

        {/* Project heading */}
        <h1>{heading}</h1>

        {/* Project description */}
        <p>{description}</p>

         {/* Address info */}
         {address && (
           <div>
               <p>Underlying Tokens Deposit: {alchemixAccount?.underlyingTokensDeposited}</p>
               <p>Deposited Yield Tokens: {alchemixAccount?.yieldTokensDeposited}</p>
               <p>Current Debt: {alchemixAccount?.debt}</p>
        </div>
        )
        }

        {/* Claim button */}
        {!address ? (
          // If not authenticated, disabled
          <button disabled>Connect Wallet to Start</button>
        ) : (
          // Else, reroute to /claim
          // <p>Your address has these tokens: {tokenIds}.</p>
          <button onClick={() => push("/invest")}>Start Investing</button>
        )}
      </div>
    </Layout>
  );
}
