---
'@astryxdesign/core': patch
---

[feat] `useTableRowExpansion` accepts `panelVariant`, so the detail panel can sit on the surface behind the table instead of on its own wash. (#5995)

@ernestt

The panel row painted `--color-background-muted` unconditionally, and being a `<tr>` the plugin builds itself, nothing a caller rendered could reach it. That wash is the right default — in a bare table it is the only thing distinguishing a detail panel from another row of data — but it is wrong for a table already sitting on a `Card` or `Section`, where it reads as a third surface stacked on the second rather than as a distinction.

`transparent` is the other option, matching `Card`'s vocabulary. Default is unchanged.

One thing worth knowing when picking: `--color-background-muted` is a low-alpha near-black, so over a dark card it is very nearly invisible — dark themes have effectively been rendering `transparent` all along. `muted` is a light-theme effect, which is also why turning it off costs less than it appears to.
