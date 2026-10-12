---
'@astryxdesign/cli': patch
---

[feat] `astryx upgrade` runs `migrate-field-input-styling`, which renames root `xstyle`/`className`/`style` on Field-composed inputs to the part they styled before: `controlXstyle`/`controlClassName`/`controlStyle` on TextInput, TextArea, NumberInput, FileInput, DateInput, DateRangeInput, DateTimeInput, TimeInput, Selector, MultiSelector, and ComplexSelector, and `containerXstyle`/`containerClassName`/`containerStyle` on Typeahead, Tokenizer, CheckboxList, RadioList, and Slider. It rewrites JSX written directly on an Astryx import (named, aliased, or namespace). Spreads and wrappers that forward their own styling props are left for manual migration, and a callsite that already sets the target prop gets a TODO instead of a rename. (#7342)

@cixzhang
