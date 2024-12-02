import { JsonS3Client } from "@/backend/json-s3-client";
import { uploadMainBodySchema } from "@/backend/types";
import { hash } from "crypto";

const jsonS3Client = new JsonS3Client();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the body
    const validationResult = uploadMainBodySchema.safeParse(body);

    if (!validationResult.success) {
      console.log("validationResult.error", validationResult.error);
      return Response.json(
        { success: false, error: validationResult.error.message },
        { status: 400 }
      );
    }

    const {
      auctionData,
      auctionHash,
      //transactionHash,
      id,
    } = validationResult.data;

    // Generate a unique filename using timestamp and random string

    // body can't be bigger than 4 MB in size
    if (JSON.stringify(auctionData).length > 4 * 1024 * 1024) {
      return Response.json(
        {
          success: false,
          error: "Body is too large",
        },
        { status: 400 }
      );
    }

    const hashedAuctionData = hash("sha256", JSON.stringify(auctionData));

    if (hashedAuctionData !== auctionHash) {
      return Response.json(
        { success: false, error: "Invalid auction hash" },
        { status: 400 }
      );
    }

    const res = await jsonS3Client.uploadJson(auctionData, `${id}.json`);

    if (!res) {
      return Response.json(
        { success: false, error: "Failed to upload auction metadata" },
        { status: 500 }
      );
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error("Error uploading auction metadata:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to upload auction metadata",
      },
      { status: 500 }
    );
  }
}
