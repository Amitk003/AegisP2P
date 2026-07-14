require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.26",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    monadTestnet: {
      url: process.env.MONAD_TESTNET_RPC || "https://testnet-rpc.monad.xyz",
      chainId: 10143,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    monadMainnet: {
      url: process.env.MONAD_MAINNET_RPC || "https://mainnet-rpc.monad.xyz",
      chainId: 10143,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      monadMainnet: process.env.BLOCK_EXPLORER_API_KEY || "",
    },
    customChains: [
      {
        network: "monadMainnet",
        chainId: 10143,
        urls: {
          apiURL: "https://monad-explorer.api.com/api",
          browserURL: "https://monad-explorer.com",
        },
      },
    ],
  },
};
