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

So that a clipped tail is not simply lost, a string or number label is also
carried in the badge's `title` — the same shape `BaseTable` already uses for a
truncated header cell. That costs no measurement and no hook, so
`Badge` still renders the same on the server and stays usable in a server
component. A rich `label` is left alone rather than flattened to a guess.

Two gaps remain, both needing runtime measurement, and both tracked in #5585:
the `title` is set whether or not the label actually fits, and a native `title`
is a pointer affordance — it answers hover, not keyboard focus, and not touch
at all. The refinement is a tooltip shown only when the text is really cut,
reachable by hover and by focus, which makes `Badge` a client component and is
its own trade-off to weigh.

@freddymeta
