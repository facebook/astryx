---
'@astryxdesign/core': patch
---

[fix] `Dialog` now closes itself when it is torn down while open. `showModal()` is a document-wide side effect — an open modal puts the element in the top layer and makes the rest of the page inert — and `close()` is the only thing that undoes it; removing the element from the DOM does not. The open/close effect only closed on an `isOpen` transition, so any dialog destroyed while still open left an invisible modal (zero-sized, `display: none`) holding the whole document inert, with every click swallowed until a reload.

Teardown rather than unmount is the case that bites: React destroys a subtree's effects when the subtree is hidden as well as when it unmounts, which is exactly what a client-side router does to the outgoing route. Following a link out of an open dialog — the docsite's own "Open in Playground", for one — landed the next page dead on arrival. The fix is a teardown-only cleanup with an empty dependency list, so the open and close transitions stay entirely with the effect that already owns them and nothing about opening, closing, focus restoration, or the exit animation changes.

@ernestt
