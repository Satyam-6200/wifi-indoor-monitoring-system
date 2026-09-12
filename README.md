# PulseWiFi — indoor monitoring system

PulseWiFi is a responsive dashboard for monitoring devices and Wi-Fi coverage indoors. It is a runnable frontend MVP: it displays clearly labelled demo telemetry, filters devices, and simulates a refresh without router access.

## Run it

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

## Important boundary

A browser cannot securely discover Wi-Fi clients or query a router itself. This UI intentionally uses demo data. For authorized production monitoring, add an authenticated server-side collector and API following [`docs/data-flow.md`](docs/data-flow.md). Never store router credentials in the browser or repository.

Read [`requirements.md`](requirements.md) and the `docs/` directory for scope and implementation guidance.
