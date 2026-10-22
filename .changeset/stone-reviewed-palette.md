---
'@astryxdesign/theme-stone': patch
'@astryxdesign/cli': patch
---

[feat] Replace Stone's internal shared-ramp mapping with reviewed light and dark ramps while preserving the public numbered palette lookups and `hue`/`chroma` metadata. The light canvas moves from `#F3F3F5` to `#F0F0F7`, the dark popover from `#25252A` to `#302F36`, and Green, Yellow, Teal, and Cyan use re-seeded midtones (including Green `#667D65` to `#528B49`). Seven families' light stop-90 surfaces, syntax colors, and input status rims shift; the mapped success and warning rims use `#609757` and `#A08C36`, and syntax attribute uses `#736419`, keeping the required contrast floors. Existing apps can keep the former appearance by extending `stoneTheme` and overriding the affected color, syntax, shadow, and component tokens with their previous values. The CLI template ships the same reproducible request, receipt, and runtime-sized references.

@rubyycheung
