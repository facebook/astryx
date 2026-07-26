---
'@astryxdesign/cli': patch
---

[docs] The documented install lines now include `@stylexjs/stylex`, a required peer dependency of `@astryxdesign/core` that hundreds of files in its `dist/` import at runtime. npm and yarn auto-install peers so the omission was invisible there; pnpm with a strict `node_modules` does not, and every component throws on import. Also fixes `astryx doctor`'s remediation for a missing scoped peer, which rendered as `npm install ` with no package name — the peer name was being truncated at its leading `@`. (#4276)
@AKnassa
