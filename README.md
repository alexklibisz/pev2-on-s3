# pev2-on-s3

A self-hosted server for Postgres Explain Visualizer 2 ([pev2](https://github.com/dalibo/pev2)) that stores plans on S3-compatible object storage.

Paste a query plan, get a shareable link.

## Functionality

- **Store plans in S3** - [explain.dalibo.com](https://github.com/dalibo/explain.dalibo.com) already serves the same purpose, but it requires a Postgres database to deploy. I love Postgres, but an S3 bucket is a lot simpler and cheaper than a full Postgres database.
- **Submit plans** — paste `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` output with an optional title and query
- **Visualize plans** — plans are rendered with [pev2](https://github.com/dalibo/pev2), showing node timing, rows, buffers, and cost estimates
- **Share plans** — each plan gets a unique URL you can send to teammates
- **View recent plans** — your plans are tracked in browser local storage, with one-click clear
- **Delete plans** — only the original creator can delete a plan, authorized using a secret key stored in browser local storage
- **Dark mode** — toggle between light and dark themes
- **S3 startup check** — the server verifies S3 connectivity on boot and fails fast if misconfigured
- **Configurable site title** — customize the navbar and browser tab title via environment variable
- **Custom banner** — display a custom HTML banner at the top of the page via environment variable

## Quick start

The included `docker-compose.yaml` runs the app with a local [MinIO](https://min.io/) instance for S3 storage:

```bash
docker-compose up --build
```

Then open [http://localhost:3000](http://localhost:3000).

## Configuration

All configuration is done via environment variables.

### S3 / Storage

| Variable | Required | Default | Description |
|---|---|---|---|
| `PEV2_ON_S3_BUCKET_ENDPOINT` | Yes | | S3-compatible endpoint URL (e.g. `https://s3.amazonaws.com`, `http://minio:9000`) |
| `PEV2_ON_S3_BUCKET_REGION` | No | `auto` | S3 bucket region |
| `PEV2_ON_S3_BUCKET` | Yes | | S3 bucket name |
| `PEV2_ON_S3_BUCKET_ACCESS_KEY_ID` | Yes | | S3 access key ID |
| `PEV2_ON_S3_BUCKET_SECRET_ACCESS_KEY` | Yes | | S3 secret access key |
| `PEV2_ON_S3_BUCKET_PATH_PREFIX` | No | | Optional key prefix for all stored objects (e.g. `production`) |

### Server

| Variable | Required | Default | Description |
|---|---|---|---|
| `PEV2_ON_S3_SERVER_PORT` | No | `3000` | Port the server listens on |

### Frontend

| Variable | Required | Default | Description |
|---|---|---|---|
| `PEV2_ON_S3_FRONTEND_SITE_TITLE` | No | `pev2` | Site title shown in the navbar and browser tab |
| `PEV2_ON_S3_CUSTOM_BANNER` | No | | Custom HTML banner displayed at the top of the page |

## Deploying with Docker

```bash
docker build -t pev2-on-s3 .

docker run -p 3000:3000 \
  -e PEV2_ON_S3_BUCKET_ENDPOINT=https://s3.amazonaws.com \
  -e PEV2_ON_S3_BUCKET_REGION=us-east-1 \
  -e PEV2_ON_S3_BUCKET=my-pev2-bucket \
  -e PEV2_ON_S3_BUCKET_ACCESS_KEY_ID=AKIA... \
  -e PEV2_ON_S3_BUCKET_SECRET_ACCESS_KEY=... \
  pev2-on-s3
```

On startup the server writes and reads back a test object to verify S3 connectivity. If the credentials or bucket are misconfigured, the container will exit with an error.

## Local development

The easiest way to develop is with Docker — no local Node.js installation required.

### Fully containerized (recommended)

```bash
npm run dev:docker
# or directly:
docker compose -f dev/docker-compose.yaml up
```

This starts three services:

| Service | URL | Description |
|---|---|---|
| **dev-client** | [http://localhost:5173](http://localhost:5173) | Vite dev server with HMR |
| **dev-server** | [http://localhost:3000](http://localhost:3000) | Express API (tsx watch) |
| **MinIO console** | [http://localhost:9001](http://localhost:9001) | S3 storage UI (minioadmin / minioadmin) |

Your source files are bind-mounted into the containers, so edits trigger hot-reload automatically. Dependencies are installed inside a Docker volume and won't pollute your host.

### Running locally with Node.js

If you prefer running Node.js on your machine, start MinIO in Docker and run the servers directly:

```bash
# Start MinIO
npm run dev:minio

# Create a dev/.env with your S3 settings, then:
npm run dev:server   # watches for changes
npm run dev:client   # Vite dev server (in another terminal)
```

The Vite dev server proxies `/api` requests to the Express server on port 3000.

## Health check

`GET /api/health` returns `{"status":"ok"}` and can be used for container health checks or load balancer probes.
