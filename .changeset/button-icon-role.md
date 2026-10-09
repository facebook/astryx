---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] Button, IconButton and ToggleButton now render a direct Astryx Icon in the `button-leading` icon role. Themes can choose its size with `roleSizeOverrides` and its appearance for the disabled, pressed or loading state, while the button's icon box always matches the final icon size. With no theme icon policy, Buttons look exactly as before, and other icon content keeps its current box.

@rubyycheung
