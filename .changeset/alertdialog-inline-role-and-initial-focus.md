---
'@astryxdesign/core': patch
---

[fix] AlertDialog: correct the inline role and pin initial focus (#4887).

The `isInline` preview path no longer renders `role="alertdialog"`. That role promises a modal interruption — focus trap, inert page, explicit dismissal — and the inline path is an always-present, non-modal preview with none of it. It now renders `role="group"`, keeping the title and description associated through `aria-labelledby`/`aria-describedby`.

The cancel button now carries `data-autofocus`, so the documented "initial focus goes to the cancel button" behavior is pinned instead of depending on cancel happening to be the first focusable node in the footer. Docs now name and link the WAI-ARIA APG Alert Dialog pattern the component implements, and gain an anatomy section.

@cixzhang
