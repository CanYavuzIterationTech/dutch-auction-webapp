import { getBackendCosmWasmClient } from "@/backend/cosmwasm-client";
import { JsonS3Client } from "@/backend/json-s3-client";
import { UploadRequestBody } from "@/backend/types";
import HomePage from "@/components/home-page";
import { DUTCH_AUCTION_CONTRACT_ADDRESS } from "@/config/constants";
import { DutchAuctionLaunchpadQueryClient } from "@/contract/dutch-auction.client";
import { Coin } from "@cosmjs/amino";

export type Auction = {
  index: number;
  info: UploadRequestBody;
  creator: string;
  end_price: string;
  end_time: string;
  in_denom: string;
  offered_asset: {
    amount: string;
    denom: string;
  };
  remaining_amount: string;
  start_time: string;
  starting_price: string;
};

const jsonS3Client = new JsonS3Client();

export default async function Home() {
  const cosmwasmClient = await getBackendCosmWasmClient();

  if (!cosmwasmClient) {
    return <div>Failed to connect to the backend</div>;
  }

  const queryClient = new DutchAuctionLaunchpadQueryClient(
    cosmwasmClient,
    DUTCH_AUCTION_CONTRACT_ADDRESS
  );

  const auctions = await queryClient.auctions({
    startAfter: 0,
    limit: 100,
  });

  const jsonAuctions = Promise.allSettled(
    auctions.map(async (auction) => {
      return {
        index: auction[0],
        info: await jsonS3Client.getJson(`${auction[0]}.json`),
        ...auction[1],
      };
    })
  );

  const results = await jsonAuctions;

  // First, create a type guard to check if a result is valid
  function isValidAuction(
    result:
      | {
          creator: string;
          end_price: string;
          end_time: string;
          in_denom: string;
          offered_asset: Coin;
          remaining_amount: string;
          start_time: string;
          starting_price: string;
          index: number;
          info: UploadRequestBody | null | undefined;
        }
      | undefined
  ): result is Auction {
    return result !== undefined && result !== null && !!result.info;
  }

  // Then modify the filtering code
  const filteredResults = results
    .map((result) => {
      if (result.status === "fulfilled" && result.value.info) {
        return result.value;
      }
      return undefined;
    })
    .filter(isValidAuction); // This will properly narrow the type

  console.log(filteredResults);

  return <HomePage auctions2={filteredResults} />;
}
