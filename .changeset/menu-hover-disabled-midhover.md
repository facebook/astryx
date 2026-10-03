---
'@astryxdesign/core': patch
---

[fix] A nav or menu trigger disabled while a hover is in flight no longer opens its surface.

Hover intent schedules an open after a short delay. Disabling the trigger in
that window left the scheduled open to land anyway, on a surface whose
handlers were already inert — so it opened and nothing could dismiss it. The
pending intent is now abandoned when the integration is disabled.

@cixzhang
