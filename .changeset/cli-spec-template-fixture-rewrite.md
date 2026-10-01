---
'@astryxdesign/cli': patch
---

[fix] `astryx template <name> <path>` and `astryx layout expand` now replace demo media only when a path starts with `/template-assets/`, so third-party URLs and product paths that merely contain that text are left alone. Demo media in a subdirectory, with a query string, or with characters such as `@` in the file name is now replaced whole instead of being corrupted or left behind. A demo media reference that cannot be replaced safely, such as one with no file suffix or one built at runtime, now fails the copy with its path. (#6596)

@josephfarina
