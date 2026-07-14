import { http, createConfig } from "wagmi";
import { monadTestnet } from "wagmi/chains";

export const monadChain = {
  ...monadTestnet,
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
    public: { http: ["https://testnet-rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: { name: "MonadScan", url: "https://testnet.monad.xyz" },
  },
};

export const config = createConfig({
  chains: [monadChain],
  transports: {
    [monadChain.id]: http(),
  },
  ssr: true,
});
