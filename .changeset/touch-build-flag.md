---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] A bundle can leave out Astryx's touch code. Build it with `__ASTRYX_TOUCH__` defined as `false` (esbuild or Vite `define`, webpack `DefinePlugin`, Next.js `compiler.define`) and every component presents the pointer way on any device, so a product that serves desktops a bundle of their own stops shipping touch behavior there. Touch modules imported through the documented guard drop out of that bundle. Without the define nothing changes. The browser support guide (`astryx docs browser-support`) shows the build settings, how to route each device to its bundle, and the Next.js caveat.

@vjeux
