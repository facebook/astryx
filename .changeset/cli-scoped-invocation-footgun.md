---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[fix] Stop suggesting bare `npx astryx` before the CLI is installed — it resolves to an unrelated package on the npm registry.

The CLI now emits an install-aware invocation everywhere it prints a command:

- Installed / global / dev runs suggest `<pm> astryx <cmd>` (e.g. `pnpm exec astryx …`), unchanged.
- One-off runs (launched via `npx`/`pnpm dlx`/`yarn dlx`/`bunx`) suggest the scoped package `<dlx> @astryxdesign/cli <cmd>`, which always resolves to us.

This is driven by a single source of truth in `package-manager.mjs` (`getCliInvocation`, `formatCliCommand`, `getDlxPrefix`, `isCliOneOff`) and applied to every runtime hint the CLI prints — `search`, `component`, `hook`, `docs`, `build`, `template`, `swizzle`, `discover`, `theme`, `init`, `upgrade`, `doctor`, the update-check notice, the manifest pointer, and the postinstall banner — plus the injected `AGENTS.md`/`CLAUDE.md` index. The postinstall banner also no longer prints a stale `npx xds init`. Structured `--json` fields (e.g. search `command`, upgrade `suggestedCommand`) keep the canonical bare `astryx <cmd>` form; only the human-facing print is rewritten.

Docs are aligned too: bootstrap commands use the scoped package or an explicit install-then-run flow, and reference commands use the bare `astryx <cmd>` form (which fails cleanly if the CLI isn't installed, rather than fetching a look-alike package). The core `<Theme>` runtime warning and the docsite copy-commands now use `npx @astryxdesign/cli …`.

@joeyfarina
