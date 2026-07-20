# Architecture

Qualms keeps the subscription-authenticated Codex process on the user's
computer. Browser interaction belongs to an execution environment selected
behind the `ExecutionRunner` interface.

```text
SvelteKit webview
      | typed Tauri commands and events
Tauri Rust process supervisor
      | NDJSON over stdin/stdout
qualms CLI sidecar
      | future Codex SDK integration
Codex (local ChatGPT session)
      | future MCP browser tools
Local browser or ephemeral VM
```

## Execution modes

- `vm` is the future production default. A session is created only when a run
  starts and must be terminated after completion, cancellation, failure, or
  TTL expiry.
- `local` is reserved for an explicit developer setting and contract tests.
- The first remote target is assumed to be a public or staging URL.

The scaffold includes only interfaces and deterministic fakes. It does not
choose a VM provider, install a browser, connect Codex, capture a QA trace, or
generate Playwright code.

## Future Codex and browser connection

- Codex will run locally through its SDK, reuse the user's `codex login`
  ChatGPT session, and stream agent events through the CLI bridge.
- A VM session will return an authenticated, short-lived Streamable HTTP MCP
  endpoint for its browser tools. The local Codex process connects to that
  endpoint; Codex credentials are not part of the VM session contract.
- Browser observations should be semantic by default. Screenshots are
  requested only for visual requirements and failures, then referenced by the
  structured QA trace.
- Repository upload, local-server tunnelling, and target deployment are later
  milestones. The initial remote target is a public or staging URL reachable
  from the VM.

## Security invariants

- The frontend cannot execute arbitrary shell commands.
- Rust owns and supervises the CLI sidecar.
- VM browser endpoints use short-lived credentials.
- ChatGPT and Codex credentials remain local and are never sent to a VM.
