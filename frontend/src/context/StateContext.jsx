import React, { createContext, useContext, useState } from "react";
import { ethers } from "ethers";

// Create the context
const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [contract, setContract] = useState(null);
  const [theme, setTheme] = useState("dark"); // <-- 🔥 FIX: Theme state added

  const CONTRACT_ADDRESS = "0x3e84af4Ed606D47C453947AA2dBC2aEac3922E45";
  const CONTRACT_ABI = [/* your full ABI here, unchanged */];

  const AMOY_CHAIN_ID = "0x13882";

  const ensureAmoyNetwork = async () => {
    const { ethereum } = window;
    if (!ethereum) throw new Error("MetaMask not detected");
    const chainId = await ethereum.request({ method: "eth_chainId" });
    if (chainId !== AMOY_CHAIN_ID) {
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: AMOY_CHAIN_ID }],
        });
      } catch (switchError) {
        throw new Error("Please switch to Polygon Amoy network in MetaMask.");
      }
    }
  };

  const createCampaignOnChain = async (title, description, targetMatic, deadline) => {
    await ensureAmoyNetwork();
    if (!window.ethereum) throw new Error("MetaMask not detected");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const now = Math.floor(Date.now() / 1000);
    if (deadline <= now) throw new Error("Deadline must be in the future");

    let targetWei;
    try {
      if (!targetMatic || isNaN(targetMatic)) throw new Error("Invalid target amount");
      targetWei = ethers.utils.parseEther(targetMatic.toString());
    } catch (err) {
      throw new Error("Invalid target amount: " + err.message);
    }

    try {
      const tx = await contract.createCampaign(title, description, targetWei, deadline, {
        gasLimit: 500000,
      });
      const receipt = await tx.wait(2);
      return receipt;
    } catch (err) {
      if (err.code === 4001) throw new Error("User rejected transaction");
      if (err.error && err.error.message) throw new Error(err.error.message);
      throw err;
    }
  };

  const fundCampaignOnChain = async (campaignId, amountMatic) => {
    await ensureAmoyNetwork();
    if (!window.ethereum) throw new Error("MetaMask not detected");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    let amountWei;
    try {
      if (!amountMatic || isNaN(amountMatic) || parseFloat(amountMatic) < 0.001) throw new Error("Minimum is 0.001 MATIC");
      amountWei = ethers.utils.parseEther(amountMatic.toString());
    } catch (err) {
      throw new Error("Invalid amount: " + err.message);
    }

    const userAddress = await signer.getAddress();
    const balance = await provider.getBalance(userAddress);
    if (balance.lt(amountWei)) throw new Error("Insufficient MATIC balance");

    try {
      const tx = await contract.donateToCampaign(campaignId, {
        value: amountWei,
        gasLimit: 300000,
      });
      const receipt = await tx.wait(1);
      return receipt;
    } catch (err) {
      if (err.code === 4001) throw new Error("User rejected transaction");
      if (err.error && err.error.message) throw new Error(err.error.message);
      throw err;
    }
  };

  const fundCampaignDirectly = async (campaignOwnerWallet, amountMatic) => {
    await ensureAmoyNetwork();
    if (!window.ethereum) throw new Error("MetaMask not detected");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const CONTRACT_ADDRESS = "0x17BB689411c1032396a2dB0f0aFB2c6b34939C0a";
    const CONTRACT_ABI_MINIMAL = [
      {
        "inputs": [{ "internalType": "address payable", "name": "campaignOwner", "type": "address" }],
        "name": "fundCampaign",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      }
    ];

    const amountWei = ethers.utils.parseEther(amountMatic.toString());
    const balance = await provider.getBalance(await signer.getAddress());
    if (balance.lt(amountWei)) throw new Error("Insufficient balance");

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI_MINIMAL, signer);
    const tx = await contract.fundCampaign(campaignOwnerWallet, {
      value: amountWei,
      gasLimit: 300000,
    });

    await tx.wait(1);
  };

  const connect = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Please install MetaMask.");
        return false;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setAddress(accounts[0]);

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(contract);
      return true;
    } catch (error) {
      if (error.code === 4001) {
        alert("Connection request was rejected by the user.");
      } else {
        alert("Error connecting wallet: " + (error.message || error));
      }
      console.error("Error connecting wallet:", error);
      return false;
    }
  };

  const donate = async (pId, amount) => {
    try {
      if (!contract) return alert("Contract not loaded.");
      const transaction = await contract.donateToCampaign(pId, {
        value: ethers.utils.parseEther(amount),
      });
      await transaction.wait();
    } catch (error) {
      console.error("Error during donation:", error);
    }
  };

  const getDonations = async (pId) => {
    try {
      if (!contract) return [];
      const donations = await contract.getDonators(pId);
      return donations.map(([donator, donation]) => ({
        donator,
        donation: ethers.utils.formatEther(donation),
      }));
    } catch (error) {
      console.error("Error fetching donations:", error);
      return [];
    }
  };

  return (
    <StateContext.Provider
      value={{
        address,
        connect,
        donate,
        getDonations,
        createCampaignOnChain,
        fundCampaignOnChain,
        fundCampaignDirectly,
        theme,           // <-- ✅ Provide theme
        setTheme         // <-- ✅ Provide setTheme
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
