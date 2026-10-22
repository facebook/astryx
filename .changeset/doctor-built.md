---
'@astryxdesign/cli': patch
---

[feat] `astryx doctor --built <path>` checks a finished build before you deliver it: a project folder, a build output folder, or one built HTML file. `built-astryx-usage` fails when the path holds no import from an Astryx package (any `@astryxdesign/*` package or an integration the project loads), no component imported from one, and no Astryx styles in built CSS or HTML, and names the template-first way to rebuild it. `built-astryx-purity` warns with the source check of `astryx docs is-my-code-good`: raw elements Astryx has a component for, raw SVG and icon-library icons, inline styles, classes, `stylex.create` and imported stylesheets, each with its file and line. Files are only read, never run. Without `--built`, `astryx doctor` runs exactly as before.

@josephfarina
