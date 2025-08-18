import { useStateContext } from "../context/StateContext";

const Protected = ({ children }) => {
  const { address, connect } = useStateContext();

  // Wait for address to resolve (undefined means still loading)
  if (address === undefined) {
    return <div style={{ color: "white", textAlign: "center", padding: "20px", fontSize: "35px" }}>Loading...Please Connect Your Wallet To Proceed</div>;
  }

  // If wallet is not connected, show connect prompt instead of redirecting
  if (address === null) {
    return (
      <div style={{ color: "white", textAlign: "center", padding: "20px", fontSize: "35px" }}>
        Please connect your wallet to access this page.<br />
        <button
          style={{
            marginTop: "20px",
            padding: "10px 30px",
            fontSize: "20px",
            background: "#8247e5",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer"
          }}
          onClick={connect}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  // Allow access if the wallet is connected (address is a string)
  return children;
};

export default Protected;