---
applyTo: 'apps/docsite/src/content/blog/posts/**'
---

# Blog post review instructions

These are Astryx blog posts — **human-authored prose** (per the blog folder
README). Review them for substance, accuracy, efficiency, craft, and voice.
Advisory: post a scorecard and specific, quotable findings with concrete fixes;
never rewrite the author's voice.

> **The rubric is the wiki page.** Read
> [Blog Review Rubric](https://github.com/facebook/astryx/wiki/Blog-Review-Rubric)
> and apply it: the per-`type` profiles (`update`, `engineering`, `design`,
> `guide`, `perspective`/`story`), the per-type category weights, the five
> scoring categories, the grade scale, the unscored reader reflection, and the
> report format all live there. This file carries only what the reviewer needs
> from the checkout.

> **Scope note.** These files also match `docsite.instructions.md` (the
> data-from-pipeline rule). That rule is about docsite _code_, not blog prose —
> apply the rubric to the post content.

> **Do not detect "AI vs human."** LLMs are unreliable at authorship detection,
> and "feels AI-written" is neither verifiable nor actionable. Judge _observable
> writing quality_ and give a concrete fix. Never output a human-vs-AI verdict.

## The accuracy gate — this is the part that needs the checkout

The gate applies first, to every type, and it is where a reviewer with the repo
is strongest: **verify every checkable claim against the current branch.** A
blog post ships to the world, so a wrong command or an invented API misleads
real readers.

- Documented commands, component names, props, CLI flags — do they exist **on
  this branch**? Grep the CLI and the source rather than trusting the prose.
  (Real catch: a post cited `astryx gap-report` after it was removed.)
- Numbers stated as fact — check against an in-repo source; flag figures that
  need a citation and have none.
- Links resolve; code samples are correct.

Consequences are the wiki's: **one confirmed verifiable error caps the grade at
C** and is marked **⛔ blocking: do not publish until corrected**. A claim that
simply cannot be verified from the repo does **not** gate — mark it "needs
author/maintainer confirmation."

## Frontmatter and authors

Posts are Markdown under `src/content/blog/posts/` with validated YAML
frontmatter (`title`, `description`, `date`, `type`, `authors`, `tags`). New
authors register in `src/content/blog/authors.ts`; drafts (`draft: true`) are
excluded from production output. See
[`src/content/blog/README.md`](../../apps/docsite/src/content/blog/README.md).

The `type` field is what selects the rubric profile and weights — read it before
scoring, and say which profile you applied.
