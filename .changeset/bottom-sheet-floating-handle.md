---
'@astryxdesign/core': patch
---

[fix] Bottom Sheet: float the grab handle so content sits closer to the top

The drag area above the sheet's content was a 48px row in the sheet's flex
column, pushing everything below it down by its full height and reading as an
empty band above the first line of content.

The bar is now 24px and floats over the content: the scrolling area starts at
the sheet's top edge and rides up under the pill, so a heading sits 24px
closer to the top. The pill is 4px tall centered in the band, so it occupies
only 10-14px from the edge — inside the top padding a content wrapper already
provides — and a surface gradient behind it keeps it legible over whatever
sits or scrolls beneath.

@imdreamrunner
