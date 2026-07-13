---
'@astryxdesign/core': patch
---

[fix] Timestamp: render nothing instead of crashing on an unparseable value

An unparseable `value` (a malformed date string, or a NaN timestamp from missing data) produced an Invalid Date whose formatting throws "Invalid time value", crashing the whole tree. Invalid values now render nothing and log a console warning instead.
@arham766
