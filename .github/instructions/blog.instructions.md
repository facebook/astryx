---
applyTo: "apps/docsite/src/content/blog/posts/**"
---

# Blog post review instructions

These are Astryx blog posts — **human-authored prose** (per the blog folder
README). Review them for substance, accuracy, efficiency, craft, and voice.
Advisory: post a scorecard and specific, quotable findings with concrete fixes;
never rewrite the author's voice.

> **Scope note.** These files also match `docsite.instructions.md` (the
> data-from-pipeline rule). That rule is about docsite *code*, not blog prose —
> apply the rubric below to the post content.

> **Do not detect "AI vs human."** LLMs are unreliable at authorship detection,
> and "feels AI-written" is neither verifiable nor actionable. Judge *observable
> writing quality* and give a concrete fix. Never output a human-vs-AI verdict.

## 1. Read the post, then read its `type` — the type sets the bar

A changelog digest and a philosophy essay are good in different ways; don't judge
one by the other's standard. Match `type` to a profile and use its weights:

| `type` | Profile | Good looks like | Don't penalize for |
|---|---|---|---|
| `update` | Changelog digest | Scannable; accurate commands/versions; each change stated once with its user-facing effect | Lacking narrative/journey |
| `engineering` | Technical deep-dive | Specifics: real numbers, named systems, code, the journey (what was tried, what broke, trade-offs) | Length that carries detail |
| `design` | Design rationale | The *why*, trade-offs, principle→application | Fewer hard numbers than engineering |
| `guide` | How-to | Correct, complete, followable steps | Being dry/instructional |
| `perspective`/`story` | Opinion/narrative | A real point of view, authentic specifics, community warmth | Lacking benchmarks/code |

**Per-type weights (each column sums to 100):**

| Category | `update` | `engineering` | `design` | `guide` | `perspective`/`story` |
|---|---|---|---|---|---|
| Substance & purpose | 20 | 30 | 30 | 25 | 30 |
| Accuracy | 30 | 25 | 20 | 30 | 10 |
| Information efficiency | 25 | 15 | 15 | 20 | 15 |
| Craft | 15 | 20 | 20 | 15 | 20 |
| Voice & fit | 10 | 10 | 15 | 10 | 25 |

## 2. Accuracy gate (applies first, all types)

A blog post ships to the world; a wrong command or invented API misleads real
readers. **Verify checkable claims against the current branch** (grep the CLI/
source) — this is where the reviewer is strongest.

- Documented commands, component names, props, CLI flags — do they exist on this
  branch? (Real catch: a post cited `astryx gap-report` after it was removed.)
- Numbers stated as fact — check against an in-repo source; flag figures that
  need a citation and have none.
- Links resolve; code samples are correct.

**One confirmed verifiable error caps the grade at C** and is marked
**⛔ blocking: do not publish until corrected**. Multiple/misleading errors cap
at D. A claim that simply can't be verified from the repo does **not** gate —
mark it "needs author/maintainer confirmation."

## 3. Score the five categories (out of each type's weight)

- **Substance & purpose** — does the post have a clear reason to exist and deliver
  on it (a gratitude/PR post with no point beyond "thanks" is thin)? Are
  takeaways *earned* to the profile's standard, not just asserted? Does
  title/description match the payload?
- **Accuracy** — how much verifiable surface it got right (the gate above is the
  teeth).
- **Information efficiency** — flag repetition (the same fact in intro + middle +
  conclusion is a *structural* problem, name where it belongs), padding (the
  "sounds nice, deletes clean" sentence), and dead clichés (Orwell: cut every
  word you can). Judge information *per word*.
- **Craft** — observable quality, **signal not ban**, never dock for one token.
  Tells: editorial labels as praise ("robust," "seamless," "powerful"); hollow
  hedging ("can help," "plays a key role"); over-signposting ("It's worth noting
  that"); defensive framing ("it's not X, it's Y"); self-labeled significance
  ("Key insight:"); puffery/peacock ("stands as a testament," "rich tapestry");
  false range ("from X to Y" bounding nothing); vague authority ("studies show").
  **Structure (Gopen & Swan):** old-before-new (open with context, land the new
  point in the sentence's stress position); topic position (a sentence should
  name what it's about up front). Antidotes that raise the score: concrete
  numbers, named people/tools, real anecdotes, admitted trade-offs, a specific
  opinion, dry humor.
- **Voice & fit** — **do not homogenize.** Aim community-forward (warm, direct,
  credits people, invites participation) while preserving the author's register.
  **Read-it-aloud test:** sounds like a marketing page or school essay → flag;
  sounds like explaining it to a coworker → right. **Relax on clearly human,
  distinctive posts** — a strong idiosyncratic voice outranks the rubric.

Grade: A 90+, B 75+, C 60+, D 40+, F <40 (after the gate).

## 4. Reader reflection (unscored — a mirror for the author)

Never changes the score. Two candid, descriptive lines:
- **How a reader might feel** after one pass (energized, informed, included,
  impressed, confused, sold-to, bored).
- **What actually sticks** — the one thing they take away. If it *differs* from
  what the post intended to land, name the gap — that's the most useful signal an
  author can get.

## Reporting

Post: type + profile, letter grade (+ ⛔ if gated), the reader-reflection mirror,
a scorecard (score / this type's weight per category), findings with quoted lines
(accuracy first), and prioritized concrete fixes. **Never a full rewrite — respect
the author's voice.**
