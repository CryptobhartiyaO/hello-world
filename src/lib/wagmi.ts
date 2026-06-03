import { http, createConfig } from "wagmi";
import { injected, metaMask } from "wagmi/connectors";
import { defineChain } from "viem";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const liteForge = defineChain({
  id: 4441,
  name: "LiteForge",
  nativeCurrency: { name: "zkLTC", symbol: "zkLTC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://liteforge.rpc.caldera.xyz/http"] },
  },
  blockExplorers: {
    default: { name: "LiteForge Explorer", url: "https://liteforge.explorer.caldera.xyz" },
  },
});

export const EXPLORER = liteForge.blockExplorers.default.url;

export const wagmiConfig = getDefaultConfig({
  appName: "BetsOnBlock",
  projectId: "betsonblock-litvm",
  chains: [liteForge],
  transports: { [liteForge.id]: http() },
  ssr: false,
});
