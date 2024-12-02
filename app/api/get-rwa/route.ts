import { JsonS3Client } from "@/backend/json-s3-client";
import { unstable_noStore } from "next/cache";

const jsonS3Client = new JsonS3Client();

export async function GET(request: Request) {
  unstable_noStore();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json(
      { success: false, error: "No id provided" },
      { status: 400 }
    );
  }

  const auctionData = await jsonS3Client.getJson(`${id}.json`);

  if (!auctionData) {
    return Response.json(
      { success: false, error: "Auction data not found" },
      { status: 404 }
    );
  }

  return Response.json({ success: true, auctionData });
}
