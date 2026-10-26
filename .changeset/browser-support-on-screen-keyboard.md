---
'@astryxdesign/cli': patch
---

[docs] The browser-support guide has a section on the on-screen keyboard: a fully expanded Tall BottomSheet and ChatLayout's composer measure it as the layout viewport's height minus the visual viewport's, and keep the focused field above it in Safari on iOS, Firefox for Android and Chrome on Android. In Chrome, by default (`interactive-widget=resizes-visual`), ChatLayout's composer and a Tall BottomSheet's focused field ride the keyboard as Gboard slides it; with `interactive-widget=resizes-content` Chrome shrinks the page for the keyboard itself and neither changes. Your app owns its viewport `<meta>` element; Astryx never sets it.

@vjeux
