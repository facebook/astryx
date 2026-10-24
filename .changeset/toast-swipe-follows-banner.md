---
'@astryxdesign/core': patch
---

[fix] A Toast's swipe now follows iOS notification banners. The card stays still for the first 14 px of finger travel and then follows at 0.55 of the finger, with no jump. On release, a quick flick toward the edge dismisses even when it barely moved the card, as does a drag that leaves the card far enough out; anything else springs the card back. A dismissed card leaves from where the finger left it and never moves back toward rest. The swipe no longer fades or shrinks the card. While the card springs back, touches pass through to the page. A theme retunes the spring-back through the `toast.settle` motion role.

@vjeux
