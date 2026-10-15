---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-080
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-15
phase: accepted
owners: [cixzhang]
affects_architecture: []
affects_families: []
affects_contributing: []
affects_consumer_docs: [styling-overview, getting-started, migration-setup]
---

# Package stylesheet distribution system spec

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

A product that uses Astryx loads prebuilt stylesheets: `@astryxdesign/core/astryx.css`,
the stylesheet of each other Astryx package it uses, and a theme stylesheet.
Those files are the whole of Astryx's component CSS. The product never compiles
Astryx package source to get it.

Every package stylesheet places its rules in the same cascade layer under the
same layer order. A theme override therefore wins over the base styles of every
package, whichever package styled the element and whichever stylesheet loads
first.

## Non-goals

- What a theme stylesheet contains, owned by `architecture:theme-compilation`,
  `spec:AST-034`, and `spec:AST-050`.
- Which StyleX variable groups a package stylesheet contains, owned by
  `spec:AST-066` FR3.
- How a product compiles its own code, including any StyleX settings it uses for
  its own styles or for components it ejects with `astryx swizzle`.
- Loading part of a package stylesheet.
- The source-build composition that the `@astryxdesign/build` package provides.
- Minifying or compressing stylesheets.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — Every published package ships one prebuilt stylesheet.** Each
  published `@astryxdesign/*` package whose modules carry styles MUST export one
  precompiled stylesheet from a `.css` subpath of the package. The stylesheet
  holds every rule its modules use. A package ships its stylesheet with its
  first published release that carries styles. The package stylesheets are:

  | Package                  | Stylesheet                                                          |
  | ------------------------ | ------------------------------------------------------------------- |
  | `@astryxdesign/core`     | `@astryxdesign/core/astryx.css`                                     |
  | `@astryxdesign/lab`      | `@astryxdesign/lab/lab.css`                                         |
  | `@astryxdesign/richtext` | `@astryxdesign/richtext/richtext.css`                               |
  | `@astryxdesign/charts`   | `@astryxdesign/charts/charts.css`, from its first published release |

  Theme packages are outside this requirement; their stylesheets follow the theme
  records named in Non-goals.

- **FR2 — Prebuilt stylesheets are complete without a compiler.** Loading a
  package's stylesheet with `astryx.css` and a theme stylesheet MUST style every
  element the package renders, in every state, color scheme, and text direction
  the package supports, with no StyleX compiler in the product's build. A non-Core
  stylesheet relies on `astryx.css` for the Core definitions it declares, such
  as variable groups and keyframes, and does not repeat a definition
  `astryx.css` declares. A Core group that `astryx.css` omits under
  `spec:AST-066` FR3 is carried by the package stylesheet whose modules read it.

- **FR3 — One layer and one layer order in every package stylesheet.** Every rule
  in every package stylesheet, and in Core's `reset.css`, MUST sit inside its one
  Astryx layer: `astryx-base` for package stylesheets and `reset` for
  `reset.css`. None of these files emits an unlayered rule or another layer. Each
  begins with the same order registration that theme output carries under
  `spec:AST-066` FR7:

  ```css
  @layer reset, astryx-base, astryx-theme;
  ```

  So `reset < astryx-base < astryx-theme` holds whatever Astryx stylesheet loads
  first, and an authored theme override wins over the base rule of every package.
  A product's unlayered CSS stays above every Astryx layer.

- **FR4 — The stylesheet survives bundling.** Each package's `exports` MUST
  resolve its stylesheet subpath in the packed package, and its `sideEffects`
  declaration MUST cover that file, so a bundler keeps the product's
  `import '@astryxdesign/<package>/<name>.css'`.

- **FR5 — Every documented setup loads prebuilt stylesheets.** Each consumer
  setup path in the documentation (plain CSS, Tailwind, and a product that
  compiles its own StyleX, including ejected components) MUST load the prebuilt
  stylesheet of every Astryx package the product uses, plus a theme stylesheet.
  No documented setup omits a package stylesheet, adds Astryx package source to
  a compiler's inputs, or presents compiling Astryx package source as a way to
  get component styles. A documented setup looks like:

  ```css
  @layer reset, astryx-base, astryx-theme;

  @import '@astryxdesign/core/reset.css';
  @import '@astryxdesign/core/astryx.css';
  @import '@astryxdesign/richtext/richtext.css'; /* each package used */
  @import '@astryxdesign/theme-neutral/theme.css';
  ```

- **FR6 — Every package documents its import.** Each package's README and the
  styling overview MUST name the package's stylesheet and show the import beside
  `astryx.css`.

### Platform support

- Supported feature/engine floor: unchanged; cascade layers are already required
  by the theme and reset stylesheets.
- Unsupported behavior: none added.
- Browser evidence: real-browser computed styles for FR2 and FR3. FR1, FR4, FR5,
  and FR6 are proven at the package, bundler, and documentation layer.

## Current-state impact

- Core, Lab, Rich Text, and Charts already export one stylesheet each with every
  rule inside `@layer astryx-base`. Non-Core stylesheets omit the Core variable
  groups `astryx.css` declares; Lab's keeps Core's data-token group, which
  `astryx.css` omits under `spec:AST-066` FR3.
- No package stylesheet and not `reset.css` carries the FR3 order registration
  today. The order holds only when the product writes the registration line
  itself; a product that loads `reset.css` after a package stylesheet without it
  places `reset` above `astryx-base`.
- Lab, Rich Text, and Charts declare `sideEffects: false`, which does not cover
  their stylesheets (FR4). Core already covers `**/*.css`.
- The styling overview's "StyleX from source" path tells a product to omit
  `astryx.css` and compile component styles from source, and the getting-started
  examples list two setups that compile Astryx source and load no `astryx.css`
  (`Next.js Source` and `Vite`). These conflict with FR5;
  the setup becomes "load `astryx.css`; compile only your own code."
- Lab, Rich Text, and Charts document their stylesheet only in their READMEs;
  the styling overview's import table lists only Core (FR6).
- The `styling-overview`, `getting-started`, and `migration-setup` consumer docs
  change. Package stylesheet rules and class names are otherwise unchanged.

## Verification

| Contract | Verification                                         | Representative states                                                                                                                  | Mutation or failure expectation                                                                                       |
| -------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| FR1      | package manifest and stylesheet build tests          | every published package with styled modules; a module's rules in its package stylesheet                                                | a styled published package has no `.css` export; a rule a module uses is missing                                      |
| FR2      | real-browser computed styles with no StyleX compiler | a representative component from each package; default, hover, focus, disabled, dark, and right-to-left                                 | removing the package stylesheet changes a computed style; a non-Core stylesheet repeats a group `astryx.css` declares |
| FR3      | stylesheet structure tests and real-browser cascade  | each package stylesheet and `reset.css`; theme first and last; package stylesheets in either order; `reset.css` last; a theme override | an unlayered rule or another layer; a missing or reordered registration; the theme override loses in any load order   |
| FR4      | packed-package and bundler fixtures                  | each package's stylesheet import in a production bundle                                                                                | the subpath does not resolve from the packed package; the bundle drops the stylesheet                                 |
| FR5–FR6  | consumer-doc checks                                  | every setup snippet in the styling overview, getting started, and migration setup; each package README                                 | a setup omits `astryx.css` or a used package stylesheet; a setup compiles Astryx source; a package import is missing  |

The real-browser cascade check uses a component whose theme changes its base
colors, such as a theme that restyles the destructive Button, and asserts the
theme's colors in every load order.

## Decision log

### DEC-1 — Products load prebuilt stylesheets and never compile Astryx source

**Reference:** `spec:AST-080/DEC-1`
**Decider:** `cixzhang`, `2026-10-15`

A second compile of Astryx package source emits a second copy of the same rules,
with an order and layer that depend on the product's compiler setup. Beside the
prebuilt stylesheet that copy outranks theme overrides, so a themed component
shows its base colors. One prebuilt file per package gives every product the
cascade the package ships and tests.

Rejected: documenting a source compile as an equal setup path, because its
cascade varies with each product's build.

### DEC-2 — Every package shares one layer and one order registration

**Reference:** `spec:AST-080/DEC-2`
**Decider:** `cixzhang`, `2026-10-15`

A theme override targets a component, not the package that ships it, so every
package's base rules sit in `astryx-base`. Each stylesheet registers the order
itself so it never depends on the product's first line.

Rejected: a layer per package, because theme layer order would then depend on
which packages a product loads.

### DEC-3 — Each package ships one whole stylesheet

**Reference:** `spec:AST-080/DEC-3`
**Decider:** `cixzhang`, `2026-10-15`

One file per package keeps setup to one import per package and works in every
framework.

Rejected: stylesheets imported by component modules, because some frameworks do
not load stylesheets that dependency modules import.

## Open questions

None.
