---
'@astryxdesign/core': patch
---

[fix] Table: proportional() and pixel() no longer throw when called from a React Server Component. The Table barrel carried a 'use client' directive that marked the pure column utilities as client functions; the directive now lives only on the component modules, and Table.doc.mjs documents which parts of the data-driven API are server-safe (#3457)
@arham766
