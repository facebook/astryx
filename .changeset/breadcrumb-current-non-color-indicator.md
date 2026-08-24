---
'@astryxdesign/core': patch
---

[fix] `Breadcrumbs` marks the current item with semibold weight, not colour alone. The current crumb was distinguished only by `--color-text-primary` against its siblings' `--color-text-secondary`, which fails WCAG 1.4.1 (use of colour) and leaves the current position invisible to anyone who cannot separate the two tones (#4605, closes #4421).

@gonzoblasco
