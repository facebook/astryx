---
'@xds/core': patch
---

Fix `XDSSpinner` rendering off-center inside the icon-only `XDSButton` loading state. The spinner canvas now pins its CSS layout size to its logical dimensions instead of deriving it from the device pixel ratio, so it no longer overflows its `overflow: hidden` wrapper and clips asymmetrically at fractional device pixel ratios. The button loading overlay and the spinner wrapper also use `display: grid` + `place-items: center` for sub-pixel-stable centering.
