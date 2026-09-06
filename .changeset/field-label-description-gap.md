---
'@astryxdesign/core': patch
---

[fix] FieldLabel: a field's description now sits flush under its label without breaking existing label layout overrides. (#5673)
@ernestt

A label and its description are one block of text, but nothing in `FieldLabel`
said so. It returned a fragment, leaving the `<label>` and the description
`<span>` as bare siblings of whatever column happened to hold them — so the
space between them was set by that parent's `gap`, the same declaration that
separates the label group from the control below it. No caller could close the
pair without also pulling the control up against the description, and each had
picked its own value.

Measured in Chromium as `description.top - label.bottom`:

|                           | label → description | description → control               |
| ------------------------- | ------------------- | ----------------------------------- |
| `Field`, `TextInput`      | 4px → **0px**       | 4px → 4px                           |
| `CheckboxInput`, `Switch` | 2px → **0px**       | n/a — control sits beside the label |

The label and description now share a wrapper of their own, so the space
between them is theirs to set rather than a side effect of the caller's
column. Only the pair closes up: the description → control gap is unchanged,
so fields keep their existing rhythm. `CheckboxInput` and `Switch` each
carried a 2px label wrapper to do this job locally, which the shared wrapper
makes redundant, so all three callers now agree instead of each choosing a
value.

A hidden label group takes `display: contents`, so the wrapper box leaves the
caller's layout entirely and the sr-only label and description stay out of
flow exactly as they were — a hidden label still costs no space and draws no
gap.

This is one change in `FieldLabel` rather than a change across the ~20 input
components, because every input reaches its label through `Field`.
