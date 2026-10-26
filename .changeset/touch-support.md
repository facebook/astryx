---
'@astryxdesign/core': patch
---

[feat] `@astryxdesign/core/touch-support` exports `TouchSupport`, the one install for the global touch and gesture module. Call `TouchSupport.install()` once in your client entry, before you render or hydrate. It registers the module only where some input is a coarse pointer, or once one appears, so people using only a mouse pay nothing. It can be called more than once, does nothing on the server, and `TouchSupport.isInstalled()` reports whether it ran. A page that never installs it carries none of the module and keeps every component's current behavior. Components take their touch behavior from the module in their own releases.

@vjeux
