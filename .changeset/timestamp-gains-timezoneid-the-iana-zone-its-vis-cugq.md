---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] `Timestamp` gains `timezoneID`, the IANA zone its visible absolute text reads in. Omit it, or pass `'local'`, for the viewer's own zone; the `<time>` element keeps carrying the true instant, and `tooltipEntries` still owns the hover card's zones. (#7646)
@humbertovirtudes
