# Stacked Bottom Sheets

<!-- CORE_PROBES: two-level-push-pop,three-level-push-pop,branch-replacement,top-only-dismissal,covered-state-persistence,initially-open-stack,deep-link-serialization,independent-stack-scope -->

Open sibling bottom sheets automatically form a last-opened-on-top stack. No stack
controller is required. Each sheet remains an ordinary controlled component.

## Import

```tsx
import {BottomSheet} from '@astryxdesign/core/BottomSheet';
```

## Basic usage

```tsx
const [issuesOpen, setIssuesOpen] = useState(false);
const [detailsOpen, setDetailsOpen] = useState(false);

<>
  <Button label="Open issues" onClick={() => setIssuesOpen(true)} />
  <BottomSheet isOpen={issuesOpen} onOpenChange={setIssuesOpen} label="Issues">
    <IssueList onSelect={() => setDetailsOpen(true)} />
  </BottomSheet>
  <BottomSheet
    isOpen={detailsOpen}
    onOpenChange={setDetailsOpen}
    label="Login timeout">
    <IssueDetails />
    <Button label="Back" onClick={() => setDetailsOpen(false)} />
  </BottomSheet>
</>;
```

Every open `BottomSheet` joins the stack registry. The last sheet to open is on top.
Covered sheets remain mounted and visibly recede by their registry depth. The
behavior is on by default; `hasStackRecede={false}` leaves a covered sheet at rest.

## State and ordering

Each sheet has its own `isOpen` and `onOpenChange`. Forward navigation opens another
sheet. Back closes the current sheet. For a branch replacement, close the current
child and open its sibling in one state update. Derive each boolean from application
or route state when navigation must be serializable.

## Dismissal

Escape, scrim interaction, and swipe call `onOpenChange(false)` only for the
last-opened sheet. Explicit Close all controls set every participating sheet to
false. Closing a covered sheet directly is ignored until it becomes topmost.

## Focus

Each sheet captures the focused element when it opens and returns focus there after
its exit. Pass `finalFocusRef` when the default opener may remount. Only the top sheet
is focusable; covered sheets are inert and accessibility-hidden.

## Modality and scrim

Each sheet accepts `modality="modal" | "nonModal"` and `hasScrim`. Modality controls
focus containment and background interaction. Scrim controls paint. A non-modal
scrim is pointer-transparent. Keep these values consistent across sheets that form
one visual flow.

## Deep links and multiple stacks

For deep links, derive all required `isOpen` booleans from the route and render
ancestors before descendants. Registration order determines initial stack order.
The registry has no public grouping primitive: avoid opening unrelated sheet flows at
the same time. If concurrent independent inspectors are required, use separate
application roots or a different presentation pattern.

## Rules

- Render stacking sheets as siblings; never nest one sheet inside another.
- Keep each sheet mounted while it may be covered or exiting.
- Coordinate branch booleans atomically so stale children do not remain open.
- Do not hand-write transforms, z-index, inertness, focus traps, or scrims.
