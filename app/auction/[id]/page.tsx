import { AuctionBuy } from "@/components/auction-buy";
import { JsonS3Client } from "@/backend/json-s3-client";
import { getBackendCosmWasmClient } from "@/backend/cosmwasm-client";
import { DutchAuctionLaunchpadQueryClient } from "@/contract/dutch-auction.client";
import { DUTCH_AUCTION_CONTRACT_ADDRESS } from "@/config/constants";
import { notFound } from "next/navigation";

const jsonS3Client = new JsonS3Client();

async function fetchOMUSDTPrice() {
  const symbol = 'OMUSDT';
  const apiUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    const price = parseFloat(data.price).toFixed(4); // Format price to 4 decimal places
    return price;
  } catch (error) {
    console.error('Error fetching the OM/USDT price:', error);
  }
}



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

    const omUsdtPrice = await fetchOMUSDTPrice();

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

    return <AuctionBuy data={combinedData} id={params.id} omUsdtPrice={Number(omUsdtPrice)} />;
  } catch (error) {
    console.error("Error fetching auction data:", error);
    notFound();
  }
}
