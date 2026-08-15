---
'@astryxdesign/core': patch
---

[fix] DateTimeInput: the focused-and-empty time placeholder hints ("e.g., 2:30 PM" / "e.g., 14:30") now route through the i18n translator so they localize with the rest of the component. Adds `@astryx.dateTimeInput.timeHint12h` and `@astryx.dateTimeInput.timeHint24h` to the `en` catalog. The live-region "Invalid date" / "Invalid time" announcements this PR also covered landed first in #4363 and now reuse that PR's `@astryx.dateInput.invalidDate` and `@astryx.timeInput.invalidTime` keys. (#4546)

@cixzhang
