# PulseWiFi — indoor monitoring system

PulseWiFi is a responsive dashboard for monitoring devices and Wi-Fi coverage indoors. It is a runnable frontend MVP: it displays clearly labelled demo telemetry, filters devices, and simulates a refresh without router access.

## Run it

Start the API in one terminal:

```bash
cd backend
npm run dev
```

Then start the dashboard in another terminal:

```bash
cd frontend
npm ci
npm run dev
```

Use `npm run build` and `npm run lint` before release.

## Included

- Network health summary and data-source state.
- Floor-zone signal map and activity feed.
- Filterable device inventory.
- Responsive desktop/mobile UI and safe simulated scan.
- A dependency-free local API that reads the host's existing ARP/neighbour cache and returns normalized device snapshots.

## Important boundary

A browser cannot securely discover Wi-Fi clients or query a router itself. The included local backend provides generic, credential-free discovery from the host's existing ARP/neighbour cache; it cannot supply Wi-Fi RSSI or room placement. The UI falls back to clearly labelled demo data if that backend is unavailable. For richer authorized monitoring, add an authenticated server-side collector following [`docs/data-flow.md`](docs/data-flow.md). Never store router credentials in the browser or repository.

Read [`requirements.md`](requirements.md) and the `docs/` directory for scope and implementation guidance.
