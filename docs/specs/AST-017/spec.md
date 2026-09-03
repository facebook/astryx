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
affects_architecture: [architecture:public-component-api]
affects_families: []
affects_contributing: [contributing:release-process, contributing:templates]
affects_consumer_docs: [release-process, templates]
---

# Published compatibility and breaking-change classification system spec

## Intent

Give contributors and reviewers one rule for deciding whether a change is
`[breaking]`: identify an installed consumer whose valid use of the latest stable
release stops working unchanged.

The label is a compatibility classification, not a risk or severity score. A
small, safe rename can be breaking; a large rewrite can be nonbreaking when it
preserves the released contract.

## Non-goals

- Freezing implementation details or every byte of generated example code.
- Defining component, template, or CLI naming conventions.
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
  each published package update in multi-package work; when categories differ,
  use separate Changesets so every package entry follows its own classification.
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
  keeps working. Preserve the old range, provide an adapter, or classify a narrower
  range as breaking and meet FR8's migration and release-note obligations.

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

The stable compatibility boundary remains the CLI operation and response schema,
not the individual entries currently present in the template catalog.

## Verification

| Contract | Verification                                                                             | Representative states                                                      | Mutation or failure expectation                                                                                           |
| -------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR3  | PR compatibility statement plus latest stable package inspection                         | released export, behavior, CLI command; unreleased and private surface     | A change is labeled from diff size or possibility alone, or a released contract change is missed                          |
| FR4–FR6  | Old-usage type/runtime/CLI regression test                                               | alias retained, deprecation warning, broad rewrite, low-adoption caller    | Contractual old usage fails despite a nonbreaking label, or risk is substituted for compatibility                         |
| FR7–FR8  | `pnpm check:changesets` plus migration review                                            | breaking and patch Changesets; codemoddable and non-codemoddable migration | Category and bump diverge, or a breaking release gives no usable migration path                                           |
| FR9–FR11 | CLI contract tests plus template catalog and output tests                                | slug rename, metadata edit, source rebuild, command or schema change       | Catalog data is frozen as API, or a command/schema incompatibility is mislabeled as a catalog-only edit                   |
| FR12     | Minimum and representative supported-version tests plus manifest and release-note review | retained range, narrowed range, adapter, coordinated upgrade               | An in-range combination breaks under a nonbreaking label, or release coordination hides the affected package or migration |

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
A coordinated breaking range change remains allowed when its classification and
FR8 migration and release notes tell consumers how to move.

Rejected: marking every dependency bump breaking, which would freeze compatible
maintenance, or calling an update nonbreaking merely because a coordinated upgrade
works, which would break supported independent consumers.

## Open questions

None.
