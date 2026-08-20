---
'@astryxdesign/core': minor
'@astryxdesign/cli': minor
---

[breaking] Banner: children are visible by default, and the collapse axis moves onto one `collapsible` prop

Banner inferred its disclosure from its content: any `children` got a chevron in
the header and were hidden until it was pressed. There was no way to show
content without a toggle — the case a banner most often wants, a list of the
three fields that failed validation — and `defaultIsExpanded` was the only knob,
with no controlled mode.

The whole axis is now one `boolean | CollapsibleConfig` prop, following the
boolean-or-config convention `SideNav.collapsible` set, and backed by the shared
`useCollapsible` hook rather than Banner's own state:

```tsx
<Banner status="error" title="3 fields need attention">…</Banner>  // always visible
<Banner collapsible>…</Banner>                                     // collapsible, starts open
<Banner collapsible={{defaultIsOpen: false}}>…</Banner>            // starts collapsed
<Banner collapsible={{isOpen, onOpenChange}}>…</Banner>            // controlled (new)
```

`defaultIsExpanded` is removed, and children with no `collapsible` prop now
render instead of hiding. Run `astryx upgrade` — the
`banner-collapsible-content` codemod rewrites `defaultIsExpanded` to the
equivalent config and adds `collapsible={{defaultIsOpen: false}}` to banners
that relied on the implicit collapse, so behaviour is preserved. Those marked
collapsed are the ones worth a second look afterwards: content that is simply
visible is usually what a banner wants, and is now one prop shorter to write.

Note for a banner whose content is now always visible: `role="alert"` announces
the whole region, so an error banner reads its detail out along with its title.

@freddymeta
