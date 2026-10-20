---
'@astryxdesign/core': patch
---

[fix] `useHoverCard`: closing a hover card with `hide()` or Escape while the pointer rests on the card no longer leaves the next open stuck. The hook kept believing the pointer was still over the card, because a card closed that way unmounts without a `mouseleave`, so the trigger's next hover-open never closed on leave or after `hideDelay`. Both paths now clear that state, as the touch dismissal already did.

@cixzhang
