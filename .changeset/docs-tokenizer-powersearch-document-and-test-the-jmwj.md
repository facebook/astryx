---
'@astryxdesign/core': patch
---

[docs] docs(Tokenizer, PowerSearch): document and test the existing startIcon prop
@HelloOjasMutreja

Both components have shipped a working `startIcon?: ReactNode | IconType` prop for a while (`PowerSearch` forwards it verbatim to the internal `Tokenizer`, and it's already exercised in Storybook), but neither's `.doc.mjs` documented it and neither had test coverage — so it was invisible to `astryx component <Name> --dense`, the docsite props table, and anyone (human or AI) relying on those as the source of truth. No behavior change; adds the missing props-table entries (en/zh/dense) and colocated tests confirming the icon renders and forwards correctly.
