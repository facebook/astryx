---
'@astryxdesign/cli': patch
---

[fix] Correct the palette authoring types. `TonalPaletteCandidate`'s description had landed on `TonalPaletteAnchor`, so the generated `.d.ts` documented the wrong type and left the candidate bare. `TonalPaletteFamilyInput` — the type an author writes by hand — had no property descriptions, and `neutralProfile` never said what its four values do.

[fix] Give the generation receipt a real type. `generationReceipt` was `Record<string, unknown>`; it is now `TonalPaletteGenerationReceipt`, with `TonalPaletteRampDiagnostics`, `TonalPaletteCoordinationDiagnostics`, and `TonalPaletteNormalizedRequest` beside it. The generator's internal typedefs point at the same types, so the compiler holds the documentation true instead of letting it drift.

[docs] Replace the stale `xds` command name with `astryx` across 79 lines of API type docs in 11 files, and realign the invocation tables. Codemods and changelogs that reference the old name are untouched — migrating it is their job.

@josephfarina
