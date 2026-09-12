# Data flow and API contract

1. An authorized collector reads client observations from a router/access point.
2. It normalizes device records and estimates a zone from AP or configured mapping.
3. The API stores a snapshot and event history.
4. The UI reads `GET /api/v1/dashboard` and triggers `POST /api/v1/scans` for refresh.

```json
{
  "generatedAt": "2026-09-12T10:25:00Z",
  "source": "router-collector",
  "devices": [{
    "id": "device_01",
    "name": "Living Room Speaker",
    "mac": "28:6A:BA:9C:17:11",
    "zone": "Living room",
    "rssiDbm": -59,
    "lastSeenAt": "2026-09-12T10:24:48Z",
    "status": "online"
  }]
}
```

The client must prominently identify demo, stale, or unavailable data.
