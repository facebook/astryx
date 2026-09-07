---
'@astryxdesign/core': patch
---

[feat] Give `DateInput` and `DateTimeInput` a caller-owned `adaptations` surface policy

Both date fields now accept an ordered, environment-conditioned policy over the
three surfaces they already have, instead of deciding from the primary pointer
alone:

```tsx
<DateInput
  label="Event date"
  value={date}
  onChange={setDate}
  adaptations={{
    default: 'popover',
    rules: [
      {when: {width: {below: 'md'}, pointer: 'coarse'}, value: 'bottom-sheet'},
      {when: {width: {below: 'sm'}, pointer: 'coarse'}, value: 'native'},
    ],
  }}
/>
```

`default` is the server-rendered, hydration, and no-match value, so the server
picks the whole tree without guessing at a viewport. Rules are checked in author
order and the LAST match wins; `width` names resolve against the nearest Theme's
width points, `from` is inclusive, `below` is exclusive, and the fields of one
`when` are ANDed. An empty `rules` array is valid and always resolves to
`default`. `DateInputAdaptationValue` and `DateTimeInputAdaptationValue` — both
`'native' | 'popover' | 'bottom-sheet'` — are exported from `@astryxdesign/core`
and from `@astryxdesign/core/DateInput` and `@astryxdesign/core/DateTimeInput`.

Each value is EXACT and holds on any pointer, which is what `nativePicker`
cannot say: `'native'` is the platform control, `'popover'` the typable field
with the anchored calendar (and, on DateTimeInput, the time list), and
`'bottom-sheet'` the touch field with its sheet. A policy can therefore pin the
sheet on a mouse-driven kiosk, keep the typable field on a tablet, or render a
chosen surface on the server.

`nativePicker` is unchanged and keeps its meaning: with no `adaptations` prop,
both components run exactly the pointer test they always did, including its
mid-interaction switch and its quiet fallback for props the platform picker
cannot draw. The two props are mutually exclusive — passing both defined values
throws before a surface opens, while an explicitly spread `undefined` is not a
conflict.

A policy that names `'native'` is validated EAGERLY, across `default` and every
rule, matched or not: `numberOfMonths={2}` or any explicit `weekStartsOn` throws
on DateInput, and those plus `hasSeconds`, a non-default `timeIncrement`, or any
`timeOptionInterval` throw on DateTimeInput, each naming the offending policy
path. The point is that the failure lands on the author's machine rather than on
the one device whose width and pointer select that rule, and it throws in
production as well as development, because a silently dropped week start is a
wrong calendar rather than a warning. `min`, `max` and `dateConstraints` stay
supported on the native surface: the bounds are forwarded and every constraint
is enforced on commit.

The resolved surface is LATCHED while the field is in use. These components
switch between separate component trees, so publishing a new value mid-entry
would unmount the focused control and take the uncommitted draft with it — an
ordinary rotation or window resize, on a field someone is typing into. A policy
change now applies once the surface has closed and focus has left. The legacy
`nativePicker` path deliberately keeps its released behavior here too.

@imdreamrunner
