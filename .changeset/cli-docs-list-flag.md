---
'@astryxdesign/cli': patch
---

[fix] `astryx docs --list` no longer errors with `unknown option '--list'`. The `docs` command registered no options at all, so commander rejected the flag even though bare `astryx docs` prints exactly that list and `component --list` / `template --list` both exist. `--list` now routes to the same list branch and ignores any positional topic. (#4276)
@AKnassa
