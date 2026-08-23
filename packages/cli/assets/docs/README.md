# /packages/cli/assets/docs

Reference topics for people **building with** Astryx. Not docs about building Astryx itself.

One `{topic}.doc.mjs` per topic, plus optional `{topic}.doc.dense.mjs` / `{topic}.doc.zh.mjs` prose overlays. `foundation/discovery/docs-discovery.mjs` picks up any `{topic}.doc.mjs` here with no registration; `api/docs/_adapter.mjs` merges the overlays.

What you add reaches `astryx docs <topic>`, `astryx search`, the `--json` API, the agent-docs block and the doc site — and ships on npm.

## Who you are writing for

Someone building a product with Astryx. Their questions:

- what a component is for, and when to reach for something else
- the props, their defaults, and what each does to what they see
- how to compose it, and the pattern to copy
- what it costs — bundle size, the a11y obligations they inherit
- how to theme it, and which targets are stable

**The test for anything you add: does a caller act on it?** They are not reviewing a PR, promoting a component out of lab, or attaching evidence to a checklist.

## Tells that you are writing for us instead

- second person aimed at the wrong reader — "reviewers should…", "before promoting a component…", "attach evidence for…"
- **rubric, readiness, gate, audit, checklist, sign-off, promotion, evidence** as things the reader must produce
- a table of things to verify rather than things to use
- anything about lab → core, which is our lifecycle, not theirs
- Storybook, Playwright, CI or the Simulator named as tools the reader runs

One subtlety: a statement about the **system's behavior** is caller-facing even when it sounds like process. "A component's theme targets are stable once published" tells a caller what they can rely on; "reviewers must check that theme targets are stable" is ours. Same fact, different reader — **rewrite it rather than move it**.

## Where the rest goes

The material is usually good; the finding is placement, not quality. It goes in the [wiki](https://github.com/facebook/astryx/wiki) — **as a section on the page that already covers it, not a new page.** The wiki is at nearly 60 pages, several of them overlapping, because every stray section got its own.

| what you wrote                                      | where it goes                                                                                                                                                                                |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| how a component is graded — checks, scoring         | [Component-Audit-Rubric](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric)                                                                                                     |
| lab → core promotion, what a component must satisfy | [Component-Lifecycle](https://github.com/facebook/astryx/wiki/Component-Lifecycle)                                                                                                           |
| how to build a new component                        | [Component-Authoring-Guide](https://github.com/facebook/astryx/wiki/Component-Authoring-Guide), [Creating-New-Components](https://github.com/facebook/astryx/wiki/Creating-New-Components)   |
| what a component must be hardened against           | [Component-Hardening-Protocol](https://github.com/facebook/astryx/wiki/Component-Hardening-Protocol), [Hardening-Audit-Guide](https://github.com/facebook/astryx/wiki/Hardening-Audit-Guide) |
| a11y requirements as checks we run                  | [Accessibility-Checklist](https://github.com/facebook/astryx/wiki/Accessibility-Checklist)                                                                                                   |
| how the system is put together                      | [System-Architecture](https://github.com/facebook/astryx/wiki/System-Architecture), [Theming-Infrastructure](https://github.com/facebook/astryx/wiki/Theming-Infrastructure)                 |
| API naming and shape decisions                      | [API-Conventions](https://github.com/facebook/astryx/wiki/API-Conventions), [API-Arbitration](https://github.com/facebook/astryx/wiki/API-Arbitration)                                       |
| contributor workflow, PR process                    | [Contributing](https://github.com/facebook/astryx/wiki/Contributing), [Contributing-with-AI-Assistants](https://github.com/facebook/astryx/wiki/Contributing-with-AI-Assistants)             |
| release mechanics                                   | [Release-Process](https://github.com/facebook/astryx/wiki/Release-Process)                                                                                                                   |
| what a nightly agent role does                      | the Night-Watch pages, from [Night-Watch-Overview](https://github.com/facebook/astryx/wiki/Night-Watch-Overview)                                                                             |

**Fits no row?** It is still not caller-facing. Default it to [Contributing](https://github.com/facebook/astryx/wiki/Contributing), or `CONTRIBUTING.md` when it is a step someone follows with the repo cloned. Never default it back to this directory.

Worked example: a responsive-and-interaction readiness rubric is grading criteria → **Component-Audit-Rubric**, or **Component-Lifecycle** if it is a promotion gate.
