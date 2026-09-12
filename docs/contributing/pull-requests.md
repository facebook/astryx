# Pull requests: one primary intent

A pull request should make one reviewable change for one reason. Choose the template that matches its primary intent; supporting tests and docs belong with that intent, but unrelated API, visual, layout, behavior, or policy changes do not.

GitHub uses the default template automatically. To choose another, add `?template=<file>.md` to the new-pull-request URL, or copy the matching file from `.github/PULL_REQUEST_TEMPLATE/` into the description.

| Primary intent                                       | Template           | Minimum evidence                                                                                         |
| ---------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------- |
| Restore broken behavior                              | `bug-fix.md`       | reproduction, expected authority, before/after result, unchanged representative path                     |
| Correct or intentionally change appearance           | `visual-update.md` | current visual authority or owner decision, real-browser before/after pixels, relevant state matrix      |
| Add a capability                                     | `new-feature.md`   | user need, current specification, complete public delta, behavior and compatibility evidence             |
| Correct contributor or consumer documentation        | `documentation.md` | reader impact, source of truth, rendered or generated result                                             |
| Record a durable decision                            | `specification.md` | exact unresolved claim, existing authority searched, decision, rejected alternatives, explicit non-goals |
| Change tooling, tests, CI, or repository maintenance | `maintenance.md`   | operational problem, failure proof, success proof, unchanged product behavior                            |
| Anything else                                        | `other.md`         | primary intent, user or maintainer impact, authority, evidence                                           |

## Explain only what authority does not already say

The pull request and current records are the first source for context. Do not copy
them into another summary. Fill only what is missing:

- Trace the problem through three why questions: why it occurs, why it harms the
  affected task, and why that harm matters.
- Map the proposed solution and every primary or supporting delta back to that
  problem. Remove or split a tagalong that does not clearly contribute.
- State who is affected, in what supported state, and what behavior the change
  enables or prevents.
- When public API changes, show representative before and after callsites,
  defaults and compatibility, and every additional decision the caller must make.

These explanations help reviewers apply current authority; they do not create it.
Product behavior remains owned by the applicable current component, module,
family, design, theme, architecture, or system record. API caller burden follows
`spec:AST-002`.

## Keep the intent atomic

Before requesting review, partition every observable delta:

- **Primary:** the reason this pull request exists.
- **Supporting:** evidence or documentation required to make the primary change complete.
- **Tagalong:** independently removable behavior, visual, API, layout, policy, or cleanup.

Remove or split tagalongs. A bug fix does not become a feature because a nearby affordance could also improve. A feature does not absorb unrelated cleanup because the same file is open.

## Use specifications last, not first

Review should produce the smallest ideal change that can land:

1. Apply current component, module, family, design, theme, architecture, and system authority to each delta.
2. If a delta violates current authority, conform or remove it. Do not propose changing the specification merely to rescue the implementation.
3. If a delta is unsettled but separable, remove or split it and keep reviewing the primary intent.
4. Propose a specification only for a surviving, intentional durable decision the team wants to pursue.

A current record governs only its explicit claims inside its ownership boundary. It does not imply that the whole named component or module is fully specified.

## Visual corrections

A visual change does not automatically need a new specification. It may proceed as a correction when current component, family, design, theme, or objective accessibility authority already settles the exact outcome. Show that authority and verify the affected state with real-browser pixels, plus representative unchanged states.

A new visual representation, subjective direction, or interaction model remains a design decision. Put that decision in its own specification or owner-reviewed visual update instead of attaching it to a bug fix.

## Public repository boundary

Descriptions, screenshots, commits, tests, and specification records are public. Do not include internal links, identifiers, hostnames, tools, or operational context.
