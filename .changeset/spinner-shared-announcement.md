---
'@astryxdesign/core': patch
---

[fix] Route standalone Spinner labels through the shared polite announcement channel once per appearance or label change, rather than mounting a status region with its name. Rerenders and StrictMode replay do not repeat the channel call; a new appearance with the same words does. Keep package-owned composed indicators silent and visible labels readable. Spinner's ring now exposes `role="img"` instead of `role="status"`; update tests that query a standalone Spinner by its old role. Default sizing, animation, and label naming are unchanged.
@korkt-kim
