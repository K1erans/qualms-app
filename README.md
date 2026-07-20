# Qualms

Qualms is a CLI-first QA automation project with a Tauri desktop client. The
current repository is an intentionally small scaffold: it establishes the
process, protocol, and execution seams without choosing a VM provider or
implementing browser automation.

## Workspace

- `apps/cli` — the published `qualms` command and desktop sidecar.
- `apps/desktop` — a Tauri 2 and SvelteKit desktop shell.
- `apps/action` — notes for the future GitHub Action.
- `packages/contracts` — runtime-validated bridge and QA trace contracts.
- `packages/execution` — local and VM execution lifecycle interfaces.

## Requirements

- Node.js 22 or newer
- Corepack
- Rust stable (only for desktop development)

```sh
corepack enable
pnpm install
pnpm check
```

Run `pnpm --filter @qualms/desktop tauri dev` to open the desktop shell. The
desktop app is deliberately neutral so its product navigation and visual
design can be developed independently.

See [docs/architecture.md](docs/architecture.md) for the intended execution
model and deferred work.
