---
'@astryxdesign/core': patch
---

[fix] Avatar: a status element now reports its own accessible label to the avatar through context, so wrapping `AvatarStatusDot` in a component of your own keeps the status in the avatar's accessible name ("Jane Doe, Online") instead of silently dropping it — the `role="img"` root prunes descendant semantics, so composing it in is the only route to assistive tech (WCAG 4.1.2). Reading `label` off a directly-passed element still works and still resolves on the first render. An interactive avatar (`href`/`onClick`) with no `name`/`alt` warns in development, and a status label no longer counts as the control's identity: "Online" reads as a legitimate name while saying nothing about where the link goes. Derived `role`/`aria-label`/`aria-hidden` now spread before the passthrough props, following Icon, so a consumer's own values win. No API change (#5034)

@cixzhang
