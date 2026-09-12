---
'@astryxdesign/core': patch
---

[feature] Add ScrollableArea and useScrollableArea for accessible, logical-axis native scrolling with explicit overscroll policy.

Scrollable viewports now become keyboard reachable only while content effectively overflows, preserve logical edge state across writing modes, apply contained overscroll only on active axes, avoid capturing Sticky while fitting unless explicitly requested, expose standard container sizing props, and integrate optional content padding plus opt-in full bleed with the shared container geometry system.

@cixzhang
