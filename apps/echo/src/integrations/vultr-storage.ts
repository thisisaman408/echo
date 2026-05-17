import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

/**
 * Vultr Object Storage is S3-compatible. We use it to archive each meeting's
 * audio file so the audit drill-down (M3.2) can play the originating snippet.
 * Endpoint is regional, e.g. https://ap-northeast-1.vultrobjects.com.
 */

const s3Singleton = (() => {
  let client: S3Client | null = null;
  return () => {
    if (client) return client;
    client = new S3Client({
      endpoint: env.VULTR_STORAGE_ENDPOINT,
      region: "us-east-1", // Vultr ignores this; AWS SDK requires a value
      credentials: {
        accessKeyId: env.VULTR_STORAGE_ACCESS_KEY,
        secretAccessKey: env.VULTR_STORAGE_SECRET_KEY,
      },
      forcePathStyle: true,
    });
    return client;
  };
})();

export async function putAudio(
  key: string,
  body: Buffer | Uint8Array,
  contentType = "video/mp4",
): Promise<string> {
  await s3Singleton().send(
    new PutObjectCommand({
      Bucket: env.VULTR_STORAGE_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return key;
}

/**
 * Pre-signed URL valid for `expiresIn` seconds. Used by the dashboard to load
 * audio in the audit drill-down without exposing the storage credentials.
 */
export async function getSignedAudioUrl(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  return getSignedUrl(
    s3Singleton(),
    new GetObjectCommand({
      Bucket: env.VULTR_STORAGE_BUCKET,
      Key: key,
    }),
    { expiresIn },
  );
}
