---
'@astryxdesign/cli': patch
---

[feat] Templates can now declare `dependencies` in their `template.doc.mjs` metadata, and a new `check:template-deps` repo check (wired into `check:repo`) verifies every template's executable imports against its declared dependencies plus the stable Astryx package set. Templates may depend on stable Astryx packages, React peers, and documented third-party packages (`@stylexjs/stylex`, `@heroicons/react`, `lucide-react`); anything else fails the check. Existing templates without declarations warn for now. (#6717)
@kiranbadam
