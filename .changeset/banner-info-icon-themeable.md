---
'@astryxdesign/core': patch
---

[fix] Banner: the 'banner-icon' theme target now rides on the default status Icon itself instead of its layout wrapper, so theme component overrides ('banner-icon' + 'status:X') that set color actually reach the glyph. The Icon keeps its existing color variant (info still renders accent) and same-element rules in @layer astryx-theme win over it, so default rendering is unchanged. Contract note: '.astryx-banner-icon' now matches the icon element rather than the wrapper when the default icon renders; a theme that used the target for wrapper layout (margin, alignment) now styles the glyph instead. With a custom `icon` node the target stays on the layout-only wrapper, since core never injects props into consumer elements (#4166)

@jiunshinn
