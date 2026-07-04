---
'@astryxdesign/core': patch
---

[fix] Escape now dismisses only the top-most open layer instead of closing every open layer at once — a popover or menu nested inside a Dialog no longer closes both on a single Escape press. Also guards against IME composition: pressing Escape to cancel a CJK/IME composition inside a Dialog or popover no longer closes the overlay (#3343).
@cixzhang
