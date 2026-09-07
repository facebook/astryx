---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:cli-surface
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [joeyfarina]
applies_to: [packages/cli]
verified_by:
  [
    pnpm check:cli-structure,
    clients/cli/commands/json-contract.test.mjs,
    clients/cli/commands/interactive-guard.test.mjs,
    clients/cli/cli-exit-codes.test.mjs,
    clients/cli/error-envelope-code.test.mjs,
    foundation/response/error-codes.test.mjs,
    clients/cli/formatters/index.test.mjs,
  ]
deciding_specs: []
---

# CLI surface architecture

## Purpose

The Astryx CLI is how an agent reaches Astryx. Everything an agent needs while
building with the design system — what exists, what it does, how to use it,
what is wrong with the code in front of it — is reachable through one command
surface, in one predictable shape, with no person in the loop.

The CLI has one audience: an agent running it in a subprocess. A person at a
terminal is a supported reader of the output, never the caller the design
serves. Every rule below follows from that one fact.

This record describes the shipped surface: how a command is invoked, what it
may emit, how it fails, and where its code lives. It does not describe what
the commands do.

## System model

A run has four stages, and each one is a place where the surface is enforced
rather than left to the command author.

1. **Preflight.** `clients/cli/bin/astryx.mjs` gates the Node version using
   only built-ins, before importing anything that could fail on an old
   runtime. The gate honours `--json` with a hand-rolled envelope carrying
   `ERR_NODE_VERSION`.
2. **Dispatch.** `clients/cli/index.mjs` parses with Commander, sets JSON mode
   in `preAction` before any command body runs, and rejects a command that
   cannot support `--json` before any side effect.
3. **Work.** The command parses its arguments and calls a function in `api/`.
   The command is a thin wrapper: parse, call, render. The API function is the
   unit that is scriptable and typed, and it is the source of truth for the
   `type` discriminator on its own envelope.
4. **Render.** Exactly one of two paths. In `--json` mode, `jsonOut` writes a
   single envelope. Otherwise the formatters render the same values as text.
   Nothing else may write to stdout.

Discovery of components, templates, codemods and docs is not per-command. It
goes through the `Project` seam in `foundation/config`, which resolves the
integrations named in `astryx.config`. Each integration is loaded
independently, so one broken package degrades that package's contribution and
never fails the run.

## Boundaries and invariants

- **INV1 — The CLI never asks a question.** No prompt, no TTY detection, no
  read of stdin for control flow. A non-TTY environment is the only supported
  condition, not a fallback. A command with nothing to do exits with a result,
  never a question.
- **INV2 — Every `--json` emission is one valid envelope.** Success is
  `{apiVersion, type, data}` plus optional `meta`. Failure is
  `{apiVersion, error, code}` plus optional `suggestions`. There is no third
  shape, no partial write, and no raw stack trace: an uncaught throw becomes an
  envelope at the bin error boundary.
- **INV3 — The code is the contract; the prose is not.** `code` is stable and
  append-only. Once shipped, a code's meaning never changes and the code is
  never removed. The `error` string may be reworded at any time. A consumer
  branches on `code`.
- **INV4 — Human output is a projection of the JSON, produced only by the
  formatters.** `emit` accepts a renderer-produced `Block` and nothing else, so
  a stray string cannot reach stdout. Output is plain ASCII: no colour, no TTY
  detection, no width wrapping, byte-for-byte identical printed or piped.
- **INV5 — Text field names mirror JSON keys one to one.** The two views cannot
  drift, and every field stays greppable.
- **INV6 — One command, one file.** A command is
  `clients/cli/commands/<name>.mjs`, or `clients/cli/commands/<name>/index.mjs`
  when it is a group, with a sibling `<name>.doc.mjs`. A subcommand's doc is
  `<parent>-<child>.doc.mjs`.
- **INV7 — Every command ships a `CommandDoc`, and the generated surfaces come
  from it.** Help text, the README command and error-code tables, and the
  manifest are generated. None of them is written by hand.
- **INV8 — Exit codes do not depend on the output mode.** The same condition
  exits the same way with and without `--json`, so a command works as a gate
  without parsing stdout.
- **INV9 — A command that cannot support `--json` is rejected before any side
  effect**, not part-way through the work.
- **INV10 — Every write is confined.** Output paths pass `assertWithin`, which
  canonicalises symlinks and rejects a NUL byte; an escape is
  `ERR_PATH_TRAVERSAL`. Bounded inputs are capped rather than trusted.
- **INV11 — A broken integration degrades, it does not fail the run.** The
  `Project` seam loads each integration independently and records the failure.
- **INV12 — Human chatter never touches stdout in JSON mode.** `humanLog` and
  `humanWarn` are the only chatter primitives, and both are no-ops under
  `--json`.

## Change coupling

A change to any of the following requires this record to be re-read, and
updated in the same pull request when it moves an invariant:

- adding, removing, or renaming a command or subcommand;
- adding an error code, or changing what an existing code means;
- adding a field to the JSON envelope, or changing the shape of one;
- adding a formatter, or writing to stdout from anywhere other than `emit` and
  `jsonOut`;
- changing the file layout under `clients/cli/commands`.

`pnpm check:cli-structure` enforces the layout. The contract tests listed in
`verified_by` enforce the envelope, the exit codes, the error codes, and the
non-interactive guarantee.

## Owning code

- `clients/cli/bin/astryx.mjs` — Node floor gate and the error boundary that
  converts an uncaught throw into an envelope.
- `clients/cli/index.mjs` — Commander wiring, JSON-mode gate, dispatch.
- `clients/cli/commands/<name>.mjs` — one command: parse, call the API, render.
- `clients/cli/commands/<name>.doc.mjs` — the `CommandDoc` that generates help
  and the published tables.
- `clients/cli/formatters/index.mjs` — `Block`, `emit`, `section`, `text`,
  `list`, `record`, `records`, `code`, and the shared ASCII vocabulary.
- `foundation/response/json.mjs` — `API_VERSION`, `jsonOut`, `jsonError`,
  `toErrorEnvelope`, `humanLog`, `humanWarn`, the JSON-mode flag.
- `foundation/response/error-codes.mjs` — the frozen, append-only code set.
- `foundation/config` — the `Project` discovery seam and the integration
  manifest loader.
- `api/<subject>/…` — the scriptable functions the commands wrap; each owns the
  `type` on its own envelope.

## Deciding specs

None yet. This record describes behaviour that is already shipped. A change to
an invariant above needs a system spec.

## Verification

| Invariant | Evidence                                            | Failure signal                                                         |
| --------- | --------------------------------------------------- | ---------------------------------------------------------------------- |
| INV1      | `clients/cli/commands/interactive-guard.test.mjs`   | The subprocess hangs: `signal === 'SIGTERM'` and `status === null`.    |
| INV2      | `clients/cli/commands/json-contract.test.mjs`       | `--json` stdout does not parse, or parses to a shape outside the two.  |
| INV3      | `foundation/response/error-codes.test.mjs`          | A shipped code disappears, or an envelope carries an unregistered one. |
| INV4      | `clients/cli/formatters/index.test.mjs`, type tests | `emit` accepts a bare string, or output varies between pipe and TTY.   |
| INV6      | `pnpm check:cli-structure`                          | A command's file or its doc is missing, or sits at the wrong path.     |
| INV8      | `clients/cli/cli-exit-codes.test.mjs`               | The same condition exits differently with and without `--json`.        |

## Open questions

- **OQ1 — Should the envelope's `meta` carry the resolved integration set?**
  (`human-api`) An agent cannot currently tell from the output whether a thin
  result means "nothing matches" or "an integration failed to load".
