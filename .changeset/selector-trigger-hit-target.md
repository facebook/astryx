---
'@astryxdesign/core': patch
---

[fix] Selector: the combobox button now spans the control's full block size. The sized container (28px at `sm`) carried the block padding while the button inside had none, so the actual interactive element collapsed to its ~20px line box — under the WCAG 2.5.8 24×24 minimum, and what axe and touch-target audits measure. The block padding moved from the container onto the button (`align-self: stretch`), so the rendered text keeps the same inset while the hit area covers the whole control. Visual output is unchanged.

@AKnassa
