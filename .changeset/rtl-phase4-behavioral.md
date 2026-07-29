---
'@astryxdesign/core': patch
---

[fix] RTL Phase 4 (behavioral): mirror directional behavior that logical-CSS and icon name-swaps alone couldn't fix. SideNavCollapseButton and TreeListItem now compose `rtlStyles.mirror` on the icon wrapper outside the state rotation, so the chevrons point toward the correct edge in every collapsed/expanded × LTR/RTL combination. TreeList connector/guide lines position via logical `inset-inline-start`/`inset-inline-end` so they mirror to the inline-start (right) edge under RTL alongside the chevron and row indent. Slider positions its thumb, fill, and marks via logical `inset-inline-start` and flips the physical centering transform under RTL, and its pointer/click math measures the value fraction from the inline-start (right) edge under RTL — so a click at 25% of the track maps to 75 instead of 25.
@nynexman4464
