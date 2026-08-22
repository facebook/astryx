---
'@astryxdesign/cli': patch
---

[fix] `astryx theme add` now tells you the theme must be rebuilt and shows the `predev`/`prebuild` script wiring to do it automatically. Previously the next-steps output never mentioned `astryx theme build`, so following it exactly left you on the runtime-injection path with no idea a build step existed. This matters because the failure is silent: a stale built artifact still reports `__built`, so the runtime skips style injection and the app renders the previous theme with no warning.
@josephfarina
