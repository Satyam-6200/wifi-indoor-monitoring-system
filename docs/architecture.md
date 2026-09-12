# Architecture

```text
Router / AP -> collector service -> monitoring API -> React dashboard
                    |                  |
                    + protected config + snapshots and events
```

The repository currently contains only the dashboard layer and uses demo data. A production collector should normalize vendor-specific client lists on the server; the browser should only call an authenticated API.

## Security

- Keep access-point credentials in a secret manager or deployment environment.
- Use a least-privilege router account if supported.
- Require TLS and authenticated access to the API/dashboard.
- Retain observations only for the operational period needed.
