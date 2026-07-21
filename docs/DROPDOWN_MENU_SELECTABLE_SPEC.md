# DropdownMenu Selectable Items — API Spec

**Status:** Lab (experimental). Ships under `@astryxdesign/lab` (canary dist-tag).
**Tracking:** [#3829](https://github.com/facebook/astryx/issues/3829)
**Family:** Action / Menu (DropdownMenu, ContextMenu, MoreMenu)

## Summary

Three components that add selectable rows to a core `<DropdownMenu>`:

- **`DropdownMenuCheckboxItem`** — an independent boolean toggle (`role="menuitemcheckbox"`).
- **`DropdownMenuRadioGroup`** + **`DropdownMenuRadioItem`** — a single-select, one-of-N group (`role="menuitemradio"`).

Radio (single-select) and checkbox (independent) are distinct ARIA + interaction
contracts, so they are explicit, composable components rather than an overloaded
`isSelected` boolean (see #3821, #3829). Naming and composition follow the
established `DropdownMenu` / `DropdownMenuItem` API so the surface reads
consistently with what already exists.

## Design principles applied

1. **Consistency first.** Props mirror `DropdownMenuItem` (`label`, `description`,
   `icon`, `isDisabled`, `endContent`, `xstyle`/`className`/`style`,
   `data-testid`). Radio selection uses `value` + `onChange` (matching
   `RadioList`); checkbox uses `checked` + `onCheckedChange` (the Radix
   natural-language prior that AI consumers reach for). Nothing new is invented
   where a sibling convention exists.
2. **Radio needs a group.** A one-of-N choice requires an owner of the single
   selection and an accessible group name, so `DropdownMenuRadioItem` must live
   inside `DropdownMenuRadioGroup` (it throws otherwise). Checkbox items are
   standalone — no group.
3. **Control size derives from the item size.** The checkbox/radio control is
   not sized independently. It reads the menu's item size from
   `DropdownMenuContext` (`menuSize`, itself derived from the trigger button
   size) and maps it: `sm → sm` (18px), `md`/`lg → md` (22px). This keeps the
   control proportional to the row it sits in — a `sm` menu gets the compact
   control automatically, with no extra prop.
4. **Mobile: control on the inline-end.** On coarse-pointer (touch) devices the
   control swaps from the leading edge to the row's inline-end via CSS `order` +
   `margin-inline-start: auto`, gated by `@media (pointer: coarse)`. This is the
   conventional placement for selection toggles on mobile and gives a
   thumb-reachable target. It is a pure-CSS swap (no JS, no `useMediaQuery`), so
   it is SSR-safe with no hydration flash.

## API

### `DropdownMenuCheckboxItem`

```tsx
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {DropdownMenuCheckboxItem} from '@astryxdesign/lab';

<DropdownMenu button={{label: 'View'}}>
  <DropdownMenuCheckboxItem
    label="Show archived"
    isChecked={showArchived}
    onCheckedChange={setShowArchived}
  />
</DropdownMenu>;
```

| Prop                                             | Type                         | Default | Notes                                                                      |
| ------------------------------------------------ | ---------------------------- | ------- | -------------------------------------------------------------------------- |
| `label`                                          | `ReactNode`                  | —       | Primary label (required).                                                  |
| `description`                                    | `ReactNode`                  | —       | Secondary text below the label.                                            |
| `icon`                                           | `ReactNode \| IconType`      | —       | Leading icon (semantic name or node).                                      |
| `isChecked`                                      | `boolean`                    | —       | Controlled checked state (required).                                       |
| `onCheckedChange`                                | `(checked: boolean) => void` | —       | Fired with the next state.                                                 |
| `isDisabled`                                     | `boolean`                    | `false` |                                                                            |
| `closeOnSelect`                                  | `boolean`                    | `false` | Checkbox menus usually stay open so several can be toggled in one session. |
| `endContent`                                     | `ReactNode`                  | —       | Trailing content.                                                          |
| `xstyle` / `className` / `style` / `data-testid` |                              |         | Standard passthroughs.                                                     |

### `DropdownMenuRadioGroup` + `DropdownMenuRadioItem`

```tsx
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {DropdownMenuRadioGroup, DropdownMenuRadioItem} from '@astryxdesign/lab';

<DropdownMenu button={{label: 'Sort'}}>
  <DropdownMenuRadioGroup value={sort} onChange={setSort} aria-label="Sort by">
    <DropdownMenuRadioItem value="newest" label="Newest" />
    <DropdownMenuRadioItem value="oldest" label="Oldest" icon="clock" />
  </DropdownMenuRadioGroup>
</DropdownMenu>;
```

**`DropdownMenuRadioGroup`**

| Prop                             | Type                      | Default | Notes                                                   |
| -------------------------------- | ------------------------- | ------- | ------------------------------------------------------- |
| `value`                          | `string \| undefined`     | —       | The selected value (required).                          |
| `onChange`                       | `(value: string) => void` | —       | Fired with the newly selected value (required).         |
| `aria-label` / `aria-labelledby` | `string`                  | —       | Accessible name for the group (one is required for AT). |
| `closeOnSelect`                  | `boolean`                 | `true`  | Radios usually close the menu on selection.             |
| `children`                       | `ReactNode`               | —       | `DropdownMenuRadioItem`s.                               |

**`DropdownMenuRadioItem`**

| Prop                                             | Type                    | Default | Notes                                             |
| ------------------------------------------------ | ----------------------- | ------- | ------------------------------------------------- |
| `value`                                          | `string`                | —       | This item's identity within the group (required). |
| `label`                                          | `ReactNode`             | —       | Primary label (required).                         |
| `description`                                    | `ReactNode`             | —       | Secondary text.                                   |
| `icon`                                           | `ReactNode \| IconType` | —       | Leading icon.                                     |
| `isDisabled`                                     | `boolean`               | `false` |                                                   |
| `endContent`                                     | `ReactNode`             | —       | Trailing content.                                 |
| `xstyle` / `className` / `style` / `data-testid` |                         |         | Standard passthroughs.                            |

## Accessibility

- The **row owns the role + state**: `role="menuitemcheckbox"` / `menuitemradio`
  with `aria-checked` on the `Item` element itself. There is **no nested native
  `<input>`** (unlike `CheckboxInput` / `RadioListItem`, which are form
  controls). The visual control is decorative and `aria-hidden`. This matches
  the WAI-ARIA menu pattern.
- `DropdownMenuRadioGroup` renders `role="group"` with an accessible name so the
  radios are announced as a set.
- **Keyboard reachability** required a core change: `DropdownMenu`'s
  `useListFocus` selector, typeahead item query, and Enter/Space activation
  previously matched only `[role="menuitem"]`. They now match
  `menuitem`, `menuitemradio`, and `menuitemcheckbox`, so selectable rows are
  focusable, type-ahead-navigable, and activatable alongside plain items. (This
  is the latent keyboard bug flagged in #3821.)

## Core changes (minimal, backwards-compatible)

1. `DropdownMenu` roving-focus / typeahead / activation now recognize the two
   selectable roles (a single `MENU_ITEM_ROLES` set drives the selector).
2. `DropdownMenuContext`, `useDropdownMenuContext`, `DropdownMenuContextValue`,
   and the new `DropdownMenuSize` type are exported from
   `@astryxdesign/core/DropdownMenu` so lab (and any consumer) can build custom
   menu items that read the menu size / close the menu.

No changes to existing `DropdownMenu` / `DropdownMenuItem` props or behavior.

## Why lab, not core

These are new interaction surfaces that benefit from real-world iteration
(API arbitration and vibe-testing are still open in #3829). `@astryxdesign/lab`
is published only under the `@canary` dist-tag, so consumers can adopt early
without a stability guarantee. They graduate to `@astryxdesign/core` once
vetted.

## Open questions (tracked in #3829)

- Whether to add a data-driven form (nested `items`) in addition to the compound
  API, for parity with `DropdownMenu`'s dual-mode surface.
- Whether standalone `DropdownMenuCheckboxItem` should be complemented by a
  `DropdownMenuCheckboxGroup` for grouped multi-select.
- Reconciling `isSelected` semantics from the parked #3821 prototype.
