---
'@astryxdesign/cli': patch
---

[fix] Drop `gpt-tokenizer` from the CLI's peer dependencies. Nothing in the CLI imports it, but npm and pnpm install a required peer by default, so every install of the CLI pulled in about 53 MB it never used.

@josephfarina
