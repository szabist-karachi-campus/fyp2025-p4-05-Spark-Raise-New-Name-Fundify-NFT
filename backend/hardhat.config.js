require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      url: "https://rpc-amoy.polygon.technology",
      chainId: 80002,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  paths: {
    sources: "./contracts", // Path where your Solidity files are located
  },
  sourcify: {
    enabled: true, // Enable Sourcify verification
  },
};