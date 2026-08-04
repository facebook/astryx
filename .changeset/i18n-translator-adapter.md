---
'@astryxdesign/core': patch
---

[feat] InternationalizationProvider gains an optional `translator` prop that formats astryx's strings with an i18n runtime you already ship (react-intl, i18next, LinguiJS) instead of the bundled `intl-messageformat`. The already-exported `Translator` interface (`format(message, values?, locale?)`) is now wired to it. Astryx keeps its own lookup — overrides, then `messages`, then the parent locale (`pt-BR` → `pt`), then the shipped `en` catalog — and hands the translator the resolved ICU message, never an `@astryx.*` key, so consumers do not have to load astryx's catalog into their runtime's store. Every astryx string goes through the translator, including the value-less ones that make up most of the catalog, so a single consumer catalog keyed on the English text can own all of them. `format` must return a string; anything else warns once in development and falls back to astryx's resolved message rather than leaking a non-string into an `aria-label`. A translator can only be passed from a client component, and a nested provider replaces it rather than inheriting it. Omitting the prop is a no-op: the bundled runtime and its formatter cache behave exactly as before. (#4029)

@AKnassa
