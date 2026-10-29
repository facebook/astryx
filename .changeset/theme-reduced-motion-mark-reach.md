---
'@astryxdesign/core': patch
---

[fix] A theme's `reducedMotion: 'always'` reaches streaming text (`useStreamingText`, and so Markdown while it streams), the chat scroll's follow and a swipe row's settle, as the person's Reduce Motion setting does. The mark also carries a marker class, on the theme's root and, for the root theme, on `<html>`, so components' Reduce Motion styles can key on it, portaled layers included.

@vjeux
