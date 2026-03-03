# /packages/core/src/Typeahead

Searchable dropdown components for single-item selection with keyboard navigation.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

The Typeahead module provides a search-as-you-type dropdown for selecting items from a data source. It supports:

- **Async and sync search** via a `searchSource` interface
- **Keyboard navigation** (arrow keys, Enter, Escape)
- **Bootstrap results** shown on focus before typing
- **Custom item rendering** for rich dropdown content
- **Combobox ARIA pattern** for full accessibility

## Import

```tsx
import {XDSTypeahead} from '@xds/core/Typeahead';
```

## Components

### XDSTypeahead

Styled typeahead with label, description, validation, and all field features. This is the primary component for most use cases.

```tsx
const source = {
  search: query => fruits.filter(f => f.label.includes(query)),
  bootstrap: () => fruits.slice(0, 5),
};

<XDSTypeahead
  label="Fruit"
  searchSource={source}
  value={selected}
  onChange={setSelected}
  placeholder="Search fruits..."
/>;
```

### XDSBaseTypeahead

Unstyled typeahead for custom compositions (used by XDSTypeahead and XDSTokenizer). Provides the combobox input, dropdown, and keyboard handling without any field chrome.

### XDSTypeaheadItem

Default dropdown item renderer. Shows label with optional icon, secondary text, and avatar.

## Search Source Interface

```tsx
type XDSSearchSource<T> = {
  search: (query: string) => T[] | Promise<T[]>;
  bootstrap?: () => T[] | Promise<T[]>;
};

type XDSSearchableItem = {
  id: string;
  label: string;
  [key: string]: unknown;
};
```

## Key Props

| Prop                | Type                        | Default  | Description                     |
| ------------------- | --------------------------- | -------- | ------------------------------- |
| `label`             | `string`                    | required | Accessible label                |
| `searchSource`      | `XDSSearchSource`           | required | Data source                     |
| `value`             | `T \| null`                 | required | Selected item                   |
| `onChange`          | `(item: T \| null) => void` | required | Selection callback              |
| `placeholder`       | `string`                    | —        | Input placeholder               |
| `hasEntriesOnFocus` | `boolean`                   | `false`  | Show bootstrap results on focus |
| `hasClear`          | `boolean`                   | `true`   | Show clear button               |
| `isDisabled`        | `boolean`                   | `false`  | Disable input                   |
| `maxMenuItems`      | `number`                    | `10`     | Max dropdown items              |
| `status`            | `XDSInputStatus`            | —        | Validation status               |
