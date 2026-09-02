# Stacked Bottom Sheets

<!-- CORE_PROBES: two-level-push-pop,three-level-push-pop,branch-replacement,top-only-dismissal,covered-state-persistence,initially-open-stack,deep-link-serialization,independent-stack-scope -->

A controlled stack owns one ordered list of open sheet IDs plus explicit interaction
policy. Array order is bottom-to-top; only the final ID is interactive and
dismissible.

## Import

```tsx
import {BottomSheet, BottomSheetStack} from '@astryxdesign/core/BottomSheet';
```

## Basic usage

```tsx
const openerRef = useRef<HTMLButtonElement>(null);
const [openSheetIds, setOpenSheetIds] = useState<ReadonlyArray<string>>([]);

<>
  <Button
    ref={openerRef}
    label="Open issues"
    onClick={() => setOpenSheetIds(['issues'])}
  />
  <BottomSheetStack
    openSheetIds={openSheetIds}
    onOpenSheetIdsChange={setOpenSheetIds}
    modality="modal"
    finalFocusRef={openerRef}>
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
one ID pushes; removing the final ID pops; `[]` closes the stack.

## State and ordering

`openSheetIds` is the complete logical path and contains unique registered IDs.
Unknown or duplicate IDs warn and are never presented as blank layers. Replace a
branch by replacing its suffix. Arbitrary controlled changes converge immediately;
append and single suffix-pop receive the designed transition.

## Dismissal

Escape, scrim interaction, and swipe request a suffix pop only from the top sheet,
subject to its `purpose`. Explicit Close all controls pass `[]`. Covered sheets
cannot dismiss themselves, and repeated dismissals during an exit cannot pop an
additional level.

## Focus

On push, the covered sheet remembers its focused control. On pop, focus returns to
that control. `finalFocusRef` is the deterministic root-close destination. Without
it, the stack captures the opener; a non-modal close restores inferred focus only
when focus is still inside the closing stack, so it never steals focus from the page.

## Modality and scrim

`modality="modal" | "nonModal"` controls focus containment, background interaction,
and scroll lock. `hasScrim` controls paint and defaults to
`modality === "modal"`. A non-modal scrim is pointer-transparent; a modal stack may
omit visible dimming without weakening modal enforcement.

Stack geometry is theme-owned through `--bottom-sheet-stack-offset`,
`--bottom-sheet-stack-scale-step`, `--bottom-sheet-stack-min-scale`, and
`--bottom-sheet-stack-visible-depth`. Presented layers expose `data-stack-depth` for
inspection, not navigation.

## Deep links and multiple stacks

Serialize `openSheetIds` directly in application or route state. A non-empty initial
value presents and focuses the top sheet on first render. Use a separate
`BottomSheetStack` instance for every independent flow; ordering, dismissal, focus,
and depth are controller-local.

## Rules

- Keep IDs stable and unique; derive one ordered path from application state.
- Append for forward navigation, replace a suffix for branching, slice for Back, and
  use `[]` for Close all.
- Set policy on the stack, not individual sheets.
- Do not hand-write transforms, z-index, inertness, focus traps, or scrims.
