---
name: Oriane REST authentication
description: How to interpret Oriane's public search API documentation when validating live integration.
---

Oriane's public REST OpenAPI documents the search endpoint and filters, but does not declare a security scheme or specify the API-key header. An unauthenticated call returns a generic 401, and different invalid-key header formats also return the same message. On 2026-09-27, a search through the configured credential returned `source=live`, confirming that the current Bearer header and live response handling worked. The four tested sunscreen queries each hit the 200-post cap while Oriane reported larger totals, and were correctly marked partial.

**Why:** Documentation and unauthenticated error responses cannot distinguish a missing credential from a wrong auth-header format; either mistake would silently route all default searches to backup evidence.

**How to apply:** When changing auth or diagnosing backup-only behavior, repeat a real search and inspect its source label without exposing the credential. Do not rely on fallback results as evidence of auth, or present a capped query sample as complete.