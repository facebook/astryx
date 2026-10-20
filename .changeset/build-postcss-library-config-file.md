---
'@astryxdesign/build': patch
---

[perf] The PostCSS plugin no longer loads the app's root Babel config when it compiles Astryx source. In the documented Next.js setup that config (`next/babel` plus Astryx's StyleX plugin) ran over every installed Astryx module on each build only for the plugin to read StyleX metadata, roughly doubling the CSS pass. The emitted CSS is unchanged, and the app's own files still compile with its config.
@vjeux
