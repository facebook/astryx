---
'@astryxdesign/core': patch
---

[fix] BottomSheet: a swipe that scrolls to the end of the sheet's content and keeps pulling now expands the sheet, instead of stopping dead at the last line. The handoff used to be decided once, when the finger landed: a gesture that started mid-content stayed a scroll for its whole life, so the natural motion — swipe up through the list, reach the bottom, keep pulling — never reached the sheet. Reaching the end of the content is now enough. The sheet is anchored at the point where the content ran out, so only the travel past it moves the sheet, and the pull is left to the content when the finger comes back down or when there is no taller detent to expand into (#5172).

@imdreamrunner
