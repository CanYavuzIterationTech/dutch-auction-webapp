const s3BucketName = process.env.S3_BUCKET_NAME;
const s3Region = process.env.S3_REGION;
const s3AccessKeyId = process.env.S3_ACCESS_KEY;
const s3SecretAccessKey = process.env.S3_SECRET_KEY;

if (!s3BucketName) {
  throw new Error("S3_BUCKET_NAME is not set");
}
if (!s3Region) {
  throw new Error("S3_REGION is not set");
}
if (!s3AccessKeyId) {
  throw new Error("S3_ACCESS_KEY_ID is not set");
}
if (!s3SecretAccessKey) {
  throw new Error("S3_SECRET_ACCESS_KEY is not set");
}

export const S3_BUCKET_NAME = s3BucketName;
export const S3_REGION = s3Region;
export const S3_ACCESS_KEY_ID = s3AccessKeyId;
export const S3_SECRET_ACCESS_KEY = s3SecretAccessKey;
