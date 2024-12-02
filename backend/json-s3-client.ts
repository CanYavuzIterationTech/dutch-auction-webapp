import { S3LocalClient } from "./s3-local-client";
import { UploadRequestBody, uploadRequestBodySchema } from "./types";

export class JsonS3Client {
  private s3Client: S3LocalClient;

  constructor() {
    this.s3Client = new S3LocalClient();
  }

  async uploadJson(json: UploadRequestBody, key: string) {
    const validationResult = uploadRequestBodySchema.safeParse(json);
    if (!validationResult.success) {
      throw new Error("Invalid JSON");
    }
    const jsonString = JSON.stringify(validationResult.data);

    const buffer = Buffer.from(jsonString, "utf-8");
    try {
      await this.s3Client.uploadFile(buffer, key);
      return true;
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      return false;
    }
  }

  async getJson(key: string) {
    try {
      const object = await this.s3Client.getFile(key);
      if (!object) {
        return null;
      }
      // Convert stream to string
      const chunks = [];
      for await (const chunk of object as unknown as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      const jsonString = buffer.toString("utf-8");

      const output = JSON.parse(jsonString);
      // validate the output
      const validationResult = uploadRequestBodySchema.safeParse(output);
      if (!validationResult.success) {
        return null;
      }
      return validationResult.data;
    } catch (err) {
      console.error(err);
    }
  }
}
