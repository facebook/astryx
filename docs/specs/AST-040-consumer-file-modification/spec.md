---
schema_version: 4
template_version: 1
kind: system-spec
id: spec:AST-040
authority: current
archive_reason: null
superseded_by: null
approved_by: josephfarina
approved_at: 2026-09-23
phase: accepted
owners: [josephfarina]
affects_architecture: [architecture:cli-surface]
affects_families: []
affects_contributing: [contributing:cli-conventions]
affects_consumer_docs: [cli-integrations]
---

# Evidence-based consumer file modification system spec

## Intent

People run Astryx commands such as `astryx upgrade --apply` on projects they
own. Those commands edit existing files in place. A consumer must be able to
trust that each edit targets content Astryx can prove it may change, that
generated, vendored, and dependency content is regenerated rather than edited,
and that anything Astryx could not change is reported instead of hidden.

This record owns what an operation may modify in an existing consumer file, what
counts as evidence, and how skipped or blocked changes are reported. It applies
to every operation that modifies or replaces an existing file in a consumer
project, including core, integration, and configuration codemods.

## Non-goals

- Creating new files, such as template copies or scaffolding. Their write
  confinement stays with `architecture:cli-surface`, and template copy behavior
  stays with `spec:AST-028`.
- Defining individual migrations or their mappings.
- Choosing a command for inspecting effective settings; `spec:AST-017` FR20
  requires one.
- Equivalent internal implementations remain valid when they satisfy this contract.

## Requirements

- **FR1 — Every edit needs affirmative evidence.** An operation MUST modify
  existing consumer content only when the file is not protected (FR2–FR4) and the
  edited construct is proven in scope. For a source transform, proof is a
  resolved binding to the migrated export: a named, aliased, default, or
  namespace import, or a re-export, that is not shadowed at the edit site. A
  type-only import proves only type positions and never authorizes an edit to a
  runtime value. A matching name, string, or shape alone is not proof, and a
  file-level import does not authorize edits elsewhere in the file. When proof is
  missing, the content MUST stay unchanged and the candidate MUST be reported
  under FR7.
- **FR2 — Generated, vendored, and dependency content is protected.** An
  operation MUST NOT modify a file that is inside an installed dependency or
  version-control metadata, is outside the operation root, is reached through a
  symbolic link, is marked generated or vendored by a recognized convention
  (FR3), or is excluded by the project's ignore rules. A file or directory name
  alone neither protects nor unprotects a file.
- **FR3 — Recognized conventions are read from the checkout.** The CLI MUST
  recognize these declarations from files present in the working tree, without
  running a version-control program:
  - `linguist-generated` and `linguist-vendored` in `.gitattributes` files,
    including nested files;
  - a generated marker in the file's leading comment block: `@generated`,
    `@partially-generated`, or a line matching the standard
    `Code generated … DO NOT EDIT.` form. A marker after authored code does not
    protect the file, and `@partially-generated` protects the whole file;
  - exclusions in `.gitignore` files and in `.hgignore`.

  Each convention uses its own standard semantics, including later-rule
  precedence, explicit unset or false attribute values, and ignore-rule negation.
  The effective result for the file decides protection; Astryx configuration and
  integration contributions can only add protection to it (FR4). The result MUST
  be the same in Git, Sapling, and Mercurial checkouts and in a directory with no
  version control. The recognized set is public and discoverable under
  `spec:AST-017` FR14. It grows by amendment when a convention is established
  across ecosystems.

- **FR4 — Protection is additive and fails closed.** Project configuration and
  integration contributions MAY add protection under `spec:AST-017` FR19 and
  FR20. A protection setting requires a reproduced case that FR3 conventions
  miss. No configuration or contribution can remove protection established by
  FR2, FR3, or another source. When a protection source cannot be read or
  parsed, the operation MUST fail before writing, with a stable error that names
  the source.
- **FR5 — Generated output is regenerated, not edited.** When a required change
  would alter a protected generated file, the operation MUST leave that file
  unchanged, complete the in-scope edits to owned sources, and then run the
  regeneration the project declares. The CLI MUST regenerate output of its own
  generators itself, or report the exact command that does. After regeneration,
  it MUST evaluate the protected files again.
- **FR6 — A blocked required change is an incomplete result.** If a protected
  file still requires a change after FR5, the operation MUST exit nonzero with a
  stable error code and list every such file with the declaration that protects
  it. Completed edits to owned files remain. A protected file that needs no
  change never blocks. Running the same operation again after the project
  regenerates MUST NOT apply a completed edit twice. A dry run MUST report the
  same classification without writing.
- **FR7 — Every skipped candidate is reported.** The machine-readable result
  MUST list modified files, protected files that required a change (FR6), and
  candidates declined for lack of proof (FR1) with their location and reason.
  Human-readable output MUST show the same facts. Declined candidates are
  reported as needing manual review; they do not by themselves fail the
  operation. A result MUST NOT look complete while a required change is blocked.
- **FR8 — Every modification path follows this contract.** Core, integration,
  and configuration codemods, and any other operation that modifies existing
  consumer files, MUST apply FR1–FR7 identically. A new modification path cannot
  opt out, consistent with `spec:AST-017` FR16.

### Platform support

- Supported feature/engine floor: every supported CLI runtime on Linux, macOS,
  and Windows; Git, Sapling, and Mercurial checkouts; and directories with no
  version control.
- Unsupported behavior: a version-control declaration that exists only in
  repository metadata outside the working tree is not read; the project adds
  protection under FR4 when a reproduced case needs it.
- Browser evidence: not applicable.

## Current-state impact

Current codemod scanners skip a fixed list of directory names and never follow
symbolic links. They read no generated markers, attributes, or ignore files, so a
codemod can edit a generated file. Some transforms treat a file-level import as
permission to edit matching literals anywhere in that file. Both behaviors are
non-conforming with FR1–FR3; this record does not choose their implementation.

Post-codemod hooks already exist and serve as the declared regeneration for FR5.
The `cli-integrations` authoring topic and the codemod authoring guidance must
explain protection, how to mark generated files, and how transforms prove scope.

This specification-only change alters no runtime behavior or published package
and needs no Changeset.

## Verification

| Contract | Verification                                               | Representative states                                                                                                                                                                  | Mutation or failure expectation                                                              |
| -------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| FR1      | Transform fixtures                                         | named, aliased, default, namespace, re-exported, type-only in a type position and a value position, shadowed, wrong-package, unrelated literal                                         | A same-named local or unrelated literal changes, or a proven usage is not edited             |
| FR2–FR4  | Protection fixtures in each checkout kind                  | nested attributes, unset or false attribute, negated ignore, marker after code, partial marker, ignored path, symlink, config and integration additions, attempted removal, bad source | A protected file changes, a result differs by version control, or a bad source allows writes |
| FR5–FR6  | Upgrade runs with a generated file and a regeneration hook | hook succeeds, hook fails, dry run, second run                                                                                                                                         | Protected bytes change, exit is zero with a blocked change, or a second run edits twice      |
| FR7      | Result snapshots in JSON and text                          | modified, blocked, declined                                                                                                                                                            | A blocked or declined candidate is missing from either output                                |
| FR8      | Inventory of every operation that modifies existing files  | core, integration, config codemods, new path                                                                                                                                           | A path bypasses FR1–FR7                                                                      |

## Decision log

### DEC-1 — Edit only with affirmative evidence

**Reference:** `spec:AST-040/DEC-1`
**Decider:** `josephfarina`, `2026-09-23`

An upgrade rewrites a person's source without review of each edit, so every
edit needs proof. A resolved binding shows that the construct is the export being
migrated. Uncertain candidates are left alone and reported.

Rejected: matching by name, string, or shape, and treating a file-level import as
permission for the whole file. Both rewrite unrelated code silently.

### DEC-2 — Use established, VCS-neutral conventions

**Reference:** `spec:AST-040/DEC-2`
**Decider:** `josephfarina`, `2026-09-23`

Projects already mark generated and vendored content through attributes, file
headers, and ignore files. Reading those from the working tree gives the same
answer in any checkout and needs no new annotation.

Rejected: an Astryx-only marker, a skip flag as the main mechanism, running a
version-control program, filename conventions, and configuration without a
reproduced gap.

### DEC-3 — Regenerate, then report what remains

**Reference:** `spec:AST-040/DEC-3`
**Decider:** `josephfarina`, `2026-09-23`

Generated files follow their sources, so the operation edits sources, runs the
declared regeneration, and checks again. Anything still blocked makes the result
incomplete and names each file.

Rejected: editing generated output, silently skipping it, and stopping before
any edit, because regeneration needs the source edits.

## Open questions

None.
