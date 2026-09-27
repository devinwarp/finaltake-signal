---
name: Oriane REST authentication
description: How to interpret Oriane's public search API documentation when validating live integration.
---

Oriane's public REST OpenAPI documents the search endpoint and filters, but does not declare a security scheme or specify the API-key header. An unauthenticated call returns a generic 401, and different invalid-key header formats also return the same message. Do not treat a successful fallback search as proof that live authentication works.

**Why:** Documentation and unauthenticated error responses cannot distinguish a missing credential from a wrong auth-header format; either mistake would silently route all default searches to backup evidence.

**How to apply:** A real authenticated search returned live results in September 2026, confirming the currently implemented header at that time. When changing auth or diagnosing backup-only behavior, repeat a live search and inspect the source label without exposing the credential; do not rely on the incomplete public spec.