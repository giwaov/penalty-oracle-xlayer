window.XCUP_CONFIG = {
  contractAddress: "0xAC40CBeaDa2ED563c2B49443E61A174269d88ce5",
  preferredChainId: 196,
  chains: {
    196: {
      chainIdHex: "0xc4",
      chainName: "X Layer mainnet",
      rpcUrls: ["https://xlayerrpc.okx.com", "https://rpc.xlayer.tech"],
      blockExplorerUrls: ["https://www.okx.com/web3/explorer/xlayer"],
      nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
    },
    1952: {
      chainIdHex: "0x7a0",
      chainName: "X Layer testnet",
      rpcUrls: ["https://testrpc.xlayer.tech/terigon", "https://xlayertestrpc.okx.com/terigon"],
      blockExplorerUrls: ["https://www.okx.com/web3/explorer/xlayer-test"],
      nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
    },
  },
};
