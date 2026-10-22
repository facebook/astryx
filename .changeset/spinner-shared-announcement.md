---
'@astryxdesign/core': patch
---

[fix] Route standalone Spinner labels through the shared polite announcement channel once per appearance or label change, rather than mounting a status region with its name. Rerenders and StrictMode replay do not repeat the channel call; a new appearance with the same words does. Spinner's ring now exposes an indeterminate `role="progressbar"` instead of `role="status"`, without a fabricated `aria-valuenow`. Update tests that query a standalone Spinner by its old role. Visible labels, sizing, animation, and label naming are unchanged.
@korkt-kim
