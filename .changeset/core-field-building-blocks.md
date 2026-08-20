---
'@astryxdesign/core': patch
---

[feat] Export three internals that a field built outside core cannot be
correct without

Each of these is something every core input already uses, and a field built
elsewhere — `@astryxdesign/lab`'s `DateInputNext`, which has to hold
`DateInput`'s exact contract — had no way to reach:

- `useResolvedRequired` (from `@astryxdesign/core/hooks`). A field that sets
  `aria-required` from its own `isRequired` alone reads as "not required" to a
  screen reader inside a `FormLayout` with `defaultOptionality="required"`,
  while looking required to everyone else. This is the hook that closes that
  gap, and every core input resolves through it.
- `normalizeDayOfWeek` and the `DayOfWeekName` type (from
  `@astryxdesign/core/utils`). `weekStartsOn` accepts `0`–`6` or `'sun'`–`'sat'`
  across Calendar and the date inputs; without the shared normalizer an
  external component taking the same prop can only support half of it.
- `groupStyles` (from `@astryxdesign/core/InputGroup`). A control inside an
  `InputGroup` has to drop its outer radii and overlap its neighbour's border;
  without these exact styles it renders as a separate box sitting inside the
  group rather than as a segment of it.

Also adds five `@astryx.dateInput.*` catalog keys for a mobile picker's header
(`today`, `doneChoosingMonth`, `chooseMonthYear`, `monthWheel`, `yearWheel`),
so those strings are translated rather than passed in as props.

All additive; nothing existing changed.

@imdreamrunner
