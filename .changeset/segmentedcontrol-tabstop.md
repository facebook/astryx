---
'@astryxdesign/core': patch
---

[fix] SegmentedControl: keep the radiogroup reachable by Tab even when the current `value` matches no item (or the selected item is disabled). Previously a stale/unmatched value left every segment at `tabIndex={-1}`, so the whole control dropped out of the tab order. The first enabled segment is now promoted to the tab stop (#3343).
@cixzhang
