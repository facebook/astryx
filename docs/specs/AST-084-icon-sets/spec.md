---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-084
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [josephfarina]
affects_architecture: [architecture:cli-surface]
affects_families: []
affects_contributing: [contributing:cli-conventions]
affects_consumer_docs: [cli/integrations, icons, template-icons]
---

# Icon set integrations system spec

<!-- Describe the system, not the project: present tense, what it does. No proposals, history, pull requests, or research in the record; see docs/contributing/spec-writing.md and report its rubric results in the pull request. -->

## Intent

An icon set is an integration item: a package of icon components plus one data
file that says what every icon means. With an icon set installed:

- an agent or engineer finds an icon by meaning (`astryx icon trash`,
  `astryx search delete`) and gets the exact import line;
- a template or block copied into the project uses the installed set's icons
  instead of the icons the template was written with; and
- a theme points the shared semantic icon names (`close`, `search`,
  `chevronDown`, …) at the set's artwork.

All three read the same data file. The file is generated from the icon
library's own metadata where the library publishes it, and is checked against
what the package actually exports.

An icon library that ships no data file takes part through a thin wrapper
package. A wrapper re-exports the library's icons as named, tree-shakeable
exports and adds the data file, the theme map, and the library's license
notices. An app imports some icons or all of them; templates work with whichever
set is installed.

## Non-goals

- Choose icon artwork at render time by appearance, weight, or size. Runtime
  presentation belongs to the Icon component contract and
  `architecture:icon-resolution-and-component-slots`; this spec only describes
  which variants a set supplies.
- Grow the shared `IconName` set. A set fills existing names; it never adds one.
- Make each icon a separate discoverable item with its own descriptor. The icon
  set is the item; its icons are that item's data.
- Edit, redraw, or synthesize artwork. Every icon is a component the package
  exports.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

### What an icon set declares

- **FR1 — An integration locates its icon sets with one root.** The integration
  manifest MAY set `iconSets`, a relative path to a directory. Each lower-kebab
  directory under it is one icon set, named by the directory. The manifest never
  lists the sets or their icons (`spec:AST-039/FR11`).
- **FR2 — Each set has one typed descriptor.** The set's directory MUST contain
  `<name>.doc.mjs`, a default-exported `IconSetDoc` annotated with its type from
  `@astryxdesign/cli/authoring`:

  ```js
  /** @type {import('@astryxdesign/cli/authoring').IconSetDoc} */
  export default {
    type: 'icon-set',
    name: 'lucide',
    displayName: 'Lucide',
    description: 'Outline icons with rounded strokes.',
    maintained: true,
    license: 'ISC',
  };
  ```

  `name` MUST equal the directory name. `license` is an SPDX expression for the
  artwork. The descriptor holds only what a person writes about the set; it
  never lists icons.

- **FR3 — Each set has one data file, and every icon surface reads it.** The
  set's directory MUST contain `<name>.icons.json`. Search, the icon lookup
  command, template icon mapping, the theme map check, and Doctor read this file
  and nothing else to learn what icons exist and what they mean. Its shape:

  ```json
  {
    "schemaVersion": 1,
    "module": "@acme/lucide-icons",
    "source": {"package": "lucide-react", "version": "1.60.0"},
    "axes": {
      "appearances": ["outline"],
      "sizes": [24],
      "weights": {"range": {"min": 0.5, "max": 3}}
    },
    "default": {"appearance": "outline", "size": 24, "weight": 2},
    "themeMap": "themeIcons",
    "icons": [
      {
        "id": "x",
        "export": "XIcon",
        "words": ["close", "cancel", "dismiss", "remove", "times"],
        "fills": ["close"]
      },
      {
        "id": "trash",
        "export": "TrashIcon",
        "words": ["delete", "remove", "bin", "garbage"],
        "variants": [
          {"appearance": "solid", "size": 20, "export": "TrashSolid20Icon"}
        ]
      }
    ]
  }
  ```

  - `module` is the import specifier every `export` is read from. An icon or a
    variant MAY set its own `module` when the package splits variants across
    subpaths.
  - `source` names the upstream library and version the file was generated
    from. It is absent for a set with no upstream.
  - `axes` lists the appearances, sizes (in pixels), and weights the set
    supplies. `weights` is either `{"values": [...]}` or `{"range": {min, max}}`.
    Every axis is optional; a set that varies on nothing omits `axes`.
  - `default` is the variant an icon's own `export` draws. When the set offers
    an outline appearance, it is the default (`design:iconography` DR5).
  - Each icon has a lower-kebab `id`, unique in the set; the `export` that draws
    its default variant; `words`, the lower-case terms a person might search
    for, at least one; optional `fills`, the shared `IconName` values it draws;
    and optional `variants`, each naming its axis values and its own `export`.
  - `themeMap` names the export that maps each filled `IconName` to its artwork
    (FR13). It is absent when the set fills no names.

- **FR4 — The data comes from the source, written once.** When the upstream
  library publishes per-icon names or tags, the set's data file is generated from
  them, and regenerating it from the same upstream version produces the same
  file. Words the upstream does not publish are written once in the wrapper's
  own source, never in a second copy of the data. A set with no upstream authors
  its data file directly.
- **FR5 — The directory is the set's boundary.** The set's directory holds its
  descriptor, data file, and any license notice files. Packing and copying take
  the whole directory, and discovery rejects a path in the data file that
  escapes the package (`spec:AST-039/FR5`). Discovery reads the descriptor and
  the data file; it never executes the icon module (`spec:AST-039/FR6`).

### Finding an icon by meaning

- **FR6 — `astryx icon` looks up icons by meaning.** `astryx icon <words>`
  MUST search every installed set's data file and answer `icon.search`:

  ```json
  {
    "apiVersion": 1,
    "type": "icon.search",
    "data": {
      "query": "delete",
      "matchCount": 3,
      "matches": [
        {
          "set": "lucide",
          "id": "trash",
          "package": "@acme/lucide-icons",
          "module": "@acme/lucide-icons",
          "export": "TrashIcon",
          "import": "import {TrashIcon} from '@acme/lucide-icons';",
          "words": ["delete", "remove", "bin", "garbage"],
          "fills": [],
          "variants": [],
          "reason": "word \"delete\"",
          "score": 80
        }
      ]
    }
  }
  ```

  Matches rank in this order: a query equal to an `IconName` the icon fills,
  then a query equal to its `id`, then a query equal to one of its `words`, then
  a word that starts with the query, then partial matches. Ties keep the set
  order (FR10) and then `id` order, so the same installation always answers the
  same way. `--set <name>` keeps one set. `--limit <n>` caps the list (default
  10); `matchCount` counts every match. A query with no match answers an empty
  list, not an error.

- **FR7 — One icon and the installed sets have their own reads.**
  `astryx icon <set>/<id>` answers `icon.detail` with the same fields as a match
  plus every variant's import line, and fails with `ERR_NOT_FOUND` with
  suggestions when the set or icon does not exist. `astryx icon --list` answers
  `icon.list`: each installed set with its `name`, `displayName`, `package`,
  `license`, icon count, `default`, `axes`, and which `IconName` values it fills
  and does not fill. Every response names its `package` (`architecture:cli-surface`
  INV28).
- **FR8 — `astryx search` finds icons too.** `astryx search <words>` MUST
  include icon matches under the domain `icon`, with `name` as `<set>/<id>`,
  `import`, `package`, and `command` set to `astryx icon <set>/<id>`. An icon
  match ranks below a component or doc match of equal score, so a word such as
  `table` still finds the Table component first. `--type icon` keeps only icons.
- **FR9 — Only installed sets answer.** A set answers searches and lookups only
  when its integration loads in the project and its `module` resolves from the
  project. A set whose data file is invalid is withdrawn from every surface, and
  Doctor reports it (FR15).

### Templates and blocks use the installed set

- **FR10 — One set is the project's icon set.** The project's icon set is the
  set named by the `iconSet` field of `astryx.config` (`"<set>"` or
  `"<package>/<set>"`); otherwise the only installed set; otherwise none. With
  two or more installed sets and no `iconSet`, the project has no icon set, and
  Doctor warns (FR15). The set order for search ties is the project's icon set
  first, then the integration load order.
- **FR11 — A template maps icons by meaning.** When the project has an icon
  set, `astryx template <name>` (printed or copied to a path) and `astryx build`
  rewrite each icon import in the source whose module and export belong to a
  known set's
  data file, including the CLI's bundled data for the libraries its own templates
  import. Each icon maps to the project set's icon that:
  1. fills the same `IconName`;
  2. otherwise has the same `id`;
  3. otherwise shares the most `words` with it, when the overlap meets the
     match threshold, with ties broken by `id`.

  The import, and every reference to the imported name in the file, use the
  mapped export. When the source icon names a variant (for example a solid
  appearance), the mapped icon uses the variant with the same appearance if it
  has one, else its default. A name that would collide with another binding in
  the file is imported under an alias.

- **FR12 — A missing icon keeps the template's icon and says so.** An icon with
  no match keeps its original import, and the original library stays a needed
  dependency of the source. The JSON result, and the copy receipt, report every
  icon as `mapped` (with source and target) or `kept` under `icons`, so the
  caller sees exactly what changed; printed source keeps stdout to the source
  and reports the same on stderr (`architecture:cli-surface` INV28). Without a
  project icon set, the source is unchanged and `icons.status` says why
  (`none` or `ambiguous`).

### Themes

- **FR13 — A set's theme map points the shared names at its artwork.** A set
  that fills any `IconName` MUST export the map named by `themeMap`: an object
  keyed by exactly the filled names, each value the artwork of the icon that
  fills it. A theme uses it directly:

  ```tsx
  import {themeIcons} from '@acme/lucide-icons';

  export const brand = defineTheme({name: 'brand', icons: themeIcons});
  ```

  A name the set does not fill resolves through the next step of shared icon
  resolution (`architecture:icon-resolution-and-component-slots`). Each
  `IconName` is filled by at most one icon in a set.

### Checks and catalogs

- **FR14 — `astryx integration check` proves the data matches the package.**
  For each icon set it MUST report, as errors: an invalid descriptor or data
  file; a duplicate `id`; an icon with no words; a `fills` value that is not an
  `IconName`, or an `IconName` filled twice; a variant whose axis values are not
  in `axes`; a `default` that is not in `axes`; an `export` that the named
  module does not export at runtime (read statically, re-exports followed); and
  a theme map whose keys or values disagree with `fills`. It MUST warn when the
  data file was generated from an upstream version other than the one the
  package depends on, and when a set with an upstream has no license notice file
  in its directory or package. Warnings fail only under `--strict`
  (`architecture:cli-surface` INV32 and INV35).
- **FR15 — `astryx doctor` checks the project's icon sets.** Doctor's
  `icon-sets` check MUST fail when `iconSet` names a set that is not installed,
  MUST warn when two or more sets are installed and `iconSet` is not set, and
  MUST warn for each installed set withdrawn by FR9 with the reason. A project
  with no icon sets passes.
- **FR16 — Discover lists icon sets as their own kind.** `astryx discover`
  treats `icon-set` as a contribution kind (`spec:AST-051/FR5`): a package's
  page lists its sets, `--type icon-set` keeps them, and a catalog entry MAY
  carry `iconCount` and `fills`. `discover <package>/<set>` shows the set's
  description, license, icon count, default variant, and which `IconName` values
  it fills, plus the command that lists its icons. Individual icons are not
  discover items; `astryx icon` finds them.

### Wrapper packages

- **FR17 — A wrapper adds data, not artwork.** A wrapper package for an icon
  library MUST depend on that library, re-export its icons as named exports
  under the names in the data file, set `sideEffects: false`, and ship the data
  file, the theme map, and the library's license and notice text unchanged. It
  MUST NOT copy, modify, or bundle the library's artwork into its own files.
  Importing one icon brings in only that icon.

### Platform support

- Supported engines: the CLI's Node floor; wrappers support every React version
  Core supports.
- Unsupported behavior: a set whose module cannot be resolved does not answer
  (FR9); templates are then written unchanged (FR12).
- Browser evidence: none. Every behavior here is CLI output, written source, or
  a module's exports.

## Current-state impact

- `architecture:cli-surface`: adds the `iconSets` manifest root and the
  `icon-set` descriptor kind to INV24's discovered kinds, the `icon` command and
  its three response types, the `icon` search domain, the `icon-sets` Doctor
  check, and the icon-set checks of `integration check` (INV35).
- `contributing:cli-conventions`: lists `IconSetDoc` and the data file among the
  authoring types a new kind ships with.
- Consumer docs: `cli/integrations` documents authoring an icon set;
  `icons` documents finding icons and using a set's theme map; `template-icons`
  documents how copied templates follow the project's icon set.
- `spec:AST-051`: discover's kinds gain `icon-set`.
- Runtime icon resolution, `IconName`, `componentIcons`, and the Icon component
  are unchanged.

## Verification

| Contract  | Verification                                                                   | Representative states                                                                                                       | Mutation or failure expectation                                                                       |
| --------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| FR1–FR3   | descriptor and data-file parser tests; discovery tests                         | valid set; missing or misnamed descriptor; missing data file; unknown field; `schemaVersion: 2`; two sets in one package    | a set without its descriptor or data file is discovered, or the manifest lists icons and still passes |
| FR4       | wrapper generator test                                                         | regenerate from the same upstream version; upstream adds an icon                                                            | regenerating changes the file, or a new upstream icon is missing                                      |
| FR5       | pack and discovery tests                                                       | module path escaping the package; nested notice file                                                                        | an escaped path is accepted, or discovery imports the icon module                                     |
| FR6–FR7   | `icon` command text and JSON tests                                             | exact `IconName`; exact id; exact word; prefix; no match; `--set`; `--limit`; unknown set or id; `--list` coverage          | ranking order changes, a tie is order-dependent, or a missing icon is not `ERR_NOT_FOUND`             |
| FR8       | search tests                                                                   | icon-only word; word matching a component and an icon; `--type icon`                                                        | an icon outranks an equal component, or `--type icon` returns another domain                          |
| FR9–FR10  | discovery and config tests                                                     | set installed but module missing; invalid data file; one set; two sets with and without `iconSet`                           | a withdrawn set answers, or two sets pick one silently                                                |
| FR11–FR12 | template print and copy tests over a fixture set and the bundled template data | icon filling a shared name; id match; word match; no match; solid variant; name collision; no set; two sets; printed source | an unmapped icon is dropped, a reference keeps the old name, or the receipt omits a kept icon         |
| FR13      | integration check tests; theme fixture                                         | theme map equal to fills; extra key; missing key; wrong artwork                                                             | a disagreeing theme map passes                                                                        |
| FR14      | `integration check` tests, with and without `--strict`                         | every error listed in FR14; upstream version drift; missing notice                                                          | an export the module lacks passes, or a warning fails without `--strict`                              |
| FR15      | Doctor tests                                                                   | no sets; one set; two sets without `iconSet`; `iconSet` not installed; invalid data file                                    | a missing configured set passes, or no sets warns                                                     |
| FR16      | discover tests                                                                 | package adding a set; `--type icon-set`; item page                                                                          | icon sets are not listed, or icons appear as discover items                                           |
| FR17      | wrapper package tests                                                          | named re-exports; one-icon import bundle size; license text present                                                         | a wrapper bundles artwork, drops a notice, or importing one icon pulls in the library                 |

## Decision log

### DEC-1 — The icon set is the item; its data file is the item's payload

**Reference:** `spec:AST-084/DEC-1`
**Decider:** `joeyfarina`, `2026-10-20`

One set is one discoverable item with one typed descriptor, like a theme. The
data file is generated payload inside the set's own directory, the way a theme's
token files are, so adding a set touches no shared file and the no-catalog rule
(`spec:AST-039/FR11`) holds. Every surface reads that one file, so search,
templates, and themes cannot disagree about what an icon means.

Rejected: one `.doc.mjs` per icon, because thousands of hand-kept files cannot
stay in step with an upstream library that adds icons every release.

### DEC-2 — Find icons with a dedicated command and in search

**Reference:** `spec:AST-084/DEC-2`
**Decider:** `joeyfarina`, `2026-10-20`

`astryx search` is where an agent looks first, so icons appear there. An icon
answer needs the import line, the variants, and the shared names it fills, which
a mixed search list cannot carry for every domain, so `astryx icon` answers with
the full record.

### DEC-3 — Templates keep their icon when the set has no match

**Reference:** `spec:AST-084/DEC-3`
**Decider:** `joeyfarina`, `2026-10-20`

A copied template always renders. Keeping the original icon, and saying so in
the receipt, is visible and fixable; a guessed icon with the wrong meaning is
neither.

Rejected: replacing an unmatched icon with a placeholder glyph, because it
silently changes what the template says.

### DEC-4 — Libraries without data join through wrapper packages

**Reference:** `spec:AST-084/DEC-4`
**Decider:** `joeyfarina`, `2026-10-20`

A wrapper adds the data, theme map, and names Astryx needs without forking the
library: artwork stays in the upstream package, under its license, and updates
with it. Re-exports keep imports tree-shakeable, so an app pays only for the
icons it uses.

## Open questions

None.
