---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build --watch` stops as soon as it is interrupted (Ctrl-C or SIGTERM). A change saved while a rebuild was running no longer starts another rebuild after "Stopped watching.", and a rebuild in progress stops with the watcher instead of keeping the process alive.

@cixzhang
