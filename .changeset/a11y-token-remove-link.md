---
'@astryxdesign/core': patch
---

[fix] Token: render the remove button as a sibling of the link instead of nesting it inside the anchor when both `href` and `onRemove` are provided. The token surface now delegates to the link via `useClickableContainer`, so clicking anywhere on the token (including with middle-click or cmd/ctrl+click to open in a new tab) activates the link, while the remove button keeps handling its own clicks.
@bhamodi
