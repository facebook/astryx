---
'@astryxdesign/core': patch
---

[fix] Tooltip: omit popover source option when trigger is an SVG element. Calling `showPopover({source: undefined})` in Chromium triggers WebIDL dictionary conversion which throws a TypeError because source expects an HTMLElement. Now the source option is omitted when the trigger is not an HTMLElement, allowing sibling mode tooltips anchored to SVG elements to open cleanly without throwing. Also update `anchorRef` in TooltipProps and useTooltip to accept `HTMLElement | SVGElement`.

@phasehumans
