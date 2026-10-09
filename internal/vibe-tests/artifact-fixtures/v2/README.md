# VibeArtifactV2 fixtures

These fixtures exercise the delivery-agnostic artifact boundary without changing
the existing vibe-test command.

- `static-valid` is a complete immutable bundle that the fixture-only static
  materializer can verify.
- `static-broken-build` represents a producer that declared a static entry but
  did not emit it; materialization must fail as `missing_entry` rather than
  score an error page.
- `invalid` contains schema/path failures that must be rejected before bundle
  access.

Every digest uses the canonical `sha256TreeV2` algorithm in
`src/vibe-artifact-v2.ts`: encode POSIX-relative paths as UTF-8, sort by those
bytes, then hash one `path + NUL + lowercase file SHA-256 + LF` record per
regular file. Symlinks and non-regular entries are rejected.

A `git-tree` baseline uses that same canonical byte stream over the regular files
exported from exactly one baseline commit. Its digest is not a Git object ID and
excludes modes, empty directories, untracked files, submodules, symlinks, and
`.git` metadata, so identical tracked bytes hash identically in SHA-1 and SHA-256
repositories.

Command arrays are structural in PR 1. Launcher resolution and shell/eval policy
belong to the isolated shared evaluator in AST-067 PR 5.
