---
'@astryxdesign/cli': patch
---

[fix] cli/api `search()` now validates its own inputs instead of relying on the CLI to pre-validate. A non-positive or non-integer `limit`, an empty query, and an unknown `--type` all throw `AstryxError` with the `ERR_INVALID_ARGUMENT` code. Previously a direct `@astryxdesign/cli/api` caller passing `limit: 0` silently received the full unclamped result set (the CLI already rejected `--limit 0`, so `astryx search` on the command line is unchanged). Also backfills api-level tests for `component`, `search`, and `doctor` (which had none), locking dispatch/precedence, ranking, and the doctor summary invariant.

@josephfarina
