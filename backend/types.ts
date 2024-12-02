import { z } from "zod";

// Define the type for the incoming request body
export const uploadRequestBodySchema = z.object({
  // Auction timing and pricing
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  startingPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Must be a valid number string"),
  minimumPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "Must be a valid number string"),
  tokenCount: z.string().regex(/^\d+$/, "Must be a valid integer string"),

  // Property descriptions
  layout1: z.string(),
  layout2: z.string(),
  views1: z.string(),
  views2: z.string(),
  outdoor1: z.string(),
  outdoor2: z.string(),
  wellness1: z.string(),
  wellness2: z.string(),
  interior1: z.string(),
  interior2: z.string(),

  // Base64 image data
  image: z
    .string()
    .regex(
      /^data:image\/(jpeg|png|gif|webp);base64,/,
      "Must be a valid base64 image string"
    ),
});

export type UploadRequestBody = z.infer<typeof uploadRequestBodySchema>;

export const uploadMainBodySchema = z.object({
  auctionData: uploadRequestBodySchema,
  auctionHash: z.string(),
  transactionHash: z.string(),
  id: z.string()
});

export type UploadMainBody = z.infer<typeof uploadMainBodySchema>;
