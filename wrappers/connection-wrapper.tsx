"use client";

import { useDutchAuctionQueryClient } from "@/hooks/use-da-query";
import { useDutchAuctionSigningClient } from "@/hooks/use-da-signing";
import { createContext, useContext } from "react";
import { DutchAuctionLaunchpadClient } from "@/contract/dutch-auction.client";
import { DutchAuctionLaunchpadQueryClient } from "@/contract/dutch-auction.client";

interface ConnectionContextType {
  queryClient: DutchAuctionLaunchpadQueryClient | undefined;
  signingClient: DutchAuctionLaunchpadClient | undefined;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(
  undefined
);

export function useAuctionClients() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useAuctionClients must be used within ConnectionWrapper");
  }
  return context;
}

export function ConnectionWrapper({ children }: { children: React.ReactNode }) {
  const { data: queryClient } = useDutchAuctionQueryClient();
  const { data: signingClient } = useDutchAuctionSigningClient();

  if (!queryClient || !signingClient) {
    return null;
  }

  return (
    <ConnectionContext.Provider value={{ queryClient, signingClient }}>
      {children}
    </ConnectionContext.Provider>
  );
}
