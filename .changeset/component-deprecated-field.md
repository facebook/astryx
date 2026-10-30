---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[feat] A component doc can mark its component deprecated with `deprecated: {replacement, description}`: the `name` of the component to use instead and the modernization route. `astryx search` results for that component carry the field as `deprecated` (a `deprecated:` line in text output), and the docsite labels the component Deprecated by its title, in the components index, sidebar, and search, with a notice at the top of its page that names and links the replacement. `BottomSheetSwitcher` sets it, naming `BottomSheet`; the component keeps working unchanged.

@imdreamrunner
