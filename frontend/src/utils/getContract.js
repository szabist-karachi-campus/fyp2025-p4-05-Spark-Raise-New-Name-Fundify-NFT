import { ethers } from "ethers";
import CampaignFunding from "../artifacts/contracts/CampaignFunding.sol/CampaignFunding.json"; // Update the path based on your contract ABI

// Set up provider and contract
export const getContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum); // Using Metamask
  const signer = provider.getSigner();
  const contract = new ethers.Contract(
    process.env.REACT_APP_CONTRACT_ADDRESS,
    CampaignFunding.abi,
    signer
  );
  return contract;
};
