"use client";
import { ChakraProvider } from "@chakra-ui/react";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { sepolia, hardhat } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { GovernorContractProvider } from "./context/GovernorContractProvider";

const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY

const { chains, publicClient } = configureChains(
  [hardhat, sepolia],
  [
    alchemyProvider({ apiKey: ALCHEMY_KEY }),
    publicProvider()
  ]
);


const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: false,
  connectors,
  publicClient,
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider 
            chains={chains}
            theme={darkTheme()}>
            <GovernorContractProvider>
              <ChakraProvider>
                {children}
              </ChakraProvider>
            </GovernorContractProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  );
}
