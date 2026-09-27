---
name: GitHub connector publishing
description: How authenticated GitHub API uploads differ from command-line git pushes in this environment.
---

The connected GitHub account can write through the GitHub API proxy, but the connection does not authorize command-line `git push`. An empty GitHub repository rejects Git Data blob creation until a first branch commit exists; create the first file through the Contents API, then Git Data blobs, tree, commit, and ref update work.

**Why:** A command-line dry run failed authentication despite write permission through the connector, and a blob upload returned an empty-repository conflict until the branch was initialized.

**How to apply:** For a repository without Git CLI credentials, use the connected GitHub API rather than extracting a token. Verify the final branch tree and commit remotely. An API-created snapshot commit does not automatically align the workspace's local Git history or configure a usable `origin`; do not claim a normal local push or assume subsequent CLI pushes will fast-forward.