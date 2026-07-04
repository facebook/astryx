---
'@astryxdesign/core': patch
---

[refactor] SegmentedControl now uses the shared useListFocus roving-tabindex primitive instead of its inline keyboard handler and tab-stop repair effect; no behavior change.

The component's ~60-line inline ArrowLeft/Right/Home/End handler and useIsomorphicLayoutEffect tab-stop repair are replaced by useListFocus({hasRovingTabIndex: true, wrap: true, orientation: 'horizontal'}), which owns the single roving tab stop, skips disabled radios, wraps, handles Home/End, and repairs the stop on mount/disable. Selection-follows-focus (APG radiogroup) is preserved via a container onFocus handler that selects the focused radio's value.
@cixzhang
