---
'@astryxdesign/core': patch
---

[fix] SideNav / useResizable: collapse notifications now fire exactly once per interaction and always reflect the region's real state. SideNav's `onCollapsedChange` no longer fires twice per toggle click (previously once directly and again via the resize hook), and a toggle click still notifies a controlled parent whose earlier refusal left the hook already in the requested state, in both the collapse and expand directions; `useResizable`'s `onCollapseChange` now fires when `resize()` moves the region out of the collapsed state, matching the drag path and the callback's documented contract; and collapse notifications are driven from live state rather than the state captured at the last render, so a drag gesture reports one collapse (not one per pointer move), dragging back above the collapse threshold re-expands mid-gesture, and two imperative calls in the same tick report the region's real final state. A drag that starts on the collapsed rail and crosses out and back no longer overwrites the saved pre-collapse width with 0. Toggling a `resizable` SideNav whose `collapsible` is unset is now a no-op instead of leaving the imperative collapse handle reporting a collapse that never happened.

@AKnassa
