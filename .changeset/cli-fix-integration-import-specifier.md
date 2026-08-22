---
'@astryxdesign/cli': patch
---

[fix] `component` built the import specifier for an integration component by joining the package name and the component name, which assumes every component is exported from a subpath named after itself. Components are commonly grouped behind a single entry point named after the concept, so the suggested import pointed at a subpath the package does not export and did not resolve (#4810).

The specifier is now resolved against the owning package's `exports` map, keyed on the directory the component's doc file sits in, and falls back to the package root when that directory is not an exported subpath. A specifier a doc file states for itself is also no longer overwritten.

@rubyycheung
