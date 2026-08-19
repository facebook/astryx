# Sample outputs

Two hand-written samples of what an agent could produce for the same prompt
(`t3-1` — preview a ticket on hover), used by `adoption-eval.test.ts` to prove
the deterministic checks actually separate the cases and flag the specific
frictions.

|                | `hand-rolled/`                                    | `adopted/`                                      |
| -------------- | ------------------------------------------------- | ----------------------------------------------- |
| Reached for    | nothing — copies the precedent in the tree        | the design system's hover layer + badge         |
| Colours        | re-derived locally, raw hex                       | app's canonical mapping, translated to variants |
| `needs_review` | `info` — meaning lost                             | `attention` → `warning`, preserved              |
| Keyboard       | hover only                                        | focus trigger                                   |
| Overrides      | arbitrary widths, negative margin, `zIndex: 9999` | none                                            |

These are **fixtures, not app source** — they never enter a sandbox and no
agent sees them.
