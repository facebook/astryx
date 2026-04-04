# Template Reference Vibe Test — Findings

**Date:** 2026-04-04
**Question:** Does giving LLMs template composition info improve layout quality?

## Configs

| Config                       | What it adds                                             | Token cost   |
| ---------------------------- | -------------------------------------------------------- | ------------ |
| A: Control                   | Stale CLAUDE.md (3 templates: blank, login, table)       | ~680 chars   |
| B: Template list             | All 16 templates with component compositions             | ~1,730 chars |
| C: Skeletons + spatial rules | B + JSX structure skeletons with padding/gap annotations | ~3,960 chars |

## Results (9/18 completed — 4 A, 2 B, 3 C)

### Layout Component Adoption

| Signal            | A (control) | B (templates) | C (skeletons) |
| ----------------- | :---------: | :-----------: | :-----------: |
| Used XDSLayout    |  1/4 (25%)  |  2/2 (100%)   |  3/3 (100%)   |
| Used hasDivider   |  1/4 (25%)  |  2/2 (100%)   |  3/3 (100%)   |
| Used XDSGrid      |  0/4 (0%)   |   1/2 (50%)   |  0/3 (0%)\*   |
| Used XDSSection   |  0/4 (0%)   |   0/2 (0%)    |   1/3 (33%)   |
| Used LayoutFooter |  0/4 (0%)   |   0/2 (0%)    |   1/3 (33%)   |

### Key Head-to-Head Comparisons

**dd-1 (table with search) — A vs C:**

- A: No Layout. Raw VStack + stylex maxWidth:1200. 8 distinct gap values.
- C: Layout → LayoutHeader(hasDivider) → LayoutContent → Table. 1 gap value. Clean.

**dd-5 (email inbox) — A vs B vs C:**

- A: No Layout. Toolbar for bulk actions. maxWidth:960 in stylex.
- B: Layout+LayoutHeader+LayoutContent. TabList for filters. hasDivider.
- C: Layout+LayoutHeader+LayoutContent+LayoutFooter for bulk actions. hasDivider×2.

**dd-3 (product grid) — A vs B:**

- A: Raw CSS grid (auto-fill minmax). No XDS layout structure.
- B: XDSGrid (columns=4, minChildWidth=240) + Layout+LayoutHeader+LayoutContent.

### Spatial Decision Quality

| Metric                    |     A (control)     | B (templates)  | C (skeletons) |
| ------------------------- | :-----------------: | :------------: | :-----------: |
| Gap value diversity       | High (4-8 per file) | Moderate (2-3) |   Low (0-2)   |
| Ad-hoc maxWidth in stylex |        100%         |       0%       |      0%       |
| hasDivider adoption       |         25%         |      100%      |     100%      |

## Interpretation

1. **Config B is surprisingly effective.** Just listing "table: Layout + LayoutHeader + LayoutContent + Table" drove Layout adoption from 25% → 100%. Cost: ~1KB.

2. **Config C adds spatial precision.** Skeleton annotations teach where padding lives. C agents produce fewer, more intentional gap values and use LayoutFooter/Section — components A never discovered.

3. **The biggest win is structural.** Going from "no page shell" to "Layout + LayoutHeader + LayoutContent" is the dominant effect. This alone would improve design judge layout fidelity scores.

4. **hasDivider = 100% in B/C vs 25% in A.** Template references teach composition patterns, not just component names.

5. **Ad-hoc maxWidth disappears.** A configs all invent their own page width constraints (1200, 960, 640). B/C let Layout/AppShell handle it — zero ad-hoc widths.

## Recommendation

**Ship Config B now.** ~1KB addition to agent-docs, zero new infrastructure, drives Layout adoption 25% → 100%.

**Build Config C next.** Skeleton extractor + spatial rules add real value for padding/gap precision. Worth a follow-up PR.

### Concrete steps:

1. Update `agent-docs.mjs` `generateCompressedIndex()` to include template compositions
2. Add `keywords` and `components` fields to `TemplateDoc` type in `docs-types.ts`
3. Run `xds agent-docs` to refresh CLAUDE.md
4. Future: `xds template --skeleton <name>` CLI command for Config C
