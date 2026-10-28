---
'@astryxdesign/core': patch
---

[experimental] With `experimental` set, on a touch screen a Lightbox photo can now zoom out of its thumbnail when it opens and back into it when it closes, like the iOS Photos viewer (UIKit's zoom transition). Without `experimental.sourceFor`, a viewer opened from an element that shows a picture (an image, or a button or link around one) zooms from that element for the photo it opened on; a text button opens and closes as before. Without `experimental`, the viewer opens and closes as before. The photo grows from the thumbnail to its fitted size while the thumbnail's picture fades out, and the backdrop and controls fade in with it. A tap or a drag that lands while it opens is held, so it can't close the viewer, zoom the photo or reach the page; keys and screen readers stay live.

Closing works the same way: the Close button, Escape, a tap beside the photo, or a swipe to another photo and then a close each send the photo back into the thumbnail of the photo showing, and the viewer stays open until it lands. A photo dragged down shrinks into its thumbnail. Under Reduce Motion the photo cross-fades in place.

With a mouse the viewer opens and closes at once, as before, though a photo dragged down still lands in its thumbnail.

@vjeux
