---
'@astryxdesign/core': patch
---

[feat] Avatar: add a `tooltip?: string | boolean` prop for a name-on-hover tooltip. Omitting it (or `true`) shows the avatar's `name` on hover and keyboard focus; a string shows that text instead (no need to wrap in `Tooltip`); `false` disables it. Avatar owns the tooltip via the existing Tooltip hook, so there's no extra wrapper DOM. Because this adds a default tooltip to every existing named Avatar, set `tooltip={false}` when you supply your own `Tooltip`/`HoverCard` overlay. The root `aria-label` (`alt || name`) is unchanged; the default name tooltip is visual-only (no `aria-describedby` double-announce), while a custom string tooltip is exposed as a description. Decorative avatars (no `name`/`alt`) get no tooltip. (#4164)
@cixzhang
