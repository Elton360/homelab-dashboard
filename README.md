# Homelab Dashboard

A single-page dashboard for my home server. It shows system health and the status of the self-hosted services running on it, and links to each of them.

## Features

- **System metrics** from Prometheus / node_exporter: CPU usage and temperature, memory, disk usage per mount, uptime, and CPU and network history charts
- **Container status** from Portainer: running and stopped counts, plus an online indicator on each service card
- **Media library counts** from Jellyfin
- **Search** that filters the service cards
- **Public and internal modes:** the public build shows a subset of services and the API only returns allowlisted containers. The internal build shows everything and is meant to sit behind authentication.

## Stack

- **Client:** React 19, Vite, Apollo Client, styled-components, Chart.js / ECharts
- **Server:** Node.js, Express, Apollo Server (GraphQL), axios

## How it works

```
Prometheus ─┐
Portainer  ─┼─> server (GraphQL) ──> client (React)
Jellyfin   ─┘
```

The client sends one GraphQL query (`client/src/graphql/dashboardSummary.gql`) and builds its cards and charts from the result. Each module in `server/api/` talks to one upstream service and handles its own authentication, caching the token and logging in again when it expires.

## Getting started

Requires Node.js 20.19+ (for Vite 7).

### Server

```sh
cd server
npm install
cp .env.example .env   # fill in your URLs and credentials
npm run dev            # http://localhost:3001/graphql
```

### Client

```sh
cd client
npm install
npm run dev
```

In development, the client reads its API URL from `client/.env.development`, which points at `localhost:3001`.

## Deployment

The server runs under [pm2](https://pm2.keymetrics.io/):

```sh
npm start                # public instance on port 4000
npm run start:internal   # internal instance on port 4001
```

For the client, copy `client/.env.example` to `.env.production.local` and set your URLs. Then run `npm run build`. The build script copies `dist/` to `/var/www/server-landing`, so change that path to suit your web server.

### Internal mode

Services that should only appear on the internal dashboard go in `client/src/internal/services.jsx`. That folder is gitignored, and `client/src/internal.empty.js` shows the interface it needs to implement. Build the internal dashboard with `npm run build:internal`, which reads `.env.internal.local`.

On the server, `CONTAINER_ALLOWLIST` limits which containers the public instance returns. The internal instance ignores it.

## Notes

- The Portainer environment ID is hardcoded to `3` in `server/api/portainer.js`.
- Pi-hole is optional: leave `PIHOLE_API_URL` empty in `.env` to skip it. If Pi-hole is unreachable or misconfigured, the rest of the dashboard still works.
