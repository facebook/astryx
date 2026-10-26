---
'@astryxdesign/core': patch
---

[feat] ChatLayout keeps its composer on top of the software keyboard in Safari on iOS (in the browser and as a home-screen app), in Firefox for Android and in Chrome on Android, where the visual viewport shrinks for the keyboard; where a page sets `interactive-widget=resizes-content`, Chrome shrinks the page for the keyboard itself and the composer stays above it without riding. There the dock rises and falls with the keyboard instead of staying underneath it until the browser scrolls the whole page; a conversation at its newest message stays there, and the rest of the transcript can still be scrolled above the composer. On a touch screen every way into the composer's text (a tap, the keyboard's previous and next buttons, Tab, the input's `focus()`) reaches it without the page scrolling; under a mouse the browser's own focus applies. The composer's dock is a group named "Message composer"; when the keyboard's Done ends typing, focus rests there (it is no tab stop), so the next tap or Tab starts from the composer. Under Reduce Motion the composer never travels: it cross-fades to its place above the keyboard on a touch screen. Nothing changes where no software keyboard appears.

@vjeux
