---
'@astryxdesign/cli': patch
---

[feat] `astryx upgrade` adds `padding={0}` to BottomSheet elements that do not set `padding`, keeping their unpadded content box now that BottomSheet pads like Dialog. Sheets whose only child is a Section or a Layout are left unchanged. A sheet with a Layout anywhere in its content also gets a TODO comment, because `padding={0}` removes the inset between that Layout's regions and the Layout's own `padding` restores only its outer edges. A shadowed `BottomSheet` binding is left alone, and a second run changes nothing.

@imdreamrunner
