---
schema_version: 4
template_version: 1
kind: system-spec
id: spec:AST-042
authority: current
archive_reason: null
superseded_by: null
approved_by: josephfarina
approved_at: 2026-09-24
phase: accepted
owners: [josephfarina]
affects_architecture: [architecture:cli-surface]
affects_families: []
affects_contributing: [contributing:cli-conventions]
affects_consumer_docs: []
---

# CLI command admission and programmatic parity system spec

## Intent

Agents learn the Astryx CLI from its help, its manifest, and their own notes, and
they script the same operations through the programmatic API. Each command,
subcommand, and option that ships becomes surface that agents depend on, and
removing one is a breaking change. Before writing code, a contributor needs to
know whether new behavior belongs in an existing command, a new option, a new
subcommand, or a new top-level command, and what each of those needs.

This record owns what each kind of CLI surface needs before it is added, the rule
that every command is a thin layer over one documented and tested programmatic
function, and the vocabulary that human-readable output may use.

## Non-goals

- Where command, API, adapter, and formatter code lives, and which modules may
  read the environment. `architecture:cli-surface` INV20–INV23 own that
  structure.
- Discoverability, environment variables, global options, and configuration.
  `spec:AST-017` FR14–FR20 own those rules.
- Classifying a removal, rename, behavior change, deprecation, or incompatible fix.
  [`spec:AST-017`](../AST-017/spec.md) owns compatibility and release lifecycle.
- The JSON envelope, error codes, and generated help. `architecture:cli-surface`
  INV2, INV3, and INV7 own them.
- Equivalent internal implementations remain valid when they satisfy this contract.

## Requirements

- **FR1 — Every command is a thin layer over one programmatic function.** Every
  command or subcommand that performs an operation MUST perform it by calling one
  function exported from `@astryxdesign/cli/api`. Called with the same inputs,
  that function MUST perform the same operation and return the same result that
  the command emits under `--json`. The command adds only argument parsing,
  rendering, and exit status; rendering MAY use how the CLI was invoked, such as
  the package manager's run prefix, to phrase hints. It MUST NOT read project
  state, change files, contact the network, or produce a result field or effect
  that the function does not produce. A command that only groups subcommands is exempt, and so is a
  command that only describes the CLI itself, such as help, the version, or the
  capability manifest. This requirement names `@astryxdesign/cli/api` because
  automation depends on it under `spec:AST-017` FR14.
- **FR2 — The programmatic API is documented and tested.** Every function
  exported from `@astryxdesign/cli/api` MUST have reference documentation that
  states its parameters, each option and its default, its result types, the error
  codes it can return, and at least one example. Tests MUST exercise each
  documented option, each result type, and each documented error code, and MUST
  fail when that behavior is removed. Every command MUST also have tests that run
  the CLI and check its `--json` result, its human-readable output, and its exit
  status, for at least one success and one failure.
- **FR3 — Human-readable output uses one shared vocabulary.** Human-readable
  output MUST use only the block kinds that generated help documents: Record,
  Section, List, Text, and Code. A Text block carries prose. Items and field
  values MUST use Record, Section, or List blocks, never columns or tables that a
  command builds from characters itself. Content authored in a documentation
  source, such as a heading or a table in a reference doc, follows the same rule.
  A command MUST NOT define an output format of its own. When no existing block
  can express an output without losing information a reader needs, such as a
  table too large to read as records, the answer is a new shared block kind, not
  a command-specific renderer. A new block kind changes the output of every
  command, so it MUST be justified by that evidence, MUST be available to every
  command, and MUST appear in generated help in the same change.
- **FR4 — New surface is admitted by tier.** Each addition MUST pass the test for
  its tier before it merges.
  - **Top-level command.** A new `astryx <command>` MUST cite a current system
    specification that authorizes it, approved by an approval owner (an owner listed in the knowledge schema's `approvalOwners`). That specification MUST state the
    question a consumer or agent has that no existing command answers; the
    existing command closest to answering it, and why extending that command is
    wrong; the one job the command does, stated without "and"; why its result is
    data rather than prose, which belongs in a docs topic; and the function that
    FR1 requires.
  - **Subcommand.** A new subcommand MUST stay inside its parent command's one
    job. Its pull request MUST state the question it answers, why an option on
    the parent or on an existing subcommand cannot answer it, and the function
    that FR1 requires. A code owner of the CLI package MUST approve it.
  - **Option.** A new option on an existing command MUST meet FR5 and
    `spec:AST-017` FR14–FR15. Normal review is enough.

  Behavior that fails the test for its tier is not admitted at that tier. It
  becomes an option, a subcommand, a docs topic, or an improvement to an existing
  command instead.

- **FR5 — Options change what a command produces, predictably.** An option MUST
  narrow or redirect work that its command already does, and MUST NOT give the
  command a second job. Its default MUST be the right result for most callers. A
  boolean option MUST default to off; behavior that is on by default gets a named
  opt-out, not a flag that defaults to true. An option that changes only how the
  same result is presented is a global presentation option and MUST meet
  `spec:AST-017` FR15. An option name MUST mean the same thing, spelled the same
  way, on every command that has it, and no command must carry an option because
  a sibling has it. An option MUST NOT exist to work around a defect. Every pair
  of options on a command MUST have a decided result: they compose and a test
  proves it, they are refused together with a stable error code, or another rule
  already prevents the pair.
- **FR6 — Moving surface is an admission.** Renaming a command, moving behavior
  into a new command, or promoting a subcommand to a top-level command is an
  admission at the new tier and MUST pass that tier's test. Removal and renaming
  also follow `spec:AST-017` FR1–FR8.
- **FR7 — Exact-lookup admission classifies batching first.** Before code is written,
  every new command or subcommand with an exact selector position MUST classify that
  position against `spec:AST-053` FR11 E1-E5. An eligible surface MUST use AST-053's
  batch contract in its first public release. An ineligible top-level command MUST cite
  a current command-owning record that names the failed condition; a draft does not
  admit the exclusion. An ineligible subcommand MUST name the condition in its
  admitting pull request and still follows FR4's code-owner approval bar. After typed
  admission metadata lands, its CommandDoc MUST retain the same classification.
  Existing eligible commands follow AST-053's incremental migration rule. A hidden
  option MUST NOT make batching opt-in or bypass this classification.

### Platform support

- Supported feature/engine floor: every supported CLI runtime.
- Unsupported behavior: none.
- Browser evidence: not applicable.

## Current-state impact

`architecture:cli-surface` INV20–INV23 carry FR1–FR3 into the code: the layout of
an API subject, the adapter as a subject's only access to the environment, thin
command handlers, and the closed formatter kit. `contributing:cli-conventions`
restates FR4 and FR5 for contributors. It does not yet restate FR7, and CommandDoc
has no typed AST-053 eligibility field; projecting the rule there and adding the
repository check are known enforcement gaps that land separately.

The CLI has 17 top-level commands. The command docs of 28 commands and
subcommands name the function they call. Known gaps, for which this record does
not assign migrations:

- the component, discover, layout, search, template, and theme handlers read
  project state or files themselves (FR1);
- the theme handler draws its target table from characters, and the docs
  handler renders authored headings and tables with its own code (FR3); both
  are candidates for one shared block kind under FR3, not two command
  renderers;
- several API subjects read or write the environment outside an adapter, and the
  `integration` subject keeps flat modules without leaves
  (`architecture:cli-surface` INV20–INV21);
- the reference docs of 14 exported functions, most of them in the
  `integration` subject, do not state the error codes they can return (FR2);
- the structure check confirms that each API subject has at least one reference
  doc, typedef file, and test, but not that each exported function or command is
  covered (FR2).

No mechanical check enforces FR1, the per-function part of FR2, FR3, FR4, FR5,
FR7, `architecture:cli-surface` INV21, or most of INV22 and INV23 yet. Review
applies them to every new change; until mechanical checks land, a new violation
fails only in review. The checks and the closure of the gaps above land as separate
changes.

This specification change alters no runtime behavior or published package and
needs no Changeset.

## Verification

| Contract | Verification                                                                                                          | Representative states                                                                        | Mutation or failure expectation                                                                                                  |
| -------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| FR1      | Command inventory from the manifest, matched to `@astryxdesign/cli/api` exports; paired CLI and API runs on one input | each executable command and subcommand; a group; the manifest                                | A command has no exported function, or emits a field or effect that its function does not                                        |
| FR2      | Reference-doc inventory for every export; per-function tests; command-level CLI tests                                 | each option, result type, and documented error code; one success and one failure per command | Removing a documented behavior leaves every test passing                                                                         |
| FR3      | Text-output snapshots per command; the help snapshot                                                                  | each block kind; a list of items; a result shaped like a table                               | A command prints a layout outside the documented blocks, or a new block kind is missing from help                                |
| FR4, FR6 | The admitting pull request and the authority it cites                                                                 | top-level command, subcommand, option, rename, promotion                                     | A top-level command lands without a current specification, or a subcommand lands without its stated case and code-owner approval |
| FR5      | Option composition tests per command                                                                                  | each option pair; a boolean default; a shared option name                                    | A pair has no decided result, a boolean defaults to on, or one name has two meanings                                             |
| FR7      | Admission review against AST-053 E1-E5 and the evidence for its tier                                                  | eligible new lookup; top-level and subcommand exclusions; draft                              | An eligible surface is single-only, or an exclusion lacks the evidence its tier requires                                         |

## Decision log

### DEC-1 — Commands are thin layers over the programmatic API

**Reference:** `spec:AST-042/DEC-1`
**Decider:** `josephfarina`, `2026-09-24`

One function owns each operation. An agent that runs the command and an agent
that scripts the API get the same result, and the behavior is tested once, where
it lives. The command only turns arguments into a call and a result into output.

Rejected: behavior implemented in the command handler, and features that only the
command offers. Both drift from the API, and automation cannot reach them.

### DEC-2 — One output vocabulary for every command

**Reference:** `spec:AST-042/DEC-2`
**Decider:** `josephfarina`, `2026-09-24`

Agents grep the text output and people read it. One small set of blocks keeps
every command's output predictable and keeps it a view of the JSON result.

Rejected: per-command renderers and tables drawn from characters. They drift from
the JSON result and from each other, and each one is a format that agents must
learn separately.

### DEC-3 — Admission bars scale with permanence

**Reference:** `spec:AST-042/DEC-3`
**Decider:** `josephfarina`, `2026-09-24`

A top-level command is a permanent concept in every agent's working set, so it
needs a current specification from an approval owner. A subcommand lives inside
one command's job, so a stated case and a code owner's approval are enough. An
option narrows work a command already does, so the option rules and normal review
are enough.

Rejected: one bar for every addition, which either blocks small options or lets
top-level commands in too easily; and adding a top-level command to make behavior
easier to find, because help and docs make behavior discoverable under
`spec:AST-017` FR14.

### DEC-4 — Exact lookups classify batching during admission

**Reference:** `spec:AST-042/DEC-4`
**Decider:** `josephfarina`, `2026-10-01`

Batch shape is part of a lookup's public surface, so admission applies AST-053 E1-E5
before implementation. The evidence still follows DEC-3's permanence tiers: a
current record for a top-level command, and the pull request plus code-owner approval
for a subcommand; CommandDoc retains the result after typed metadata lands.

Rejected: letting each eligible command remain single-only or hide batching behind an
option, which gives equivalent read-only lookups different automation contracts; and
requiring a new system record for every subcommand exclusion, which defeats the tiered
bar.

### DEC-5 — Incompatible fixes use `[breaking]` until Changesets carry a classification

**Reference:** `spec:AST-042/DEC-5`
**Decider:** `josephfarina` (proposed), `2026-10-09`

A Changeset's bump states the tier its change requires (`spec:AST-017` FR7).
`check:changesets` validates a Changeset's tag and bump and has no classification
field, and while the packages are 0.x it accepts a minor bump only with
`[breaking]`. An incompatible fix requires the incompatible tier, so until
Changesets gain a machine-readable classification, its Changeset uses `[breaking]`
with a minor bump and names its `IFIX-*` and `CLN-*` ids. The record keeps the
classification: the change is a correction under `spec:AST-017` FR32, not a generic
removal. This record changes none of `check:changesets`, the Changeset coverage
gate, or release admission.

Rejected: `[fix]` with a minor bump, which `check:changesets` refuses while the
packages are 0.x; and a classification field in the release gates, which changes
how every package releases inside a records change.

### DEC-6 — `IFIX-0006` needs no patch transition

**Reference:** `spec:AST-042/DEC-6`
**Decider:** `josephfarina` (proposed), `2026-10-09`

`spec:AST-017` FR34 has a patch keep the old behavior while it ships the corrected
path and a warning, when that is safe. For `IFIX-0006` the warning already exists:
every affected run prints `[error]` lines that name each private variable and the
fix, and the correction changes only the exit status, with output and files
identical. A transition patch adds nothing a user can act on, so the correction
ships through `CLN-0012` in the next minor release.

Rejected: a patch that prints one more warning line before the minor, which
repeats the `[error]` lines and delays the correction by a release; and an option
that keeps exit 0, which makes a documented failure optional.

## Deprecation and cleanup records

### DEP-0006 — Deprecate the `astryx layout` command group

| Field            | Value                                                                                                                                                                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id               | `DEP-0006`                                                                                                                                                                                                                                                     |
| cleanup          | `CLN-0006`                                                                                                                                                                                                                                                     |
| package          | `@astryxdesign/cli`                                                                                                                                                                                                                                            |
| surface          | CLI command group: `astryx layout` (`expand`, `check`, `grammar`), its three JSON response types (`layout.expand`, `layout.check`, `layout.grammar`), and the programmatic API exports `layoutExpand`, `layoutCheck`, `layoutGrammar` from `@astryxdesign/cli` |
| old contract     | Compressed XLE/XLO expressions parsed, validated, and expanded into XDS TSX; expression validation with canonical-surface echo; grammar cheatsheet with alias table                                                                                            |
| replacement      | `astryx build` chooses the closest template to start from. `astryx template <name> <path>` scaffolds it. `astryx docs layout` teaches the layout principles (scaffold, structure, spacing, breakpoints).                                                       |
| warning          | Human mode: one stderr line per invocation naming DEP-0006 and the replacement commands. JSON mode: `meta.deprecations` array in the response envelope, each entry `{id, replacements}`, matching the documented envelope schema.                              |
| migration        | Non-mechanical. The XLE/XLO expression language has no source-level equivalent in the replacement commands. Use `astryx build` to find the right template, `astryx template <name>` to scaffold it, and edit the scaffolded code directly.                     |
| codemod          | None — vacuous: expressions are ad-hoc input, not persisted source that a codemod can rewrite.                                                                                                                                                                 |
| downstream       | Maintained agent-docs teach `build` as the front door. The layout guide (`astryx docs layout`) is unaffected.                                                                                                                                                  |
| direct authority | `spec:AST-042` (CLI command admission and programmatic parity)                                                                                                                                                                                                 |
| state            | `deprecated`                                                                                                                                                                                                                                                   |
| target plan      | `CLN-0006` removal in the next minor release                                                                                                                                                                                                                   |

### CLN-0006 — Remove the `astryx layout` command group

| Field     | Value                                                                                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id        | `CLN-0006`                                                                                                                                                       |
| lifecycle | `DEP-0006`                                                                                                                                                       |
| delta     | Remove command registration, API exports (`layoutExpand`, `layoutCheck`, `layoutGrammar`), CLI bindings, command docs, tests, and the `layout.*` response types. |
| rollback  | Re-register the command group with the same API, response types, and tests from the final-patch baseline.                                                        |
| state     | `pending` — lands only in a minor release whose frozen manifest lists `CLN-0006`                                                                                 |

### DEP-0005 — Deprecate the copy default of `astryx theme add`

| Field            | Value                                                                                                                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id               | `DEP-0005`                                                                                                                                                                                                                                                                |
| cleanup          | `CLN-0005`                                                                                                                                                                                                                                                                |
| package          | `@astryxdesign/cli`                                                                                                                                                                                                                                                       |
| surface          | CLI command default: `astryx theme add <slug>` without `--import`, its target path argument and `--overwrite` option, the `theme.add` JSON response type, and the programmatic `ThemeAddResponse` type                                                                    |
| old contract     | `theme add <slug> [path] [--overwrite] [--package <package>]` copies the theme's source into the app and returns `theme.add`                                                                                                                                              |
| replacement      | `theme add <slug> --import [--package <package>]` records the theme in the generated app theme module and returns `theme.app`. `theme eject <slug> [path] [--overwrite] [--package <package>]` copies the source as an independent local fork and returns `theme.eject`   |
| warning          | Human mode: at most one stderr line per invocation naming `DEP-0005`, `theme eject` for a fork, and `theme add --import` for using the theme. JSON mode: `meta.deprecations` carries `{id: 'DEP-0005', replacements}`; every released `theme.add` data field is unchanged |
| migration        | Non-mechanical. A script that copies source runs `theme eject` with the same slug, path, `--overwrite`, and `--package` arguments. A script that wants the app to use the theme runs `theme add --import`, which keeps its meaning after the cleanup                      |
| codemod          | None: the right replacement depends on which of the two the caller meant, and the warning names both                                                                                                                                                                      |
| downstream       | Maintained docs, `init` next steps, doctor fixes, and `theme add --list` text name `theme add --import` while the default is deprecated and `theme add <slug>` after the cleanup                                                                                          |
| direct authority | `spec:AST-050` FR12 (the copy default leaves through its lifecycle). Owners: `spec:AST-050`: `josephfarina`.                                                                                                                                                              |
| state            | `deprecated`                                                                                                                                                                                                                                                              |
| target plan      | `CLN-0005` in the next minor release                                                                                                                                                                                                                                      |

### CLN-0005 — Make `astryx theme add` import by default

| Field     | Value                                                                                                                                                                                                                                                                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id        | `CLN-0005`                                                                                                                                                                                                                                                                                                                                     |
| lifecycle | `DEP-0005`                                                                                                                                                                                                                                                                                                                                     |
| delta     | `theme add <slug>` imports and returns `theme.app`, with or without `--import`, which stays an accepted no-op. A target path exits 1 with `ERR_INVALID_ARGUMENT` and `--overwrite` exits 1 with `ERR_INVALID_OPTION`; neither writes files. The `theme.add` response type, the `ThemeAddResponse` type, and the `DEP-0005` warning are removed |
| rollback  | Restore the copy default, its options, and the `theme.add` response from the final-patch baseline                                                                                                                                                                                                                                              |
| state     | `pending` — lands only in a minor release whose frozen manifest lists `CLN-0005`                                                                                                                                                                                                                                                               |

### IFIX-0001 — The CLI stops reading the Astryx-owned agent variables

| Field         | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id            | `IFIX-0001`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| cleanup       | `CLN-0007`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| package       | `@astryxdesign/cli`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| surface       | The Astryx-owned environment variables `ASTRYX_AGENT_ID`, `ASTRYX_AGENT_SESSION_ID`, and `ASTRYX_AGENT_METADATA`, which every command reads to fill the agent fields of its debug event (`agent`, `agentIdentity`, `agentSessionIdHash`, `agentSessionIdSource`, `invocationSource`) and the gap report's record of whether an agent or a person ran it                                                                                                                                                                                                                   |
| authority     | `spec:AST-017` FR14: "The CLI MUST NOT define or read an Astryx-owned environment variable for any purpose." Owners: `spec:AST-017`: `cixzhang`, `josephfarina`.                                                                                                                                                                                                                                                                                                                                                                                                          |
| reproducer    | With the latest stable CLI, in a project whose `astryx.config` `debug` handler records `event.env`, `ASTRYX_AGENT_ID=my-agent ASTRYX_AGENT_SESSION_ID=s1 astryx doctor --json` records identity `my-agent`, session source `ASTRYX_AGENT_SESSION_ID` with the session hashed, and invocation source `ai`. `ASTRYX_AGENT_METADATA=id=my-agent,session_id=s1` records the same identity with session source `ASTRYX_AGENT_METADATA.session_id`                                                                                                                              |
| affected      | Tools that set only the Astryx-prefixed variables and read agent attribution: a project or integration `debug` handler that reads those event fields, and gap reports that record who ran them. No command's output or exit code depends on the variables                                                                                                                                                                                                                                                                                                                 |
| matrix        | Text output, `--json` output, and exit codes of every command: unchanged. Debug event with only the Astryx-prefixed variables set: identity, session, and invocation source `ai` before; no identity or session after, and the invocation source falls back to `automation` in CI, `human` on a terminal, otherwise `unknown`. With `AGENT` and `AGENT_SESSION_ID` set: identical before and after. With the old and new variables both set: the same identity and session hash, and `agentSessionIdSource` reads `AGENT_SESSION_ID` instead of `ASTRYX_AGENT_SESSION_ID` |
| coexistence   | `AGENT` and `AGENT_SESSION_ID` are read before and after the correction, so a tool that sets them, alone or beside the old variables, gets the same identity and session hash on both. No option keeps reading the old variables, because the authority forbids reading them                                                                                                                                                                                                                                                                                              |
| migration     | Set `AGENT` for the identity and `AGENT_SESSION_ID` for the session. `ASTRYX_AGENT_METADATA` has no replacement: move its `id` to `AGENT` and its `session_id` or `invocation_id` to `AGENT_SESSION_ID`                                                                                                                                                                                                                                                                                                                                                                   |
| codemod       | None: the invoking tool sets these variables in its own process environment, so there is no consumer source for a codemod to rewrite                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| downstream    | Outside the CLI's attribution code, its public debug type comment, and its tests, no maintained source, doc, or template sets or teaches the three variables. The correction removes them from the type comment, and a guard test fails on any Astryx-prefixed environment read in the CLI source                                                                                                                                                                                                                                                                         |
| rollback      | Restore reading the three variables from the final-patch baseline. No persisted data, file format, or debug event field changes shape                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| harm of delay | The CLI keeps reading variables its current spec forbids, and tools come to depend on them, which makes the removal more costly                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| harm of apply | A tool that sets only the Astryx-prefixed variables loses agent attribution in debug events and gap reports until it sets `AGENT` and `AGENT_SESSION_ID`                                                                                                                                                                                                                                                                                                                                                                                                                  |
| state         | `proposed`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

### CLN-0007 — Stop reading the Astryx-owned agent variables

| Field     | Value                                                                                                                                                                                                                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id        | `CLN-0007`                                                                                                                                                                                                                                                                                |
| lifecycle | `IFIX-0001`                                                                                                                                                                                                                                                                               |
| delta     | The CLI stops reading `ASTRYX_AGENT_ID`, `ASTRYX_AGENT_SESSION_ID`, and `ASTRYX_AGENT_METADATA`. Agent identity comes from `AGENT` or a known agent signal, and the session from `AGENT_SESSION_ID`. Command output, `--json` output, exit codes, and the debug event shape are unchanged |
| rollback  | Restore reading the three variables from the final-patch baseline                                                                                                                                                                                                                         |
| state     | `pending` — lands only in a minor release, once `IFIX-0001` is approved and that release's frozen manifest lists `CLN-0007`                                                                                                                                                               |

### IFIX-0003 — An empty positional argument is not an omitted one

| Field         | Value                                                                                                                                                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id            | `IFIX-0003`                                                                                                                                                                                                                                                               |
| cleanup       | `CLN-0009`                                                                                                                                                                                                                                                                |
| package       | `@astryxdesign/cli`                                                                                                                                                                                                                                                       |
| surface       | The `template`, `swizzle`, and `discover` commands when a positional argument is the empty string `""`                                                                                                                                                                    |
| authority     | `spec:AST-017` FR17 (suppressed work is observable). Owners: `spec:AST-017`: `cixzhang`, `josephfarina`.                                                                                                                                                                  |
| reproducer    | With the latest stable CLI, `astryx template "" src/page.tsx` prints the full template list, discards the write target, and exits 0. `astryx swizzle ""` and `astryx discover ""` also list and exit 0. A single space already fails with `ERR_INVALID_ARGUMENT`          |
| affected      | A caller that passes an unset shell variable (`astryx template "$TEMPLATE" src/page.tsx`), a CI matrix cell with no value, or an agent that interpolates an empty field. The command reports success and writes nothing                                                   |
| matrix        | `template ""` with a path, `swizzle ""`, and `discover ""`: text and `--json` list and exit 0 before; `ERR_INVALID_ARGUMENT` and exit 1 after. Modes that ignore the positional (`--list`, `--cdn`, `--skeleton`, `swizzle --list`) and an omitted argument are unchanged |
| coexistence   | Not applicable: the released behavior silently routes the call to a different mode                                                                                                                                                                                        |
| migration     | Remove the empty string from the invocation. The documented way to list is to omit the argument                                                                                                                                                                           |
| codemod       | None: an empty string is almost always an unset variable, and only the caller knows the intended value                                                                                                                                                                    |
| downstream    | No maintained source passes `""` as a positional argument to these commands                                                                                                                                                                                               |
| rollback      | Restore the released handling of `""` from the final-patch baseline                                                                                                                                                                                                       |
| harm of delay | Each release keeps discarding a write target when a variable is unset                                                                                                                                                                                                     |
| harm of apply | A caller that passes `""` on purpose to reach the list fails; omitting the argument still lists                                                                                                                                                                           |
| state         | `proposed`                                                                                                                                                                                                                                                                |

### CLN-0009 — Reject an empty positional argument

| Field     | Value                                                                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| id        | `CLN-0009`                                                                                                                                                               |
| lifecycle | `IFIX-0003`                                                                                                                                                              |
| delta     | `template`, `swizzle`, and `discover` reject `""` with `ERR_INVALID_ARGUMENT` and exit 1 where the selected mode uses the positional. Modes that ignore it are unchanged |
| rollback  | Restore the released handling of `""` from the final-patch baseline                                                                                                      |
| state     | `pending` — lands only in a minor release, once `IFIX-0003` is approved and that release's frozen manifest lists `CLN-0009`                                              |

### IFIX-0004 — `astryx init --remove-agents` reports a removal only when one happened

| Field         | Value                                                                                                                                                                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id            | `IFIX-0004`                                                                                                                                                                                                                                                                 |
| cleanup       | `CLN-0010`                                                                                                                                                                                                                                                                  |
| package       | `@astryxdesign/cli`                                                                                                                                                                                                                                                         |
| surface       | `astryx init --remove-agents`: the `data.removed` field of the `init.remove` response and its human line                                                                                                                                                                    |
| authority     | `spec:AST-017` FR17 (suppressed work is observable). Owners: `spec:AST-017`: `cixzhang`, `josephfarina`.                                                                                                                                                                    |
| reproducer    | With the latest stable CLI, in a project with no agent-docs block, `astryx --json init --remove-agents` returns `{"type":"init.remove","data":{"removed":true}}` and exits 0. The response type is the literal `{removed: true}`, so it cannot say that nothing was removed |
| affected      | A teardown script or agent that checks whether a project is clean. The receipt reports a removal that did not happen                                                                                                                                                        |
| matrix        | Project with no block: text `[ok] AI agent docs removed.` before, `[ok] Nothing to remove: no Astryx agent-docs block was found.` after; `--json` `removed: true` before, `removed: false` after. Project with a block: unchanged, `removed: true`. Exit 0 in every case    |
| coexistence   | Not applicable: the released value is a false claim                                                                                                                                                                                                                         |
| migration     | A consumer that reads `data.removed` as a boolean keeps working. A consumer that treats the literal `true` as proof the project had agent docs checks before it calls remove, or reads the value                                                                            |
| codemod       | None: the replacement depends on what the consumer meant the value to prove                                                                                                                                                                                                 |
| downstream    | No maintained source relies on the literal `true`                                                                                                                                                                                                                           |
| rollback      | Restore the literal `true` receipt from the final-patch baseline                                                                                                                                                                                                            |
| harm of delay | Each release tells clean projects that a removal happened                                                                                                                                                                                                                   |
| harm of apply | A consumer that treats `removed` as a constant sees `false` on a clean project                                                                                                                                                                                              |
| state         | `proposed`                                                                                                                                                                                                                                                                  |

### CLN-0010 — Report whether agent docs were removed

| Field     | Value                                                                                                                       |
| --------- | --------------------------------------------------------------------------------------------------------------------------- |
| id        | `CLN-0010`                                                                                                                  |
| lifecycle | `IFIX-0004`                                                                                                                 |
| delta     | `data.removed` widens from the literal `true` to a boolean, and the human line says which happened                          |
| rollback  | Restore the literal `true` receipt and its human line from the final-patch baseline                                         |
| state     | `pending` — lands only in a minor release, once `IFIX-0004` is approved and that release's frozen manifest lists `CLN-0010` |

### IFIX-0005 — Contradictory options are refused, not silently ignored

| Field         | Value                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id            | `IFIX-0005`                                                                                                                                                                                                                                                                                                                                                                                           |
| cleanup       | `CLN-0011`                                                                                                                                                                                                                                                                                                                                                                                            |
| package       | `@astryxdesign/cli`                                                                                                                                                                                                                                                                                                                                                                                   |
| surface       | `gap-report --list-categories` with submission options; `init --remove-agents` with install options, and `init --all` with `--features`; `upgrade --list` with migration options; `template --cdn`, `--list`, and `--skeleton` with the options each mode ignores                                                                                                                                     |
| authority     | `spec:AST-042` FR5 (every option pair composes, refuses, or is prevented), `spec:AST-017` FR17 (suppressed work is observable). Owners: `spec:AST-042`: `josephfarina`; `spec:AST-017`: `cixzhang`, `josephfarina`.                                                                                                                                                                                   |
| reproducer    | With the latest stable CLI, `astryx gap-report Button --list-categories --category other --reason test` lists categories and drops the submission; `astryx init --remove-agents --features agents` removes and ignores `--features`; `astryx upgrade --list --from 0.5.0` lists and ignores `--from`; `astryx template ai-chat --cdn` writes the CDN page and ignores the template name. Each exits 0 |
| affected      | A caller that combines contradictory options and does not notice that one side was dropped. The command reports success for work it did not do                                                                                                                                                                                                                                                        |
| matrix        | Each refused pair, text and `--json`: exit 0 with one option silently ignored before; `ERR_INVALID_ARGUMENT` naming both options and exit 1 after. Removing the ignored option gives the released result                                                                                                                                                                                              |
| coexistence   | Not applicable: the ignored option has no effect                                                                                                                                                                                                                                                                                                                                                      |
| migration     | Remove the option that the command ignores                                                                                                                                                                                                                                                                                                                                                            |
| codemod       | None: only the caller knows which of the two options it meant                                                                                                                                                                                                                                                                                                                                         |
| downstream    | No maintained source passes these pairs                                                                                                                                                                                                                                                                                                                                                               |
| rollback      | Restore the released option handling from the final-patch baseline                                                                                                                                                                                                                                                                                                                                    |
| harm of delay | Each release keeps dropping part of what the caller asked for                                                                                                                                                                                                                                                                                                                                         |
| harm of apply | A caller that combines contradictory options and relies on exit 0 fails until it removes the ignored option                                                                                                                                                                                                                                                                                           |
| state         | `proposed`                                                                                                                                                                                                                                                                                                                                                                                            |

### CLN-0011 — Refuse contradictory option pairs

| Field     | Value                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| id        | `CLN-0011`                                                                                                                                        |
| lifecycle | `IFIX-0005`                                                                                                                                       |
| delta     | `gap-report`, `init`, `upgrade`, and `template` refuse the contradictory option pairs with `ERR_INVALID_ARGUMENT` and exit 1, naming both options |
| rollback  | Restore the released option handling from the final-patch baseline                                                                                |
| state     | `pending` — lands only in a minor release, once `IFIX-0005` is approved and that release's frozen manifest lists `CLN-0011`                       |

### IFIX-0006 — `astryx theme build` exits 1 when it reports private variables

| Field         | Value                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| id            | `IFIX-0006`                                                                                                                                                                                                                                                                                                                                                                                                              |
| cleanup       | `CLN-0012`                                                                                                                                                                                                                                                                                                                                                                                                               |
| package       | `@astryxdesign/cli`                                                                                                                                                                                                                                                                                                                                                                                                      |
| surface       | The exit status of `astryx theme build` when it reports a theme that sets a private `--_*` variable, in human output, `--json`, `--check`, several files, and `--family`                                                                                                                                                                                                                                                 |
| authority     | `architecture:cli-surface` INV7: a command's `CommandDoc` is the source of its help and manifest, and the `theme build` `CommandDoc` declares exit 1 for a build or validation error. `architecture:component-theming-surface` INV11: private `--_*` variables must not be authored directly. Owners: `architecture:cli-surface`: `josephfarina`; `architecture:component-theming-surface`: `cixzhang`, `imdreamrunner`. |
| reproducer    | With the latest stable CLI, `astryx theme build` on a theme whose component override sets `--_button-radius` prints `[error] Component "button" ... sets private var "--_button-radius"` and `1 private var error(s)`, writes its outputs, and exits 0                                                                                                                                                                   |
| affected      | Build scripts and CI steps that run `theme build` on a theme that sets a private variable. They start to fail until the theme uses public properties                                                                                                                                                                                                                                                                     |
| matrix        | Human output, `--json`, `--check`, several files, and `--family`: exit 0 before, exit 1 after. Standard output, standard error, JSON receipts, warnings, generated files, and `--check` results are unchanged                                                                                                                                                                                                            |
| coexistence   | No option keeps exit 0. Every affected run already prints the `[error]` lines that name each private variable and the fix, and the outputs keep being written (DEC-6)                                                                                                                                                                                                                                                    |
| migration     | Non-mechanical: replace each private variable with the public property that the component exposes for it. The right property depends on the design intent                                                                                                                                                                                                                                                                |
| codemod       | None, for the same reason                                                                                                                                                                                                                                                                                                                                                                                                |
| downstream    | Every first-party theme package builds with no private-variable error and exits 0                                                                                                                                                                                                                                                                                                                                        |
| rollback      | Restore exit 0 for these runs from the final-patch baseline; outputs are identical either way                                                                                                                                                                                                                                                                                                                            |
| harm of delay | CI keeps passing themes whose private variables are unsupported and can stop working with any Core release                                                                                                                                                                                                                                                                                                               |
| harm of apply | A CI step that builds such a theme fails until its private variables are replaced                                                                                                                                                                                                                                                                                                                                        |
| state         | `proposed`                                                                                                                                                                                                                                                                                                                                                                                                               |

### CLN-0012 — Apply the `theme build` exit status correction

| Field     | Value                                                                                                                       |
| --------- | --------------------------------------------------------------------------------------------------------------------------- |
| id        | `CLN-0012`                                                                                                                  |
| lifecycle | `IFIX-0006`                                                                                                                 |
| delta     | `theme build` exits 1 when it reports a private-variable error. Its output, receipts, and generated files are unchanged     |
| rollback  | Restore exit 0 for these runs from the final-patch baseline                                                                 |
| state     | `pending` — lands only in a minor release, once `IFIX-0006` is approved and that release's frozen manifest lists `CLN-0012` |

### IFIX-0007 — Invalid input is refused, not accepted with an empty result

| Field         | Value                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id            | `IFIX-0007`                                                                                                                                                                                                                                                                                                                                                                                                                 |
| cleanup       | `CLN-0013`                                                                                                                                                                                                                                                                                                                                                                                                                  |
| package       | `@astryxdesign/cli`                                                                                                                                                                                                                                                                                                                                                                                                         |
| surface       | `template --list --type` with an unknown type; `template --list --package` with an unknown package; `build --type doc`; `build --limit` with a fractional number; `integration add` with extra positional arguments; the error code of `component()` for a name that several packages provide                                                                                                                               |
| authority     | `spec:AST-017` FR17 (suppressed work is observable), `spec:AST-042` FR5 (options change what a command produces, predictably), `architecture:cli-surface` INV3 (the code is the contract). Owners: `spec:AST-017`: `cixzhang`, `josephfarina`; `spec:AST-042`: `josephfarina`; `architecture:cli-surface`: `josephfarina`.                                                                                                  |
| reproducer    | With the latest stable CLI, `astryx template --list --type bogus` prints an empty list and exits 0; `astryx build pricing --type doc` returns `hasResults: true` with no pages or blocks and exits 0; `astryx build pricing --limit 2.5` uses 2; `astryx integration add agent-doc Run acme verify` drops the extra words and exits 0; `component()` throws `ERR_UNKNOWN_COMPONENT` when two packages provide the same name |
| affected      | A caller whose invalid input the CLI accepts. The command reports success for a result that is empty or not what was asked, or names the wrong error                                                                                                                                                                                                                                                                        |
| matrix        | Unknown template type or package, `build --type doc`, a fractional `--limit`, and extra `integration add` arguments: exit 0 with an empty, truncated, or partial result before; an error and exit 1 after, in text and `--json`. A name several packages provide: `ERR_UNKNOWN_COMPONENT` before, `ERR_AMBIGUOUS_COMPONENT` after, with the same exit status                                                                |
| coexistence   | Not applicable: the released results are empty or misleading                                                                                                                                                                                                                                                                                                                                                                |
| migration     | Pass a valid type or package, an integer limit, or the documented arguments. A caller of `component()` catches `ERR_AMBIGUOUS_COMPONENT` for a name that several packages provide                                                                                                                                                                                                                                           |
| codemod       | None: only the caller knows the input it meant                                                                                                                                                                                                                                                                                                                                                                              |
| downstream    | No maintained source passes these inputs                                                                                                                                                                                                                                                                                                                                                                                    |
| rollback      | Restore the released input handling and error code from the final-patch baseline                                                                                                                                                                                                                                                                                                                                            |
| harm of delay | Each release keeps reporting success for invalid input                                                                                                                                                                                                                                                                                                                                                                      |
| harm of apply | A caller that passes one of these inputs fails until it corrects the input                                                                                                                                                                                                                                                                                                                                                  |
| state         | `proposed`                                                                                                                                                                                                                                                                                                                                                                                                                  |

### CLN-0013 — Refuse invalid input

| Field     | Value                                                                                                                                                                                                                                         |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id        | `CLN-0013`                                                                                                                                                                                                                                    |
| lifecycle | `IFIX-0007`                                                                                                                                                                                                                                   |
| delta     | `template` refuses unknown types and packages, `build` refuses `doc` as a type and a fractional limit, `integration add` refuses extra arguments, and `component()` throws `ERR_AMBIGUOUS_COMPONENT` for a name that several packages provide |
| rollback  | Restore the released input handling and error code from the final-patch baseline                                                                                                                                                              |
| state     | `pending` — lands only in a minor release, once `IFIX-0007` is approved and that release's frozen manifest lists `CLN-0013`                                                                                                                   |

### IFIX-0008 — `doctor integration validate` exits 1 when there is nothing to validate

| Field         | Value                                                                                                                                                                                                           |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id            | `IFIX-0008`                                                                                                                                                                                                     |
| cleanup       | `CLN-0014`                                                                                                                                                                                                      |
| package       | `@astryxdesign/cli`                                                                                                                                                                                             |
| surface       | `doctor integration validate` in a directory with no `package.json`                                                                                                                                             |
| authority     | `spec:AST-017` FR17 (suppressed work is observable). Owners: `spec:AST-017`: `cixzhang`, `josephfarina`.                                                                                                        |
| reproducer    | With the latest stable CLI, `astryx doctor integration validate` in a directory with no `package.json` prints that nothing was validated and exits 0                                                            |
| affected      | A CI step that runs the command as a gate and passes although it found no package to check                                                                                                                      |
| matrix        | `doctor integration validate` with no `package.json`: text and `--json` exit 0 before, exit 1 after, with the same envelope. `integration verify` is unchanged: it already exits 1 with a `no_package` envelope |
| coexistence   | Not applicable: exit 0 when there is nothing to check is the defect                                                                                                                                             |
| migration     | Run the command in a directory that has a `package.json`, or handle exit 1 for that case                                                                                                                        |
| codemod       | None: a script adds the directory check or handles the failure itself                                                                                                                                           |
| downstream    | No maintained source runs this command in a directory without a `package.json`                                                                                                                                  |
| rollback      | Restore exit 0 for this run from the final-patch baseline                                                                                                                                                       |
| harm of delay | Each release lets a gate pass when there was nothing to check                                                                                                                                                   |
| harm of apply | A script that runs `doctor integration validate` in a directory without a `package.json` fails until it checks the directory first                                                                              |
| state         | `proposed`                                                                                                                                                                                                      |

### CLN-0014 — Fail `doctor integration validate` with nothing to validate

| Field     | Value                                                                                                                       |
| --------- | --------------------------------------------------------------------------------------------------------------------------- |
| id        | `CLN-0014`                                                                                                                  |
| lifecycle | `IFIX-0008`                                                                                                                 |
| delta     | `doctor integration validate` exits 1 when nothing was validated. `integration verify` is unchanged                         |
| rollback  | Restore exit 0 for this run from the final-patch baseline                                                                   |
| state     | `pending` — lands only in a minor release, once `IFIX-0008` is approved and that release's frozen manifest lists `CLN-0014` |

## Open questions

None.
