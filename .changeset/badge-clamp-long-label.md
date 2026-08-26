---
'@astryxdesign/core': patch
---

[fix] Badge: a long label no longer escapes its container.

`Badge` set `white-space: nowrap` with nothing to clip it — the one pairing
that neither wraps nor truncates. A label wider than the space available
rendered _outside_ the badge's container and over whatever sat beside it.

```tsx
<div style={{width: 100}}>
  <Badge variant="pink" label="Awaiting security review" />
</div>
```

Measured in Chromium: that badge came out **163px** wide in a 100px column,
spilling 63px past it; in a fixed-layout table cell it painted 64px over the
text in the next cell. The badge now clamps to the width it is given and cuts
the label with an ellipsis.

A badge that already fits is untouched — same width, same height, same DOM.
Measured before and after, a badge with room to spare is 53px either way; only
the cases that were already overflowing change. `Badge` uses no hooks and
stays server-renderable.

The ellipsis sits on an inner label span rather than the badge itself, because
`text-overflow` needs a block container and taking the root off `inline-flex`
to get one would cost the icon its centring. With an icon, the icon holds its
place and the label gives way.

Not included: a tooltip carrying the full text. That needs runtime measurement
and would make `Badge` a client component, so it is a separate change with its
own trade-off to weigh.

@freddymeta
