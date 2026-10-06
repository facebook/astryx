---
'@astryxdesign/cli': patch
---

[fix] Search: differentiate all-word matches by total quality; index themes

Within the all-words tier, every candidate whose strongest token hit was a
keyword scored the same (e.g. 157), regardless of how the other query words
matched. A doc matching both words by keyword outranked nothing, and `search
"how to use a theme"` put API reference docs above the consumer theme guide.

The bonus now uses the sum of ALL token scores instead of just the strongest,
so a candidate matching every word by keyword outranks one matching
keyword + prose. The `theme` doc also gains consumer-facing keywords so it
surfaces for questions like "how to use a theme" and "how to apply a theme".

Themes are now a search domain: bundled and integration-provided themes appear
in results with their slug, displayName, and the `astryx theme add` command.

@josephfarina
