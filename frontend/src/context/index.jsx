import React, { useContext, createContext, useState, useEffect } from "react";
import { ethers } from "ethers";

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [theme, setTheme] = useState('dark');

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Initialize provider and auto-connect wallet if possible
  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      provider.listAccounts().then((accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        }
      });

      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        } else {
          setAddress(null);
        }
      });
    }
  }, []);

  // Connect to MetaMask (user action)
  const connect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this feature');
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      setAddress(accounts[0]);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  // Disconnect from MetaMask
  const disconnect = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }]
      });
      setAddress(null);
    } catch (error) {
      console.error('Error disconnecting from MetaMask:', error);
    }
  };

  const getCampaigns = async (wallet) => {
    // const campaigns = await contract.call('getCampaigns');

    const response = await fetch(
      `http://localhost:5001/api/schema?${
        wallet ? `wallet_address=${wallet}` : ""
      }`
    );
    const data = await response.json();

    // const parsedCampaings = campaigns.map((campaign, i) => ({
    //   owner: campaign.owner,
    //   title: campaign.title,
    //   description: campaign.description,
    //   target: ethers.utils.formatEther(campaign.target.toString()),
    //   deadline: campaign.deadline.toNumber(),
    //   amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
    //   image: campaign.image,
    //   pId: i
    // }));

    return data;
  };

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns(address);

    // const filteredCampaigns = allCampaigns.filter(
    //   (campaign) => campaign.owner === address
    // );

    return allCampaigns;
  };

  // --- Blockchain Crowdfunding Integration ---
  const CONTRACT_ADDRESS = "0x3e84af4Ed606D47C453947AA2dBC2aEac3922E45";
  const CONTRACT_ABI = [
    {
      "inputs": [
        { "internalType": "string", "name": "_title", "type": "string" },
        { "internalType": "string", "name": "_description", "type": "string" },
        { "internalType": "uint256", "name": "_target", "type": "uint256" },
        { "internalType": "uint256", "name": "_deadline", "type": "uint256" }
      ],
      "name": "createCampaign",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "_id", "type": "uint256" }
      ],
      "name": "donateToCampaign",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "_id", "type": "uint256" }
      ],
      "name": "getDonators",
      "outputs": [
        { "internalType": "address[]", "name": "", "type": "address[]" },
        { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "campaignCount",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "name": "campaigns",
      "outputs": [
        { "internalType": "address", "name": "owner", "type": "address" },
        { "internalType": "string", "name": "title", "type": "string" },
        { "internalType": "string", "name": "description", "type": "string" },
        { "internalType": "uint256", "name": "target", "type": "uint256" },
        { "internalType": "uint256", "name": "deadline", "type": "uint256" },
        { "internalType": "uint256", "name": "amountCollected", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
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

    // Validate deadline
    const now = Math.floor(Date.now() / 1000);
    if (deadline <= now) throw new Error("Deadline must be in the future");

    // Validate and convert target
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
      const receipt = await tx.wait(2); // Wait for 2 confirmations
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

    // Validate amount
    let amountWei;
    try {
      if (!amountMatic || isNaN(amountMatic) || parseFloat(amountMatic) < 0.001) throw new Error("Minimum is 0.001 MATIC");
      amountWei = ethers.utils.parseEther(amountMatic.toString());
    } catch (err) {
      throw new Error("Invalid amount: " + err.message);
    }

    // Check user balance
    const userAddress = await signer.getAddress();
    const balance = await provider.getBalance(userAddress);
    if (balance.lt(amountWei)) throw new Error("Insufficient MATIC balance");

    try {
      const tx = await contract.donateToCampaign(campaignId, {
        value: amountWei,
        gasLimit: 300000,
      });
      const receipt = await tx.wait(1); // Wait for 1 confirmation
      return receipt;
    } catch (err) {
      if (err.code === 4001) throw new Error("User rejected transaction");
      if (err.error && err.error.message) throw new Error(err.error.message);
      throw err;
    }
  };

  const donate = async (pId, amount) => {
    await ensureAmoyNetwork();
    if (!window.ethereum) throw new Error("MetaMask not detected");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const tx = await contract.donateToCampaign(pId, {
      value: ethers.utils.parseEther(amount),
      gasLimit: 300000,
    });
    await tx.wait(1);
  };

  const getDonations = async (pId) => {
    await ensureAmoyNetwork();
    if (!window.ethereum) throw new Error("MetaMask not detected");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const [donators, donations] = await contract.getDonators(pId);
    return donators.map((donator, i) => ({
      donator,
      donation: ethers.utils.formatEther(donations[i]),
    }));
  };

  return (
    <StateContext.Provider
      value={{
        address,
        connect,
        disconnect,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
        provider,
        theme,
        toggleTheme,
        createCampaignOnChain,
        fundCampaignOnChain,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
