---
schema_version: 4
template_version: 1
kind: system-spec
id: spec:AST-053
authority: current
archive_reason: null
superseded_by: null
approved_by: josephfarina
approved_at: 2026-10-01
phase: accepted
owners: [josephfarina]
affects_architecture: [architecture:cli-surface]
affects_families: []
affects_contributing: [contributing:cli-conventions]
affects_consumer_docs: [cli]
---

# Complete multi-selector lookup receipts system spec

## Intent

An agent sometimes knows several exact subjects it must inspect. Repeating one CLI
process per subject wastes setup work and makes it easy to lose a failure between
successful calls. A lookup that accepts several selectors returns one complete,
ordered receipt: every requested selector has one row, ambiguity stays visible, and
the exit status says whether every lookup resolved.

This record owns the observable batch contract for any CLI lookup that elects to
accept several exact selectors. The lookup's existing authority still owns what a
selector means, how one selector resolves, and the data returned for one resolved
subject.

## Non-goals

- Turning free-text search into a batch. Words in one search query remain one query.
- Requiring every lookup command to accept several selectors.
- Changing existing CLI responses for zero or one positional selector, or existing
  programmatic responses for omitted and string arguments.
- Ranking candidates or choosing among ambiguous identities.
- Adding a global option, configuration key, environment variable, or network source.
- Equivalent internal implementations remain valid when they satisfy this contract.

## Requirements

- **FR1 — Batch selection is explicit and discoverable.** A command that accepts
  several exact selectors MUST document a variadic positional argument in generated
  help, its manifest entry, and its programmatic API. No hidden control enables the
  behavior.
- **FR2 — Every selector gets one row.** A batch receipt MUST contain exactly one
  result row per supplied selector, in input order. Duplicate selectors remain
  duplicate rows. No limit, deduplication, or successful neighbor may remove a row.
- **FR3 — Every row states its outcome.** Each row MUST echo the selector exactly and
  identify one state: `found`, `not_found`, `ambiguous`, or `error`.
- **FR4 — Found rows preserve single-lookup meaning.** A `found` row MUST carry the
  same typed result that the command's programmatic API returns for that selector by
  itself with the same controls. A caller does not reconstruct the single result
  from batch-only fields.
- **FR5 — Ambiguity is data, never a guess.** When several identities can satisfy a
  selector, the row MUST be `ambiguous` and list every effective candidate with the
  stable identity fields that the owning catalog exposes. The lookup MUST NOT choose
  the first candidate or silently prefer a package.
- **FR6 — Failures stay complete and machine-readable.** A `not_found` or `error` row
  MUST carry the stable error code the same one-selector lookup uses, its
  human-readable error, and any structured suggestions. A batch MUST NOT print an
  error outside the receipt, drop the row, or turn the failed selector into an empty
  success.
- **FR7 — Exact package versions do not fall through.** When a selector names a
  package version, it resolves only against that exact installed version. A different
  installed version is `not_found` and points the caller to the owning discovery
  command; it is never used as a plausible substitute.
- **FR8 — The full receipt precedes failure.** The CLI MUST emit every row, then exit
  nonzero when any row is not `found`. Text and JSON modes use the same exit status.
  The programmatic API returns the complete typed receipt and leaves process exit
  policy to its caller.
- **FR9 — Existing CLI cardinalities keep their contracts and API input is explicit.**
  In the CLI, zero positional selectors keep browse behavior and one keeps its
  existing success or error envelope; two or more use the batch discriminator. In
  the programmatic API, an omitted argument browses, a string requests one result,
  and an array requests a batch at every array length, including zero and one.
- **FR10 — Text is a projection of the batch.** Human-readable output MUST expose the
  count and every row's selector, status, and state-specific fields through the
  shared formatter vocabulary. It MUST NOT invent a command-specific table or omit a
  failure that JSON carries.

### Platform support

- Supported feature/engine floor: every runtime already supported by the owning CLI
  command.
- Unsupported behavior: none. A command that does not opt in keeps its existing
  single-selector grammar.
- Browser evidence: not applicable; this is a CLI and programmatic API contract.

## Current-state impact

The component lookup is the first adopter. Its variadic command argument and
`component.batch` response apply FR1-FR10. CLI browse and single-selector response
types remain unchanged. Programmatic callers choose the catalog with an omitted
argument, one result with a string, and a batch with an array.
`architecture:cli-surface` keeps ownership of the outer envelope, formatter
vocabulary, generated help, and API to CLI parity.

## Verification

| Contract | Verification                                                       | Representative states                                           | Mutation or failure expectation                                                         |
| -------- | ------------------------------------------------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| FR1      | Generated help and manifest tests; FunctionDoc contract tests      | zero, one, and several positional selectors                     | The variadic input exists in code but is absent from help, manifest, or API docs        |
| FR2, FR3 | Programmatic API and CLI batch tests                               | found rows, duplicate selectors, mixed outcomes                 | A selector is reordered, deduplicated, dropped, or has no state                         |
| FR4      | Batch versus single-result comparison                              | detail and each supported focused projection                    | A found row differs from the same one-selector result                                   |
| FR5      | Ambiguous installed-identity fixture                               | two effective package owners for one name                       | One owner is chosen or a candidate is omitted                                           |
| FR6, FR7 | Missing, malformed, unknown-package, and version-mismatch fixtures | suggestions present and absent; another version installed       | A failure becomes an empty success, loses its code, or falls through to another version |
| FR8      | Text and JSON process tests                                        | all found; one failure; several failures                        | Output stops at the first failure or an unresolved batch exits zero                     |
| FR9      | CLI cardinality tests and API input-shape tests                    | CLI zero/one/many; omitted, string, empty array, one-item array | A CLI discriminator changes, or an explicit array does not return a batch               |
| FR10     | Text projection tests                                              | every row state                                                 | Text omits a state field or draws an unregistered output format                         |

## Decision log

### DEC-1 — A batch is a complete ordered receipt

**Reference:** `spec:AST-053/DEC-1`
**Decider:** `josephfarina`, `2026-10-01`

Batch lookup exists to reduce repeated process work without hiding what happened to
any request, so selectors remain one-for-one and in order, including duplicates.

Rejected: fail the whole call on the first miss, which loses later answers; and drop
failed selectors, which makes partial work look complete.

### DEC-2 — Ambiguity lists candidates

**Reference:** `spec:AST-053/DEC-2`
**Decider:** `josephfarina`, `2026-10-01`

An unqualified identity can belong to several packages. The receipt exposes those
candidates so the caller can make the next lookup exact.

Rejected: package precedence or first-match selection, which turns catalog order into
an undocumented answer.

### DEC-3 — An unresolved row makes the CLI fail after output

**Reference:** `spec:AST-053/DEC-3`
**Decider:** `josephfarina`, `2026-10-01`

Automation needs the process status to say whether every requested lookup resolved,
while the receipt is still useful for fixing all failures in one pass.

Rejected: exit zero because some rows succeeded, which reports incomplete work as
success; and emit no receipt on failure, which forces repeated calls.

### DEC-4 — Input shape makes batch intent explicit

**Reference:** `spec:AST-053/DEC-4`
**Decider:** `josephfarina`, `2026-10-01`

Existing CLI callers keep the browse and single-selector envelopes they already
parse. Programmatic callers choose those paths with an omitted argument or a string,
and choose a complete batch receipt with an array. Empty and one-item arrays remain
batches, so `component([])` means "look up this empty set" rather than "browse all."

Rejected: making an array's response depend on its length, which makes an explicit
batch call change shape as a caller filters selectors; and always returning a batch
for strings, which changes the stable JSON shape for existing callers.

## Open questions

None.
