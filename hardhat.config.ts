import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-vyper";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  vyper: {
    version: "0.3.10",
  },
  networks: {
    kairos: {
      url: "https://public-en-kairos.node.kaia.io",
      accounts: [
        "0x2290b2bd6fd9c61484b0d1b87d6b0a38764218a128a0df632f56714324e86163",
      ],
    },
  },
  etherscan: {
    apiKey: {
      kairos: "unnecessary",
    },
    customChains: [
      {
        network: "kairos",
        chainId: 1001,
        urls: {
          apiURL: "https://compiler-api-v2.kaiascan.io/kairos/hardhat-verify",
          browserURL: "https://kairos.kaiascan.io",
        },
      },
    ],
  },
};

export default config;
