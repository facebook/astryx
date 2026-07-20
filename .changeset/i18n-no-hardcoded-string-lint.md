---
'@astryxdesign/core': patch
---

[feat] New ESLint rule `@astryx/no-hardcoded-i18n-string` (in `@astryx/eslint-plugin-astryx`, `astryx.configs.strict` / `astryx.configs.recommended`). Flags hardcoded English string literals on user-facing props so future component work can't skip translation. The rule is filesystem-agnostic — downstream packages that ship translatable UI can enable it in their own ESLint config with the standard `files` / `ignores` pattern.

@nynexman4464
