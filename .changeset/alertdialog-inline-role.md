---
'@astryxdesign/core': patch
---

[fix] AlertDialog: the `isInline` preview path no longer renders `role="alertdialog"`. That role promises a modal interruption — focus trap, inert page, explicit dismissal — and the inline path is an always-present, non-modal preview with none of it. It now renders `role="group"`, keeping the title and description associated through `aria-labelledby`/`aria-describedby`.

@cixzhang
