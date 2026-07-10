---
'@astryxdesign/core': patch
---

[feat] i18n scaffold + Pagination migration (#3641). Adds `InternationalizationProvider`, `useTranslator()`, ICU MessageFormat runtime (`intl-messageformat`), BCP 47 regional-locale fallback (`pt-BR` → `pt` → `en`), and a shipped English catalog at `packages/core/locales/en.json`. Pagination is migrated as the first component consumer — 10 hardcoded strings (aria labels, live-region announcements, visible count/compact text) now flow through the i18n system with `en` defaults preserving current behavior. A dev-only pseudo locale is generated from `en.json` at build time for QA. Provider is opt-in — consumers who never render one continue to get today's English strings unchanged. Server-side rendering (RSC) and framework adapters are deferred to a follow-up.

@nynexman4464
