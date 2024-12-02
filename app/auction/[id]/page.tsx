import { AuctionBuy } from "@/components/auction-buy";
import { JsonS3Client } from "@/backend/json-s3-client";

const jsonS3Client = new JsonS3Client();
export default async function AuctionPage({
  params,
}: {
  params: { id: string };
}) {
  const auctionData = await jsonS3Client.getJson(`${params.id}.json`);

  if (!auctionData) {
    return <div>No auction data found</div>;
  }

  return <AuctionBuy data={auctionData} id={params.id} />;
}
