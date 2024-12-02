import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_REGION,
  S3_BUCKET_NAME,
} from "@/config/backend-environment";

export class S3LocalClient {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: S3_REGION,
      credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(file: Buffer, key: string) {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: file,
    });

    try {
      await this.client.send(command);
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw error;
    }
  }

  async getFile(key: string) {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });
    try {
      const response = await this.client.send(command);
      return response.Body;
    } catch (error) {
      console.error("Error getting file from S3:", error);
      throw error;
    }
  }

  async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });
    try {
      await this.client.send(command);
    } catch (error) {
      console.error("Error deleting file from S3:", error);
      throw error;
    }
  }
  async uploadJson(json: JSON, key: string) {
    const jsonString = JSON.stringify(json);
    const buffer = Buffer.from(jsonString, "utf-8");
    try {
      await this.uploadFile(buffer, key);
    } catch (error) {
      console.error("Error uploading JSON to S3:", error);
      throw error;
    }
  }

  async getJson(key: string) {
    const object = await this.getFile(key);
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
    return JSON.parse(jsonString);
  }
}
