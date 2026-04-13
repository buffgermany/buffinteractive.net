import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ============================================================
// MinIO S3 Client (Server-Side Only)
//
// Uses the standard AWS SDK v3. MinIO is fully S3-compatible.
// ============================================================

if (
  !process.env["MINIO_ENDPOINT"] ||
  !process.env["MINIO_ACCESS_KEY"] ||
  !process.env["MINIO_SECRET_KEY"]
) {
  throw new Error(
    "[web] MINIO_ENDPOINT, MINIO_ACCESS_KEY, and MINIO_SECRET_KEY must be set."
  );
}

export const minioClient = new S3Client({
  endpoint: process.env["MINIO_ENDPOINT"],
  region: process.env["MINIO_REGION"] ?? "us-east-1",
  credentials: {
    accessKeyId: process.env["MINIO_ACCESS_KEY"],
    secretAccessKey: process.env["MINIO_SECRET_KEY"],
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET = process.env["MINIO_BUCKET"] ?? "platform-assets";

/**
 * Generates a pre-signed PUT URL for direct browser → MinIO upload.
 * The browser performs the actual upload, bypassing Next.js entirely.
 *
 * @param key    - MinIO object key (e.g. "products/cuid/filename.zip")
 * @param contentType - MIME type (e.g. "application/zip")
 * @param expiresIn  - URL validity in seconds (default: 15 minutes)
 */
export async function getPresignedPutUrl(
  key: string,
  contentType: string,
  expiresIn = 900
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(minioClient, command, { expiresIn });
}

/**
 * Generates a pre-signed GET URL for secure asset downloads.
 * Default expiry is 15 minutes — enough for a download to start.
 *
 * @param key       - MinIO object key
 * @param expiresIn - URL validity in seconds (default: 900 = 15 min)
 */
export async function getPresignedGetUrl(
  key: string,
  expiresIn = 900
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(minioClient, command, { expiresIn });
}

/**
 * Constructs a canonical MinIO object key for product assets.
 * Format: products/{productId}/{filename}
 */
export function buildAssetKey(productId: string, filename: string): string {
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `products/${productId}/${sanitized}`;
}
