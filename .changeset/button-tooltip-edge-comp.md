---
'@astryxdesign/core': patch
---

[fix] Button: keep edge compensation working when a ghost button also has a tooltip. The tooltip wrapper now forwards the edge-compensation marker, so containers (Toolbar, Banner) still detect it via their direct-child `:has()` selector and pull the button flush to the optical edge. (#2578)
@cixzhang
