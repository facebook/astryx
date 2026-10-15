---
'@astryxdesign/core': patch
---

[fix] `ChatMessage` no longer leaves empty space for an avatar, name, or metadata that renders nothing. Booleans and empty strings create no slot, and any other slot content that renders nothing, such as an empty Fragment or a component that returns `null`, collapses its wrapper. A name that renders no text falls back to the translated sender label, while numeric values such as `0` still render.

@cixzhang
