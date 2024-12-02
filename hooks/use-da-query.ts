import { DUTCH_AUCTION_CONTRACT_ADDRESS } from "@/config/constants";
import { DutchAuctionLaunchpadQueryClient } from "@/contract/dutch-auction.client";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

import { useQuery } from "@tanstack/react-query";
import { useConnection } from "./use-connection";

export const useDutchAuctionQueryClient = () => {
  const { address, getCosmWasmClient, status } = useConnection();

  return useQuery({
    queryKey: ["use-dutch-auction-query-client", address, status],
    queryFn: async () =>
      await getDutchAuctionLaunchpadClient({
        getCosmWasmClient,
        address,
      }),
    enabled: !!address,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
    gcTime: Infinity,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
};

const getDutchAuctionLaunchpadClient = async ({
  getCosmWasmClient,
  address,
}: {
  getCosmWasmClient: () => Promise<CosmWasmClient>;
  address: string | undefined;
}) => {
  const client = await getCosmWasmClient();

  if (!address) {
    return undefined;
  }

  return new DutchAuctionLaunchpadQueryClient(
    client,
    DUTCH_AUCTION_CONTRACT_ADDRESS
  );
};
