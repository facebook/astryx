---
'@astryxdesign/cli': patch
---

[fix] Template and build tell you what a scaffolded template needs that your project lacks.

When `astryx template <name> <path>` scaffolds a file that imports packages your project does not have (e.g. `@heroicons/react`, `recharts`, `lucide-react`), the receipt now includes a ready-to-run install command with the project's package manager and version ranges from the CLI workspace. `astryx build` shows the same note on its start template.

When a scaffolded template uses StyleX and the project has no compiler plugin configured, the receipt warns and points to `astryx docs styling-overview`. The agent-docs block no longer says "don't use xstyle" flat-out — it acknowledges that some templates need it and links the setup doc.

`detectStylingSystem` now recognizes the official `@stylexjs/rollup-plugin`, `@stylexjs/webpack-plugin`, and `@stylexjs/nextjs-plugin` alongside the existing entries.

@josephfarina
