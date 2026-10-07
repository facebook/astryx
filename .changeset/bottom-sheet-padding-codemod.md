---
'@astryxdesign/cli': patch
---

[feat] `astryx upgrade` adds `padding={0}` to BottomSheet elements that do not set `padding`, keeping their unpadded content box now that BottomSheet pads like Dialog. Sheets whose only child is a Section or a Layout are left unchanged, and a sheet with a nested Layout that sets no padding also gets a TODO comment.

@imdreamrunner
