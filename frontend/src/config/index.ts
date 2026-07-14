import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http, createConfig, injected } from "wagmi";

export const monadChain = {
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
} as const;

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export const config = projectId
  ? getDefaultConfig({
      appName: "AegisP2P",
      projectId,
      chains: [monadChain],
      transports: {
        [monadChain.id]: http(),
      },
      ssr: true,
    })
  : createConfig({
      chains: [monadChain],
      connectors: [injected()],
      transports: {
        [monadChain.id]: http(),
      },
      ssr: true,
    });
