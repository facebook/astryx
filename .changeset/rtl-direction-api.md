---
'@astryxdesign/core': patch
---

[feat] Add RTL direction API: `useDirection()` hook, `getLocaleDirection(locale)` server-safe helper, and an optional `dir` prop on `InternationalizationProvider`.

- `useDirection()` returns `'ltr' | 'rtl'` for the current provider context (falls back to `'ltr'` when called outside a provider).
- `getLocaleDirection(locale)` computes direction from a BCP 47 locale via `Intl.Locale.getTextInfo()` — safe to call from React Server Components and Next.js layouts to set `<html dir>`.
- `<InternationalizationProvider locale="ar">` auto-derives `dir="rtl"`. Pass an explicit `dir` prop to override (useful for RTL testing under an English catalog, or to force LTR).
- Pagination is the first component to consume the hook: prev/next chevron icons flip under RTL while the aria-labels stay semantic.
- Storybook gains a global `Direction` toolbar for toggling every story between LTR and RTL.
- Component-level CSS migrations (borders, chevrons, sliders, calendar range pills, etc.) land in follow-up PRs.

@nynexman4464
