---
'@astryxdesign/core': patch
---

[feat] TextInput/TextArea: the control's type now follows its size (sm → supporting, md → body, lg → large), and TextInput's inner `<input>` renders as its own theme target, `astryx-text-input-control`, mirroring `text-area-control` for TextArea. (#6014) Before, `size` changed only the control height — typed text and placeholder stayed at `--text-body-size` in all three sizes, so a `sm` input was body text squeezed into a 28px box and an `lg` input the same 14px text floating in a 36px one. Both of the issue's asks are covered: the default scale adapts, and a theme that wants a different scale can key off the new control target (the size stays reflected as `data-size` on the `astryx-text-input` wrapper, so per-size control styling stays reachable without a structural selector). The coarse-pointer `max(1rem, …)` minimum is kept at every size so touch devices never get sub-16px text — and never zoom on focus. TextArea gets the same type scale; its `lg` padding step is unchanged.

@ManoharPaturi
