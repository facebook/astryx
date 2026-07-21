---
'@astryxdesign/cli': patch
---

[fix] The `rename-status-variants` codemod now also migrates `positive`/`negative` status values supplied through status-denoting object keys (`dot`, `state`, `status`) in files that import a StatusDot-family component, so values fed indirectly into `variant`/`color` no longer survive the migration as invalid variants. `info` and unrelated string data are left untouched.

@ejhammond
