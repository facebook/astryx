---
'@astryxdesign/core': patch
---

[fix] `mod` hotkeys and `Kbd` resolve to Cmd on macOS again when client hints report a blank platform

`useHotkeys` and `Kbd` both prefer `navigator.userAgentData.platform` and fall
back to `navigator.platform`, but guarded the preference with
`'platform' in uaData`, which is true whenever the key exists at all. A build
reporting `platform: ''` therefore committed to the client-hints branch and got
`false` without ever reaching the fallback, so on macOS every `mod` combo
listened for Ctrl and every `<Kbd>` drew Ctrl. Electron and other embedders
that rewrite the app's user-agent identity ship exactly that. A blank platform
is now treated as unknown and falls through.

@Astro-Han
