---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] Add `presentation` to DateInput, DateTimeInput, and TimeInput (`spec:AST-043`).

`presentation` names every picker surface, distinguishing Astryx's desktop surface, Astryx's bottom sheet (including a new TimeInput sheet), the browser/OS picker, and — for TimeInput only — a plain typed field. DateInput and DateTimeInput accept five values: `'popover' | 'bottom-sheet' | 'native' | 'adaptive-bottom-sheet' | 'adaptive-native'` (default). TimeInput accepts those five plus `'text-input'`, the typed field on every pointer, because that is the surface its released `nativePicker="never"` already was. `presentation="native"` always shows native; `adaptive-native` keeps the released native fallbacks.

`nativePicker` is deprecated but keeps working exactly as released (`touch`→`adaptive-native`, `always`→`native`, `never`→`adaptive-bottom-sheet`, or `text-input` for TimeInput); `presentation` wins when both are set. `astryx upgrade` ships `migrate-native-picker-to-presentation` for static callsites.

@imdreamrunner
