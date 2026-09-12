# Module design

## Present frontend

- `src/App.tsx`: dashboard composition and in-memory demo interactions.
- `src/App.css`: component and responsive styles.
- `src/index.css`: global tokens and focus behavior.

When the API is available, extract types and a `dashboardApi` module, add loading/error states, and keep vendor-specific logic outside the UI.

## Recommended backend modules

- `collectors/`: router/AP adapters.
- `normalization/`: raw-client conversion.
- `services/`: state, zone and alert rules.
- `api/`: authenticated endpoints.
- `storage/`: latest snapshots, events and retention.
