---
'@astryxdesign/cli': patch
---

[docs] The browser-support guide has a section on the on-screen keyboard: a fully expanded Tall BottomSheet and ChatLayout's composer measure it as the layout viewport's height minus the visual viewport's, and keep the focused field above it in Safari on iOS, Firefox for Android and Chrome on Android. In Chrome they ride the keyboard by default (`interactive-widget=resizes-visual`); with `interactive-widget=resizes-content` Chrome shrinks the page for the keyboard itself and they do not ride. Your app owns its viewport `<meta>` element; Astryx never sets it.

@vjeux
