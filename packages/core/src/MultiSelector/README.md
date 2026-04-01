# MultiSelector

Multi-select dropdown with checkboxes for choosing multiple items from a list.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

XDSMultiSelector is a checkbox dropdown for small, finite lists — column toggles, filter facets, permissions. For large/open sets with typeahead search, use XDSTokenizer instead.

- **Checkbox items** — real `XDSCheckboxInput` for each option
- **Select all** — optional toggle with indeterminate state
- **Search** — optional filter-in-place
- **Trigger display** — count, labels, or badge chips
- **Sections** — reuses `XDSSelector` option type model
- **Selected-first sort** — selected items sort to top on open (stable during interaction)

## Import

```tsx
import {XDSMultiSelector} from '@xds/core/MultiSelector';
```

## Usage

```tsx
<XDSMultiSelector
  label="Columns"
  options={['Name', 'Email', 'Role', 'Status']}
  value={selected}
  onChange={setSelected}
  hasSelectAll
/>
```

## Key Props

| Prop             | Type                              | Default   | Description                                     |
| ---------------- | --------------------------------- | --------- | ----------------------------------------------- |
| `label`          | `string`                          | required  | Accessible label                                |
| `options`        | `XDSMultiSelectorOptionType[]`    | required  | Items — strings, objects, dividers, or sections |
| `value`          | `string[]`                        | required  | Currently selected values                       |
| `onChange`       | `(value: string[]) => void`       | required  | Selection change callback                       |
| `hasSelectAll`   | `boolean`                         | `false`   | Show select-all toggle                          |
| `hasSearch`      | `boolean`                         | `false`   | Show search/filter input                        |
| `triggerDisplay` | `'count' \| 'labels' \| 'badges'` | `'count'` | How trigger shows selections                    |
| `maxBadges`      | `number`                          | `3`       | Max badges before "+N"                          |
| `size`           | `'sm' \| 'md' \| 'lg'`            | `'md'`    | Size variant                                    |
| `status`         | `{type, message?}`                | —         | Validation state                                |
| `isDisabled`     | `boolean`                         | `false`   | Disable the selector                            |
| `onChangeAction` | `(value) => Promise`              | —         | Async action with optimistic UI                 |

## Theming

The trigger renders `xdsClassName('multi-selector', {size, status})`. Theme authors
target these classes via `defineTheme({ components })`:

```ts
defineTheme({
  name: 'custom',
  components: {
    'multi-selector': {
      base: {borderRadius: 'var(--radius-3)'},
      'size:sm': {fontSize: '12px'},
    },
  },
});
```

See the [Theming Infrastructure wiki](https://github.com/facebookexperimental/xds/wiki/Theming-Infrastructure).
