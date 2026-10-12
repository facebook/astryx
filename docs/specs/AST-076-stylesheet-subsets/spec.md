---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-076
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [vjeux]
affects_architecture: []
affects_families: []
affects_contributing: []
affects_consumer_docs: [styling-overview]
---

# Precompiled stylesheet subsets system spec

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

An app that uses Astryx's precompiled styles loads a package stylesheet, such as
`@astryxdesign/core/astryx.css`, that holds the rules of every module in the
package. The app can load a subset of that stylesheet instead. A build step
passes the package modules that the app's production output contains and gets
back the stylesheet with only the rules those modules use. Every element those
modules render looks and cascades as it does with the whole stylesheet.

## Non-goals

- Finding the modules an app ships. The app's bundler owns its module graph and
  its tree shaking; this contract starts from the list the app passes.
- A stylesheet per component, or stylesheets that component modules import at
  run time.
- Theme stylesheets, `reset.css`, `tailwind-theme.css`, and builds that compile
  Astryx source with the app's own StyleX compiler.
- Minifying or compressing a subset.
- CSS the app writes itself. A custom property it reads from Astryx follows
  `spec:AST-066` FR4.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — Listed modules render as with the whole stylesheet.** Every element a
  listed module renders MUST compute the same styles under the subset as under
  the whole stylesheet, in every state, color scheme, and text direction the
  whole stylesheet styles.
- **FR2 — A subset only removes rules.** A subset MUST be the whole stylesheet
  with every rule that no listed module uses removed. Each retained rule keeps
  its text and its order relative to the other retained rules. Everything that
  is not a rule, including the cascade layer that wraps the rules and the
  comments, is unchanged. Listing every module the package ships produces the
  whole stylesheet byte for byte, and listing none produces it with no rules.
  The result depends only on which modules are listed, not on their order or
  repetition.
- **FR3 — Shared definitions follow their readers.** A module uses the rules
  compiled from its own styles and the StyleX definitions it reads from other
  modules, such as variable groups and keyframes. A variable group is retained
  whole when the list contains its module or a module that reads it, and is
  omitted otherwise, as `spec:AST-066` FR3 states for whole stylesheets.
- **FR4 — Every precompiled stylesheet subsets the same way.** The Core
  stylesheet and the stylesheets of the canary packages (`lab.css`,
  `charts.css`, and `richtext.css`) MUST each support subsets. A canary
  stylesheet relies on the Core stylesheet for the Core variable groups its
  modules read, as the whole stylesheets do. Each built module imports the
  definition modules it reads, so a production module list that contains a
  canary module also contains the Core definition modules it reads, and the Core
  subset of that list MUST retain their variable groups.
- **FR5 — Inputs outside the package change nothing.** A listed path outside the
  stylesheet's package, or a package module that uses no rules, MUST NOT change
  the result, so an app can pass its whole production module list.
- **FR6 — A mismatch fails.** Subsetting MUST fail, naming the stylesheet, when
  the stylesheet cannot be read, when its package ships no subset data for it,
  or when the stylesheet differs from the one that data describes, such as a
  stylesheet edited after install. It never returns a partial subset.
- **FR7 — One public function.** Core MUST export `subsetStylesheet` from the
  Node.js-only subpath `@astryxdesign/core/stylesheet`:

  ```ts
  import {subsetStylesheet} from '@astryxdesign/core/stylesheet';

  const css = subsetStylesheet(
    import.meta.resolve('@astryxdesign/core/astryx.css'),
    moduleFiles, // every module file the production build contains
  );
  ```

  The first argument is the path or `file:` URL of a precompiled package
  stylesheet; the second is an iterable of module file paths or `file:` URLs.
  It returns the subset as a string. The data it reads is not a public format.

- **FR8 — Consumer docs teach the subset path.** The styling overview MUST show
  generating the subset at build time from the production module list, loading
  it in place of the whole stylesheet, and regenerating it on every build,
  because a subset matches only the package version it came from.

### Platform support

- Supported feature/engine floor: unchanged; a subset contains only rules the
  whole stylesheet ships. `subsetStylesheet` runs in the Node.js versions the
  package supports, at build time.
- Unsupported behavior: none in the browser. An app without a module list keeps
  loading the whole stylesheet.
- Browser evidence: real-browser computed styles for FR1. FR2–FR7 are proven at
  the text and function layer.

## Current-state impact

- Each precompiled stylesheet is unchanged, byte for byte. Its package also
  ships the data `subsetStylesheet` reads.
- Core gains the `@astryxdesign/core/stylesheet` subpath, an addition under
  `spec:AST-017` FR5.
- `spec:AST-066` FR3 continues to own which variable groups a whole stylesheet
  contains.
- The `styling-overview` consumer doc gains the subset path.

## Verification

| Contract | Verification                                      | Representative states                                                                                     | Mutation or failure expectation                                                                   |
| -------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| FR1      | real-browser computed styles, whole versus subset | representative components in default, hover, focus, disabled, dark, and right-to-left states              | removing a rule a listed module uses changes a computed style                                     |
| FR2      | build tests over each package stylesheet          | every module; no module; random sets; reordered and repeated lists                                        | the every-module subset differs by a byte; a retained rule changes or moves; order changes output |
| FR3      | build fixtures                                    | a module reading a variable group; one importing a definition module; no reader; a type-only import       | a read group is missing or partial, or an unread group is retained                                |
| FR4      | canary stylesheet tests                           | a canary module reading a group of its own, and one reading a Core group                                  | the canary subset misses its group, or the Core subset of the same list misses the Core group     |
| FR5–FR6  | function tests                                    | paths outside the package; modules with no styles; missing stylesheet; missing data; an edited stylesheet | a foreign path changes the result; a mismatch returns CSS instead of failing                      |
| FR7–FR8  | export and consumer-doc checks                    | the subpath export; the styling overview                                                                  | the export or the documented build step is missing                                                |

## Decision log

### DEC-1 — A subset is the whole stylesheet minus unused rules

**Reference:** `spec:AST-076/DEC-1`
**Decider:** pending owner review

A precompiled stylesheet orders its rules and pads their selectors with
specificity by priority, and an element's winning declarations depend on both.
A subset that keeps each retained rule's text and order keeps both, and a removed
rule matches no element a listed module renders, so FR1 follows from FR2 and FR3.

Rejected: a stylesheet per component imported by its module, because some frameworks do not load stylesheets that dependency modules import.

Rejected: recompiling the selected rules, because the padding depends on which priority levels are present, so recompiled rules cascade differently.

### DEC-2 — The app lists modules; Astryx maps them to rules

**Reference:** `spec:AST-076/DEC-2`
**Decider:** pending owner review

Which modules ship is known only after the app's tree shaking. Which rules a
module uses is known only to Astryx, because atomic class names are hashed,
shared across modules, and change between releases.

Rejected: component names as input, because Astryx cannot know what the app's tree shaking keeps, and a barrel import names every component.

### DEC-3 — One Node.js function in Core; its data stays private

**Reference:** `spec:AST-076/DEC-3`
**Decider:** pending owner review

One function serves every precompiled stylesheet, so no package needs its own
entry point, and a private data format can change in any release.

Rejected: publishing only the data, because every app would reimplement FR2 and FR6, and the format would become a stable contract under `spec:AST-017` FR3.

## Open questions

None.
