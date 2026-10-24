---
'@astryxdesign/core': patch
---

[feat] A Lightbox photo can now zoom out of its thumbnail when it opens and back into it when it closes, like the iOS Photos viewer (UIKit's zoom transition). Pass `sourceFor`, which returns each item's thumbnail element. The photo grows from the thumbnail to its fitted size while the thumbnail's picture fades out, and the backdrop and controls fade in with it.

Closing works the same way: the Close button, Escape, a tap beside the photo, or a swipe to another photo and then a close each send the photo back into the thumbnail of the photo showing, and the viewer stays open until it lands. A photo dragged down shrinks into its thumbnail. Without `sourceFor`, a viewer opened from an element that shows a picture (an image, or a button or link around one) zooms from that element for the photo it opened on. A text button opens and closes as before. Under Reduce Motion the photo cross-fades in place.

`sourceFor` is proposed and pending owner review.

@vjeux
