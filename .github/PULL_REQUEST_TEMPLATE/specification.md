<!-- Use this template only when recording a durable decision is the primary intent. Do not include implementation. -->

## Exact decision needed

<!-- State the smallest unresolved public behavior, API, ownership, compatibility, theme, or design claim. -->

## Existing authority searched

<!-- Name current records, affected paths/exports, semantic terms, and overlapping open PRs inspected. Explain why no existing claim settles this decision. -->

## Decision

<!-- State the approved observable requirement: supported inputs, outputs/states, failure or degradation behavior, defaults, exceptions, compatibility, and owner. Preserve implementation freedom. -->

## Rejected alternatives

<!-- Record only consequential alternatives likely to recur. -->

## Claim scope and non-goals

<!-- A current record governs only these explicit claims. Leave adjacent behavior uncontracted instead of filling it for completeness. -->

## Evidence and implementation relationship

<!-- Evidence supporting the decision; linked implementation PR if one exists. The specification must remain valid without it. -->

## Scope

- [ ] This PR contains specification records only.
- [ ] It records observable behavior and preserves equivalent internal implementations.
- [ ] Any named internal mechanism is intentionally public, names its dependent caller/system, and explains why an equivalent implementation would not satisfy the contract.
- [ ] Verification states the evidence layer and failure signal without prescribing CI job/workflow topology.
- [ ] It records one intentional durable decision, not a review transcript or rescue for a separable tagalong.
- [ ] The canonical knowledge owner, affected current claims, and overlapping open work are named; any ownership collision is resolved or called out for human decision.
- [ ] Adjacent API, visual, accessibility, composition, and implementation facts remain outside scope unless this exact decision depends on them.
- [ ] Public text and artifacts contain no internal Meta context.

## Validation

- `pnpm check:knowledge`
- Prettier
- `git diff --check`
