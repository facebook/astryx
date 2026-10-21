---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-084
authority: current
archive_reason: null
superseded_by: null
approved_by: josephfarina
approved_at: 2026-10-20
phase: accepted
owners: [josephfarina]
affects_architecture: [architecture:cli-surface]
affects_families: []
affects_contributing: [contributing:cli-conventions]
affects_consumer_docs: [cli/experimental]
---

# Icon set integrations system spec

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

An icon set is an experimental integration item: icon components a package
exports, plus one data file that says which icon draws each icon definition.
Astryx ships icon definitions, one typed doc file per thing an icon can stand
for (`close`, `delete`, `rocket`). A set registers its icons against them, and
may add definitions of its own. With a set installed:

- an agent or engineer finds an icon by meaning with
  `astryx experimental icon <words>` and gets the exact import line;
- a template copied into a project that opts in with `experimental.iconSet`
  uses the set's icons for the definitions the template declares; and
- a theme points the shared semantic icon names at the set's artwork.

The CLI encodes no icon library: the author, or the author's agent, picks each
icon, and the CLI verifies it, writes the files, and checks the set.

## Non-goals

- Choose artwork at render time by appearance, weight, or size; that belongs
  to the Icon component contract.
- Grow the shared `IconName` set: the built-in definitions are exactly its
  values.
- Make each icon its own discoverable item: the set is the item.
- Edit, redraw, or bundle artwork: every icon is a component the package
  exports.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

### Experimental placement

- **FR0 — Every icon-set surface is experimental and isolated.** Under
  `spec:AST-017/FR21`–FR27:
  - the commands are `astryx experimental icon` and its subcommands, under the
    `experimental` command group; no stable command gains an icon-set
    subcommand, kind, or option value;
  - configuration is `experimental.iconSet` in `astryx.config`, the project's
    opt-in, and `experimental.iconSets` in the integration manifest;
  - the docs live under `cli/experimental` (the guide and the
    `icon-definitions` namespace) and carry `stability: 'experimental'`;
    API functions and authoring types carry `@experimental`; and
  - every change ships as an `[experimental]` patch Changeset. Promotion to
    stable needs the owner's approval and a `[feat]` Changeset
    (`spec:AST-017/FR23`).

  Without `experimental.iconSet`, help (apart from the `experimental` group
  line), the manifest (apart from that group), the `astryx docs cli` listing
  (apart from the `experimental` namespace), `astryx template`, `astryx
discover`, Doctor, and `integration check` and `verify` give the output they
  give without this feature, whatever sets are installed. `astryx search`
  never reads icon sets, with or without the opt-in.

### What a set declares

- **FR1 — One manifest root.** The manifest MAY set `experimental.iconSets`,
  a relative directory. Each lower-kebab directory under it is one set, named
  by the directory; the manifest never lists sets or icons
  (`spec:AST-039/FR11`).
- **FR2 — One typed descriptor.** Each set directory holds `<name>.doc.mjs`, a
  default-exported `IconSetDoc` (`type: 'icon-set'`, `name` equal to the
  directory, `displayName`, `description`, `maintained`, and `license`, an
  SPDX expression for the artwork).
- **FR3 — One data file, read by every icon surface.** Each set directory
  holds `<name>.icons.json` (`schemaVersion: 1`):
  - `module`: the import specifier every export is read from, the package's
    name or one of its `exports` subpaths;
  - `icons`: each with a unique lower-kebab `id`, an `export`, at least one
    search word in `words`, optional `variants` (axis values and an export),
    and optional `matches`, reviewed equivalents in other installed sets with
    a confidence of `exact`, `strong`, or `likely`;
  - `map`: icon definition name to icon `id`; one icon MAY draw several
    definitions;
  - optional `axes`, `default`, `source` (the upstream library and version),
    `generated` (FR13), `adapter` (FR13), and `themeMap` (FR12).

  A data file that fails this shape, repeats an `id`, maps a name that is
  neither an Astryx definition nor one of the set's own, or maps to a missing
  icon is invalid, and the set is withdrawn from every surface.

- **FR4 — Icon definitions are typed doc files in folders.** An
  `IconDefinitionDoc` (`type: 'icon-definition'`) has a camelCase `name`, a
  one-sentence `description`, `words`, and `builtIn: true` exactly for an
  `IconName`. Astryx ships one file per definition in the CLI's definitions
  folder; a set adds its own in `<set>/definitions/<name>.doc.mjs`. The doc
  compiler reads every file in a folder; there is no index. A set's own
  definition needs no change to Astryx and maps only within that set;
  proposing it for every set is a pull request that copies its file into the
  CLI's folder. When names collide, Astryx's wins. The experimental
  `icon-definitions` namespace lists them all.
- **FR5 — The directory is the boundary.** Discovery reads the descriptor,
  data file, and definitions statically, never runs the icon module, and
  rejects a path that escapes the package (`spec:AST-039/FR5`, FR6).

### Finding and choosing

- **FR6 — `astryx experimental icon <words>` ranks icons by meaning.** It
  answers `icon.search`, each match with its `set`, `id`, `package`, `module`,
  `export`, `import` line, `words`, `definitions`, `variants`, `reason`, and
  `score`: 100 for a definition the set maps to the icon, 90 or 80 for an exact
  name or meaning match (the reading most of the searched icons use leads),
  60 when the query starts one of its words, 40 for a partial match. An icon also answers
  to the name and words of every definition it draws. Ties keep the set order
  (FR8) and then `id`. `--set` keeps one set and `--limit` caps the list.
- **FR7 — One icon and the installed sets.** `<set>/<id>` answers
  `icon.detail` with every variant's import line; `--list` answers `icon.list`
  with each set's coverage of built-in, Astryx, and its own definitions, the
  project's icon-set state, and each withdrawn set. A set is named by its name
  or `<package>/<set>`; a name two packages ship needs the qualified form.
- **FR8 — The project's set.** `experimental.iconSet` names the project's set
  (`"<set>"` or `"<package>/<set>"`) and opts the project in. Within
  `astryx experimental icon`, a project without it treats its only installed
  set as its set. A name two installed packages ship names no set. Lookups put
  the project's set first, then the integration load order.

### Templates and themes

- **FR9 — Templates declare definitions.** A template or block descriptor
  declares, in `icons`, the definition each imported icon draws
  (`{TrashIcon: 'delete'}`). In a project with a set (FR8, opted in),
  `astryx template` (printed or copied) rewrites each declared icon, and each
  icon another installed set ships, to the project set's icon that names it in
  an `exact` or `strong` match, else the icon its `map` names for the
  definition. Every reference uses the mapped export, under an alias when the
  name is taken. Nothing is guessed from names, and a `likely` match is only
  suggested.
- **FR10 — The template reports every icon.** The result, and the copy
  receipt, gain `icons`: the set state, each icon `mapped` (source, target,
  and the rule) or `kept` (with why, and a `likely` suggestion when one
  exists). An unmapped icon keeps its import, and its library stays a needed
  dependency. Printed source keeps the report on stderr. Without the opt-in
  there is no `icons` field and no rewrite.
- **FR11 — Search stays stable.** `astryx search` has no icon domain and no
  `--type icon`, and returns no experimental doc, with or without the opt-in.
  Icons join it only at promotion.
- **FR12 — The theme map.** A set exports the map `themeMap` names: one entry
  per built-in definition in `map`, each its icon's artwork, so a theme sets
  `icons: themeIcons`.

### Authoring

- **FR13 — The CLI writes the set, one verified icon at a time.** Every
  command reads modules statically and leaves files unchanged when it fails:
  - `experimental icon new-set <name>` writes the descriptor, an empty data
    file, the generated module (`generated`) with its declaration file and an
    empty theme map, and the manifest root. `--from <module>` wraps every
    component the module exports, and every data export through the set's
    `adapter`, as `<Name>Icon` exports, filling `map` only where a definition's
    name or word is an icon's whole `id`; a shared library prefix is left out
    of ids and names, and `--exclude` drops exports that are not icons. Run
    again, it refreshes the icons and keeps `map` entries whose icon exists.
  - `experimental icon add <Export> --from <module>` verifies the export,
    lists the definitions that fit it, and with `--definition` or
    `--new-definition` adds it and maps it.
  - `experimental icon map <definition> <icon>` writes one `map` entry;
    `new-definition` writes one of the set's own definitions; `use <set>`
    writes `experimental.iconSet`.
  - The generated module re-exports each library component, or wraps a data
    export with the adapter, and rewrites its declaration file and theme map
    with every change.
- **FR14 — The export contract.** Every icon and variant is a named
  `<Name>Icon` export of the package's public entry: a React component, or an
  adapter call, that takes SVG props, draws with `currentColor`, and fills its
  box. The module, name, and component shape are checked statically; color and
  size are documented with a render test authors can copy.

### Checks and catalogs

- **FR15 — `integration check` proves the set matches the package.** For each
  set it reports, without running the package:

  | Code                              | Severity | When                                                                           |
  | --------------------------------- | -------- | ------------------------------------------------------------------------------ |
  | `invalid_icon_set`                | error    | the descriptor, data file, or a definition file is invalid                     |
  | `icon_builtin_definition_missing` | error    | a built-in definition is not in `map`                                          |
  | `icon_definition_unused`          | warning  | a definition the set declares is not in `map`                                  |
  | `icon_definition_shadowed`        | warning  | a definition the set declares has an Astryx definition's name                  |
  | `icon_module_not_public`          | error    | an icon is read from outside the package's public entry                        |
  | `icon_export_name`                | warning  | an export is not named `<Name>Icon`                                            |
  | `icon_not_component`              | error    | an export is a literal, not a component or adapter call                        |
  | `icon_export_missing`             | error    | an export, the generated module, or the adapter does not exist                 |
  | `icon_module_invalid`             | error    | the set's module, a file it re-exports, or the generated module does not parse |
  | `icon_generated_types_mismatch`   | error    | the generated declaration file is missing or stale                             |
  | `icon_theme_map_mismatch`         | error    | the theme map disagrees with the built-in entries of `map`                     |
  | `icon_theme_map_unchecked`        | warning  | a theme-map entry is not a form the reader can check                           |
  | `icon_source_version_drift`       | warning  | the data names another upstream version than the package depends on            |
  | `icon_license_notice_missing`     | warning  | a set with an upstream ships no license notice                                 |

  A definition finding names the definition's description and words, and
  suggests an `icon map` command only when an icon's whole `id` is the
  definition's name or one of its words. Errors fail the check; warnings fail
  under `--strict`. Re-exports are followed through relative files and
  installed packages for these checks only. The optional Astryx definitions a
  set leaves unmapped are not issues: the validate result lists them in the
  additive field `iconSets` (each `{set, unmappedDefinitions, suggestions}`),
  printed as "Unmapped icon definitions (optional)", never counted and never
  failing.

- **FR16 — Older CLIs.** Published CLI 0.7.1 refuses `stability` on page and
  block templates, namespace docs, and theme descriptors, and refuses a
  template's `icons`, dropping the descriptor. No integration descriptor this
  feature writes sets `stability` there. For the package being authored, the
  validate result's additive field `olderCliNotes` (each
  `{file, kind, field, message}`) names each template or namespace doc that
  sets `stability`, and each template that declares `icons`, while the
  package's CLI peer range admits a release before 0.7.2; a note is never
  counted and never fails a check.
- **FR17 — Doctor and discover read sets only with the opt-in.** In a project
  that sets `experimental.iconSet`, Doctor's `icon-sets` check fails when it
  names a set that is not installed and warns when two packages ship that name
  or a set is withdrawn, and `astryx discover` reads `icon-set` as a kind:
  `--type icon-set`, catalog entries with `iconCount` and `definitions`, and
  `discover <package>/<set>`. Without the opt-in, Doctor has no such check and
  reports no icon-set issue, and discover treats `icon-set` as an unknown kind
  (`spec:AST-051/FR7`).

### Supporting pieces

- **FR18 — Additive docs support.** Every doc type, schema field, and enum
  value accepts `stability: 'experimental'`: help shows a marked command as
  `[experimental]`, stable tables leave out a marked field or value, search
  leaves out a marked doc, and Doctor's doc counts leave marked docs out. A
  namespace's `source.packages: 'all'` adopts a doc group from every package
  only on a CLI namespace marked experimental (the icon definitions).

### Platform support

- Supported engines: the CLI's Node floor.
- Unsupported behavior: a set whose module does not resolve does not answer
  lookups, and templates keep their icons.
- Browser evidence: none; every behavior is CLI output, written source, or a
  module's exports.

## Current-state impact

- `architecture:cli-surface`: the `experimental` command group and
  `experimental icon` commands with their response types, the
  `experimental.iconSets` manifest root, the `icon-set` and `icon-definition`
  descriptor kinds, the `cli/experimental` docs namespace, the `icon-sets`
  Doctor check, the icon-set checks and the `iconSets` and `olderCliNotes`
  validate fields.
- `contributing:cli-conventions`: `IconSetDoc`, `IconSetData`, and
  `IconDefinitionDoc` join the authoring types.
- Consumer docs: `cli/experimental/icon-sets` and
  `cli/experimental/icon-definitions`.
- `spec:AST-051`: discover's `icon-set` kind, read only with the opt-in.

## Verification

| Contract  | Verification                                                                   | Representative states                                                                                                       | Mutation or failure expectation                                                     |
| --------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| FR0, FR11 | experimental-isolation tests against the output of the CLI without the feature | help; search with no set and with a set opted in; template printed and copied; discover and Doctor with a set and no opt-in | any stable output changes, or a stable command gains an icon-set subcommand or kind |
| FR1–FR5   | descriptor, data-file, and definition parser and discovery tests               | valid set; invalid data; definitions Astryx and the set both have                                                           | an invalid set answers, or a definition file is not read                            |
| FR6–FR8   | `experimental icon` text and JSON tests                                        | definition, name, and meaning matches; `<set>/<id>`; `--list`; two sets of one name                                         | ranking or tie order changes, or a bare ambiguous name answers                      |
| FR9–FR10  | template mapping tests                                                         | mapped by match and by definition; kept with a suggestion; no opt-in                                                        | a name is guessed, or a project without the opt-in gets a rewrite                   |
| FR12–FR14 | writer and command tests                                                       | wrap and refresh; adapter; generated types and theme map                                                                    | a write is left half done, or the theme map drifts from `map`                       |
| FR15      | `integration check` tests, with and without `--strict`                         | every code; unmapped optional definitions                                                                                   | an export the module lacks passes, or the optional list fails a check               |
| FR16      | validate tests; a scratch project on published CLI 0.7.1                       | `stability` on a template and namespace doc; template `icons`; peer range from 0.7.2                                        | a note fails a check, or a dropped descriptor goes unnoted                          |
| FR17      | Doctor and discover tests                                                      | opted in; installed set and no opt-in; invalid set and no opt-in                                                            | a project without the opt-in sees an icon-set check, issue, or kind                 |
| FR18      | docs tree, help, and search tests                                              | marked command; stable and experimental namespace with `packages: 'all'`                                                    | a stable namespace adopts another package's doc, or a marked doc reaches search     |

## Decision log

### DEC-1 — The set is the item; its data file is the payload

**Reference:** `spec:AST-084/DEC-1`
**Decider:** `josephfarina`, `2026-10-20`

One descriptor per set keeps the no-catalog rule, and every surface reads the
one data file, so lookup, templates, and themes agree on what an icon means.

Rejected: one doc file per icon, which thousands of hand-kept files cannot keep in step with a library.

### DEC-2 — Find icons with a dedicated command

**Reference:** `spec:AST-084/DEC-2`
**Decider:** `josephfarina`, `2026-10-20`

An icon answer needs its import line, variants, and definitions, so
`astryx experimental icon` answers with the full record. `astryx search` is a
stable surface the experiment never feeds; icons join it at promotion.

### DEC-3 — Templates keep their icon when nothing maps

**Reference:** `spec:AST-084/DEC-3`
**Decider:** `josephfarina`, `2026-10-20`

A wrong icon is worse than a familiar one, so an unmapped icon keeps its
import and the report says so.

### DEC-4 — Astryx owns the definitions; sets map to them

**Reference:** `spec:AST-084/DEC-4`
**Decider:** `josephfarina`, `2026-10-20`

Shared definitions let templates name meanings, not libraries. A set extends
them with its own files, and the CLI never encodes a library.

### DEC-5 — Every icon is a component the package exports

**Reference:** `spec:AST-084/DEC-5`
**Decider:** `josephfarina`, `2026-10-20`

Apps, templates, and theme maps import every icon from the set's package; the
generated module and adapter make data-only libraries work the same way.

### DEC-6 — Icon sets ship experimental

**Reference:** `spec:AST-084/DEC-6`
**Decider:** `josephfarina`, `2026-10-20`

The commands, keys, data file, and output may change in a patch release while
real sets prove the design. Each surface uses its kind's experimental
boundary, and a project that does not opt in sees the output it saw before.

## Open questions

None.
