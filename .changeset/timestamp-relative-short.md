---
'@astryxdesign/core': patch
---

[feat] Timestamp: add a `relative_short` format — the compact sibling of `relative`. It uses the same tier boundaries and present/clock-skew handling but renders abbreviated units for space-constrained surfaces (chat metadata, dense tables, chips): `now`, `30s ago`, `5m ago`, `2h ago`, `1d ago`, `3mo ago`, `2y ago`, and `in 5m` for future times. Months render as `mo` (not `m`) so they never collide with minutes; the short form is always numeric (no `yesterday` idiom). Like `relative`, it keeps the full absolute date as its accessible name and gets the hover tooltip and live updates. Additive — existing formats are unchanged.

@freddymeta
