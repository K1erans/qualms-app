# Future GitHub Action

The GitHub Action will call the published `qualms` CLI and consume the same
validated bridge contracts as the desktop app. It must use CI-appropriate
Codex authentication; desktop ChatGPT sessions and local `auth.json` files
must never be copied into Actions runners.

No Action manifest or runtime is included in the scaffold.
