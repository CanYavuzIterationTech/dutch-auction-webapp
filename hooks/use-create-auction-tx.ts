import { UploadRequestBody } from "@/backend/types";
import { useDutchAuctionLaunchpadCreateAuctionMutation } from "@/contract/dutch-auction.react-query";
import { Uint128 } from "@/contract/dutch-auction.types";
import { Timestamp } from "@/contract/dutch-auction.types";
import { useAuctionClients } from "@/wrappers/connection-wrapper";
import { Coin } from "@cosmjs/amino";

export const useCreateAuctionTx = ({}: //uploadRequestBody,
{
  uploadRequestBody: UploadRequestBody;
}) => {
  const { queryClient, signingClient } = useAuctionClients();
  const { mutateAsync: sendTx } =
    useDutchAuctionLaunchpadCreateAuctionMutation();

  if (!queryClient || !signingClient) {
    return undefined;
  }

  return async ({
    inDenom,
    offeredAsset,
    endTime,
    endPrice,
    startingPrice,
    startTime,
    memoHash,
    funds,
  }: {
    inDenom: string;
    offeredAsset: Coin;
    endTime: Timestamp;
    endPrice: Uint128;
    startingPrice: Uint128;
    startTime: Timestamp;
    memoHash: string;
    funds: Coin[];
  }) => {
    const memo = {
      auctionHash: memoHash,
    };
    const memoString = JSON.stringify(memo);

    return await sendTx({
      client: signingClient,
      msg: {
        inDenom, // bid denomu
        offeredAsset, // starting price 1 milyon  1000 = 10 bin dolar
        endTime, // nanoseconds
        endPrice, // 1 adet paydanın fiyatı 10 bin dolar
        startingPrice, // 1 adet paydanın fiyatı 20 bin dolar
        startTime, // nanoseconds
      },

      args: {
        fee: {
          amount: [
            {
              denom: "uom",
              amount: "0.0025",
            },
          ],
          gas: "500000",
        },
        memo: memoString,
        funds, //
      },
    });
  };
};
