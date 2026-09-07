---
'@astryxdesign/core': minor
---

[breaking] Give `Selector` a caller-owned `adaptations` presentation policy

`Selector` now accepts an ordered, environment-conditioned policy for the one
choice `presentation` already owned — anchored popover or modal bottom sheet:

```tsx
<Selector
  label="Owner"
  options={owners}
  adaptations={{
    default: 'popover',
    rules: [
      {when: {width: {below: 'md'}, pointer: 'coarse'}, value: 'bottom-sheet'},
    ],
  }}
/>
```

`default` is the server-rendered, hydration, and no-match value, so the server
picks the whole tree without guessing at a viewport. Rules are checked in author
order and the LAST match wins; `width` names resolve against the nearest Theme's
width points, `from` is inclusive, `below` is exclusive, and the fields of one
`when` are ANDed. An empty `rules` array is valid and always resolves to
`default`. `ComponentAdaptations`, `ComponentAdaptationRule`, and
`ComponentAdaptationCondition` are exported from `@astryxdesign/core`;
`SelectorAdaptationValue` (`'popover' | 'bottom-sheet'`) is exported from both
`@astryxdesign/core` and `@astryxdesign/core/Selector`.

`presentation` keeps its meaning and stays the short spelling. The two props are
mutually exclusive: TypeScript admits only one, and passing both defined values
throws before any surface opens. An explicitly spread `undefined` is not a
conflict.

**Behavior change — an invalid `presentation` now throws.** Its closed set is
`popover`, `bottom-sheet`, and `adaptive`. A value outside it — one arriving
from JavaScript, an untyped props bag, config, or a stale `presentation="modal"`
left by a rename — previously fell through to an anchored popover with no
warning, so a wrong surface was reported as a correct one. It now throws
`<Selector presentation> must be one of popover, bottom-sheet, adaptive;
received "modal".` TypeScript callers are unaffected; a JavaScript call site
passing a bad value sees a failure where it used to see silence.

**Breaking — the exact 768px edge.** `presentation="adaptive"` is now
`default: 'popover'` plus a `{width: {below: 'md'}, pointer: 'coarse'}`
bottom-sheet rule, resolved against the theme's `md` point. The released query
was `(max-width: 768px) and (pointer: coarse)`, which INCLUDED 768px; `below` is
exclusive, so at exactly 768px a coarse-pointer Selector now opens an anchored
popover where it previously presented a bottom sheet. Every other width behaves
as before. There is no per-callsite migration — the shared grammar has no
inclusive upper edge. A product that needs the old cutoff moves its theme's `md`
(global, and it also moves AppShell's default mobile-nav breakpoint); a Selector
that should always present a sheet uses `presentation="bottom-sheet"`.

`MultiSelector`, `DropdownMenu`, and `ContextMenu` are unchanged and keep the
released `max-width: 768px` query, so Selector and MultiSelector deliberately
disagree at exactly that width until they are separately migrated.

One pre-existing limitation is worth knowing when adopting a policy: with
server rendering, a selector that also sets `isDefaultOpen` comes up CLOSED
whenever its policy resolves differently on the client — `presentation="adaptive"`
on a compact touch client, or any rule matching there. The open runs from a
mount effect holding the server value. It behaves the same on `MultiSelector`,
which never migrated, and is unchanged by this release. Where a server-rendered
selector must start open, give it a policy that does not change across
hydration: `adaptations={{default: 'bottom-sheet', rules: []}}`.

@imdreamrunner
