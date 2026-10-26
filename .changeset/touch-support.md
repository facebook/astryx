---
'@astryxdesign/core': patch
---

[feat] `@astryxdesign/core/touch-support` exports `TouchSupport`, the one install for the global touch and gesture module. Call `TouchSupport.install()` once in your client entry, before you render or hydrate. It registers the module only where some input is a coarse pointer, or once one appears; the module's code ships with the entry, so a page that imports it sends that code to every visitor. It can be called more than once, does nothing on the server, and `TouchSupport.isInstalled()` reports whether it ran. A page that never imports the entry carries none of the module and keeps every component's current behavior. No component uses the module yet; components take their touch behavior from it in their own releases.

@vjeux
