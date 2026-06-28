---
'@astryxdesign/core': patch
---

[fix] Fix mobile nav drawer not re-opening after it is closed (#3091)
@cixzhang

The AppShell mobile drawer mounts `MobileNav` inside an `<Activity>` that
switches to `mode="hidden"` when the drawer closes. On close, React runs the
drawer effect's cleanup (with a stale `isOpen`) instead of re-running the
effect with `isOpen=false`, so the deferred `dialog.close()` never fired and
the native `<dialog>` was left `open` in the hidden subtree. The next open then
skipped `showModal()` (the dialog was already open), so the drawer could be
opened and closed once but never re-opened. The effect cleanup now closes the
dialog if it is still open, keeping the native dialog state in sync so a
subsequent open cleanly calls `showModal()` again.
