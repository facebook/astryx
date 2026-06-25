---
'@astryxdesign/cli': patch
---

[feat] Tailor agent-docs styling guidance to the project's configured system

`init`/`agent-docs` now detect whether the consumer project has the StyleX
compiler, Tailwind, or neither, and write the matching custom-styling guidance
into the generated `CLAUDE.md`/`AGENTS.md`:

- StyleX compiler wired → `xstyle` / StyleX token imports
- Tailwind → utility classes backed by `@astryxdesign/core/tailwind-theme.css`
- neither → `style`/`className` with `var(--token)` design tokens, plus an
  explicit note NOT to use `xstyle`/utilities (they would not compile)

Previously the docs hardcoded "use the xstyle prop," which throws at runtime
(blank page) in a plain Vite app with no StyleX compiler, and ignored the
Tailwind bridge entirely. Also corrects the token prefix in the theme rule
(`--astryx-color-*` → `--color-*`).
@joeyfarina
