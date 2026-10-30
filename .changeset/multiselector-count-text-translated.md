---
'@astryxdesign/core': patch
---

[fix] MultiSelector: the default text of `triggerDisplay="count"` now comes from a translated message with a count parameter (`@astryx.multiSelector.triggerCount`, "3 selected" in English), so it follows the app's locale and can use plural forms, instead of the literal English "N selected" in every locale. A `formatValue` still replaces it. English output is unchanged. No API changes.

@HelloOjasMutreja
