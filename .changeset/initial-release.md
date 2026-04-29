---
'payload-blurhash': minor
---

Initial public release.

- Generate a base64 WebP placeholder for image uploads via Payload's `afterChange` hook
- Configurable `componentX` / `componentY` resolution (1–9)
- Sidebar preview with in-admin "Regenerate" button
- `POST /api/blurhash/regenerate` endpoint (auth-gated)
- Scoped via `collections` option, or applied to all upload collections by default
