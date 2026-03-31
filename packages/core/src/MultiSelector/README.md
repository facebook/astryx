# MultiSelector

Multi-select dropdown component with checkboxes for choosing multiple items from a list.

## File Manifest

| File                        | Purpose                                                  |
| --------------------------- | -------------------------------------------------------- |
| `XDSMultiSelector.tsx`      | Main component implementation                            |
| `types.ts`                  | Type re-exports from Selector with MultiSelector aliases |
| `hooks.ts`                  | `useMultiCombobox` — keyboard nav + toggle logic         |
| `index.ts`                  | Public API entry point                                   |
| `MultiSelector.doc.mjs`     | Component documentation (ComponentDoc)                   |
| `XDSMultiSelector.test.tsx` | Unit tests                                               |
| `README.md`                 | This file                                                |

## Architecture

Composes existing XDS components rather than rebuilding:

- **XDSField** — label, description, status delegation
- **useXDSPopover** — dropdown positioning, surface styles, light dismiss, focus trapping
- **XDSCheckboxInput** — real checkbox for each option
- **XDSDivider** — section dividers
- **XDSBadge** — trigger display="badges" mode
- **XDSSpinner** — loading state

Reuses `XDSSelectorOptionType/Data/Divider/Section` types and utilities
(`isOptionData`, `isDivider`, `isSection`, `normalizeOption`, `getSelectableOptions`)
from `../Selector/types` and `../Selector/utils`.

## Differences from XDSSelector

- **Multi-value**: `value: string[]` and `onChange: (value: string[]) => void`
- **Stays open**: clicking an item toggles it without closing the dropdown
- **Checkboxes**: each option renders a real `XDSCheckboxInput`
- **Select all**: optional `hasSelectAll` with indeterminate state
- **Search**: optional `hasSearch` for filtering options
- **Trigger display**: `count` | `labels` | `badges` modes

## Theming

The trigger renders `xdsClassName('multi-selector', {size, status})`, producing stable
CSS classes that themes can target via `defineTheme({ components })`:

```ts
defineTheme({
  name: 'custom',
  components: {
    'multi-selector': {
      base: {borderRadius: 'var(--radius-3)'},
      'size:sm': {fontSize: '12px'},
      'status:error': {borderColor: 'var(--color-negative)'},
    },
  },
});
```

See the [Theming Infrastructure wiki](https://github.com/facebookexperimental/xds/wiki/Theming-Infrastructure)
for the full component theming model.
