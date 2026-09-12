# MVP requirements

## Outcome

An operator can quickly identify known devices, their latest estimated zone and signal, and locations requiring attention.

## Functional scope

1. Present network summary and timestamp/source state.
2. Render a per-zone signal map.
3. List a device name, MAC address, zone, RSSI, last-seen time and state.
4. Filter device records by online, warning and offline status.
5. Provide a scan/refresh control.
6. Support screens down to 320px wide.

## Boundaries

- Build and lint must pass.
- Credentials never enter the browser or Git history.
- Network-control actions and unauthorized tracking are out of scope.
