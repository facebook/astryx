---
'@astryxdesign/core': patch
---

[feat] Collapsible: add an `isDisabled` prop to disable a single item. A disabled item's trigger can't be toggled and is dimmed; following the system-wide disabled convention it uses `aria-disabled` (not the native `disabled` attribute) and drops out of the tab order, staying perceivable to assistive tech. Disabling doesn't collapse an already-open item. Works standalone and inside CollapsibleGroup.
@cixzhang
