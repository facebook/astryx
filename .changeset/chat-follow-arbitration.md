---
'@astryxdesign/core': patch
---

[fix] Chat/useChatStreamScroll: an upward scroll releases auto-follow in both motion modes, and only the reader can release it. While following, the hook owns the container's position: it disables CSS scroll anchoring on the scroll element, so the only move the browser makes on its own is the resize clamp onto the bottom, and any other upward move is read as the reader. A wheel or drag a nested scroller consumes, or a block collapsing above the viewport, no longer touches the lock either way; unlocked, anchoring is restored. The wheel and touch listeners are gone. `jumpToBottom` also cancels the spring's pending frame, so animation loops cannot stack. (#5662, #5663)
@yyq1025
