import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { config } from "./config.js";

const client = new S3Client({
  endpoint: config.s3.endpoint,
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
  forcePathStyle: true,
});

const bucket = config.s3.bucket;

function prefixedKey(key: string): string {
  return config.s3.pathPrefix + key;
}

export async function putObject(key: string, body: string): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: prefixedKey(key),
      Body: body,
      ContentType: "application/json",
    })
  );
}

export async function getObject(key: string): Promise<string | null> {
  try {
    const resp = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: prefixedKey(key) })
    );
    return (await resp.Body?.transformToString()) ?? null;
  } catch (err: any) {
    if (err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404) {
      return null;
    }
    throw err;
  }
}

export async function deleteObject(key: string): Promise<void> {
  await client.send(
    new DeleteObjectCommand({ Bucket: bucket, Key: prefixedKey(key) })
  );
}

export async function checkConnection(): Promise<void> {
  const key = "_health-check";
  const body = "ok";
  await putObject(key, body);
  const result = await getObject(key);
  if (result !== body) {
    throw new Error("S3 read-back mismatch");
  }
  await deleteObject(key);
}
