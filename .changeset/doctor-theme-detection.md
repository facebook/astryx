---
'@astryxdesign/cli': patch
---

[fix] Doctor recognizes theme imports in source files, reducing false "no theme appears wired" warnings for apps that follow the recommended setup (importing a built theme package). The fix text no longer names the ASTRYX_THEME environment variable; existing apps that use the variable keep a working, doctor-passing setup. Agent docs and getting-started guide updated to point at importing the built output as the primary path.

@josephfarina
