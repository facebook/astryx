---
'@astryxdesign/core': minor
'@astryxdesign/cli': minor
---

[breaking] Banner: the collapse axis moves onto one `collapsible` prop, and content can opt out of collapsing (#5255)

Banner inferred its disclosure from its content: any `children` got a chevron in
the header and were hidden until it was pressed. There was no way to show
content without a toggle — the case a banner most often wants, a list of the
three fields that failed validation — and `defaultIsExpanded` was the only knob,
with no controlled mode.

The whole axis is now one `boolean | CollapsibleConfig` prop, following the
boolean-or-config convention `SideNav.collapsible` set, and backed by the shared
`useCollapsible` hook rather than Banner's own state:

```tsx
<Banner status="error" title="3 fields need attention">…</Banner>  // unchanged: collapsible, starts closed
<Banner collapsible={false}>…</Banner>                             // new: always visible, no toggle
<Banner collapsible={{defaultIsOpen: true}}>…</Banner>             // replaces defaultIsExpanded
<Banner collapsible={{isOpen, onOpenChange}}>…</Banner>            // new: controlled
```

**The default is unchanged** — a banner that never mentioned `defaultIsExpanded`
behaves exactly as it did. The breaking part is the prop itself:
`defaultIsExpanded` is removed in favour of the config, which is a type error at
every call site rather than a silent change.

**Codemod:** `npx astryx upgrade --codemod banner-collapsible-content`

It rewrites `defaultIsExpanded` to `collapsible={{defaultIsOpen: true}}` and
drops `defaultIsExpanded={false}`, which is now the default. Banners that never
set the prop are left alone. `defaultIsExpanded` inside a props object (a
Storybook `args`, for instance) is out of the transform's scope — the removed
prop makes those a type error, so the compiler finds them.

@freddymeta
