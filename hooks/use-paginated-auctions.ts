"use client";
import { DutchAuctionLaunchpadQueryClient } from "@/contract/dutch-auction.client";
import { useQuery } from "@tanstack/react-query";
import { useDutchAuctionQueryClient } from "./use-da-query";

export const usePaginatedAuctions = () => {
  const { data: queryClient } = useDutchAuctionQueryClient();

  return useQuery({
    queryKey: ["auctions"],
    queryFn: async () => await paginateAuctionsQuery(queryClient),
    refetchInterval: 10000,
    enabled: !!queryClient,
  });
};

const paginateAuctionsQuery = async (
  queryClient: DutchAuctionLaunchpadQueryClient | undefined
) => {
  try {
    const res = await queryClient?.auctions({
      startAfter: 0,
      limit: 100,
    });
    return res;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};
