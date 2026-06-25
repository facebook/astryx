---
'@astryxdesign/cli': patch
---

[fix] Standalone page templates fill the viewport (`100dvh`, not `100%`)

The login family (`login`, `login-card`, `login-sso`, `login-split`),
`form-two-column`, and `theme-showcase` painted their page background with
`minHeight: '100%'`, which collapses to content height unless the consumer sets
`html`/`body`/`#root` height — leaving an unpainted band below the content when
scaffolded into a plain app. Switched to `100dvh` so a standalone page fills the
viewport on its own. (`ai-chat-landing` keeps `100%`: it fills a `Layout`
content area that already has height.)
@joeyfarina
