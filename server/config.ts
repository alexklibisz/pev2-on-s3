const pathPrefixRaw = process.env.PEV2_ON_S3_BUCKET_PATH_PREFIX;

export const config = {
  server: {
    port: parseInt(process.env.PEV2_ON_S3_SERVER_PORT || "3000", 10),
  },
  s3: {
    endpoint: process.env.PEV2_ON_S3_BUCKET_ENDPOINT,
    region: process.env.PEV2_ON_S3_BUCKET_REGION || "auto",
    accessKeyId: process.env.PEV2_ON_S3_BUCKET_ACCESS_KEY_ID!,
    secretAccessKey: process.env.PEV2_ON_S3_BUCKET_SECRET_ACCESS_KEY!,
    bucket: process.env.PEV2_ON_S3_BUCKET!,
    pathPrefix: pathPrefixRaw
      ? pathPrefixRaw.replace(/\/+$/, "") + "/"
      : "",
  },
  frontend: {
    siteTitle: process.env.PEV2_ON_S3_FRONTEND_SITE_TITLE || "pev2",
  },
};
