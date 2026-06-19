---
'@xds/core': minor
---

Add a `width` prop to field-based components so they can size predictably. `width` (a `SizeValue` — numbers are pixels, strings like `'100%'` are used as-is) is applied to the outer `XDSField` container, so the whole field — label, control, and status — sizes together and stays aligned.

Previously the only way to size these components was `xstyle`/`className`/`style`, which land on the inner control box: setting `width: '100%'` there stretched the bordered input but left the label and status at their natural width (issue #2755). `width` targets the right element and avoids that mismatch.

This is additive and backward compatible — `xstyle`/`className`/`style` continue to target the inner control box exactly as before.

Affected: `XDSTextInput`, `XDSTextArea`, `XDSNumberInput`, `XDSDateInput`, `XDSDateRangeInput`, `XDSDateTimeInput`, `XDSTimeInput`, `XDSFileInput`, `XDSSelector`, `XDSMultiSelector`, `XDSTypeahead`, `XDSTokenizer`, `XDSSlider`, `XDSCheckboxInput`, `XDSCheckboxList`, `XDSRadioList`, `XDSSwitch`, and `XDSField` itself.
