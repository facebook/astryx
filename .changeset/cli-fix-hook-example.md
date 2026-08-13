---
'@astryxdesign/cli': patch
---

[fix] The documented `hook` example referenced `useToggle`, which is not a hook in the design system — running it failed with `ERR_UNKNOWN_HOOK`. It now uses `useFocusTrap`. (#4742)

This shipped in two places a consumer sees: `astryx manifest --json`, which agents read to learn the CLI, and the `hook` CommandDoc that feeds `--help`. Replaced in both.
@josephfarina
