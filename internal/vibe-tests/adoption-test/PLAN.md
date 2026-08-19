# Adoption Vibe Test — introducing Astryx into an app that already has a styling system

**Status:** design + harness scaffold. Mechanism verified without agents; **no findings yet.**
**Related:** `../README.md` (Checker Protocol), `../cli-discovery-test/PLAN.md` (the pattern this
follows), [#3212](https://github.com/facebook/astryx/issues/3212) (component-selection guidance —
blocked on exactly the failure cases this produces), [#974](https://github.com/facebook/astryx/issues/974)
(migration strategies), [#4276](https://github.com/facebook/astryx/issues/4276) (one real adoption,
written up by hand).

---

## 1. The question

Every vibe test we run today hands an agent an **empty project** and asks it to build something.
Even `astryx-tailwind` — the target that sounds like it covers this — is a blank scaffold with both
systems available.

Some consumers really do start from an empty project — a new app, a prototype, a template — and
that path is well covered. The one that isn't:

> An app already exists. It has a styling system, a folder of its own components, house
> conventions, and a year of precedent. Someone adds `@astryxdesign/core` to `package.json`.
> The next feature request arrives.

> **When an agent is asked for a feature in an app that already has its own Tailwind components,
> does it reach for Astryx at all — and when it does, does the result survive contact with the
> app it landed in?**

Two failure modes, and the second is the one greenfield tests are blind to:

1. **Non-adoption** — the agent never considers Astryx, or considers and rejects it. Greenfield
   tests can't see this; there is nothing else to reach for.
2. **Bad adoption** — the agent adopts, and the component doesn't fit: it can't be styled to match
   its neighbours without escape hatches, it drops the app's semantics, it looks foreign, or it
   drags in a build/data contract the app doesn't have. A greenfield test scores this as a win.

## 2. Why this needs its own harness

|             | Nightly evaluation                       | This test                                                               |
| ----------- | ---------------------------------------- | ----------------------------------------------------------------------- |
| Environment | empty scaffold per target                | one **fixed app**, snapshotted and versioned                            |
| Variable    | the design system                        | the **guidance surface** (the system is constant and already installed) |
| Output      | one `.tsx` file                          | a **working-tree diff** against a committed baseline                    |
| "Correct"   | valid component usage                    | _did it adopt, and does the adoption fit the host app_                  |
| Blind to    | whether adoption was ever the right call | —                                                                       |

The system under test is **not** Astryx here. Astryx is installed in every arm. What varies is what
the agent is told, and the outcome is a decision plus its consequences.

## 3. Goal & measure

**What decides the winner:** the **adoption decision** — did the agent reach for the right thing
(app component / Astryx component / Astryx primitives / hand-rolled, in that order of preference
where each is available), and can that choice be justified from what it actually read.

Everything else is downstream of that call and only scored once it's made:

| Dimension                             | Measured by                                                                                                    | Why it's here                                                                        |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Adoption decision** _(tie-breaker)_ | import graph of the diff + the CLI invocation log                                                              | The whole question                                                                   |
| **Verification**                      | did any doc lookup happen **before** the first write                                                           | We have seen an arm reject Astryx on a capability it never checked                   |
| **Integration correctness**           | typecheck, renders, no duplicate-provider/reset breakage                                                       | Adoption that doesn't build isn't adoption                                           |
| **Host-app parity**                   | token classes / radius / border / surface vs the sibling component it sits next to                             | A component that looks foreign gets reverted                                         |
| **Escape-hatch cost**                 | overrides needed to reach parity — arbitrary values, negative margins, `!important`, raw hex, z-index literals | The honest price of adopting; a high count is a **product finding**, not agent error |
| **Semantic fidelity**                 | domain→variant mappings vs the app's own ground truth                                                          | Semantic names don't automatically survive a port between systems                    |
| **A11y delta**                        | keyboard path, roles/labels, focus visibility — vs the code it replaced                                        | One of the stated reasons to adopt; worth measuring rather than assuming             |
| **Blast radius**                      | files created/modified outside the feature; global CSS/layout touched                                          | Coexistence damage                                                                   |

**Ad-hoc first.** Per the [Designing Vibe Tests](https://github.com/facebook/astryx/wiki/Designing-Vibe-Tests)
playbook: the deliverable is a results table, not a pipeline. This gets promoted to a night-watch
target only if a pilot shows the conditions actually separate.

## 4. Where the dimensions come from

Not invented. Each row is a friction point observed in a **real adoption of Astryx into an existing
Tailwind-styled internal console app**, generalized. That's the point of the fixture: reproduce the
conditions that produced them, then measure whether guidance changes the outcome.

| Observed in the real adoption                                                                                                                                                             | Encoded as                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| A single wrong availability check ("that library isn't a dependency here" — it was) produced a hand-rolled component; **every later agent copied that precedent** rather than re-checking | `precedent` factor (§8) + `verifiedAvailability` check                                                |
| An agent rejected Astryx on an accessibility contract it **never looked up**, and said so                                                                                                 | `verification` dimension — doc lookup before first write, from the invocation log                     |
| The docs' own "known gaps", written as broad categories (dense type, layering), were quoted back as licence to skip the system for a component that is definitionally both                | Gap-wording is a condition patch; rejection reasons are classified, not just counted                  |
| Two comparable components documented their a11y contract **unevenly**; the one that didn't advertise it lost the selection                                                                | Rejection-reason classification separates "checked and it's missing" from "checked and couldn't tell" |
| The app's own agent guidance said one system was the house style while the direction was the other                                                                                        | `a3-aligned` arm removes the contradiction; nothing else changes                                      |
| Where a finished component existed, adoption was near-unanimous with no prompting. Where the job needed **composition from primitives**, it was near-zero even with good docs             | Prompt tiers T1 vs T2 (§7) — the differentiator                                                       |
| Reaching visual parity required overrides because one popup surface isn't reachable from a non-StyleX app ([#4804](https://github.com/facebook/astryx/issues/4804))                       | `escapeHatch` counters, including negative-margin and arbitrary-value hacks                           |
| Ported status colours lost the app's canonical mapping — the variant _names_ carried, the meaning didn't                                                                                  | `semanticFidelity` against the fixture's own `lib/status.ts`                                          |
| The adopted component assumed a shared data-provider contract the app didn't have                                                                                                         | Fixture ships a deliberately plain data layer; "renders real data" is pass/fail                       |
| Setup-time failures: peer dep missing from the documented install line, version skew, a CLI subcommand that no longer exists                                                              | `setupFailures` counted from the invocation log's non-zero exits                                      |
| The right focus primitive existed and was found only under pressure; the wrong one was tried first                                                                                        | A11y delta + which primitives appear in the diff                                                      |

Anonymized by the [public-repo boundary](https://github.com/facebook/astryx/wiki/Contributing-with-AI-Assistants#public-repository-boundary):
patterns and conclusions, no internal names, paths, or data.

## 5. The fixture app (`fixture-app/`)

The environment **is** the experiment, so it's versioned rather than generated. A small but
opinionated console app:

- **Tailwind v4** + real shadcn components in `components/ui/` (symlinked from the existing
  `.baseline/`, the same source the nightly baseline target uses — one copy, no drift)
- **Its own conventions**: `cn()`, `cva` variants, a house radius/border/surface vocabulary
- **`AGENTS.md`** written the way a real app writes one — including a line that names Tailwind as
  the house system. That contradiction is a _condition_, not an accident (§6)
- **A canonical semantic mapping** (`lib/status.ts`) — domain status → colour, the ground truth for
  semantic-fidelity scoring
- **A hand-rolled precedent** (`components/entity/build-hovercard.tsx`) — hover-only, no keyboard
  path, custom z-index. Removable, which makes the precedent factor possible
- **A hand-rolled dense picker** (`components/env-picker.tsx`) — bespoke keyboard handling, no
  visible focus ring. The a11y-delta baseline
- **A plain data layer** (`lib/entities.ts`) — no provider, no cache

Astryx (core + theme + CLI) is symlinked into `node_modules` in **every** arm, exactly as
`setup-environment.mjs` does it. Availability is never the variable.

## 6. Conditions (the guidance surface — the only variable)

Five arms, floor to ceiling. Everything else — app, prompts, packages, model — is identical.

| id             | Guidance the agent can find                                                                                                                                                                           | Role                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `a0-installed` | App's own `AGENTS.md` + README only. Astryx present in `node_modules`, unannounced.                                                                                                                   | **Floor**                               |
| `a1-init`      | `a0` + the real `astryx init` block in `AGENTS.md` (what we ship today)                                                                                                                               | Shipped default                         |
| `a2-ladder`    | `a1` + an explicit selection ladder: app component → Astryx component → Astryx primitives → custom, and where a custom one goes ([#3212](https://github.com/facebook/astryx/issues/3212)'s candidate) | Candidate                               |
| `a3-aligned`   | `a2` + the app's own guidance no longer contradicts it ("moving to Astryx" instead of "Tailwind is the house system")                                                                                 | Candidate                               |
| `a4-directed`  | `a3` + told outright to use Astryx where it fits                                                                                                                                                      | **Ceiling** (capability, not discovery) |

`a4` is not a shipping recommendation — it measures what's achievable when the decision is removed,
so a shortfall there is a **product** gap, not a guidance gap. Keeping those two apart is why the
ceiling arm is here at all.

## 7. Prompt battery (`prompts.json`)

Feature requests against the existing app. They describe the user experience, name no component,
and never mention Astryx, Tailwind, or the CLI (Checker Protocol §3).

| Tier                               | What it probes                                                        | Expectation                                                             |
| ---------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **T1 · finished component exists** | An Astryx component maps 1:1                                          | Easy win; a floor arm that misses these is not looking at all           |
| **T2 · compose from primitives**   | Nothing maps 1:1; the job is composition                              | **The differentiator.** Observed near-zero adoption here even with docs |
| **T3 · precedent nearby**          | A hand-rolled version of something similar already exists in the tree | Does precedent beat guidance? (crossed with §8)                         |
| **T4 · interaction / a11y**        | Existing widget can't be used from the keyboard                       | Where adoption should pay for itself                                    |
| **T5 · semantics & parity**        | Must match the app's canonical mapping and its neighbours visually    | Where adoption silently costs                                           |

10 prompts, stratified across tiers. `expectedAdoption` (the component or primitives an informed
reviewer would reach for) is **evaluation-only** and never enters a prompt.

## 8. The precedent factor

Crossed with the T3 prompts only, because it's the cheapest way to measure the strongest effect
observed in the real adoption: **an agent matches the precedent in the tree over the guidance in
the docs.**

- `--precedent keep` — the hand-rolled component stays
- `--precedent strip` — the same prompt, with that file (and its imports) removed

Same prompt, same guidance, one file's difference. If `strip` adopts and `keep` doesn't, precedent
is dominant and the lever is a codemod/lint, not documentation.

## 9. Harness design

Three mechanisms, all borrowed from the existing harness where one already exists:

**Git-baselined sandbox (new).** Each run gets a copy of the fixture, `git init`, one baseline
commit. The agent's output is the **diff** — which gives file-level blast radius, "did it touch
globals", and new-file placement for free, deterministically. No output-format instructions beyond
"work in this app".

**Ground-truth CLI log (reused from `cli-discovery-test`).** `node_modules/.bin/astryx` is a shim
that appends `{ts, argv, status}` before exec-ing the real CLI. Self-report is not trusted —
in the discovery pilot self-reports diverged from the log repeatedly. The `ts` is what makes
"searched **before** deciding" measurable: shim entries before the first write to the diff.

**Isolation (reused).** Sandboxes are built outside the repo, packages copied not symlinked when
run isolated, and agents are spawned fresh per `(prompt × condition × rep)` with the anti-context
preamble. The discovery pilot's §14 finding — an in-repo run silently inherited this repo's own
agent rules and invalidated the numbers — applies here verbatim.

## 10. Measurement

**Deterministic first** (`adoption-eval.ts`) — every dimension in §3 that can be computed is
computed from the diff + the log: import graph, escape-hatch counters, token discipline, semantic
mapping vs `lib/status.ts`, a11y statics, blast radius, verification ordering, setup failures. No
LLM in this path, so it is identical across arms by construction (Checker Protocol §1).

**Runtime a11y, deferred.** Static a11y scoring is a known false positive
([#4145](https://github.com/facebook/astryx/issues/4145)). This test therefore scores an a11y
_delta_ against the code it replaced, from a small, explicit set of statics, and defers the real
number to a runtime pass through the existing preview pipeline. Not wired yet; called out rather
than faked.

**Judge last.** One judge agent, all arms side by side, for what statics can't see: was the
rejection reasoning sound, does it look like it belongs, is the composition sensible. Sub-agents
never score their own work.

## 11. Pre-registered decision rule

Set before any run, so the result can't be read backwards:

- A guidance change **ships** if it lifts T1+T2 adoption by **≥ 25 points** over `a0-installed`
  with the lower CI bound above `a0`'s upper bound, **and** does not increase mean escape-hatch
  count per adopted component.
- **Adoption without parity doesn't count.** A diff that adopts and then needs > 3 escape hatches
  to match its neighbours is scored as a _product_ finding and filed against the component, not
  as a guidance win.
- If `a4-directed` (ceiling) can't clear a tier, that tier is a **capability gap** — guidance work
  stops and an issue gets filed instead.
- Precedent is judged only on the `keep` vs `strip` delta within one arm, never across arms.

## 12. Risks & limitations

- **One fixture, one app shape.** Findings generalize to "dense console app with an existing
  utility-CSS system", not to all apps. A second fixture (marketing-style, different conventions)
  is the obvious follow-up if the first shows separation.
- **The fixture's flaws are authored.** Its precedent components are deliberately imperfect. That's
  the realism, but it also means the a11y delta is partly a property of the fixture — hence
  measuring _delta_, and holding the fixture constant across arms.
- **Escape-hatch counting is heuristic.** It counts syntax, not intent; a legitimate one-off layout
  class scores the same as a workaround. Reported as a count with examples, never as a grade.
- **Agent-harness dependence.** Whether `AGENTS.md` is auto-loaded is a property of the harness,
  not the package (`cli-discovery-test` §9). Record the agent with every result.
- **Cost.** 5 arms × 10 prompts × K reps is a bigger matrix than the nightly. Pilot on T1+T2 only
  (floor vs ceiling) before spending on the full grid.

## 13. Checker Protocol compliance

| Invariant                     | How this honors it                                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| §1 Fair evaluators            | Same deterministic evaluator and same judge rubric for every arm; the evaluator never sees the condition id            |
| §2 Only the SUT varies        | One fixture commit, one prompt set; arms differ **only** in guidance files. Astryx is installed in all arms            |
| §3 Never leak the answer      | Prompts name no component, no system, no CLI; `expectedAdoption` is evaluation-only. The floor arm gets no hint at all |
| §4 Representative environment | Real shadcn source, real Tailwind, real `astryx init` output, packages as a consumer receives them                     |
| §5 Context-free sub-agents    | Fresh agent per run, sandboxes built outside the repo, anti-context preamble, no shared session                        |

## 14. Status

**Implemented and verified without agents** (the mechanism, not the finding):

- `fixture-app/` — the app, its conventions, its precedent, its canonical mapping
- `setup-adoption.mjs` — builds `condition × prompt × rep` sandboxes, git-baselines each, installs
  the logging shim, applies guidance patches, honours `--precedent keep|strip`
- `adoption-eval.ts` — the deterministic scorer over a sandbox diff + log
- `adoption-aggregate.ts` — per-arm rates with Wilson CIs, the results table
- `adoption-eval.test.ts` — the scorer's own tests: a known-good adopted diff and a known-bad
  hand-rolled diff, asserting the checks separate them **and** flag the specific frictions

**Not done:** no agent has run this yet. No findings, no scores, no recommendation. Runtime a11y is
deferred (§10). `a2`/`a3` guidance text is a first draft and should be treated as a strawman to
iterate on, not a proposal.

**Next:** pilot `a0-installed` vs `a4-directed` on T1+T2, K=3, one agent — enough to answer "do the
arms separate at all" before anyone pays for the full grid.

## 15. Folder layout

```
internal/vibe-tests/adoption-test/
├── PLAN.md                 # this file
├── conditions.json         # the guidance matrix (independent variable)
├── prompts.json            # the battery, tiered
├── fixture-app/            # the existing app (versioned, not generated)
├── guidance/               # the guidance patches applied per condition
├── fixtures/               # sample diffs used to test the evaluator itself
├── setup-adoption.mjs      # sandbox builder
├── adoption-eval.ts        # deterministic scorer
├── adoption-eval.test.ts   # the scorer's tests
├── adoption-aggregate.ts   # rates + results table
└── results/                # (gitignored)
```
