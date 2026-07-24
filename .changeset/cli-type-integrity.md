---
'@astryxdesign/cli': patch
---

[fix] Align two `--json` contract shapes with what the CLI actually emits

- `swizzle.copy` payloads always include `package` and `usesStyleX` (both covered by tests), but `SwizzleCopyResponse.data` didn't declare them — the call site cast the payload to `Record<string, unknown>` to sidestep the mismatch. Added both fields to the type and dropped the loose cast so the payload is type-checked.
- The error `suggestions` shape was declared as `{name, reason}` (reason required) in the JSON envelope / API error contract, but some call sites emit bare `{name}` (e.g. candidate component names on swizzle). Introduced a single canonical `Suggestion` type (`reason?` optional) and referenced it everywhere so the contract matches the emitted data.

No runtime change.

@josephfarina
