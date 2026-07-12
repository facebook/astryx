---
'@astryxdesign/cli': patch
---

[fix] `astryx swizzle`: swizzled components ship raw StyleX source that needs a build-time StyleX compiler, and without one they render unstyled with no error. The command now prints a StyleX build-setup note after copying (including the Next.js caveat that the StyleX Babel plugin disables SWC and breaks `next/font`, so an SWC-based transform is required), and `astryx docs styling` gains a "StyleX Build Setup" section covering per-bundler setup. (#3373)

@josephfarina
