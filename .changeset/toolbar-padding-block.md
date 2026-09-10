---
'@astryxdesign/core': patch
---

[feat] Let a Toolbar set its own vertical padding

`Toolbar` fixed its block padding per size, which is right for a toolbar
heading a band of content and too loose for one acting as app chrome. A tab
strip or a dense tool bar wants to sit tighter, and there was no way to ask:
the padding lands on the inner Section element while `xstyle` lands on the
outer one, so a padding set through `xstyle` wraps the default rather than
replacing it. The `--astryx-section-padding-block-*` tokens are no way in
either — they are the fallback for when no padding is set, and this component
always sets one.

Two derived values now follow the padding in force rather than the size's
default: the inset that edge-compensates ghost triggers, which is defined as
container padding minus the toolbar's own, and the drop that lands a nested
tab indicator on the divider rail. Left keyed to the size, a tightened
toolbar would ring its ghost buttons with the spacing of a padding it no
longer has and push its tab indicator through the rail.

@ernestt
