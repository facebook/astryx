---
'@astryxdesign/core': patch
---

[fix] Thumbnail: only sample the image when the remove button renders (#3231)

The APCA luminance sample (`fetch(src, {mode: 'cors'})` → `createImageBitmap` → `OffscreenCanvas`) ran on every image-backed thumbnail, but its only consumer is the contrast theming of the overlaid remove button. Thumbnails without `onRemove` — or with it suppressed by `isDisabled` — now skip the fetch entirely: no wasted request, and no CORS console error on cross-origin sources that were never sampled for anything.
@AKnassa
