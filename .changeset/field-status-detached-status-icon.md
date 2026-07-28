---
'@astryxdesign/core': patch
---

[fix] FieldStatus renders a leading status icon on the `detached` message so status is not conveyed by color/position alone (WCAG 1.4.1). The icon is decorative for assistive tech; the message text and live-region announcement carry the status. The `attached` variant is unchanged.

@cixzhang
