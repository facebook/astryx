---
'@astryxdesign/core': patch
---

[feat] Tooltip and HoverCard: tap to open where there is no hover

Hover is the one trigger a touch screen cannot express, and both components
were answering that badly. `Tooltip` suppressed itself on any device reporting
`(hover: none)`, so its content — often the only label an icon button has —
was simply unreachable on a phone. `HoverCard` did nothing at all: the
`mouseenter` a tap synthesizes opened the card on every tap of its trigger,
over the control the user was aiming at, with no gesture that closed it again.

Both now take a `touchTrigger` prop, and what the trigger DOES decides the
default. A trigger that performs an action — a button, a link, a form control
— keeps its tap under `auto`: the layer stays shut, because the tap already
has somewhere to go and a hint about a control the user just operated is
noise. A trigger that performs no action — an info icon, an abbreviation, a
truncated label — has nothing to lose, so the tap opens the layer, with no
show delay (a tap is a decision, not the hover intent the delay exists to
filter) and a tap outside to dismiss it. `tap` and `none` state the choice
outright; `tap` is what an info icon rendered as a button wants, since it
looks like an action to the DOM while revealing the layer is the only thing it
does.

Hover-capable devices are unaffected, hybrid ones included: the decision is
made per interaction from the pointer type rather than once per device from a
media query, so the same trigger opens on hover under a mouse and on tap under
a finger. `HoverCard` also no longer opens from the focus a tap leaves behind,
which was the second way a tap could bury the control it activated.

[fix] InfoTip (lab): opts into `touchTrigger="tap"`. Its trigger is a real
button, so the `auto` rule would hand the tap to the control — but revealing
the tooltip is that button's only purpose, and suppressing it left an
InfoTip's content unreachable on a phone.

@rubycheung
