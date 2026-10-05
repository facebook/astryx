---
'@astryxdesign/core': patch
---

[feat] Add the BottomSheetSwitcher ordered-path API (`activeSheets`).

`BottomSheetSwitcher` now accepts a controlled `activeSheets` list — the
bottom-to-top path of open sheet ids — plus `onActiveSheetsChange(nextIds,
{reason, dismissedSheetId})` and `finalFocusRef`. Appending an id pushes a
drill-in sheet above the current one (which stays mounted, inert, and visually
receded), removing the final id pops back and restores that sheet's recorded
focus, replacing a suffix changes branch, and `[]` closes the flow. Only the
top sheet is interactive; implicit dismissal (Escape, modal-scrim click, or
swipe, per the top sheet's `purpose`) requests the path without its final id.
Invalid, repeated, unknown, or ambiguously registered ids present the longest
valid prefix and warn in development.

The change is additive: the released singular `activeSheet` /
`onActiveSheetChange` pair keeps its exact shipped behavior as a length ≤ 1
projection of the list, `hasScrim` keeps its released meaning at every path
length, and no exports change.

@imdreamrunner
