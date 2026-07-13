---
'@astryxdesign/core': patch
---

[fix] SegmentedControl: tabbing through no longer rewrites the value (#3597)

When value matched no enabled item (initial empty state, stale server value, or the selected item disabled), the roving tab stop fell back to the first enabled radio and selection-follows-focus fired onChange with it — a keyboard user mutated the form just by tabbing past the control. Selection now only follows focus moves within the group (arrow/Home/End); entering focus is a pure focus move, and click selection is unchanged.
@arham766
