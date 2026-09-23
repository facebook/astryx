---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-017
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-02
phase: accepted
owners: [cixzhang, josephfarina]
affects_architecture:
  [architecture:public-component-api, architecture:cli-surface]
affects_families: []
affects_contributing:
  [
    contributing:release-process,
    contributing:templates,
    contributing:cli-conventions,
  ]
affects_consumer_docs: [release-process, templates]
---

# Published compatibility and breaking-change classification system spec

<!-- review-applicability:v1 -->

```json
{
  "scope": "global",
  "triggers": {
    "compatibility": [
      "DEC-1",
      "DEC-5",
      "DEC-6",
      "DEC-7",
      "FR3",
      "FR4",
      "FR5",
      "FR12",
      "FR14",
      "FR15",
      "FR16",
      "FR17",
      "FR18"
    ]
  }
}
```

## Intent

Give contributors and reviewers one rule for deciding whether a change is
`[breaking]`: identify an installed consumer whose valid use of the latest stable
release stops working unchanged.

The label is a compatibility classification, not a risk or severity score. A
small, safe rename can be breaking; a large rewrite can be nonbreaking when it
preserves the released contract.

For CLI controls, keep every supported behavior discoverable and put each control on
the narrowest surface that owns it. Global controls require evidence that their value
and meaning are global. Cross-cutting guarantees must be complete, observable, and
independent for each invocation.

## Non-goals

- Freezing implementation details or every byte of generated example code.
- Defining component or template naming conventions.
- Treating private packages, canaries, or unreleased work as stable public API.
- Replacing the release process, Changesets, or migration tooling.

## Requirements

- **FR1 — Breaking changes need a released victim.** A change is breaking only
  when a valid consumer scenario supported by the latest stable release of a
  published package no longer works unchanged, or produces an incompatible
  result under a documented stable contract. The review names that scenario and
  the released surface it uses.
- **FR2 — Classify against the latest stable release.** A surface added and then
  renamed, removed, or reworked before any stable release has no installed
  consumer and is not breaking. Private or ignored packages are outside the
  published compatibility promise. Promotion from a private package into a
  published package is additive from the published side.
- **FR3 — Released contracts include behavior, not only types.** Compatibility
  covers public exports and import paths; requiredness, accepted values, defaults,
  return types, callbacks, and error behavior; documented interaction and
  accessibility behavior; stable CLI command names, options, exit behavior, and
  machine-readable schemas; and other explicitly documented public extension
  points. Internal implementation, undocumented markup, and source layout are not
  stable merely because a consumer can observe them.
- **FR4 — Preserved old usage is nonbreaking.** A rename or replacement is
  nonbreaking when the old released call, import, option, identifier, or input
  continues to work with equivalent meaning through a compatibility alias or
  adapter. A deprecation may warn and point to the replacement, but removing that
  compatibility path is the breaking event.
- **FR5 — Additive and contract-restoring changes are nonbreaking.** New optional
  capabilities, new components, new commands, broader accepted inputs, and new
  templates are nonbreaking when old usage is unchanged. A fix that restores the
  already-documented contract is nonbreaking even when it changes faulty output.
  A proposal that intentionally replaces the documented contract is not a fix for
  classification purposes.
- **FR6 — Risk does not override compatibility.** Low adoption, low likelihood,
  engineering approval, or confidence that affected callers are uncommon does not
  make an incompatible released contract nonbreaking. Conversely, implementation
  size, visual scope, or review difficulty does not make a compatible change
  breaking.
- **FR7 — The Changeset category follows the classification.** A published
  breaking change uses a `[breaking]` Changeset. While Astryx packages remain on
  `0.x`, that category carries a minor bump; every nonbreaking published category
  carries a patch bump. Documentation-only, test-only, and private-package-only
  changes need no Changeset. `pnpm changeset:new` is the authoring path and
  `pnpm check:changesets` enforces the current category/bump coupling. Classify
  each published package update in multi-package work. A fixed-group version-only
  co-bump needs no Changeset entry by itself, but a generated dependency or peer
  range edit is part of that package's update and must be classified and named in a
  Changeset. When categories differ, use separate Changesets so every package entry
  follows its own classification.
- **FR8 — Migration evidence matches the affected surface.** Every breaking change
  names the old valid usage, the replacement, and how consumers migrate. Supply an
  `astryx upgrade` codemod when consumer source can be rewritten mechanically.
  When no source rewrite is possible, provide an explicit compatibility alias or
  concrete replacement instructions rather than inventing a vacuous codemod.
- **FR9 — Template slugs are mutable catalog data.** A template slug identifies an
  entry in the current template catalog; it is data about that template, not a
  contractual CLI API. Renaming a slug is nonbreaking even when
  `astryx template <old-slug>` no longer resolves. The Changeset and release note
  describe the catalog rename so builders can find the new value, but the rename
  does not use the `[breaking]` category or require an alias or codemod.
- **FR10 — Template content and metadata are expected to evolve.** Adding a
  template, rebuilding its starter source, or changing its slug, human-facing
  name, description, category, keywords, or example data is nonbreaking while the
  CLI's stable command and machine-readable schema contracts remain compatible.
  Generated starter code is not promised byte-for-byte stability across releases,
  and existing projects are not rewritten when a template improves.
- **FR11 — The CLI contract surrounds the catalog.** The `template` command name,
  supported options, exit behavior, and machine-readable response schema are
  contractual surfaces under FR3. Individual catalog values returned through that
  schema, including template slugs, names, descriptions, categories, keywords, and
  starter content, are not independently stable API identifiers.
- **FR12 — Supported inter-package ranges are contracts.** For an update to a
  published package, its latest stable release's documented installation scenarios
  and declared dependency or peer ranges define the supported companion package
  versions. The update is breaking for that package when upgrading it alone makes
  any such combination stop working unchanged, including by narrowing or raising
  the range. A coordinated upgrade that works does not change that classification.
  A dependency bump is not breaking when every previously supported combination
  keeps working. Keep every previously supported version in range and provide an
  adapter when needed; otherwise classify the narrower or higher-floor range as
  breaking, describe the range change in its Changeset release note, and meet FR8's
  migration obligation.
- **FR13 — Stable machine schemas project every field.** A stable CLI response
  contract includes fields inside discriminated `data` entries as well as the
  outer envelope. Every field is present in the canonical response type, contract
  tests, text projection where the command provides one, and complete
  consumer-facing schema documentation. Adding an optional field is nonbreaking
  when old consumers continue unchanged, but it remains a public schema update and
  does not bypass current-authority review or documentation.
- **FR14 — No supported CLI behavior is hidden.** Any Astryx CLI behavior
  available in a supported flow—including behavior selected automatically and
  behavior selected by an Astryx-owned control—is a public surface and MUST be
  documented and discoverable. Every caller-settable control that changes command
  selection, work, output, side effects, or exit behavior is part of that surface,
  whether spelled as a command, option, positional argument, package field, or
  configuration key. The CLI MUST NOT define or read an Astryx-owned environment
  variable for any purpose. A variable is Astryx-owned when Astryx defines its
  semantics, regardless of its name or prefix; standard platform variables remain
  outside this prohibition unless Astryx assigns them an Astryx-specific meaning.
  Automation MUST use the documented programmatic API.
  Public controls MUST define their accepted values, default, precedence and
  interactions, error behavior, and a representative invocation. Commands and
  options MUST appear in generated help and the machine-readable manifest.
  Automatic behavior and other controls MUST either appear there or be linked from
  those discovery surfaces to consumer documentation. A
  normal invocation mode MUST have a documented command, option, or configuration
  surface. Private test hooks and maintainer rollout gates MAY affect tests,
  diagnostics, or staged availability without becoming public controls, but they MUST
  NOT use environment variables, require action from supported consumers, or serve as
  the sole interface to a supported mode. The user-facing behavior they gate remains
  subject to this requirement once supported.
- **FR15 — Global controls require CLI-wide value and semantics.** An option is
  global when the root parser accepts it across commands or the manifest lists it in
  `globalOptions`. A new behavior-changing option MAY be global only when it
  represents one coherent CLI-wide invariant, solves a demonstrated
  supported-consumer need that a narrower surface cannot solve, and has defined,
  meaningful, non-no-op behavior for every executable command and subcommand. The proposal MUST enumerate those surfaces
  from generated help and the machine-readable manifest and state the control's
  behavior, output or error effect, and verification for each one. A command on
  which the control has no meaningful effect is evidence that the proposed scope is too broad. A behavior that applies to only part of the
  CLI MUST be placed on the nearest command, command group, or programmatic API that
  owns it. The same name MUST keep the same meaning throughout that scope, and names
  MUST describe the exact controlled capability rather than make broad claims such as
  `safe`, `secure`, `trusted`, or `isolated`. A safety or trust control MUST also
  define its trust boundary and fail closed before untrusted input can execute or
  cause a side effect.
- **FR16 — Cross-cutting guarantees define and close their boundary.** A claim that
  prevents a class of execution, data access, or side effect MUST define the trusted
  inputs, denied actions, and the points where protection begins and ends. It MUST
  cover every current entry point and fail closed for an unknown or newly added
  extension point.
- **FR17 — Suppressed work is observable.** When a safety or reduced-capability
  control intentionally omits a normally available source, capability, or unit of
  work, every successful machine-readable result MUST identify the active mode and
  what category was omitted. Human-readable output MUST project the same fact. A
  partial or empty result MUST NOT look like an ordinary complete success. If the
  operation cannot produce a useful conforming result, it MUST return a stable
  structured error and, for the CLI, a nonzero exit code before any write or external
  side effect.
- **FR18 — Programmatic controls are explicit and invocation-scoped.** A
  programmatic control MUST be an explicit API input and MUST NOT depend on ambient
  mutable process state. Concurrent calls MUST be able to select different values
  independently. When the CLI and programmatic API expose the same control, they MUST
  share accepted values, defaults, precedence, observable behavior, and error
  semantics.

### Platform support

- Supported feature/engine floor: every published Astryx package and stable CLI
  release.
- Unsupported behavior: private packages, unreleased branch state, and canary-only
  surfaces carry no stable compatibility promise.
- Browser evidence: not applicable to the classification itself; a browser-owned
  compatibility claim still follows the governing component or platform spec.

## Current-state impact

The release tooling already enforces `[breaking]` to minor and every other
category to patch while packages are on `0.x`. The Release Process already limits
migration obligations to released surfaces. The template contribution guide notes
that template resolution is exact-match, but that lookup mechanic does not turn a
slug value into a contractual API.

This spec supplies the missing classification rule shared by those documents. In
particular, both CLI-template cases discussed during review are nonbreaking catalog
updates:

- renaming a template slug changes data about the current template and may make the
  previous value stop resolving; and
- changing or completely rebuilding the template's emitted starter page updates
  content for future generations without modifying projects that already copied it.

The stable compatibility boundary remains the CLI operation and complete response
schema, not the individual entries currently present in the template catalog.
Nested entry fields are public schema even when optional; their type, tests, text
projection where present, and consumer schema documentation move together.

The CLI already generates command help, README tables, and a machine-readable
manifest. This amendment extends that discoverability standard to every supported
behavior, including automatic behavior and controls outside command syntax. Existing
Astryx-owned environment controls are non-conforming and must move to documented
commands, options, configuration, or programmatic APIs; this record does not choose
their individual migrations. Removing an existing variable still follows FR3–FR8:
a breaking removal needs concrete migration guidance, and silently ignoring the old
input is not a migration. This record does not authorize any specific global control.
A future proposal must prove meaningful behavior across every command under FR15 or place the control on the narrower command and API surfaces that own the
behavior. These decisions change policy only, so they do not change runtime output or
a published package and require no Changeset.

## Verification

| Contract  | Verification                                                                                                                     | Representative states                                                                         | Mutation or failure expectation                                                                                                                |
| --------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR3   | PR compatibility statement plus latest stable package inspection                                                                 | released export, behavior, CLI command; unreleased and private surface                        | A change is labeled from diff size or possibility alone, or a released contract change is missed                                               |
| FR4–FR6   | Old-usage type/runtime/CLI regression test                                                                                       | alias retained, deprecation warning, broad rewrite, low-adoption caller                       | Contractual old usage fails despite a nonbreaking label, or risk is substituted for compatibility                                              |
| FR7–FR8   | `pnpm check:changesets` plus migration review                                                                                    | breaking and patch Changesets; codemoddable and non-codemoddable migration                    | Category and bump diverge, or a breaking release gives no usable migration path                                                                |
| FR9–FR13  | CLI contract tests, response-schema/type snapshots, text projections, generated consumer docs, and template catalog/output tests | slug rename, metadata edit, source rebuild, optional field addition, command or schema change | Catalog data is frozen as API, a command/schema incompatibility is mislabeled as catalog-only, or a response field lacks a complete projection |
| FR12      | Minimum and representative supported-version tests plus manifest and release-note review                                         | retained range, narrowed range, adapter, coordinated upgrade                                  | An in-range combination breaks under a nonbreaking label, or release coordination hides the affected package or migration                      |
| FR14      | Help/manifest snapshots, public API and consumer docs, and focused contract tests                                                | command, option, API/config, private rollout/test hook                                        | Supported behavior is hidden, an environment variable changes behavior, or automation lacks a documented API                                   |
| FR15      | Full manifest-derived command matrix, supported-consumer evidence, and scope-specific contract tests                             | global invariant, scoped command group, single command, programmatic API                      | A global control is a no-op for any command, has different meanings, or replaces a narrower owning surface                                     |
| FR16–FR18 | Boundary inventory, hostile side-effect probes, response snapshots, and concurrent API tests                                     | known and new extension, partial result, text/JSON/API parity, independent concurrent calls   | A route bypasses the guarantee, omitted work looks complete, or one invocation changes another                                                 |

## Decision log

### DEC-1 — Breaking means a released consumer must change

**Reference:** `spec:AST-017/DEC-1`
**Decider:** `cixzhang`, `2026-09-02`

Classify compatibility from the latest stable published contract and name the
consumer scenario that stops working. This makes labels predictable, keeps
unreleased and private experimentation free to change, and prevents low-risk but
incompatible edits from hiding in patch releases.

Rejected: classifying by implementation size, perceived risk, reviewer confidence,
or any observable difference. Those tests either miss real contract breakage or
freeze implementation details and data values that were never promised.

### DEC-2 — Template slugs and source are mutable catalog data

**Reference:** `spec:AST-017/DEC-2`
**Decider:** `cixzhang`, `2026-09-02`

Treat a template slug as data describing the current catalog entry, alongside its
name, description, category, keywords, and starter content. Those values may evolve
in patch releases, including a slug rename that makes the previous value stop
resolving. The release note should make the new value discoverable, but the change
is not `[breaking]` and needs no compatibility alias or codemod.

Keep the surrounding CLI operation contractual: incompatible changes to the
`template` command, its options, exit behavior, or machine-readable schema still
follow the normal breaking-change rule. This lets the template library improve
without confusing current catalog contents with the interface that serves them.

Rejected: treating a slug as stable API merely because it is interpolated into an
exact CLI invocation. That would freeze catalog data and discourage clearer naming
without protecting a contract the template system intends to make.

### DEC-3 — Package updates keep their own range promises

**Reference:** `spec:AST-017/DEC-3`
**Decider:** `cixzhang`, `2026-09-03`

Treat the latest stable package's declared dependency or peer range and documented
installation scenario as its compatibility promise. Consumers may upgrade that
package with any companion version the range still allows; a coordinated release
cannot require an undeclared lockstep upgrade. Classify the package update that
creates the mismatch. Supporting package updates keep their own classifications.
A coordinated breaking range change remains allowed when its Changeset release note
describes the new range and its FR8 migration tells consumers how to move.

Rejected: marking every dependency bump breaking, which would freeze compatible
maintenance, or calling an update nonbreaking merely because a coordinated upgrade
works, which would break supported independent consumers.

### DEC-4 — Stable CLI response fields receive complete projections

**Reference:** `spec:AST-017/DEC-4`
**Decider:** `cixzhang`, `2026-09-06`

Treat every field in a stable machine-readable CLI response—including nested
entry fields—as public schema. Keep its canonical type, contract tests, applicable
text output, and complete consumer documentation aligned in the same change.

An optional field addition may remain nonbreaking when old consumers continue
unchanged. That compatibility result does not make the field private or waive
current-authority and documentation requirements.

Rejected: documenting only the outer envelope, relying on implementation typedefs
as consumer documentation, or treating a response-entry field as mutable catalog
data merely because the value it carries may evolve.

### DEC-5 — Supported CLI behavior is never hidden

**Reference:** `spec:AST-017/DEC-5`
**Decider:** `josephfarina`, `2026-09-23`

Any Astryx CLI behavior available in a supported flow is public and must be
documented and discoverable, including behavior selected automatically. A control
that can change supported CLI behavior is public and must be documented and
discoverable. Its status follows the behavior it changes, not whether it is spelled
as a command, option, package field, or configuration key.

Use an option for invocation-scoped behavior, placed on the nearest command or
command group that owns it; a global option must meet FR15's CLI-wide evidence bar.
Use a documented configuration surface for persistent project behavior. Do not
introduce Astryx-owned environment variables, including aliases for another surface.
Automation uses the documented programmatic API. Private tests use injected test
seams instead of environment variables. A maintainer rollout gate may control staged
availability, but it is not a public user interface, must not use an environment
variable, and cannot be the only way to reach a supported mode. The user-facing
behavior it gates becomes subject to this requirement once supported.

Rejected: documented or undocumented environment-variable controls, naming a hidden
rollout gate as the user interface, or describing a behavior only in prose while
omitting it—or a direct link to its documentation—from generated help and the
machine-readable manifest.

### DEC-6 — Global CLI controls prove global value

**Reference:** `spec:AST-017/DEC-6`
**Decider:** `josephfarina`, `2026-09-23`

Treat a behavior-changing global control as a last resort, not as the default home for
invocation-scoped behavior. Because it changes every command, it requires current
system-spec authority before implementation. Its proposal must show one stable
invariant with meaningful behavior for every command, a supported-consumer need that
narrower command or API scope cannot satisfy, and a manifest-derived command matrix that verifies the claim. A
no-op or different meaning on any command means the control is scoped too broadly.

Put narrower behavior on the nearest command, command group, or programmatic API that
owns it. Name the control for the exact capability it changes rather than using broad
quality claims such as `safe`, `secure`, `trusted`, or `isolated`. A safety or trust
control also defines its trust boundary and fails closed before untrusted input can
execute or cause a side effect.

Rejected: making a control global because several implementations share a switch,
because root parsing is convenient, or because unrelated commands can silently ignore
it. Those approaches enlarge the public surface without establishing coherent value.

### DEC-7 — Cross-cutting controls are complete, observable, and per invocation

**Reference:** `spec:AST-017/DEC-7`
**Decider:** `josephfarina`, `2026-09-23`

Define a cross-cutting guarantee by its complete boundary, not by the current list of
implementation sites. Unknown and future extension points fail closed.

Make work omitted by a safety or reduced-capability mode part of the result contract
so a partial result cannot be mistaken for a complete one. When no useful result
remains, return a stable error before writes or external effects. Pass programmatic controls as explicit inputs, keep
them independent across concurrent calls, and preserve semantics across equivalent CLI
and API surfaces.

Rejected: best-effort interception of known loaders, silent fallback to partial or
empty results, process-global mutable switches, and separate CLI and API meanings. Each can
make the advertised guarantee false while the happy-path tests remain green.

## Open questions

None.
