# Stacked Bottom Sheets

<!-- CORE_PROBES: two-level-push-pop,three-level-push-pop,branch-replacement,top-only-dismissal,covered-state-persistence,initially-open-stack,deep-link-serialization,independent-stack-scope -->

A declarative stack groups ordinary sheet roots. Each sheet owns its open state;
opening chronology determines which open sheet is on top within the nearest stack.

## Import

```tsx
import {BottomSheet, BottomSheetStack} from '@astryxdesign/core/BottomSheet';
```

## Basic usage

```tsx
<BottomSheetStack.Root>
  <BottomSheet.Root forStack="closest">
    <BottomSheet.Trigger>Open issues</BottomSheet.Trigger>
    <BottomSheet.View label="Issues">
      <IssueList />
      <BottomSheet.Root forStack="closest">
        <BottomSheet.Trigger>Login timeout</BottomSheet.Trigger>
        <BottomSheet.View label="Login timeout">
          <IssueDetails />
          <BottomSheet.Trigger action="dismiss">Back</BottomSheet.Trigger>
        </BottomSheet.View>
      </BottomSheet.Root>
    </BottomSheet.View>
  </BottomSheet.Root>
</BottomSheetStack.Root>
```

Sheets may be nested or siblings. `forStack="closest"` associates a sheet with the
nearest `BottomSheetStack.Root`; the order in which sheets open determines their
bottom-to-top order. Covered sheets remain mounted, visible, inert, and
accessibility-hidden.

## State and ordering

`BottomSheet.Root` may be controlled for routing, branching, or external state:

```tsx
<BottomSheet.Root
  open={detailsOpen}
  onOpenChange={setDetailsOpen}
  forStack="closest">
  <BottomSheet.View label="Details">...</BottomSheet.View>
</BottomSheet.Root>
```

Opening a sheet puts it on top. Closing it reveals the previously opened sheet.
When changing branches, close the old child before opening the new child so stale
branches do not remain in history.

## Dismissal

Escape, scrim interaction, and swipe request dismissal only from the top sheet.
`BottomSheet.Trigger action="dismiss"` closes its owning sheet. A root-level Close
all action should set every controlled sheet to closed. Covered sheets ignore
programmatic dismissal requests until they are topmost.

## Focus

Each `BottomSheet.Trigger` is the default focus-return target for its sheet. On open,
focus moves to `[data-autofocus]` or the sheet panel. On dismiss, focus returns to
that sheet's trigger. When sheets are controlled without a trigger, pass
`finalFocusRef` to `BottomSheet.Root`.

## Modality and scrim

Each `BottomSheet.View` accepts `modality="modal" | "nonModal"` and `hasScrim`.
Modal behavior controls focus containment and background interaction; scrim controls
paint. Keep policy consistent across sheets in one stack. A non-modal scrim is
pointer-transparent.

## Deep links and multiple stacks

Derive each root's `open` value from route state for an initially open path. Open
ancestors before descendants. Separate flows require separate
`BottomSheetStack.Root` instances. For disconnected trees, pass the same `stackId`
to the stack root and `forStack` on each sheet root.

## Rules

- Keep every logical flow inside one stack root.
- Use stable sheet roots; do not remount an open root to navigate.
- Close sibling branches explicitly before opening a replacement branch.
- Do not hand-write transforms, z-index, inertness, focus traps, or scrims.
