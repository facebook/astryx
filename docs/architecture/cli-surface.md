---
schema_version: 1
template_version: 1
kind: architecture
id: architecture:cli-surface
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-13
owners: [josephfarina]
applies_to: [packages/cli]
verified_by:
  [
    pnpm check:cli-structure,
    clients/cli/commands/json-contract.test.mjs,
    clients/cli/commands/interactive-guard.test.mjs,
    clients/cli/cli-exit-codes.test.mjs,
    clients/cli/error-envelope-code.test.mjs,
    foundation/response/error-codes.test.mjs,
    foundation/agent-docs/agent-docs.test.mjs,
    foundation/integrations/autolink.test.mjs,
    foundation/integrations/manifest-writer.test.mjs,
    foundation/integrations/contribution-inventory.test.mjs,
    clients/cli/commands/integration-authoring.test.mjs,
    clients/cli/commands/integration-real-world.test.mjs,
    api/integration/add-contribution.test.mjs,
    api/integration/pack-check.test.mjs,
    api/integration/validate-integration.test.mjs,
    api/theme/integration-themes.test.mjs,
    clients/cli/commands/upgrade.integration-policy.test.mjs,
    clients/cli/formatters/index.test.mjs,
  ]
deciding_specs: [spec:AST-017/DEC-4, spec:AST-042/DEC-1, spec:AST-042/DEC-2]
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
   `type` discriminator on its own envelope. `spec:AST-042` FR1 makes this the
   contract; INV20–INV22 fix where each part lives.
4. **Render.** Exactly one of two paths. In `--json` mode, `jsonOut` writes a
   single envelope. Otherwise the formatters render the same values as text,
   from a closed set of blocks (INV23). Nothing else may write to stdout.

Discovery of components, templates, themes, codemods and docs is not per-command. It
goes through the `Project` seam in `foundation/config`, which resolves the
integrations named in `astryx.config` and then autolinks any DECLARED dependency
that ships a root `astryx.integration.*` manifest — a config entry is how a
project pins an integration, not how the CLI finds one. Each integration is
loaded independently, so one broken package degrades that package's
contribution and never fails the run.

AST-017 DEC-4 owns stable response-entry fields and requires their complete type,
test, applicable text, and consumer-documentation projections.

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
- **INV13 — Agent docs have one rendered source of truth.** Init and upgrade
  render configured integration `agentDocs` through the existing `Project`
  seam. Upgrade compares complete block bytes even when Core is unchanged and,
  when codemods or hooks run, writes the prepared block only after they succeed.
- **INV14 — An installed integration is discoverable without configuration, and
  autolinking it can only add.** A dependency the project DECLARES in
  package.json, and that ships a root `astryx.integration.*` manifest, is
  loaded; `node_modules` is never walked, so nothing the project did not declare
  can contribute. Only the dependency KEY is read, never its value, so an npm
  alias or a non-semver protocol resolves like any other. A config entry keeps
  precedence over the same package autolinked, and a dependency whose manifest
  fails to load is dropped rather than raised as the consuming project's issue.
- **INV15 — Integration authoring writes one complete, discoverable contribution.**
  `integration add <kind> <name>` and its typed per-kind APIs share one receipt
  contract. A dry run reports the same planned paths without writing. A real run
  refuses to clobber authored files, stages related writes atomically, declares
  a contribution root only with valid bytes behind it, and verifies visibility
  through the same discovery seam consumers use.
- **INV16 — Authoring preserves package policy and local source wins while it is
  being edited.** Writers never create `files` or `exports`; when either field
  already exists, they add only the required manifest, root, or public subpath
  and preserve every author-owned entry. Generated component and template export
  keys are extensionless public subpaths even when they target authored `.ts` or
  `.tsx` source. The integration beside the current package.json replaces the
  same installed package in place, preserving its configured order while making
  working bytes authoritative.
- **INV17 — Pack verification examines the artifact consumers receive.**
  `integration pack --check` runs the package lifecycle through `npm pack`,
  compares the required file inventory with the actual tarball, extracts that
  tarball into a scratch consumer, and reruns contribution discovery. It rejects
  advertised component imports ending in `.ts` or `.tsx`, resolves every exact
  advertised component and inferred template import through Node's package
  resolver, and fails when the packed artifact has no usable public export. This
  contract does not require project-local TypeScript or promise validation under
  TypeScript's Node16 or bundler resolution modes.
- **INV18 — Integration diagnostics are read-only and package-specific.** Doctor
  validation reports malformed or unreachable roots and contribution conflicts
  without rewriting the package. Everyday discovery skips a broken integration
  and records its issue; a package-scoped theme lookup surfaces that package's
  blocking catalog error instead of misreporting the theme as unknown.
- **INV19 — Integration themes are packaged editable source.** The manifest's
  `themes` root contains a versioned catalog. Each entry names its slug, source
  entry, named runtime export, and complete file list. Discovery parses the entry
  without executing it, requires every local static import and re-export to name
  a file in that list, and rejects missing or type-only named exports. Pack
  verification preserves that identity; `theme list` retains package ownership;
  `theme add --package` copies every listed file, including nested palette/token
  modules, before `theme build` compiles the consumer-owned copy.
- **INV20 — A command's API subject has one layout.** A command's behavior lives
  in `api/<subject>/`. `<subject>.mjs` is the subject's entry, and `api/index.mjs`
  re-exports what it exports. A subject with more than one operation puts each in
  a leaf, `<leaf>/<leaf>.mjs`, and the entry dispatches to the leaves. Every
  exported function has a colocated `FunctionDoc` — `<subject>.doc.mjs` for the
  entry function, `<function>.doc.mjs` for any other — and response typedefs in a
  `*.type.mjs` file. Tests sit beside the module they cover as
  `<module>.test.mjs`. A private helper is an underscore-prefixed file, such as
  `_site.mjs`. `api/blog` is the reference layout.
- **INV21 — An API subject reaches the environment only through its adapter.**
  Within `api/<subject>/`, reading or writing files, network requests,
  subprocesses, loading the project or its modules, and discovery that reads the
  disk happen in the subject's adapter: `_adapter.mjs` and any underscore-prefixed
  helper that only it imports. The adapter may call foundation seams such as the
  `Project` seam and `assertWithin`. The entry and the leaves shape inputs and
  results and call the adapter; they do not import filesystem, network, or
  subprocess modules, the `Project` seam, or discovery and loader functions. A
  subject that needs no environment access has no adapter.
  `api/blog/_adapter.mjs` is the reference adapter.
- **INV22 — A command handler parses, calls, and renders.** A handler in
  `clients/cli/commands/` registers through `defineCommand` with its
  `CommandDoc`, and an executable command's `CommandDoc` names in `fn` the API
  function it calls. The handler parses its arguments, calls that function, and
  renders the result through `jsonOut` or the formatter kit. It reads no files,
  loads no project, runs no discovery, and starts no subprocess or network
  request; it may phrase hints with how the CLI was invoked, such as the package
  manager's run prefix. Only command handlers, their `CommandDoc` files, and
  their tests live in that directory. `clients/cli/commands/blog.mjs` is the
  reference handler.
- **INV23 — The formatter kit is closed.** Text output is built only from the
  block constructors in `clients/cli/formatters/index.mjs` — `section`, `text`,
  `list`, `record`, `records`, and `code` — and printed through `emit`. A handler
  does not pad strings to a width, align columns, or draw tables, and it defines
  no renderer of its own; it maps its data onto records, lists, and sections. A
  block kind is added to the kit, with its tests and its line in the help
  "Output format" list, only as `spec:AST-042` FR3 allows.
- **INV24 — Every discoverable integration item owns one typed descriptor.** New
  authoring emits `<source-stem>.doc.mjs`, annotated with its public type from
  `@astryxdesign/cli/authoring`, beside the source or payload it describes. The
  descriptor is the sole per-item metadata authority; `astryx.integration.*`
  locates roots and integration-level capabilities but never catalogs items:
  there is no catalog file under a root and no per-item map or list in the
  manifest (`spec:AST-039/FR11`). A released alternate reader is an isolated
  compatibility path, not a second authoring convention.

Some modules predate INV20–INV23 and do not meet them yet; `spec:AST-042` lists
the known gaps.

## Change coupling

A change to any of the following requires this record to be re-read, and
updated in the same pull request when it moves an invariant:

- adding, removing, or renaming a command or subcommand;
- adding an error code, or changing what an existing code means;
- a change to a stable JSON envelope or discriminated response-entry field
  follows `spec:AST-017/DEC-4`;
- adding a formatter or block kind (INV23, `spec:AST-042` FR3), or writing to
  stdout from anywhere other than `emit` and `jsonOut`;
- changing the file layout under `clients/cli/commands`;
- adding an API subject, leaf, adapter, or exported function, or giving an API
  module access to the environment (INV20–INV21);
- changing an integration writer's receipt, no-clobber/rollback behavior,
  package.json mutation policy, or public subpath spelling;
- changing what `integration pack --check` executes, resolves, or proves about
  the tarball;
- changing local, configured, or autolinked integration precedence;
- changing the integration theme catalog or consumer copy contract.

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
- `foundation/config` — the `Project` discovery seam and integration precedence.
- `foundation/integrations/manifest-writer.mjs` — safe manifest-root patching,
  verification, and rollback.
- `foundation/integrations/contribution-inventory.mjs` — the shared local and
  packed contribution identity/file contract.
- `api/integration` — contribution writers, diagnostics, and packed-artifact
  verification.
- `foundation/discovery/theme-discovery.mjs` and `api/theme` — integration theme
  catalog discovery, package-aware selection, source copy, and build.
- `foundation/agent-docs` — the shared expected-block renderer and managed-file
  writer used by init and upgrade.
- `api/index.mjs` — the public programmatic API, `@astryxdesign/cli/api`, which
  re-exports every subject's functions.
- `api/<subject>/…` — the scriptable functions the commands wrap, laid out as
  INV20 describes; each owns the `type` on its own envelope.
- `api/<subject>/_adapter.mjs` — the subject's only access to the environment
  (INV21).

## Deciding specs

- `spec:AST-017/DEC-4` — stable response fields and their complete projections
  are current compatibility authority.
- `spec:AST-042/DEC-1` — every command is a thin layer over one programmatic
  function.
- `spec:AST-042/DEC-2` — every command's text output uses one shared block
  vocabulary.

## Verification

| Invariant | Evidence                                                                                                                                                   | Failure signal                                                                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| INV1      | `clients/cli/commands/interactive-guard.test.mjs`                                                                                                          | The subprocess hangs: `signal === 'SIGTERM'` and `status === null`.                                                                             |
| INV2      | `clients/cli/commands/json-contract.test.mjs`                                                                                                              | `--json` stdout does not parse, or parses to a shape outside the two.                                                                           |
| INV3      | `foundation/response/error-codes.test.mjs`                                                                                                                 | A shipped code disappears, or an envelope carries an unregistered one.                                                                          |
| INV4      | `clients/cli/formatters/index.test.mjs`, type tests                                                                                                        | `emit` accepts a bare string, or output varies between pipe and TTY.                                                                            |
| INV6      | `pnpm check:cli-structure`                                                                                                                                 | A command's file or its doc is missing, or sits at the wrong path.                                                                              |
| INV8      | `clients/cli/cli-exit-codes.test.mjs`                                                                                                                      | The same condition exits differently with and without `--json`.                                                                                 |
| INV14     | `foundation/integrations/autolink.test.mjs`, `foundation/config/project.test.mjs`                                                                          | An undeclared package contributes, or configured/local precedence changes.                                                                      |
| INV15     | `api/integration/add-contribution.test.mjs`, `clients/cli/commands/integration-authoring.test.mjs`                                                         | Dry-run/write paths differ, a writer clobbers bytes, or the new contribution is not discoverable.                                               |
| INV16     | `foundation/integrations/manifest-writer.test.mjs`, `api/integration/add-contribution.test.mjs`                                                            | A writer invents package policy, replaces an author entry, or local bytes lose precedence.                                                      |
| INV17     | `api/integration/pack-check.test.mjs`                                                                                                                      | Lifecycle output, packed files, identities, or public imports diverge without failing the gate.                                                 |
| INV18     | `api/integration/validate-integration.test.mjs`, `api/theme/integration-themes.test.mjs`                                                                   | Diagnostics mutate files, or a selected broken theme package is reported as merely unknown.                                                     |
| INV19     | `clients/cli/commands/integration-real-world.test.mjs`                                                                                                     | A CLI-authored theme, nested palette, or guides fail across pack, install, list, add, and build.                                                |
| INV20     | `pnpm check:cli-structure` checks that each subject has a `FunctionDoc`, typedefs, and a test; per-function coverage and leaf layout are checked in review | A subject or exported function lacks its `FunctionDoc`, typedefs, or tests, or an operation sits outside its subject.                           |
| INV21     | Review of imports under `api/**`; no mechanical check yet                                                                                                  | A module other than a subject's adapter reads or writes files, contacts the network, starts a subprocess, loads the project, or runs discovery. |
| INV22     | Review of imports under `clients/cli/commands/**`; the docs drift harness checks each `CommandDoc` against the live command                                | A handler reaches the environment itself, an executable command's `CommandDoc` names no `fn`, or a non-command file sits in the directory.      |
| INV23     | `clients/cli/formatters/index.test.mjs` for the kit; review of handlers; no mechanical check yet                                                           | A handler pads, aligns, or draws text itself, or a block kind is missing from the help "Output format" list.                                    |
| INV24     | `api/integration/add-contribution.test.mjs`, `api/integration/add-theme.test.mjs`, `foundation/discovery/theme-discovery.test.mjs`                         | New authoring emits an untyped or non-`.doc.mjs` item, adding one item edits a shared file, or an item catalog becomes authoritative.           |

## Open questions

- **OQ1 — Should the envelope's `meta` carry the resolved integration set?**
  (`human-api`) An agent cannot currently tell from the output whether a thin
  result means "nothing matches" or "an integration failed to load".
