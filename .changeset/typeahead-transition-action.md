---
'@astryxdesign/core': patch
---

[feat] Typeahead: isLoading and changeAction join the input family's busy and Transition Action contracts (#5941)

Typeahead could show a search in flight but had no way to say its value was busy. `isLoading` marks the field value as resolving or being saved: the end-lane Spinner shows and the combobox carries `aria-busy`, while the search source and its results stay untouched (FR5). `changeAction` runs after `onChange` with the same proposed item, in a React transition, on both value paths — selection and the clear button — with the proposed item shown as the token until `value` catches up (FR6). A search in flight and a busy value share one Spinner and one `aria-busy`, never two (FR7). Callers that pass neither prop see no change beyond the disabled-reason fix below.

While the field is disabled with a `disabledMessage`, the focusable-disabled input keeps receiving keys and an already-open menu stays on screen, so two edits that slipped through are now blocked (family FR4): ArrowDown then Enter selecting one of the entries shown on focus, and clicking an option in a menu still open from before the field was disabled. Dismissal is not an edit: Tab still closes that open menu on the keydown itself, and Escape still closes it through the shared layer stack.

@AKnassa
