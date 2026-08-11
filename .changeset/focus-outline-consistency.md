---
'@astryxdesign/core': minor
---

[breaking] Consolidate general interactive focus outlines so every component shares one 2px accent ring at 2px offset.

Removes `--button-focus-offset`. Button was the only component exposing its focus offset as a themeable var, and the only one offsetting by 3px rather than 2px — both look incidental rather than intended. A theme setting it should drop the override; buttons now match every other control.

Destructive buttons keep their error-colored ring. Form and input focus treatments are unchanged.

@cixzhang
