import { AuctionBuy } from "@/components/auction-buy";
import { JsonS3Client } from "@/backend/json-s3-client";
import { getBackendCosmWasmClient } from "@/backend/cosmwasm-client";
import { DutchAuctionLaunchpadQueryClient } from "@/contract/dutch-auction.client";
import { DUTCH_AUCTION_CONTRACT_ADDRESS } from "@/config/constants";
import { notFound } from "next/navigation";

const jsonS3Client = new JsonS3Client();

export default async function AuctionPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const cosmwasmClient = await getBackendCosmWasmClient();

    if (!cosmwasmClient) {
      throw new Error("Failed to connect to backend");
    }

    const queryClient = new DutchAuctionLaunchpadQueryClient(
      cosmwasmClient,
      DUTCH_AUCTION_CONTRACT_ADDRESS
    );

    // Fetch both auction data and metadata in parallel
    const [auctionData, metadata] = await Promise.all([
      queryClient.auction({ auctionId: Number(params.id) }),
      jsonS3Client.getJson(`${params.id}.json`),
    ]);

    if (!auctionData || !metadata) {
      notFound();
    }

    // Combine contract data with metadata
    const combinedData = {
      index: Number(params.id),
      info: metadata,
      creator: auctionData.creator,
      end_price: auctionData.end_price,
      end_time: auctionData.end_time,
      in_denom: auctionData.in_denom,
      offered_asset: auctionData.offered_asset,
      remaining_amount: auctionData.remaining_amount,
      start_time: auctionData.start_time,
      starting_price: auctionData.starting_price,
    };

    return <AuctionBuy data={combinedData} id={params.id} />;
  } catch (error) {
    console.error("Error fetching auction data:", error);
    notFound();
  }
}
