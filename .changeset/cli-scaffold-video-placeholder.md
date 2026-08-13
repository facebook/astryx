---
'@astryxdesign/cli': patch
---

[fix] Scaffolding a template that references demo video (e.g. `LightboxVideo`) no longer replaces the video source with the image placeholder data URI, which the generated `<video>` element couldn't play. `stripTemplateAssetRefs()` treated every demo-media reference as an image regardless of extension; video extensions (`.mp4`, `.webm`, `.mov`, `.ogv`) are now stripped to an empty `src` instead — there's no equivalent self-contained inline placeholder for video, so the scaffolded example is honest about needing the builder to supply their own file rather than pointing at something that can't play.

@HelloOjasMutreja
