const hre = require("hardhat");

async function main() {
  // Get the ContractFactory for NFTFund
  const NFTFund = await hre.ethers.getContractFactory("NFTFund");

  // Deploy the contract
  const nftFund = await NFTFund.deploy();

  // Wait for deployment to complete
  await nftFund.waitForDeployment();

  // Get contract address
  const contractAddress = await nftFund.getAddress();

  console.log(`NFTFund contract deployed to: ${contractAddress}`);
}

// Handle errors properly
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
