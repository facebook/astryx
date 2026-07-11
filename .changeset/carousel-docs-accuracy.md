---
'@astryxdesign/core': patch
---

[docs] Correct Carousel doc drift and translate its Chinese usage block (#3532)

The Carousel docs described behaviors the component doesn't have: there is no scroll-driven scale effect on items, and the prev/next buttons are driven by per-edge overflow (each appears when the content can scroll in that direction), not by hover or platform. Descriptions now match the source. Also translates the docsZh usage block, which was still in English.
@arham766
