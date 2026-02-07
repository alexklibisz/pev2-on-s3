import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import routes from "./routes.js";
import { checkConnection } from "./s3.js";
import { config } from "./config.js";

const app = express();
const port = config.server.port;

app.use(express.json({ limit: "10mb" }));
app.use(routes);

// Serve built Vue SPA
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));

// SPA fallback — all non-API routes serve index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

async function start() {
  console.log("Checking S3 connectivity...");
  await checkConnection();
  console.log("S3 connection verified.");

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
