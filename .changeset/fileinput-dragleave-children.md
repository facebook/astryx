---
'@astryxdesign/core': patch
---

[fix] FileInput: don't drop the drag-over highlight when dragging over dropzone children

Dragging a file across the dropzone's own icon/text fired a dragleave on the container and cleared the drag-over state, so the "Drop files here" highlight flickered mid-drag. A dragleave whose relatedTarget is still inside the dropzone is now ignored; only actually exiting the dropzone ends the drag-over state.
@arham766
