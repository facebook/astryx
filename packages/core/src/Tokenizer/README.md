# /packages/core/src/Tokenizer

Multi-select typeahead with token chips for selected items.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

XDSTokenizer combines XDSBaseTypeahead (search) with XDSToken (chips) for multi-item selection. It supports:

- **Token chips** for each selected item with remove buttons
- **Filtered search** that excludes already-selected items
- **Max entries** to limit selections
- **Clear all** button for bulk removal
- **Custom token and item rendering**
- **Backspace to remove** the last token

## Import

```tsx
import {XDSTokenizer} from '@xds/core/Tokenizer';
```

## Usage

```tsx
const source = {
  search: query => users.filter(u => u.label.includes(query)),
  bootstrap: () => users.slice(0, 5),
};

<XDSTokenizer
  label="Team Members"
  searchSource={source}
  value={selected}
  onChange={(items, change) => {
    setSelected(items);
    // change.type is 'add' | 'remove' | 'reorder'
  }}
  placeholder="Search people..."
  hasClear
  maxEntries={10}
/>;
```

## Key Props

| Prop           | Type                            | Default  | Description                             |
| -------------- | ------------------------------- | -------- | --------------------------------------- |
| `label`        | `string`                        | required | Accessible label                        |
| `searchSource` | `XDSSearchSource`               | required | Data source                             |
| `value`        | `T[]`                           | required | Selected items                          |
| `onChange`     | `(items, change) => void`       | required | Selection callback with change metadata |
| `maxEntries`   | `number`                        | —        | Max number of selections                |
| `hasClear`     | `boolean`                       | `false`  | Show "Clear all" button                 |
| `renderToken`  | `(item, onRemove) => ReactNode` | —        | Custom token renderer                   |
| `renderItem`   | `(item) => ReactNode`           | —        | Custom dropdown item renderer           |
| `placeholder`  | `string`                        | —        | Input placeholder                       |
| `isDisabled`   | `boolean`                       | `false`  | Disable input and tokens                |
| `status`       | `XDSInputStatus`                | —        | Validation status                       |

## Change Metadata

The `onChange` callback receives a second argument describing what changed:

```tsx
type XDSTokenizerChange<T> =
  | {item: T; type: 'add'}
  | {item: T; type: 'remove'}
  | {type: 'reorder'};
```
