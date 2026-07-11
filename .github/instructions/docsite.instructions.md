---
applyTo: "apps/docsite/**"
---

# Docsite review instructions

The docsite (`apps/docsite/`) is a Next.js + StyleX app that documents Astryx.
Its defining constraint is **how it handles data** — review against
[`apps/docsite/README.md`](../../apps/docsite/README.md), specifically the
"How It Works" and "The Rule" sections.

## Step 0 — Triage first

Fast triage before depth. The docsite ships app code (not published packages),
so consumer-breaking API changes aren't the concern — **blast radius** is:

- **Shared component / util** (e.g. a `components/blog/BlogCard`, a shared layout)
  → higher stakes: a change ripples across pages. Check every call site, and
  that a new prop is **optional** (additive) so existing usages don't break.
- **Single page / one-off** → lower stakes, contained.

Then pick depth: **fast path** for a contained single-page or copy tweak (verify
the data rule + accuracy, approve); **standard path** for a shared-component or
layout/structural change (full data-rule + idiomatic + mobile review below).
State it briefly, e.g. `Triage: shared BlogCard, additive optional prop → standard`.

## The data rule (primary review focus)

**All data comes from the build-time pipeline. Never hardcode package names,
component lists, or theme objects in page code.**

`scripts/generate-data.mjs` scans the monorepo and writes typed registries into
`src/generated/` (which is gitignored). Pages import from those registries and
render whatever the pipeline found. If a change needs data about the monorepo,
it belongs in `generate-data.mjs` and is consumed from a registry — not inlined
in a page.

Flag as violations:

- Importing a built theme directly in a page (e.g.
  `import {fooTheme} from '@astryxdesign/theme-foo/built'`). Use `themeObjects`
  from the generated `themeRegistry` instead.
- Hand-maintained arrays of component names. Use `componentRegistry`.
- Package-name switches like `if (pkg === '@astryxdesign/core')`. Let the
  pipeline classify packages.
- Any hardcoded package/version/description that duplicates what
  `packageRegistry`, `blockRegistry`, `templateRegistry`, `docsRegistry`, or
  `showcaseRegistry` already provide.

New source? The registries auto-discover it: a new theme package or a new
`packages/<name>/` is picked up by `pnpm generate` after it's added to
`apps/docsite/package.json` dependencies — no manual page wiring.

## Blog content

Blog posts are human-authored Markdown under `src/content/blog/posts/` with
validated YAML frontmatter (`title`, `description`, `date`, `type`, `authors`,
`tags`). Follow
[`src/content/blog/README.md`](../../apps/docsite/src/content/blog/README.md);
new authors register in `src/content/blog/authors.ts`. Drafts
(`draft: true`) are excluded from production output.

## Idiomatic Astryx (nudge, don't block)

The docsite is Astryx's own showcase — it should be built *with* Astryx, not
around it. When a change reaches for raw HTML/CSS where an Astryx primitive
exists, **nudge** toward the idiomatic path (a suggestion, not a hard block —
the docsite has real app-specific needs the component set won't always cover):

- Compose from Astryx components/primitives over raw elements — `VStack`/
  `HStack`/`Grid`/`Center`/`Card` over `<div>`, `Text`/`Heading` over text tags,
  `Button`/`Link`, `Table`, `List`, `Icon` (never raw `<svg>` as an icon).
- Style through props + semantic tokens (`xstyle`, `gap`, `padding`, `variant`),
  not custom CSS or raw color/spacing values. Prefer attaching behavior via the
  system's hooks/props over adding a wrapper element (see the packages reviewer's
  "avoid unnecessary wrappers" guidance — it applies here too).
- If the docsite genuinely needs something the component set lacks, that's a
  signal worth surfacing: note it as a possible gap to file upstream, rather than
  quietly forking a bespoke pattern in page code.

The bar is lighter than for `packages/**` — the docsite ships app code, not
published components — so frame these as "here's the idiomatic way" nudges, and
reserve firm flags for raw CSS/hardcoded tokens that have a clear Astryx
equivalent.

## Mobile-friendliness

Docsite pages must hold up on small screens. Review any layout/structural change
for how it degrades on mobile, and flag the common failure modes:

- **Side panels / multi-column layouts.** A `start`/`end` `LayoutPanel`, a
  sidebar, or a two-pane split should collapse to an **inline / stacked**
  treatment on small screens (panel becomes a top section, a drawer, or a
  disclosure) — not sit as a squeezed column or push content off-screen. Flag a
  new side panel or column split with no small-screen story.
- **Min-widths that don't shrink.** A fixed `width`/`minWidth` (or a
  `min-content` grid track) that exceeds a phone viewport causes horizontal
  overflow. Prefer `Grid` with `minChildWidth` (reflows automatically),
  `max-width` over fixed `width`, and `minWidth: 0` on flex/grid children that
  must be allowed to shrink (the classic fix for a child refusing to shrink
  inside a flex row). Flag fixed widths on content that needs to fit narrow
  screens.
- **Overflow & tap targets.** Wide content (tables, code blocks, long rows)
  should scroll within its container, not blow out the page width. Interactive
  targets should stay comfortably tappable (~44px) at mobile sizes.
- **Prefer CSS-first responsiveness.** The docsite leans on `useMediaQuery` /
  `isMobile` JS in places; for *layout* that CSS can express, prefer
  `@container` queries, `Grid` `minChildWidth`, `flex-wrap`, and
  `clamp()`/`min()`/`max()` over JS breakpoint branching (fewer hydration/SSR
  mismatches, no layout flash). JS breakpoints are fine when the change is
  genuinely structural (swapping a panel for a drawer), but flag JS used for what
  a media/container query would handle.

If verifying a responsive claim needs a real viewport (does this actually reflow
at 375px?), say so and route it to human/preview verification rather than
asserting it works from the diff.

## Everything else

Docsite-only or CLI-docs-only changes are a light review overall — the
data-from-pipeline rule is the primary gate, plus the idiomatic-Astryx and
mobile checks above. Keep code comments minimal.
