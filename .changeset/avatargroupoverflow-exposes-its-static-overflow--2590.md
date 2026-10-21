---
'@astryxdesign/core': patch
---

[fix] The static `AvatarGroupOverflow` chip (no `onClick`) is exposed to assistive technology as an image named by its count label ("5 more"). Before, it was a span with an `aria-label` but no role, a name the generic role does not allow, so screen readers could skip the count. This meets WCAG 2.2 SC 4.1.2 Name, Role, Value. Nothing changes visually; the clickable chip stays a button, and a `role` passed by the caller still wins.

@azure-553
