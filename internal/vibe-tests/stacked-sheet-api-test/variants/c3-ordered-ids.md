# Stacked Bottom Sheets

<!-- CORE_PROBES: two-level-push-pop,three-level-push-pop,branch-replacement,top-only-dismissal,covered-state-persistence,initially-open-stack,deep-link-serialization,independent-stack-scope -->

A controlled stack owns one ordered list of open sheet IDs. Array order is
bottom-to-top; only the final ID is interactive and dismissible.

## Import

```tsx
import {BottomSheet, BottomSheetStack} from '@astryxdesign/core/BottomSheet';
```

## Basic usage

```tsx
const [openSheetIds, setOpenSheetIds] = useState<ReadonlyArray<string>>([]);

<>
  <Button label="Open issues" onClick={() => setOpenSheetIds(['issues'])} />
  <BottomSheetStack
    openSheetIds={openSheetIds}
    onOpenSheetIdsChange={setOpenSheetIds}>
    <BottomSheet sheetId="issues" label="Issues">
      <IssueList onSelect={() => setOpenSheetIds(ids => [...ids, 'details'])} />
    </BottomSheet>
    <BottomSheet sheetId="details" label="Login timeout">
      <IssueDetails />
      <Button
        label="Back"
        onClick={() => setOpenSheetIds(ids => ids.slice(0, -1))}
      />
    </BottomSheet>
  </BottomSheetStack>
</>;
```

Covered sheets remain mounted, visible, inert, and accessibility-hidden. Appending
one ID pushes a sheet; removing the final ID pops one level; `[]` closes the stack.

## State and ordering

`openSheetIds` is the complete logical path and must contain unique IDs matching
child `sheetId` values. Replace a branch with a new suffix rather than keeping stale
IDs. Arbitrary controlled changes converge immediately; append and single suffix-pop
receive the designed transition.

## Dismissal

Escape, scrim interaction, and swipe call `onOpenSheetIdsChange` with only the final
ID removed, subject to the top sheet's `purpose`. Explicit Close all controls pass
`[]`. Covered sheets cannot dismiss themselves.

## Focus

On push, the covered sheet remembers its focused control. On pop, focus returns to
that control. Closing the full modal stack returns focus to the element that opened
the first sheet when it remains mounted. The top sheet focuses `[data-autofocus]` or
its panel.

## Modality and scrim

`hasScrim` configures both paint and interaction policy for the complete stack.
`true` (default) is modal: native backdrop, focus containment, background blocking,
and scroll lock. `false` is non-modal with no scrim and leaves the page interactive.
The original API does not represent modal-without-scrim or
non-modal-with-scrim as independent choices.

## Deep links and multiple stacks

Serialize `openSheetIds` directly in application or route state. A non-empty initial
value presents that path on first render. Use a separate `BottomSheetStack` instance
for every independent flow; ordering, dismissal, and depth are controller-local.

## Rules

- Keep IDs stable and unique; never include an unknown ID.
- Treat the value as one path, not a set; preserve bottom-to-top order.
- Append for forward navigation, slice the suffix for Back, and use `[]` for Close all.
- Do not hand-write transforms, z-index, inertness, focus traps, or scrims.
