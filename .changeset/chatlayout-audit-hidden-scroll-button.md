---
'@astryxdesign/core': patch
---

[fix] Stop ChatLayout's scroll-to-bottom button from being a tab stop while it is invisible. At rest the layout's default `scrollButton` renders hidden, but `opacity: 0` and `pointer-events: none` leave it in sequential focus navigation — so a keyboard user's first Tab into any chat landed on a control with no visible focus indicator (WCAG 2.2 SC 2.4.7), and Enter scrolled the transcript. The hidden state now also sets `visibility: hidden`, which the fade transition carries so the animation is unchanged; the visible button keeps its keyboard access. The pill's height and collapsed width now track `--size-element-md` instead of a hardcoded `32px`, so a theme that retunes the element scale can no longer make the pill clip its own Button. ChatLayout's consumer docs also gain the `density` prop, which was undocumented, and drop the claim that density adapts automatically to container width — it never did. (#6466)

@cixzhang
