---
'@astryxdesign/core': patch
---

Route hardcoded English validation messages in DateInput and DateTimeInput through the i18n translator so they can be localized. Adds `@astryx.dateInput.invalidDate`, `@astryx.dateTimeInput.invalidTime`, `@astryx.dateTimeInput.timeHint12h`, and `@astryx.dateTimeInput.timeHint24h` keys to the locale catalog.
