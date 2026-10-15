# List edge naming vibe test

**Status:** ad-hoc · rounds 1 and 2 complete · recommendation applied in the PR, pending the List owner's approval
**Related:** [`../README.md`](../README.md) (Checker Protocol), [API Arbitration](https://github.com/facebook/astryx/wiki/API-Arbitration), [Designing Vibe Tests](https://github.com/facebook/astryx/wiki/Designing-Vibe-Tests), [PR #7592](https://github.com/facebook/astryx/pull/7592)

---

## 1. The question

[PR #7592](https://github.com/facebook/astryx/pull/7592) gives `List` one prop that
picks where each row's text, highlight, and dividers sit relative to the list's sides
and a surrounding `Card`, `Section`, or `Dialog`. There are four looks:

| look        | row text                                  | highlight and dividers                                     |
| ----------- | ----------------------------------------- | ---------------------------------------------------------- |
| 1 (default) | a short distance in from the list's sides | span the list, a little beyond the text                    |
| 2           | at the list's sides, on a heading's line  | stop at the text                                           |
| 3           | on a heading's line                       | a little beyond the text, short of the container's borders |
| 4           | on a heading's line                       | reach the container's borders, like table rows             |

**What should the prop and its four values be called?** When the test ran, the PR
shipped `edge` with `inset · flush · outset · bleed`.

## 2. Design

Four-ingredient intake per [Designing Vibe Tests](https://github.com/facebook/astryx/wiki/Designing-Vibe-Tests).

**Goal and measure.** A naive agent is told what a layout needs and never told a prop or
value name. Scored on correctness, invented props or styles, directness, and confidence
calibration. Tie-break: fewer misreads and invented props, then plainer words.

**Three probes.**

| probe   | what the agent gets                                  | what it measures                              |
| ------- | ---------------------------------------------------- | --------------------------------------------- |
| use     | its arm's reference doc and one layout prompt        | can it pick the right value from the docs?    |
| recall  | a doc that describes the four looks but names no API | what API does it expect? one prop or several? |
| reading | no doc, only code with one value in a `Card`         | does the name alone predict the rendering?    |

**Use battery.** Seven prompts in [`prompts.json`](prompts.json). None name a prop, a
value, or the words padding, inset, edge, margin, or align.

|     | layout                                                                           | correct look                             |
| --- | -------------------------------------------------------------------------------- | ---------------------------------------- |
| p1  | static list with dividers under a page heading, no card                          | 2                                        |
| p2  | static list in a card, lines touch the card's borders                            | 4                                        |
| p3  | static list in a card, lines stop short of the borders                           | 2                                        |
| p4  | clickable folders in a card, highlight with room that stays clear of the borders | 3                                        |
| p5  | clickable menu in a card, highlight touching the card's sides                    | 4                                        |
| p6  | recent-files popup, nothing to line up with                                      | **leave it unset** (negative control)    |
| p7  | sidebar list under a heading, no card, aligned text and a roomy highlight        | **no single value does both** (conflict) |

**Arms.**

| arm | round | prop           | look 1   | look 2  | look 3    | look 4  |
| --- | ----- | -------------- | -------- | ------- | --------- | ------- |
| A   | 1     | `edge`         | `inset`  | `flush` | `outset`  | `bleed` |
| B   | 1     | `edge`         | `padded` | `flush` | `hanging` | `bleed` |
| C   | 2     | `rowAlignment` | `inset`  | `flush` | `outset`  | `bleed` |

Arm B swaps the two names most likely to mislead: `outset` is rare, and `inset`
already names a different kind of list on some platforms. Arm C is round 1's most common recalled
prop name, added in round 2 as planned.

**Orchestration.** 63 isolated agents, one per task, all on one model at one setting:
round 1 had 14 use, 6 recall, and 10 reading agents; round 2 had 7 use (arm C) and 26
reading agents. Round 2's reading probe adds samples where round 1 split or was thin,
tries both prop names, and adds a condition that shows the type an editor displays on
hover. A scripted checker ([`check.mjs`](check.mjs)) scores every value choice and
multiple-choice answer. One judge agent, seeing all arms side by side, scored round 1's
use replies on the rubric; round 2's outcomes were all scriptable.

### Fairness (Checker Protocol)

| Invariant                     | How this honors it                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §1 Fair evaluators            | The checker applies one rule to every arm. The judge scored round 1 on one rubric with all arms side by side. Blinding is impossible because the value names show the arm, so the judge was told to score the rubric, not its own taste, and to audit doc parity first. It found none                                                                                                         |
| §2 Only the SUT varies        | [`gen-docs.mjs`](gen-docs.mjs) renders every arm from one template and fails unless arm B with its two names mapped back, and arm C with its prop name mapped back, equal arm A byte for byte (507/507/507 words). The prose never uses a word that echoes one arm's names (pad, inset, inside, outset, outside, hang), and the recall doc's prose never uses a word that would name the prop |
| §3 Never leak the answer      | Ground truth lives in `prompts.json` and never reached a generating agent. The prompts were scanned for padding, inset, edge, margin, align, and indent                                                                                                                                                                                                                                       |
| §4 Representative environment | A reference doc is what a consumer's agent reads. The reading probe is what a reviewer sees in code, with and without the editor's type hover                                                                                                                                                                                                                                                 |
| §5 Context-free               | Each agent started fresh and received only the exact path of its own task file, in a directory it could not list. Each of the 63 test agents' logs shows exactly one tool call: reading that file                                                                                                                                                                                             |

---

## 3. Findings

### 3.1 With the docs, the names do not change what agents build

**18 of 18 scored use prompts were correct across all three arms**, with no invented props
and no custom styles. All three p6 agents left the prop unset. All three p7 agents saw
that look 3 needs a container: arms A and C chose look 2 and said the highlight would be
tight (confidence 2/5), and arm B wrapped the heading and list in a `Section` (3/5).

As in earlier naming tests, once the API is documented, agents pick by the look
descriptions ("like table rows", "without reaching those borders"), not by the names.
Everything below is about what agents expect and what they read.

### 3.2 One prop with four values is what agents expect

All six recall agents wrote one prop with four values. None wrote booleans, and all six
rejected them unprompted: a yes/no switch cannot pick among four looks, and several
switches allow combinations like "both on" that mean nothing.

### 3.3 `inset` is misread in code; `padded` is read better

| value    | bare code | with the editor's type |
| -------- | --------- | ---------------------- |
| `inset`  | **0/9**   | 2/3                    |
| `padded` | 5/9       | 3/3                    |

Every bare `inset` reader said the text lines up with the heading, which is the opposite
of what look 1 does. They read it as "inset inside the card's padding" (round 1:
_"'inset' suggests the list sits inside the card's padding, so the row text lines up with
the heading"_). The four `padded` readers who missed made the same placement mistake by
another route: they assumed the rows grow outward around their padding, so the text stays
on the heading's line.

Recall points the other way: five of six recall agents named look 1 `inset`, and three
chose `outset` for look 3 because it pairs with `inset`. The sixth chose `padded` only
because its prop was already called `rowInset`, and it produced `padded · flush · outset ·
bleed` exactly. Agents guess `inset`, but they misread it.

### 3.4 `outset` and `bleed` are read right every time

`outset` 4/4, `hanging` 2/2, and `bleed` 3/3 were fully right from code alone. In
recall, `outset` named look 3 in four of six samples (`hanging` and `bleed` once each).
Four recall agents considered `hang` or `hanging` and rejected it: two as typography terms
(hanging punctuation, a hanging indent) and two because `outset` pairs with `inset`.
`bleed` named look 4 in four samples (`edgeToEdge` and `fullBleed` once each).

### 3.5 `flush` is what everyone reaches for, but its highlight is a guess

All six recall agents named look 2 `flush`, and every use agent applied it correctly. From
code alone, all three readers put the text in the right place, but **none** put the
highlight at the text: one put it a little beyond the text, and two ran it and the dividers
to the card's borders. The docs have to say plainly that look 2's highlight and dividers
stop at the text.

### 3.6 Agents guess alignment-style prop names, but those do no better

Recall produced `rowAlignment` 3, `rowAlign` 1, `rowInset` 1, and `edge` 1. But arm C
(`rowAlignment`) scored the same as `edge` in use (6/6), and read no better:

| value    | `edge` | `rowAlignment` |
| -------- | ------ | -------------- |
| `inset`  | 0/6    | 0/3            |
| `padded` | 4/6    | 1/3            |
| `outset` | 2/2    | 2/2            |
| `bleed`  | 1/1    | 2/2            |

Recall agents themselves rejected bare `align` and `alignment` as left, center, or right
text alignment. In this codebase, `Item` already has an `align` prop for the vertical
alignment of its start and end content, so `rowAlignment` on `List` would sit next to an
unrelated `align`.

### 3.7 Doc gaps the use probe surfaced (not naming)

1. **Which containers count.** All three p6 agents asked whether a popup counts as a
   container for looks 3 and 4.
2. **Whether start content counts as text.** All three p4 agents were unsure whether the
   icon in `startContent` lines up with the heading or the label does.
3. **Sidebars.** No look aligns the text and keeps highlight room without a container. One
   p7 agent in three used a `Section` wrapper; the other two considered it and held back
   because the docs do not say whether a `Section` looks like a box. The docs could show
   the pattern.

---

## 4. Recommendation

**Keep `edge` and one prop with four values. Rename look 1 from `inset` to `padded`. Keep
`flush`, `outset`, and `bleed`.** Applied in [PR #7592](https://github.com/facebook/astryx/pull/7592),
with the List docs covering §3.5 and the three gaps in §3.7. The List owner approves it
with the PR.

- One prop with four values, because recall produced it 6/6 and the looks exclude each
  other (§3.2).
- `edge`, because the alternative agents guess performs no better and collides with
  `Item`'s `align` (§3.6), and `edge` matches the existing edge-compensation vocabulary.
- `padded` for look 1, because `inset` was misread 0/9 from code and `padded` 5/9; the
  gap narrows, to 2/3 against 3/3, only when the editor shows the full type (§3.3). The
  cost is the `inset`/`outset` pair that recall agents liked.
- `outset` and `bleed`, because they were read right every time and recalled most
  (§3.4).
- `flush`, because everyone reaches for it, with docs that state where its highlight and
  dividers stop (§3.5).

## 5. Caveats

- **Small samples.** Reading has 2 to 9 samples per condition and recall has 6. The
  `inset`/`padded` split (0/9 against 5/9) is the only reading result wide enough to
  matter on its own.
- **One model.** All agents ran on one model at one setting, so they share priors and are
  not independent people.
- **The use probe hit its ceiling.** The prompts echo the look descriptions, so use cannot
  separate the arms.
- **One composition.** Reading covers one value at a time in a `Card` under a heading.
- **Recall wording.** The recall doc's phrases ("a short distance", "extend a little
  beyond") may prime some words.
- **The recommended set was never used as a whole.** Arm B paired `padded` with `hanging`,
  and no arm paired it with `outset`. With use at its ceiling, that is a small risk.
- **One author** wrote the battery and the candidates.

## 6. Folder layout

```
internal/vibe-tests/list-edge-naming-test/
├── PLAN.md          # this file: design, findings, recommendation
├── prompts.json     # battery, ground truth, recall and reading probes, round 2 conditions
├── gen-docs.mjs     # renders every arm's doc from one template and proves parity
├── build-tasks.mjs  # assembles one self-contained task per agent
├── check.mjs        # scripted scoring of value choices and reading answers
├── docs/            # the generated docs, one per arm
└── results/         # (gitignored) tasks, the agents' replies, check.md, judge
```

To rerun: `node gen-docs.mjs`, then `node build-tasks.mjs` (round 1) and
`node build-tasks.mjs --round=2`. Run one fresh agent per task file, save each reply to
`results/out/<task id>.md`, then run `node check.mjs`.
