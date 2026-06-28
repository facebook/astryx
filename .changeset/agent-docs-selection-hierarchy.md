---
'@astryxdesign/cli': patch
---

[docs] Add a component-selection ladder to the generated agent cheat sheet (`agent-docs`): guide LLM consumers to prefer the app's own components, then Astryx semantic components, then Astryx primitives, then a custom composition in `/components`, and only as a last resort a token-built custom component — cribbing behavior from the closest Astryx component instead of hand-rolling raw CSS (#3212)
@durvesh1992
