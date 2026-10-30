---
'@astryxdesign/core': patch
---

[fix] MultiSelector: the default text of `triggerDisplay="count"` now comes from a translated message with a count parameter (`@astryx.multiSelector.triggerCount`, "3 selected" in English), so it follows the app's locale and can use plural forms, instead of the literal English "N selected" in every locale. A `formatValue` still replaces it. The English text is the same except that the count is formatted for the locale (1,200 selections read "1,200 selected"). The message is declared as a plural, so translators can supply plural forms. No API changes.

@HelloOjasMutreja
