---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-060
authority: current
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: accepted
owners: [josephfarina]
affects_architecture: [architecture:cli-surface]
affects_families: []
affects_contributing: []
affects_consumer_docs: [cli/integrations/quick-start]
---

# Integration package init system spec

## Intent

Starting an Astryx integration package requires five manual steps: creating a
directory, running `npm init`, setting the package name, writing an empty
`exports` map (which nobody guesses), and installing the CLI and Core as dev
dependencies. A no-context author who follows only the CLI's own docs cannot
reliably reach a state where `integration add` works, because that command
requires all five steps to be done correctly first.

This record authorizes `astryx integration init`, a subcommand under the
`integration` group, so that one command replaces those five manual steps.

A new package (init writes `exports: {}`) passes `integration verify` after its
first `integration add`. An existing package without an exports map keeps it
absent (`architecture:cli-surface` INV16); verify flags components until an exports map exists, and the
receipt notes the gap.

The programmatic function is `integrationInit(options?, ctx?)`, exported from
`@astryxdesign/cli/api`.

## Non-goals

- Creating the `astryx.integration.mjs` manifest. That stays with
  `integration add`, which creates it on first contribution.
- Adding the first contribution (component, template, doc). That stays with
  `integration add`.
- Choosing a package manager. Init detects the one the project uses and falls
  back to npm.
- Writing a Core peer dependency. That is written by `integration add` on the
  first component, template, or theme (see DEC-3).

## Requirements

### Platform support

**Node floor:** >=22.13.0 (the CLI's `engines.node` field).

**Unsupported:** Deno, Bun as runtime (Bun as a package manager is supported).

On Windows, init runs npm, pnpm, yarn, and bun through their command shims; a
package manager that is not installed is reported as one that could not be
started.

`integration init` runs on any platform that runs Node.js and a supported
package manager (npm, yarn, pnpm, or bun). Package-manager detection walks up
from the target directory, taking the first directory with evidence:

1. A recognized `packageManager` field decides unconditionally. An unrecognized
   value is ignored.
2. A single lockfile, when nothing is declared.
3. When several lockfiles tie and nothing is declared, a committed PM config
   (`pnpm-workspace.yaml`, `.yarnrc.yml`, `.yarnrc`, `bunfig.toml`) breaks the
   tie. A config file without a lockfile in the same directory is not evidence
   on its own.
4. When nothing breaks the tie, the result is ambiguous and init installs
   with npm.

The runner user-agent applies only when no directory in the walk has any
evidence. It is never a tiebreak.

Browser evidence: Not applicable: CLI only.

- **FR1 — One command produces a ready-to-use package.** `integration init
  [name]` writes or completes `package.json` in the current directory with the
  fields `integration add` needs, then installs the CLI and Core. After init on
  a new package, `integration add` succeeds without further manual setup. On an
  existing package without an `exports` map, the receipt carries a note: public
  subpaths from `integration add` need an exports map, and adding one makes
  existing deep imports private. `integration verify` needs a contribution
  (DEC-2: init writes no manifest), so the sequence is: init, then at least one
  `integration add`, then verify.

- **FR2 — The Core peer is written by `integration add`, not by init.** The
  first `integration add component`, `integration add template`, or
  `integration add theme` writes `"@astryxdesign/core": "^<installed>"` when
  the package has no Core peer yet, reading the installed version from
  `node_modules` (hoisted installs are found). It never overwrites an author's
  existing range, even an empty string. If Core is not installed, no Core peer
  is written; a later add writes it once Core is installed, because the rule
  applies whenever no Core peer exists. `integration add doc`, `add codemod`,
  and `add agent-doc` never write a Core peer. See DEC-3 for the rationale and
  follow-up.

- **FR3 — Existing values are preserved; init never renames.** Init never
  overwrites a field that the author already set. When the `name` argument
  differs from the existing `package.json` name, init throws
  `ERR_INVALID_ARGUMENT` naming both names. The same name is a no-op.
  Re-running on an initialized package with satisfied deps reports "unchanged"
  with no error, no file write, and no package-manager invocation. A blank
  existing name (`""` or whitespace-only) counts as missing and is filled from
  the argument or the directory name. "Satisfied
  deps" means both `@astryxdesign/cli` and `@astryxdesign/core` are declared
  in `dependencies`, `devDependencies`, or `optionalDependencies` AND
  installed in the package's own or an ancestor `node_modules` (not global
  folders). A declared entry is never moved between dependency fields;
  undeclared packages are added as dev dependencies.

- **FR4 — The install step is optional.** `--no-install` skips the dependency
  install and writes only the package.json fields. `--dry-run` writes nothing
  and reports the receipt with `dryRun: true`, `installed: false`, and the
  `fieldsAdded` and `packageCreated` values that a real run would produce.
  `--dry-run` with `--no-install` previews without writing and without
  installing. Both options compose: `--dry-run` takes priority (nothing
  happens), and `--no-install` alone writes fields but skips the install.

- **FR5 — The receipt is a stable JSON contract.** The `--json` envelope is
  `{type: "integration.init", data: {name, packageCreated, fieldsAdded,
  installed, dryRun, notes}}`. Field definitions:
  - `name` (string): the resolved package name.
  - `packageCreated` (boolean): true when the file was created (no file
    existed), false when updated or unchanged.
  - `fieldsAdded` (string[]): names of package.json fields that init itself
    wrote (e.g. `["name", "version", "exports"]`). The install step's
    `devDependencies` are not listed here; they are reported via `installed`.
  - `installed` (boolean): true when the install step ran and succeeded.
  - `dryRun` (boolean): whether this was a dry run.
  - `notes` (string[]): informational notes for the author, such as when an
    existing package has no exports map.

  "Unchanged" means `fieldsAdded` is empty, `installed` is false, and
  `packageCreated` is false.

  Field semantics follow `spec:AST-017/DEC-4`.

- **FR6 — Defaults and overwrite rules.** Init writes these fields when they
  are absent:
  - `name`: from the argument, then the existing value, then the directory
    name. Must be a valid npm package name: lowercase, at most 214 characters,
    matching `/^(@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/u`, and not
    `node_modules`, `favicon.ico`, or a Node.js core module name. These strict
    rules apply only to names init writes (new packages, a directory-name
    fallback, or a name filled into a blank existing name); an existing package's own name is accepted when npm's rules for
    existing packages accept it (no leading period, underscore, or hyphen; no
    leading or trailing spaces; URL-safe; at most one scope; not `node_modules`
    or `favicon.ico` in any letter case); its length is not limited.
  - `version`: `"1.0.0"` (only when absent; never overwrites). On a partial
    file that already has a name but no version, init adds `"1.0.0"`.
  - `exports`: `{}` (new packages only; see DEC-4).
  Init never writes `peerDependencies` (see DEC-3), `type`, `description`,
  `license`, `files`, or any field not listed above.

  Partial package.json files (e.g. `{"name": "@acme/lib"}`) keep every
  existing field and gain only the missing ones from the list above. Init
  rewrites the file with the detected indent; other formatting (such as inline
  objects) may be expanded.

  When `devDependencies` are declared in package.json but not installed (the
  packages are absent from `node_modules`), init runs the install step and
  reports `installed: true`.

- **FR7 — Install failure rolls back.** When the package-manager install exits
  non-zero, times out, or the package manager cannot be started, init restores
  `package.json` to its byte-identical original state (or removes it if init
  created it). A manager that cannot be started reports the reason (e.g. the
  system error). A timeout reports the duration. No other cleanup: the PM's own
  `node_modules` and lockfile artifacts from the failed attempt remain as
  the PM left them, but the package declaration is clean. A Ctrl-C (SIGINT)
  during the install leaves the written `package.json` in place; it is not
  rolled back. Error code: `ERR_INSTALL_FAILED`.

- **FR8 — Invalid input.** An invalid package name (characters npm rejects,
  uppercase, over 214 characters, a reserved name, or a Node.js core module
  name) throws `ERR_INVALID_ARGUMENT` for names init writes; an existing
  package's own name is accepted when npm's rules for existing packages accept
  it. An unparseable existing `package.json` throws
  `ERR_INVALID_ARGUMENT`. A `package.json` that parses to a non-object (null,
  array, string, number) throws `ERR_INVALID_ARGUMENT`. A `name` field that is
  not a string (number, object, array, boolean, null) throws
  `ERR_INVALID_ARGUMENT`. A name argument that differs from the existing
  package name throws `ERR_INVALID_ARGUMENT` naming both names. A blank
  existing name is not an error: it counts as missing (FR3). In every case,
  `package.json` is left untouched and no other files are written.

  A `peerDependencies` field that is not a plain object (string, number,
  boolean, array) is never rewritten. `peerDependencies: null` is treated as
  absent. `add doc --parent` and `add theme`, which must add the CLI peer,
  refuse it with `ERR_INVALID_ARGUMENT` and leave `package.json` untouched.
  `add doc --parent` and `add theme` also refuse a non-object
  `peerDependenciesMeta` with `ERR_INVALID_ARGUMENT`. The Core-peer write of
  `add component`, `add template`, and `add theme` is skipped for a non-object
  `peerDependencies`, and the add otherwise behaves as before.

## Current-state impact

The `integration` command group has three subcommands: `add`, `verify`, and
`pack` (a deprecated alias of `verify`). None of them creates the package that
all of them require. The quick-start guide uses `integration init` instead of
the five manual steps.

This specification adds one subcommand (`init`), one error code
(`ERR_INSTALL_FAILED`), and a Core-peer write in the component, template, and
theme paths of `integration add`. It also adds a peer-shape guard to prevent
corruption when spreading a non-object `peerDependencies` or
`peerDependenciesMeta`.

The receipt shape of `integration add` is unchanged. The `files` array in the
add receipt names `package.json` when the Core peer is written, which is a new
value in an existing array (not a new field).

One existing behavior changes: `add theme` and `add doc --parent` previously
accepted a non-object `peerDependencies` or `peerDependenciesMeta` and rewrote
it into a corrupted object while reporting success; they now refuse it with
`ERR_INVALID_ARGUMENT` and leave `package.json` unchanged. This is a fix for
data loss. Component and template adds behave exactly as before for such a
field.

`add theme` on an existing package without an exports map creates one
containing only theme subpaths (`spec:AST-050` FR7), which makes unlisted deep
imports private. This is pre-existing behavior, not changed by this record.

It amends `architecture:cli-surface` INV16 to allow a writer that creates a new
`package.json` to start it with an empty `exports` map; writers never create
`files` on any package.

## Verification

| Contract | Verification | Representative states | Mutation or failure expectation |
| -------- | ------------ | --------------------- | ------------------------------- |
| FR1 | `integration init` in an empty dir, then `integration add component X`, then `integration verify --json` | empty dir; existing with exports; existing without exports | `add` fails after init, or `verify` reports issues on the init+add package; existing without exports gets a note |
| FR2 | After `integration add component` on a package with no Core peer, check that `peerDependencies.@astryxdesign/core` is `^<installed>`; after `add doc`, check that no Core peer was written; with an existing Core peer (including empty string), check it was not overwritten; a second add with a bumped installed Core leaves the peer unchanged; hoisted Core is found; add without Core installed writes no peer, then add after installing Core writes it | component add; template add; theme add; doc add; existing peer; empty-string peer; second add; hoisted; Core not installed then installed | The wrong kinds write or omit the peer, an existing range is overwritten, Core-not-installed writes a peer, or hoisted Core is missed |
| FR3 | Run `init` twice on the same directory; run with a differing name argument on an existing package; run on a blank existing name (`""` or whitespace) with no argument (filled from directory, `fieldsAdded` includes `name`) and with an argument (filled, not refused); run on a blank name with a strict-invalid argument (e.g. `fs`) or a strict-invalid directory fallback (refused, file untouched) | existing package.json with all fields; existing with some fields; name mismatch; same name; blank name with argument; blank name without; blank name with strict-invalid argument | A field is overwritten, a re-run exits non-zero, a re-run invokes the PM, a rename succeeds, a blank name is not filled, `fieldsAdded` omits `name`, or a strict-invalid fill is accepted |
| FR4 | `init --no-install --json` and `init --dry-run --json` in an empty dir; `--dry-run --no-install` | `--no-install`; `--dry-run`; `--dry-run --no-install`; neither | `--no-install` installs, or `--dry-run` writes a file; dry-run receipt has wrong values |
| FR5 | Text-JSON parity test; drift test; response-types enum membership; dry-run receipt values | `--json` vs text output; the response-types doc; dry-run receipt | A JSON field is absent from text and not allowlisted, the type is missing from the enum, or dry-run receipt values are wrong |
| FR6 | Create a new package and check each default; a new name `MyLib` is refused (uppercase); an existing package named `MyLib` is accepted and `init MyLib` on it is a no-op; an existing `.hidden`, `_private`, `Node_Modules`, `@a/b/c` or name with spaces is refused; a 220-char legacy name is accepted; core-module names (`fs`, `path`) are refused for new names only; update an existing partial package (name only, no version) and check version is added; devDeps declared but not installed triggers install | new package; partial; existing with all fields; devDeps declared not installed; invalid new names; valid legacy names; invalid legacy names; core modules | A default overwrites an author-set value, or a field not in the list appears, or a declared-not-installed case skips install, or an invalid name is accepted, or a valid legacy name is refused |
| FR7 | Force a PM failure (a fake script that exits 1, a manager that cannot be started, and a timeout), read package.json bytes after; confirm fields were written before the failure (version added then rolled back) | existing package.json; empty dir; non-zero exit; manager not found; timeout | Bytes differ from the snapshot, or a created file survives, or a field init added is still present after rollback |
| FR8 | Pass an invalid name, a differing name, unparseable JSON, null JSON, array JSON, string JSON, number JSON, non-string name, a Node core module name; malformed peerDependencies on a CLI-peer write path (doc --parent, theme) and on a Core-peer-only path (component, template) with Core installed; malformed peerDependenciesMeta on theme and doc --parent | each invalid input | The wrong error code, or a CLI-peer write path succeeds, or a Core-peer-only path fails, or package.json is modified on refusal |
| DEC-4 | Run init on an existing package without exports; check that exports is absent and the consumer's main import still resolves | existing package with main but no exports | Exports appears in the file, or the consumer can no longer import the main entry |

## Decision log

### DEC-1 — Subcommand of integration, not a top-level command

**Decider:** josephfarina (proposed) · **Date:** 2026-10-05

The `integration` group's one job is "author and verify an integration package."
Creating the package is the prerequisite step of that job. A top-level
`astryx init` writes agent-docs files (AGENTS.md / CLAUDE.md) for consumer apps
and is unrelated to integration package setup.

Rejected: a top-level `astryx create-integration`. The behavior belongs inside
the `integration` group, and a second top-level `init`/`create` command
fragments discoverability.

### DEC-2 — No manifest creation at init time

**Decider:** josephfarina (proposed) · **Date:** 2026-10-05

The manifest declares contribution roots. An empty manifest is valid but useless.
`integration add` creates it on first contribution, which is when a root exists
to declare. Separating package creation (init) from integration content (add)
keeps each command's scope clean.

### DEC-3 — Core peer from add, not from init

**Decider:** josephfarina (proposed) · **Date:** 2026-10-08

A Core peer from init causes npm `ERESOLVE` on the next Core minor for doc,
codemod, and agent-doc integrations that never import Core at runtime. Instead,
the first `integration add component`, `add template`, or `add theme` writes
`"@astryxdesign/core": "^<installed>"` when the package has no Core peer yet.
It never overwrites an author's existing range, even an empty string. If Core is
not installed, no Core peer is written; a later add writes it once Core is
installed.

Component and template contributions compose Core components in real
integrations; the scaffold is a starting point. Theme contributions import Core
directly (the scaffold writes `import {defineTheme} from
'@astryxdesign/core/theme'`). Doc, codemod, and agent-doc scaffolds are text or
transform files with no Core import.

The `integration add` receipt shape is unchanged. The `files` array names
`package.json` when the Core peer is written, which is a new value in an
existing array, not a new field. The `integration add` command docs state the
write.

Follow-up: `integration verify` does not flag an undeclared Core peer when an
author adds a Core import to a component or template without declaring the peer.

Rejected: a Core peer from init. Every integration would declare a Core range,
but doc-only and codemod-only integrations never import Core, so the peer forces
an unnecessary install and fails on the next minor. Also rejected: narrowing to
theme only, because `integration verify` does not flag an undeclared peer and
component/template authors would ship without one.

### DEC-4 — Exports only on new packages

**Decider:** josephfarina (proposed) · **Date:** 2026-10-05

A new `package.json` has no consumers, so an empty `exports` map makes nothing
private. An existing package may already publish deep imports that `exports`
would block. Init tells the author about the gap in the receipt `notes` field
instead of silently breaking their consumers. `integration verify` flags
components until an exports map exists. Writers never create `files` on any
package, new or existing.

`add theme` on an existing package without an exports map creates one containing
only theme subpaths (`spec:AST-050` FR7), which makes unlisted deep imports private.
This is pre-existing behavior that predates this record.

Rejected: always writing `exports: {}`. This violates `architecture:cli-surface` INV16 for existing
packages. Also rejected: never writing `exports`. This leaves the new-package
quick start requiring a manual step that nobody guesses.

### DEC-5 — Not batch-eligible

**Decider:** josephfarina (proposed) · **Date:** 2026-10-05

`integration init` fails `spec:AST-053` FR11 E1 (it writes package.json and runs an
install, so it is not read-only) and E4 (an install per selector has no single
safe aggregate work bound for two or more selectors).

## Open questions

- **OQ1 — Is the `add theme` exports exception durable?** (`human-api`)
  `add theme` creates an exports map on an existing package with only theme
  subpaths, per `spec:AST-050` FR7, which makes unlisted deep imports private.
  Is this a durable rule, or a temporary exception to remove when the theme
  writer keeps `.`/main mapped?
