---
'@astryxdesign/cli': patch
---

[feat] Setup gotchas are now single-sourced as data: `packages/cli/assets/gotchas.json` holds 12 entries (id, title, trigger, fix, severity), and the generated agent cheat sheet (`init --agent`) renders its GOTCHAS section from that JSON instead of hand-written error-preventers — covering StyleX compiler setup, stylesheet import order, cascade-layer order, SWC-vs-Babel on Next.js, SSR theme builds, token usage, the hover-on-touch guard, and more. `init`, `build`, and `doctor` can consume the same source next. (#6725)
@kiranbadam
