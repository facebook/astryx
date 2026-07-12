---
'@astryxdesign/core': patch
---

[fix] Keep Collapsible self-toggling when uncontrolled with onOpenChange (#3785)

`useCollapsible` treated the presence of `onOpenChange` as a signal that the component was controlled: its `toggle` handler fired the callback but skipped the internal state update, so an uncontrolled Collapsible given only `onOpenChange` (no `isOpen`) appeared stuck — the callback fired but the content never opened or closed. Control is now determined solely by whether `isOpen` was provided, mirroring how `isOpen` is derived. Uncontrolled usage drives internal state _and_ fires `onOpenChange`; controlled usage still defers entirely to the parent.
@arham766
