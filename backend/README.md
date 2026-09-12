# PulseWiFi generic backend

This zero-dependency Node service exposes a stable monitoring API without assuming a router brand. It reads the computer's existing ARP/neighbour cache, so it does not sweep ports, log into a router, or store router credentials.

## Run

```bash
npm run dev
```

The server starts at `http://localhost:8787`.

## Endpoints

- `GET /api/v1/health` — service health.
- `GET /api/v1/dashboard` — latest cached monitoring snapshot.
- `POST /api/v1/scans` — read the local neighbour cache and save a new snapshot.

On Windows the collector uses `arp -a`; on Linux it uses `ip neigh`. Discovered data is stored locally in `backend/data/state.json`, which is intentionally ignored by Git.

## Limitations

The generic collector can discover currently cached local-network devices and their IP/MAC addresses. It cannot universally retrieve Wi-Fi signal strength, router client names, or indoor location. Those fields require an optional authorized access-point integration later.
