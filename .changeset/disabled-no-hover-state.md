---
'@astryxdesign/core': patch
---

[fix] Disabled elements no longer paint a hover state: every self-`:hover` in core and lab, and every `:hover` a theme authors, now carries the zero-specificity guard `:hover:where(:not(:disabled,[aria-disabled="true"]))`, so existing overrides weigh exactly what they weighed before. A lint rule and a Chromium sweep over every story keep it that way (#5247).

@cixzhang
