---
schema_version: 4
template_version: 1
kind: system-spec
id: spec:AST-050
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [josephfarina]
affects_architecture: [architecture:cli-surface]
affects_families: []
affects_contributing: []
affects_consumer_docs: [theme, cli/integrations]
---

# App themes system spec

## Intent

A builder, a person or a coding agent, wants an app that uses one or more themes:
a first-party theme, a theme from an installed integration package, or a theme
the app makes itself. They want to add a theme, choose the default, let users
switch between themes at runtime, and know that the setup is correct.

Today `astryx theme add` copies a theme's source into the app, as a template
does. A copied theme no longer receives its owner's updates, loses its package
identity, and must be built again by the app. It also loses any stylesheet its
package loads beside it, such as its fonts, so it can render in fallback fonts
with no error. Nothing tracks which themes an app uses, nothing helps it switch
between them, and doctor checks only that a first-party theme package is
installed.

This record owns how an app declares, imports, switches, and checks its themes
through the CLI. The rule is the same for every theme: an app uses a theme by
importing its built form and passing it to `Theme`, and customizes it by
extending that theme. Copying a theme's source is an explicit author fork.
`architecture:theme-application` already supports several built themes on one
page, because built theme CSS is scoped to the theme's name and switching
changes only the active identity. `spec:AST-017` owns compatibility and response
fields, `spec:AST-042` owns command admission, `spec:AST-040` owns writes to
consumer files, and `architecture:cli-surface` INV19 and INV24 own how
integration items are described.

## Non-goals

- A Core component for switching themes, and saving a user's choice. The
  generated module gives an app everything a switcher needs; a Core component is
  a separate component decision.
- Loading theme stylesheets lazily.
- Finding themes that are not installed.
- Changing how a theme is authored, compiled, or applied at runtime.
- Merging or renaming the first-party theme packages.
- Making theme source CLI-owned. The generated module only imports and lists the
  app's themes; every theme's source stays with its author.
- How a font stylesheet delivers its fonts. Font files in the package and a font
  service both satisfy FR7; the package chooses.
- Reading the 0.6 theme catalog (`themes/manifest.json`). A package moves to
  typed descriptors with the migration that ships in the next release, and no
  root holds a catalog file (`architecture:cli-surface` INV24); this record adds
  no catalog reader.
- Equivalent internal implementations remain valid when they satisfy this
  contract. The generated module's exact text, the discovery code, and the
  receipt field order are implementation.

## Requirements

- **FR1 — Adding a theme imports it.** `theme add <slug> [--package <package>]`
  MUST make the theme part of the app by adding it to the app's theme record
  (FR3) and regenerating the app's theme module (FR2). It MUST NOT copy theme
  source into the project and MUST NOT edit application code. Adding a theme
  that is already added regenerates the module and reports no change. Adding a
  slug that is already added from a different owner switches it to the new owner
  and reports that change.
- **FR2 — One generated theme module.** The CLI MUST keep one module that
  imports each added theme's built module and stylesheet. It exports `themes`,
  every added theme keyed by its slug, and `defaultThemeSlug`, the default slug;
  a TypeScript module also exports the type `ThemeSlug`, the union of the added
  slugs. These exports are the module's public contract, and its theme record
  (FR3) is not one of them. The module carries a generated marker, and the CLI
  regenerates the whole module instead of editing it (`spec:AST-040/FR5`). The
  module is TypeScript when the project uses TypeScript and JavaScript
  otherwise. It has one fixed home: `astryx-themes.ts` or `astryx-themes.js` in
  the project's `src` folder when the project has one, and otherwise in the
  project root. A module that already exists stays where it is, even when the
  project gains or loses a `src` folder. No configuration chooses the home
  (`spec:AST-017/FR19`). When the home holds a file the CLI did not generate, or
  more than one generated theme module exists, the command MUST fail before
  writing and name the files.
- **FR3 — The module is the app's theme record.** The theme module records each
  added theme's slug and owner, a package name or the project's local themes
  root, and the default slug, in a form the CLI reads without running the
  module. `theme add`, `theme remove`, and `theme use` read that record, change
  it, and regenerate the module. The default MUST be one of the added themes. No
  `package.json` field, configuration key, or environment variable records or
  selects the app's themes (`spec:AST-017/FR14`, `spec:AST-017/FR19`). In a
  project with no theme module, an existing `astryx.theme` field keeps its
  released meaning.
- **FR4 — The set and the default are managed by command.**
  `theme remove <slug>` removes a theme from the app, and `theme use <slug>`
  makes an added theme the default. Removing the default theme MUST fail and
  name `theme use`; `theme use` on a theme that is not added MUST fail and name
  `theme add`. Each command regenerates the module (FR2).
- **FR5 — One receipt describes the app's themes.** `theme add`, `theme remove`,
  and `theme use` MUST return the `theme.app` response: every added theme with
  its slug, owner, and the module and stylesheet it imports; the default slug;
  the module path; and the change the command made. Text output shows the same
  facts. The first `theme add` in a project also shows the one-time wiring:
  import `themes` and `defaultThemeSlug` from the module and pass
  `themes[defaultThemeSlug]` to `Theme`.
- **FR6 — Ejecting is the author fork.**
  `theme eject <slug> [path] [--package <package>]` MUST copy a theme's complete
  source directory into the project as `theme add` copied it before this record,
  with the same path safety, overwrite rule, and rollback. It MUST also copy the
  theme's same-stem descriptor (`architecture:cli-surface` INV24), so the
  ejected theme is a discoverable local theme (FR8). The copy MUST NOT describe
  itself as maintained by the theme's original owner. It returns the former copy
  fields as the `theme.eject` response, with the descriptor in its file list.
- **FR7 — A package exposes each theme to import.** A package makes a theme
  importable by exporting its built module at `./themes/<slug>` and its
  stylesheet at `./themes/<slug>.css`. A package that owns exactly one theme MAY
  instead export `./built` and `./theme.css`. When a theme needs fonts that
  are not system fonts, the package SHOULD export a font stylesheet at
  `./themes/<slug>.fonts.css`, or `./fonts.css` for a single theme. The font
  stylesheet owns loading its fonts: it may ship the font files with
  `@font-face` rules or import them from a font service. `theme add`
  MUST fail, naming what is missing, when a theme has no resolvable built module
  and stylesheet; it never falls back to copying or to runtime source.
  `integration add theme` MUST write these exports, and `integration verify`
  MUST fail when an exported theme module, stylesheet, or font stylesheet does
  not resolve from the packed tarball, or when a built module or stylesheet
  does not match its source.
- **FR8 — Local themes are added like package themes.** The project's local
  themes root is `src/themes`: the folder `theme add` copied into before this
  record and the folder `theme eject` copies into by default, also in a project
  with no `src` folder. A theme directory there, with the same shape as an
  integration theme (`architecture:cli-surface` INV19), is listed and added like
  a package theme. Its built module and stylesheet are the files `theme build`
  writes beside its source, and its font stylesheet, when it has one, is
  `<slug>.fonts.css` beside them. `theme add` MUST fail and name the build
  command when the built module or stylesheet is missing. When a local theme and
  a package theme share a slug, `theme add <slug>` adds the local theme unless
  `--package` names the package, and `theme list` shows both with their owners.
- **FR9 — The module imports built themes only.** The generated module MUST
  import built themes, their stylesheets, and their font stylesheets when the
  package exports one, never theme source for runtime style injection, so every
  added theme is present at first paint and a switch never waits for styles.
- **FR10 — Listing shows the app's themes.** `theme list` MUST mark each theme
  as added or not and as the default or not for the project, and name whether it
  is bundled, from a package, or local. These fields are additive.
- **FR11 — Doctor proves the setup.** In a project with a theme module, doctor
  MUST check, and pass each check only on positive evidence:
  1. every added theme's owner is installed and its module and stylesheet
     resolve from the project;
  2. the theme module exists, carries the CLI's generated marker, and is exactly
     what the CLI generates from the record it carries;
  3. project source imports the theme module (a warning when this cannot be
     shown);
  4. no built theme module is imported without its stylesheet;
  5. every added local theme is built, and its outputs match its source;
  6. no added theme sets a private `--_*` variable directly
     (`architecture:theme-compilation` INV6);
  7. every added theme's `@astryxdesign/core` peer range accepts the installed
     Core;
  8. the default theme is one of the added themes;
  9. every font family an added theme names is a system font or is loaded by a
     font stylesheet the module imports (a warning that names the family when
     this cannot be shown, as when the stylesheet imports its fonts from a font
     service);
  10. no two added themes write different rules outside their own theme scope
      for the same selector, because every added stylesheet loads at once.

  Each failure names the exact command that fixes it.

- **FR12 — The breaking change and its migration are stated.** `theme.add` is
  no longer emitted, so a JSON caller sees a new response type instead of a
  changed shape. The change ships with a `[breaking]` Changeset, and every doc,
  agent doc, example, and hint that describes `theme add` as a copy moves in the
  same change. Existing projects migrate as follows (`spec:AST-017/FR8`):
  1. A script that ran `theme add` to copy source runs `theme eject` with the
     same arguments; one that wanted the app to use the theme keeps
     `theme add`. No codemod rewrites these calls, because the right
     replacement depends on which of the two the caller meant. A stale call
     does not pass silently: it copies nothing, and its response type changes.
  2. A theme copied by an earlier `theme add` is app source. The CLI MUST NOT
     move, change, or delete it, and the app's imports of it keep working. The
     released copy left the theme's descriptor behind, so `astryx upgrade` MUST
     supply a project codemod that writes the missing descriptor beside each
     such copy in the local themes root, marked as not maintained, which makes
     the copy a local theme (FR8). The codemod changes nothing else, and a
     second run changes nothing (`spec:AST-040`).
  3. Until that codemod runs, a folder in the local themes root that holds a
     theme source without a descriptor MUST NOT fail a theme command or doctor.
     `theme list` and doctor name it as an unmigrated copy, with the upgrade
     command, and it is not listed or added as a theme. For the local themes
     root only, this replaces the rule that such a folder fails discovery
     (`architecture:cli-surface` INV19).
  4. A project with no theme module keeps working as it is. Doctor reports that
     the CLI manages none of its themes and names `theme add`; the FR11 checks
     apply once a theme module exists.
  5. A caller that set `ASTRYX_THEME` chooses the default with `theme use`, or
     with `astryx.theme` in a project with no theme module.
- **FR13 — Every builder-facing surface agrees.** The theme guide, the
  integration guide, the generated agent docs, and `init`'s next steps MUST
  describe the same workflow: add themes, wire the module once, switch through
  the exported themes, extend a theme to customize it, and eject only to fork.

### Platform support

- Supported floor: every runtime and package manager the CLI supports, and every
  toolchain that imports CSS from a JavaScript module.
- Unsupported behavior: a toolchain that cannot import CSS from a module loads
  each added theme's stylesheet itself; the module still exports the themes, and
  doctor check 4 names the stylesheets to load.
- Browser evidence: a consumer app built for production adds a first-party,
  an integration, and a local theme, renders the default on first paint, and
  switches among all three.

## Current-state impact

When this ships:

- `theme add` records and imports a theme instead of copying it; the copy moves to
  the new `theme eject`; `theme remove` and `theme use` are new; `theme list`
  gains its app fields;
- `architecture:cli-surface` INV19 changes from "integration themes are packaged
  editable source" to "integration themes are importable packages, and editable
  source is an explicit eject";
- `integration add theme` writes theme exports, and `integration verify`
  checks them;
- doctor's theme check is replaced by FR11, or by the FR12 report in a project
  with no theme module;
- `astryx upgrade` gains the codemod that gives earlier copies their
  descriptors (FR12);
- the CLI stops reading the `ASTRYX_THEME` environment variable, and the
  `component` command reads the default theme from the theme module's record, or
  from `astryx.theme` in a project with no theme module;
- the theme guide, the integration guide, agent docs, and `init` next steps move
  to the FR13 workflow.

`architecture:theme-application` and `architecture:theme-compilation` are
unchanged.

## Verification

| Contract | Verification                                                          | Representative states                                                                                                                                                                                          | Mutation or failure expectation                                                                                                                                                                                                                    |
| -------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1, FR2 | Theme command tests and a real consumer                               | first add; repeat add; a slug re-added from another owner; the module's exports; hand-written file at the module home; no TypeScript; no `src` folder; `src` added later                                       | Source is copied, app code changes, a repeat add changes files, a re-add keeps the old owner, an export is missing or renamed, the theme record is exported, a user file is replaced, or an existing module moves                                  |
| FR3, FR4 | Theme record tests                                                    | add, remove, use; removing the default; using a theme not added; a hand-edited module; two modules; no module with `astryx.theme`                                                                              | The default is not an added theme, a hand-edited or second module is overwritten, theme state is written outside the module, or `astryx.theme` stops resolving                                                                                     |
| FR5      | Response type and text field tests                                    | every command; first add                                                                                                                                                                                       | `theme.add` is emitted, a field has no text projection, or the first add shows no wiring                                                                                                                                                           |
| FR6      | Eject tests against the former copy fixtures                          | bundled, integration, and nested-file themes; eject then list                                                                                                                                                  | Copied source bytes or former receipt fields differ, the descriptor is missing, or the ejected theme is not listed as local                                                                                                                        |
| FR7, FR8 | Pack check and real provider-to-consumer tests                        | multi-theme package; single-theme package; missing export; font stylesheet missing from the tarball; stale build; a local theme sharing a package theme's slug; local themes in a project with no `src` folder | A theme without a resolvable built module is added, pack check passes a stale or missing export, a shared slug adds the package theme without `--package`, or local themes are looked for outside `src/themes`                                     |
| FR9      | Generated module tests                                                | package and local themes                                                                                                                                                                                       | The module imports source                                                                                                                                                                                                                          |
| FR10     | List tests                                                            | added, default, bundled, package, local                                                                                                                                                                        | A listed theme lacks its app fields                                                                                                                                                                                                                |
| FR11     | Doctor tests, one planted fault per check                             | each of the ten faults; a correct app                                                                                                                                                                          | A check passes on its fault, or passes without positive evidence                                                                                                                                                                                   |
| FR12     | Migration tests on a project made by the released CLI, and docs tests | a copy made by the released `theme add`; the upgrade codemod run twice; no theme module; `ASTRYX_THEME` set                                                                                                    | A theme command or doctor fails on an unmigrated copy, the codemod changes more than the descriptor or changes anything on its second run, a copy is moved or deleted, doctor fails a project with no theme module, or a doc still says add copies |
| FR13     | Docs and agent-docs tests                                             | theme guide, integration guide, agent block, init next steps                                                                                                                                                   | A surface teaches copying as the way to use a theme                                                                                                                                                                                                |

## Decision log

### DEC-1 — Consumers import; copying is an author fork

**Reference:** `spec:AST-050/DEC-1`
**Decider:** `josephfarina`, `2026-09-30`

A theme an app uses is a dependency, like a component library: it keeps its
owner's updates, its identity, and the stylesheets its package loads beside it.
An app customizes a theme by extending it. Copying is how a template starts a
page and how an author forks a theme, not how an app uses one. Consumer
`theme add` therefore imports, and source copying moves to the explicit author
fork, `theme eject`.

Rejected: keeping `theme add` as a copy and adding a new verb for importing,
which leaves the obvious command doing the wrong thing for most builders.

### DEC-2 — The CLI owns one generated module and never edits app code

**Reference:** `spec:AST-050/DEC-2`
**Decider:** `josephfarina`, `2026-09-30`

An app wires one module once. After that, adding, removing, and choosing themes
changes only files the CLI generates, so no command needs proof that it may
change application source, and a switcher reads every added theme from one
export. The module has one fixed home that never moves, so the app's import
keeps working and nothing has to be set to find it.

Rejected: editing the app's root component on every add, which needs a source
transform for every framework; printing import lines only, which leaves the app
to keep the list of themes by hand; and a configurable module path, which
`spec:AST-017/FR19` admits only for a case where the fixed home fails.

### DEC-3 — The generated module is the record

**Reference:** `spec:AST-050/DEC-3`
**Decider:** `josephfarina`, `2026-10-01`

The module already names every added theme, where it comes from, and the
default. A second record elsewhere would duplicate a value the CLI can read from
its own output, which `spec:AST-017/FR19` forbids, and would add a public field
that every app has to keep in step with the module.

Rejected: an `astryx.themes` field in `package.json`, which duplicates the
module and becomes permanent public surface with no case where reading the
module fails; a key in `astryx.config`, which released CLIs reject as unknown;
and detecting themes from application source, which cannot tell a theme an app
uses from one it only mentions.

### DEC-4 — Packages expose themes through their exports

**Reference:** `spec:AST-050/DEC-4`
**Decider:** `josephfarina`, `2026-09-30`

A fixed export path lets any app import a theme with any CLI version, or with no
CLI. It adds no descriptor field, so no released CLI meets an unknown field. The
single-theme form keeps the `./built` and `./theme.css` export names that built
theme packages already use, so an existing package can be added without a new
release.

Rejected: import paths declared in the theme descriptor, which older CLIs would
reject as an unknown field.

### DEC-5 — New subcommands under `theme`

**Reference:** `spec:AST-050/DEC-5`
**Decider:** `josephfarina`, `2026-09-30`

Each stays inside the `theme` command's job, managing an app's themes
(`spec:AST-042/FR4`):

- `theme remove` answers "stop using this theme". An option on `add` would give
  it a second job.
- `theme use` answers "start with this theme". An option on `add` could not set
  the default of a theme that is already added.
- `theme eject` answers "give me this theme's source to fork". It is the former
  `theme add` copy, plus the descriptor a local theme needs, moved under
  `spec:AST-042/FR6`; an option on `add` would give `add` two opposite results.

None of them is eligible for the batch contract (`spec:AST-042/FR7`,
`spec:AST-053/FR11`), so each takes one selector:

- `theme remove <slug>` changes the app's themes: it fails E1 and E4.
- `theme use <slug>` changes the app's themes and picks the one default: it
  fails E1, E2, and E4.
- `theme eject <slug> [path]` writes files and takes a positional after the
  slug: it fails E1, E4, and E5.
- `theme add <slug>`, an existing command whose effect this record changes,
  changes the app's themes: it fails E1 and E4.

Each has one API function under `spec:AST-042/FR1`.

Rejected: one `theme set` command with flags for each action, which gives a
single command several jobs.

## Open questions

None.
