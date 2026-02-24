// src/lib/b2-s3.ts
import { S3Client } from "@aws-sdk/client-s3";
import type { AwsCredentialIdentity } from "@aws-sdk/types";

const { B2_KEY_ID, B2_APP_KEY } = process.env;

if (!B2_KEY_ID || !B2_APP_KEY) {
  throw new Error(
    "Missing Backblaze B2 credentials: set B2_KEY_ID and B2_APP_KEY in .env",
  );
}

const credentials: AwsCredentialIdentity = {
  accessKeyId: B2_KEY_ID,
  secretAccessKey: B2_APP_KEY,
};

export const bucketClient = new S3Client({
  region: "us-east-005", // your region
  endpoint: "https://s3.us-east-005.backblazeb2.com",
  forcePathStyle: true, 
  credentials,
});
