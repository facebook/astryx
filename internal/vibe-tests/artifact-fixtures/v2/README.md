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

Every digest uses the canonical SHA-256 tree algorithm in
`src/static-artifact-fixture.ts`: sorted POSIX-relative file path, NUL, file
SHA-256, and newline for each regular file.
