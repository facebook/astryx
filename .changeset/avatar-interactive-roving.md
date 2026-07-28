---
'@astryxdesign/core': patch
---

[feat] `Avatar` gains optional interactivity via `href`/`onClick` (with `as`/`target`/`rel`), following Button's element-swap trichotomy: `href` renders a link through `useLinkComponent`, `onClick` (no href) renders a `<button type="button">`, and with neither the avatar stays the static, non-focusable element it is today (non-breaking default). Interactive avatars get the focus-visible accent ring and a required accessible name (from `alt`/`name`). Inside `AvatarGroup`, interactive avatars — and an interactive `AvatarGroupOverflow` — now share a single Tab stop with roving ArrowLeft/ArrowRight focus, and the group exposes a screen-reader keyboard hint via `aria-describedby`. A purely static facepile is unchanged. (#4170)

@cixzhang
