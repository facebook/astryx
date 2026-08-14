---
'@astryxdesign/core': minor
---

[breaking] Avatar: an interactive avatar (`href` or `onClick`) must now carry `name` or `alt`. `AvatarProps` is a union, so `<Avatar href="/u" src="..." />` fails to compile instead of shipping a control assistive tech cannot identify; `aria-label`/`aria-labelledby` satisfy the requirement too, and the dev warning stays as a backstop for untyped callers. The warning no longer accepts a status label as a control's identity. Derived `role`/`aria-label`/`aria-hidden` now spread before the passthrough props, following Icon, so a consumer's own values win. Additive alongside it: a status element can register its accessible label through context, so wrapping `AvatarStatusDot` in your own component keeps the status in the avatar's accessible name (WCAG 4.1.2), and a new `statusLabel` prop names a fully custom status element. Reading `label` off the passed element still works and is deprecated (#5034)

@cixzhang

Migration: add the name the control should have had, `<Avatar href="/users/ada" src="/ada.jpg" name="Ada Lovelace" />`. `AvatarProps` is a union type now, so `interface X extends AvatarProps` no longer works: use `X & AvatarProps`, or extend the exported `AvatarBaseProps`. No codemod, because a codemod cannot invent the missing name and the compile error already points at the call site and the property to add.
