---
name: GitHub connector publishing
description: How authenticated GitHub API uploads differ from command-line git pushes in this environment.
---

The connected GitHub account can write through the GitHub API proxy, but the connection does not authorize command-line `git push`. An API upload also does not automatically align the workspace's local Git history.

**Why:** Connector OAuth and local Git credentials are separate authorization paths.

**How to apply:** For a repository without Git CLI credentials, use the connected GitHub API rather than extracting a token. Verify the destination state remotely; do not claim an API-created snapshot was a local push.