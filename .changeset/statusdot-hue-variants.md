---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] StatusDot: the nine hue variants — `blue`, `cyan`, `green`, `orange`, `pink`, `purple`, `red`, `teal`, `yellow`

The dot had the five sentiment variants and nothing else, so a consumer
colouring dots by category rather than by health — a legend key, a project
colour, a tab strip's per-section marker — had no variant to reach for and
fell back to overriding the fill. `Badge` already carries exactly this set
under exactly these names; the dot now matches it, so the two agree when they
sit in the same row.

The dot paints from the solid `--color-text-<hue>` stop, not the
`--color-background-<hue>` wash `Badge` fills its pill with: the wash is 20%
alpha, and on an 8px shape it lands at 1.2–1.5:1 against the page instead of
the ≥8.3:1 the solid stop holds in both colour schemes. A user-supplied `icon`
paints from the surface as ink, the same pairing `neutral` already uses,
measured at ≥8.3:1 on every hue in both schemes.

No new tokens, and no change to the five existing variants.

@cixzhang
