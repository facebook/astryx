---
'@astryxdesign/core': patch
---

[fix] Button: keep edge compensation working when a ghost button also has a tooltip. The tooltip is now attached via the tooltip hook instead of a wrapper element, so the button stays a direct child of its container — no extra DOM node, no layout shift, and containers (Toolbar, Banner) still detect the edge-compensation marker via their direct-child `:has()` selector and pull the button flush to the optical edge. (#2578)
@cixzhang
