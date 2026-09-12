# Roadmap

## Phase 1 — dashboard MVP (complete)

Replace the generated Vite page with a responsive monitoring dashboard and clearly identified demo telemetry.

## Phase 2 — project definition (complete)

Document requirements, architecture, API contract, security limits and module boundaries.

## Phase 3 — generic backend (complete)

The project now includes a local, router-agnostic Node API and ARP/neighbour-cache collector. It exposes a stable snapshot/scan contract and the frontend uses it when available, with a safe demo fallback.

## Phase 4 — richer authorized integrations (next)

1. Select an authorized router/AP integration when RSSI, access-point client names, or room-level accuracy is needed.
2. Implement authenticated collector and API.
3. Add secret management, access control, retention and health checks.
4. Replace demo state, add integration tests and deploy.
