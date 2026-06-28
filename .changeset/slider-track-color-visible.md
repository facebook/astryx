---
'@astryxdesign/core': patch
---

[fix] make the `Slider` default track color visible on muted backgrounds

The background track painted with `--color-background-muted` — the same token
used for muted surface fills — so the track disappeared on muted backgrounds.
The track now uses the dedicated `--color-track` channel token, which is
designed to stay legible against body/muted surfaces.

Also makes the `Slider` docsite examples interactive: the showcase block now
manages its own state via `onChange`, and the properties-tab preview gains an
explicit `width` so the track renders with room to drag.

@cixzhang
