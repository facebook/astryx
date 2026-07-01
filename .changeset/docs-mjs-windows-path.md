---
'@astryxdesign/core': patch
---

[fix] docs.mjs: resolve the package directory with fileURLToPath so component docs work on Windows, where URL.pathname yields drive-letter paths like /D:/... that made --list silently print nothing and single-component lookup crash with ENOENT (#3331)
@arham766
