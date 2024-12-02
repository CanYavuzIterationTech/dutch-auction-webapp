"use client";
import { ChainProvider } from "@cosmos-kit/react";
import { chains, assets } from "chain-registry";
import { wallets } from "@cosmos-kit/keplr";
import { GasPrice } from "@cosmjs/stargate";

export function CosmosProvider({ children }: { children: React.ReactNode }) {
  return (
    <ChainProvider
      chains={chains}
      assetLists={assets}
      wallets={wallets}
      walletConnectOptions={{
        signClient: {
          projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
          relayUrl: "wss://relay.walletconnect.org",
          metadata: {
            name: "Dutch Auction",
            description: "A Dutch Auction dApp",
            url: "https://your-website.com",
            icons: ["https://your-website.com/icon.png"],
          },
        },
      }}
      signerOptions={{
        signingStargate: () => {
          return {
            gasPrice: GasPrice.fromString("0.0025uom"),
          };
        },
      }}
    >
      {children}
    </ChainProvider>
  );
}