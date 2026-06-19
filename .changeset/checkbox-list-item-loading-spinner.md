---
'@xds/core': patch
---

`XDSCheckboxList` loading is now per-item. The group-level `isLoading` prop on `XDSCheckboxList` (which dimmed every item) has been removed in favor of an `isLoading` prop on `XDSCheckboxListItem`. A loading item renders a spinner **inside its checkbox** (using `XDSSpinner`'s `inherit` shade so the ring matches the box's resolved foreground in both checked and unchecked states) and blocks interaction on that item only.

In collection mode this is also driven automatically: when `XDSCheckboxList` has a `changeAction`, the item the user just toggled shows its spinner while that promise is pending — no value-array diffing required, since the toggled value is passed up directly.

`XDSCheckboxInput`'s built-in loading spinner now uses the `inherit` shade as well, for consistent contrast across themes.
