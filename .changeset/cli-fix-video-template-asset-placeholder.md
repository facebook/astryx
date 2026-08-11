---
'@astryxdesign/cli': patch
---

[fix] Scaffolding a template with a video source (`astryx template LightboxVideo ./out --type block`) rewrote the `.mp4` to the image placeholder, leaving `src: 'data:image/svg+xml,...'` next to `type: 'video'` — a `<video>` handed SVG image data, which can never play.

The scaffold transform now picks the placeholder from the reference's extension: `.mp4`, `.webm`, `.mov`, `.m4v`, and `.ogv` get a self-contained inline video placeholder (silent, ~1.6s, H.264 baseline, 2.8 kB), everything else keeps the image placeholder. Both stay zero-setup — no `/template-assets/` dir and no network.

The extension is read from the last dotted segment of the filename, so `clip.min.mp4` is recognised as video rather than classified from `min`, and `@2x` variants are replaced instead of being left to 404.

@AKnassa
