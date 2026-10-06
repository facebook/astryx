---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-063
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [josephfarina]
affects_architecture: []
affects_families: []
affects_contributing: []
affects_consumer_docs: [Chart]
---

# Charts stable channel system spec

## Intent

A builder who installs `@astryxdesign/charts` from npm gets the promise every
stable Astryx package gives: a `latest` release they can install and upgrade
without a surprise break. This record owns Charts' place on the stable channel
and the compatibility promise that comes with it. `spec:AST-017` owns what that
promise means, and `spec:AST-033` FR5 owns when a package appears on the
production docsite.

## Non-goals

- Publishing a release, and the npm trusted-publishing setup a first stable
  publish needs.
- Charts' component APIs, which their component records own.
- The other canary-only integration packages.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — Charts is on the stable channel.** `@astryxdesign/charts` MUST publish
  to the `latest` dist-tag with the other stable packages, in their fixed version
  group, and MUST NOT carry `private` or `astryx.canaryOnly`.
- **FR2 — The promise starts with the first stable release.** From its first
  stable release, Charts' public surface MUST follow `spec:AST-017`'s stable
  compatibility: its package exports, its six documented components (Chart,
  ChartAxis, ChartGrid, ChartLegend, ChartSwatch, ChartTooltip) and their props,
  and its two block templates. No breaking change ships outside a scheduled
  minor, and removal follows deprecation.
- **FR3 — Production documents Charts from that release.** The production
  docsite MUST document Charts only once it has released stable
  (`spec:AST-033` FR5), and then from the published package, like every other
  stable package.
- **FR4 — Leaving the stable channel is a withdrawal.** Returning Charts to
  canary only MUST restore `private` and `astryx.canaryOnly` and leave the fixed
  group. Any stable release already published keeps `spec:AST-017`'s deprecation
  rules, with a pointer to the canary tag.

### Platform support

- Supported floor: every runtime and package manager the stable packages
  support.
- Unsupported behavior: none beyond the stable packages'.
- Browser evidence: none; this record changes no rendering.

## Current-state impact

- the Charts package manifest drops `private` and `astryx.canaryOnly`, and the
  fixed version group gains Charts (FR1);
- the production docsite's admission follows `spec:AST-033` FR5, so Charts joins
  it with its first stable release (FR3);
- the visual plan treats Charts stories as stable visuals, which the shared
  baseline workflow adopts (`spec:AST-030` FR12).

## Verification

| Contract | Verification                                   | Representative states                                | Mutation or failure expectation                                                    |
| -------- | ---------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------- |
| FR1      | Release and changeset checks, manifest review  | the stable publish set; the fixed group              | Charts is skipped by the stable publish, or leaves the fixed group                 |
| FR2      | `spec:AST-017` compatibility checks            | a change to an export, a component prop, or a block  | A breaking change ships outside a scheduled minor                                  |
| FR3      | Docsite latest/canary generation tests         | Charts never released stable; Charts released stable | Production documents Charts before its first stable release, or from the workspace |
| FR4      | Manifest review and `spec:AST-017` deprecation | a withdrawal after a stable release                  | A stable release is removed without deprecation                                    |

## Decision log

### DEC-1 — Charts is the first integration on the stable channel

**Reference:** `spec:AST-063/DEC-1`
**Decider:** `josephfarina`, `2026-10-06`

Charts has the smallest useful public surface of the integration packages: six
documented components, two block templates, three runtime dependencies, and the
standard peers. A builder gets a real integration from `latest`, and the
promise covers a surface small enough to keep.

Rejected: Lab first, whose components are experimental by charter.

Rejected: Rich Text first, whose editor brings thirteen peer dependencies.

Rejected: Vega first, which documents one component.

## Open questions

None.
