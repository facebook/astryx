---
'@astryxdesign/build': minor
---

[breaking] `withAstryx()` refuses a Turbopack config instead of building an unstyled app. Every alias the helper installs lives in `nextConfig.webpack`, which Turbopack never calls, so the app resolved `@astryxdesign/*` to dist while PostCSS compiled the library from source — disjoint class names, an exit code of 0, and an unstyled page. It now throws, naming both ways out: `--webpack`, or drop the helper and consume the pre-built package. Also warns when no package yields a `source` entry, which reaches the same unstyled state by another route. (#6109)
@joaodotwork
