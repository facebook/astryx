---
'@astryxdesign/core': minor
---

feat: add default accessible labels to AvatarStatusDot per variant

AvatarStatusDot now resolves a default accessible label ("Online", "Away", "Busy") when no explicit `label` prop is given, ensuring screen readers always have status meaning to announce (WCAG 2.1 SC 1.4.1). The label resolves as: explicit `label` prop → default per variant → none.

Custom augmented variants (via `AvatarStatusDotVariantMap` module augmentation) have no default label and continue to render without `role="img"`, as documented.
