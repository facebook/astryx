---
schema_version: 4
template_version: 1
kind: system-spec
id: spec:AST-051
authority: current
archive_reason: null
superseded_by: null
approved_by: josephfarina
approved_at: 2026-09-30
phase: accepted
owners: [josephfarina]
affects_architecture: [architecture:cli-surface]
affects_families: []
affects_contributing: []
affects_consumer_docs: [cli/integrations]
---

# Discover integration manager system spec

## Intent

A person or agent building an Astryx app wants to know which integrations
exist, what each one adds, which ones the app already has, and which versions
are published, without leaving the terminal. `astryx discover` answers that. It
is the read-only manager for integrations: it lists what the project has and
what its sources offer, shows each package's versions and what they add, and
searches and filters all of it. The project's package manager installs,
updates, and removes packages.

This record owns what discover shows, where the list of available integrations
comes from, and what happens when a source cannot be reached. `spec:AST-031`
owns how named-export features compose; discover sources follow it except where
this record says otherwise.

## Non-goals

- Installing, updating, or removing packages. The package manager does that,
  and autolink loads a newly installed integration with no discover step.
- Hosting a catalog, or choosing a built-in public source (OQ1).
- How a source signs in. A source runs as the person running the CLI and uses
  whatever credentials its host already has. The CLI never prompts
  (`architecture:cli-surface` INV1) and reads no Astryx-owned environment
  variable for a source (`spec:AST-017` FR14).
- `astryx search`, which stays on installed content.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — The list shows what the project has and what it could add.** With no
  query, discover MUST list every integration the project loads, configured or
  autolinked, with its version, what it adds as one list per kind, and the
  latest release a source knows. It MUST then list, once per integration, every
  package its sources offer that the project neither loads nor declares as a
  dependency, and MUST NOT offer a package whose integration the project has
  under another name. An integration that failed to load is left out; the
  integration-issues warning and Doctor report it.
- **FR2 — A package page shows its versions and what they add.** `discover
<package>` MUST show what the shown version adds, grouped by kind, whether
  the project has the package, its latest release, and its releases newest
  first with their dates and any unreadable status, and MUST count its
  prereleases. `discover <package>@<version>` shows any version, prerelease
  included; the default is the installed version, else the latest release. A
  version no source lists MUST fail with `ERR_NOT_FOUND` and suggest releases.
  For a package the project does not have, discover MUST print the
  package-manager command that adds it, as text, and MUST NOT run it; for an
  alias of a package the project has, it names that package instead.
- **FR3 — An item page shows one item.** `discover <package>/<Component>` for an
  installed component keeps printing its doc. Any other item a package adds,
  installed or listed by a source, MUST resolve to its kind, name, package,
  version, and whether the project has it.
- **FR4 — Search covers every kind and every source.** `discover <words>` MUST
  match installed components, the project's other installed items, package
  names and descriptions, and every item a source lists for a package the
  project could add, by name, title, summary, and keywords. It MUST answer with
  the list of matches, even when one name matches exactly or only one item
  matches, so the response type depends on the form of the query and never on
  what the project has. Matches are ranked by how closely the name matches,
  with installed items first among equals. Each match states its kind and
  whether the project has its package. One item opens by its package path
  (FR3).
- **FR5 — Filters follow the CLI's existing options.** `--type <kind>` keeps one
  kind (`component`, `template`, `doc`, `theme`, `codemod`, `agent-doc`): in the
  list, packages that add it; in a search, items of that kind. `--installed`
  and `--available` keep one side and MUST be refused together with
  `ERR_INVALID_OPTION`. `--limit <n>` caps search results (default 20) and the
  response reports the total when it cut the list. An unknown kind or a limit
  that is not a positive integer MUST fail with `ERR_INVALID_OPTION`.
- **FR6 — Sources are functions a project or integration provides.** A source is
  an async function that receives `{signal, package?, version?}` and resolves
  to a catalog; `package` asks for one package with every version, and
  `version` asks for that version's items. A project MAY set one as the
  `discover` field of `astryx.config`, and each loaded integration MAY export
  one as its `discover` named export. Every source is called, the project's
  first and then each integration's in load order, and the same function runs
  once. A source that throws, exceeds 30 seconds (signalled on `signal`), or
  returns an invalid catalog fails alone: the others still count, and discover
  reports which source failed and why. Sources only read, so `spec:AST-031`'s
  consent gate does not apply to them.
- **FR7 — The catalog shape is versioned.** A catalog is `{schemaVersion: 1,
source, packages}`. `source` has `name`, `generatedAt`, and `complete`. Each
  package has `package`, `integration` (shared by every package name that
  publishes the same integration), `aliases`, an optional `description`,
  `latest`, `versions` (each with `version`, `publishedAt`, `prerelease`, and
  `status`), and the `contributions` of the requested or latest version (each
  with `kind`, `name`, and optional `title`, `summary`, and `keywords`). The CLI
  MUST validate every answer, MUST ignore fields and kinds it does not know,
  MUST refuse any other `schemaVersion`, and MUST show versions newest first by
  publish time whatever order the source returned them in. When two sources
  list the same package, the earlier source's entry is used.
- **FR8 — A saved copy covers an unreachable source.** After a source answers,
  discover MUST save that answer, per source and per request, in the per-user
  cache directory of the platform, never in the project. When the source later
  fails, discover MUST use the saved answer for the same request and say when
  it was saved. With no saved answer, the source adds nothing and discover says
  so. Installed integrations always appear, with or without a source.
- **FR9 — JSON stays compatible.** Existing response types and fields keep their
  meaning; new information is additive. `discover.list` `data` lists installed
  integrations, now every loaded one, with optional per-kind lists and
  `latest`; `meta.available` lists what the project could add and
  `meta.sources` reports each source. `discover.detail` gains `installed` and,
  with a source, `latest`, `aliases`, `source`, `versions`, and `install` or
  `installedAs`. Items other than installed components use the new
  `discover.item` type. `discover.search` matches gain `kind` and `installed`,
  `component` holds the item name for every kind, and `data.total` appears when
  `--limit` cut the list. A free-text query that used to return
  `discover.detail.doc` now returns `discover.search` (FR4).

- **FR10 — A package can name its docs site.** An integration manifest MAY
  set `docsiteUrl` to the absolute `https:` or `http:` URL, at most 2,048
  characters, where the package's documentation lives. For a package the
  project has, `discover.list` entries and `discover.detail` MUST carry it as
  `docsiteUrl`, and the text package page MUST print it. A manifest without the
  field shows nothing new. An invalid value MUST NOT stop the rest of the
  manifest from loading: discover leaves the field out, and `astryx doctor
integration validate` reports it as a warning with the code
  `invalid_docsite_url`. The CLI never opens or fetches the URL.
- **FR11 — A package can name where its feedback goes.** An integration
  manifest MAY set `feedback` to an object whose `destination` is a single-line
  string of 1 to 512 characters with no surrounding whitespace: a namespace, an
  address, or a URL that the package's own tooling understands. The CLI treats
  the value as opaque and passes it through unchanged; it never resolves,
  opens, or sends to it, and it ignores other keys inside `feedback`. For a
  package the project has, `discover.list` entries and `discover.detail` MUST
  carry it as `feedback`, and the text package page MUST print the
  destination. An invalid value is left out the same way as an invalid
  `docsiteUrl`, and `astryx doctor integration validate` reports it as a
  warning with the code `invalid_feedback`.

### Platform support

- Supported feature/engine floor: every supported CLI runtime.
- Unsupported behavior: none. What a source needs from its machine is its
  author's responsibility; a source that cannot run there fails under FR6.
- Browser evidence: not applicable.

## Current-state impact

- `astryx discover` listed only configured integrations with a components root
  and matched component names only; its `description` and `displayName` fields
  were never filled. This record replaces that behavior additively (FR9).
- `discover <Name>` opened an installed component's doc when the name matched
  exactly or was the only match. It now lists the matches, and
  `discover <package>/<Name>` opens the doc (FR4, DEC-4).
- `architecture:cli-surface`: the discover adapter calls sources and keeps the
  saved copy (INV21); the saved copy's path passes `assertWithin` under the
  cache directory (INV10).
- `spec:AST-031`: `discover` is a second named-export feature, without the
  consent gate (FR6).
- Consumer docs: `cli/integrations` gains the `discover` named export and config
  field, and `astryx docs authoring` gains the `discover-source` section.
- Integration manifests gain the optional `docsiteUrl` and `feedback` fields
  (FR10, FR11). A CLI
  that does not know the field ignores it with its unknown-field warning and
  loads the rest of the manifest, as `architecture:cli-surface` INV11 requires.
  The manifest reference in `astryx docs authoring` and the CLI README list
  both fields.

## Verification

| Contract | Verification                           | Representative states                                                                                                              | Mutation or failure expectation                                                                                                    |
| -------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| FR1      | list leaf, catalog view, command tests | installed only; available only; both; latest known; alias of an installed package; declared dependency                             | an available package is missing, an alias or declared package is offered, or latest is absent                                      |
| FR2      | detail leaf and command tests          | installed; not installed; `@version`; prerelease; unpublished version; alias                                                       | a version is dropped, the default is wrong, the add command runs, or an alias is offered                                           |
| FR3      | item leaf and dispatcher tests         | installed component; installed template; listed item; unknown item                                                                 | an installed component loses its doc, or a listed item is not found                                                                |
| FR4      | search leaf and command tests          | components, templates, docs, packages; installed and available; title and summary matches; an exact installed name; a single match | a kind is not searched, installed state is wrong, a weak match ranks first, or a free-text query returns a doc instead of the list |
| FR5      | dispatcher, leaf, and command tests    | each kind; `--installed`; `--available`; both; `--limit`; bad values                                                               | a filter is ignored, the pair is accepted, or a bad value passes                                                                   |
| FR6      | adapter source tests                   | project and two integrations; a shared function; a throw; a timeout; invalid data                                                  | a failure hides other sources, a function runs twice, order changes, or the signal never aborts                                    |
| FR7      | catalog schema tests                   | unknown field; unknown kind; `schemaVersion: 2`; duplicate package across sources; misordered versions                             | an unknown field fails, another version is accepted, the later source wins, or versions keep the source order                      |
| FR8      | adapter saved-copy and command tests   | fresh answer; failure with a saved copy; failure with none; another request                                                        | a stale copy hides a fresh answer, the saved date is missing, or a project file is written                                         |
| FR9      | existing discover JSON tests           | each response type with and without a source                                                                                       | an existing field changes type or meaning                                                                                          |
| FR10     | parser, validate, leaf, command tests  | no field; an https URL; an http URL; a relative path; another scheme; a value over 2,048 characters                                | an invalid value hides a contribution, a valid value is missing from JSON or text, or validate does not warn                       |
| FR11     | parser, validate, leaf, command tests  | no field; a namespace; a URL; a blank or multi-line value; an unknown inner key                                                    | a value is changed or resolved, an invalid value hides a contribution, or validate does not warn                                   |

## Decision log

### DEC-1 — Discover shows; the package manager installs

**Reference:** `spec:AST-051/DEC-1`
**Decider:** `josephfarina`, `2026-09-30`

Installing is the package manager's job, and autolink already loads a newly
installed integration, so discover only reads. For a package the project does
not have, it prints the command that adds it.

Rejected: `discover add`, `update`, and `remove` subcommands; running the
package manager from discover.

### DEC-2 — Available integrations come from sources, not from the CLI

**Reference:** `spec:AST-051/DEC-2`
**Decider:** `josephfarina`, `2026-09-30`

A project or an integration provides a source as a function, and discover
merges every source. A catalog host that needs sign-in works through the
function, which runs with the credentials its host already has, and a project
can add or replace what it reads without a CLI release.

Rejected: a catalog URL built into the CLI, which ties the public CLI to one
host; a source given as a URL for the CLI to fetch, which cannot sign in to a
private host without the CLI handling credentials.

### DEC-3 — Discover has its own search and filters, in the CLI's existing terms

**Reference:** `spec:AST-051/DEC-3`
**Decider:** `josephfarina`, `2026-09-30`

Discover lists, shows one package, version, or item, and searches with filters,
using the option names the CLI already has (`--type`, `--limit`) plus
`--installed` and `--available`. Its responses follow the existing discover
types, so a reader of `--json` learns nothing new to use it.

Rejected: sending discover's searches through `astryx search`, which answers
about installed content only.

### DEC-4 — A free-text query always answers with a list

**Reference:** `spec:AST-051/DEC-4`
**Decider:** `josephfarina`, `2026-09-30`

`discover <words>` is a search, so it lists every match across all packages,
the ones the project has and the ones it could add, even when a component's
name matches exactly or only one item matches. The response type then depends
only on the form of the query. One item opens by its package path.

Rejected: keeping the earlier shortcut, where an exact or only
installed-component match opened that component's doc. The same query then
returned a doc or a list depending on what the project and its sources held.

### DEC-5 — The docs site link is manifest metadata named `docsiteUrl`

**Reference:** `spec:AST-051/DEC-5`
**Decider:** `josephfarina (proposed)`

The integration manifest already holds integration-level metadata such as
`issuesUrl`, so the docs site link sits beside it with a parallel name. The
link is optional and only shown, so a bad value costs only the link: it is
parsed on its own, and the package's contributions still load. Only `https:`
and `http:` are accepted, because the value is printed as a link a reader
follows.

Rejected: reading `homepage` from package.json, which often names the
repository rather than the docs; a `docs` URL key, which already names the
reference-docs folder.

### DEC-6 — Feedback destination is opaque manifest metadata

**Reference:** `spec:AST-051/DEC-6`
**Decider:** `josephfarina (proposed)`

A package routes its feedback to its own place, and the tools that collect
feedback differ between hosts, so the manifest carries the destination as an
opaque string and the CLI only passes it on. It sits in a `feedback` object so
later routing details can join it without a new top-level key. `issuesUrl`
keeps its meaning: the URL that "report an issue" links and the gap-report
fallback use.

Rejected: reusing `issuesUrl`, which must be a URL and drives the gap-report
fallback; a CLI-owned list of feedback services, which ties the public CLI to
specific hosts.

## Open questions

- **OQ1 — A built-in public source** (`human-design`). Whether discover ships a
  built-in source for a public catalog, and whether a project source adds to it
  or replaces it. Until this is decided, discover has no built-in source.
