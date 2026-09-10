---
'@astryxdesign/core': patch
---

[fix] scope the 16px text-control font-size floor to iOS with `@supports (-webkit-touch-callout: none)` inside the coarse-pointer query, so Android and touch-screen laptops keep the theme's type scale instead of an inflated 16px (#6015)

@ManoharPaturi
