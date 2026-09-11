<!-- Use this template only when recording a durable decision is the primary intent. Do not include implementation. -->

## Exact decision needed

<!-- State the smallest unresolved public behavior, API, ownership, compatibility, theme, or design claim. -->

## Existing authority searched

<!-- Name current records, affected paths/exports, semantic terms, and overlapping open PRs inspected. Explain why no existing claim settles this decision. -->

## Decision

<!-- State the approved requirement, conditions, defaults, exceptions, compatibility, and owner. -->

## Rejected alternatives

<!-- Record only consequential alternatives likely to recur. -->

## Claim scope and non-goals

<!-- A current record governs only these explicit claims. Leave adjacent behavior uncontracted instead of filling it for completeness. -->

## Evidence and implementation relationship

<!-- Evidence supporting the decision; linked implementation PR if one exists. The specification must remain valid without it. -->

## Scope

- [ ] This PR contains specification records only.
- [ ] It records one intentional durable decision, not a review transcript or rescue for a separable tagalong.
- [ ] Adjacent API, visual, accessibility, composition, and implementation facts remain outside scope unless this exact decision depends on them.
- [ ] Public text and artifacts contain no internal Meta context.

## Validation

- `pnpm check:knowledge`
- Prettier
- `git diff --check`
