import { DUTCH_AUCTION_CONTRACT_ADDRESS } from "@/config/constants";
import { DutchAuctionLaunchpadClient } from "@/contract/dutch-auction.client";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useQuery } from "@tanstack/react-query";
import { useConnection } from "./use-connection";

export const useDutchAuctionSigningClient = () => {
  const { address, getSigningCosmWasmClient, status } = useConnection();

  return useQuery({
    queryKey: ["use-dutch-auction-signing-client", address, status],
    queryFn: async () =>
      await getDutchAuctionLaunchpadClient({
        getSigningCosmWasmClient,
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
  getSigningCosmWasmClient,
  address,
}: {
  getSigningCosmWasmClient: () => Promise<SigningCosmWasmClient>;
  address: string | undefined;
}) => {
  const signingClient = await getSigningCosmWasmClient();

  if (!address) {
    return undefined;
  }

  return new DutchAuctionLaunchpadClient(
    signingClient,
    address,
    DUTCH_AUCTION_CONTRACT_ADDRESS
  );
};
