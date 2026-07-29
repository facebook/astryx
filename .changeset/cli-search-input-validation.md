---
'@astryxdesign/cli': patch
---

[fix] cli/api hardening pass — validate inputs at the API layer and close write-path safety gaps that were only guarded in the CLI wrapper (the API is a public surface: `@astryxdesign/cli/api`).

- `search()`: a non-positive/non-integer `limit`, empty query, and unknown `--type` now throw `ERR_INVALID_ARGUMENT` (previously `limit: 0` silently returned the full unclamped set).
- `swizzle()`: the component name is sanitized — a name containing `..`/separators can no longer escape the `--output` base and write files outside it (`ERR_PATH_TRAVERSAL`).
- `template()` copy: refuses to clobber an existing file unless `overwrite: true` (`ERR_FILE_EXISTS`) — previously the API silently overwrote user files; adds an `overwrite` option, matching the peer `theme add` leaf and the CLI's own guard.
- `upgrade()`: the `--path` scan directory is confined to cwd (`ERR_PATH_TRAVERSAL`) — `--apply` rewrites files in place, so an escaping/out-of-tree path is now rejected.
- `layout` check/expand: an unknown `--form` value (`ERR_INVALID_OPTION`) and an empty expression (`ERR_INVALID_ARGUMENT`) are rejected instead of silently parsing as an empty compact layout.
- `component --package <pkg> --showcase`/`--blocks`: now route to the showcase/blocks leaves instead of silently falling back to `component.detail`.
- `discover` search leaf / `docs` section leaf: an empty query/section now errors instead of matching everything via `.includes('')`.
- `toErrorEnvelope` / `AstryxError`: only a real `Suggestion[]` is attached — a string or `{length}` object is no longer mistaken for suggestions.

Backfills api-level tests for the zero-coverage commands (`component`, `search`, `doctor`) plus the new guards, and unit tests for `levenshteinDistance` and the error-envelope contract.

@josephfarina
