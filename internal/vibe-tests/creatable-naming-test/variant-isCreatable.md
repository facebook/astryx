# XDSTokenizer — Multi-select Typeahead with Token Chips

A multi-select input that combines typeahead search with token chips. Users search for items via a dropdown and selected items appear as removable chips. Supports free-text token creation for open-ended inputs like tags, emails, or custom values.

## Import

```tsx
import {XDSTokenizer} from '@xds/core';
```

## Basic Usage — Search Only

```tsx
const userSource = {
  search: query => users.filter(u => u.label.includes(query)),
  bootstrap: () => users.slice(0, 5),
};

<XDSTokenizer
  label="Team Members"
  searchSource={userSource}
  value={selected}
  onChange={items => setSelected(items)}
  placeholder="Search people..."
/>;
```

## Free-Text Token Creation

When `isCreatable` is true, users can type any value and commit it as a new token — even if the search source returns no results. A "Create" option appears in the dropdown.

```tsx
// Tags — no search source, pure free-text
const emptySource = {search: () => [], bootstrap: () => []};

<XDSTokenizer
  label="Tags"
  searchSource={emptySource}
  value={tags}
  onChange={(items, change) => {
    setTags(items);
    if (change.type === 'create') {
      console.log('New tag created:', change.item.label);
    }
  }}
  isCreatable
  placeholder="Type a tag and press Enter..."
/>;
```

## Hybrid — Search + Create

Combine a search source with `isCreatable` so users can pick existing items OR create new ones:

```tsx
<XDSTokenizer
  label="Skills"
  searchSource={skillSource}
  value={skills}
  onChange={(items, change) => {
    setSkills(items);
    if (change.type === 'create') {
      // Persist the new skill to the backend
      saveNewSkill(change.item.label);
    }
  }}
  isCreatable
  placeholder="Search or add skills..."
/>
```

## Props

| Prop                | Type                               | Default | Description                                                                                 |
| ------------------- | ---------------------------------- | ------- | ------------------------------------------------------------------------------------------- |
| `label`             | `string`                           | —       | Accessible label (required)                                                                 |
| `searchSource`      | `XDSSearchSource<T>`               | —       | Data source for search + bootstrap (required)                                               |
| `value`             | `T[]`                              | —       | Currently selected items (required)                                                         |
| `onChange`          | `(items: T[], change) => void`     | —       | Selection change callback. `change.type` is `'add'`, `'create'`, `'remove'`, or `'reorder'` |
| `isCreatable`       | `boolean`                          | `false` | Enable free-text token creation from typed input                                            |
| `placeholder`       | `string`                           | —       | Input placeholder (shown when no tokens selected)                                           |
| `maxEntries`        | `number`                           | —       | Maximum selections allowed                                                                  |
| `hasClear`          | `boolean`                          | `false` | Show clear-all button                                                                       |
| `renderItem`        | `(item: T) => ReactNode`           | —       | Custom dropdown item renderer                                                               |
| `renderToken`       | `(item: T, onRemove) => ReactNode` | —       | Custom token chip renderer                                                                  |
| `hasEntriesOnFocus` | `boolean`                          | `false` | Show bootstrap results on focus                                                             |
| `isDisabled`        | `boolean`                          | `false` | Disable the input                                                                           |
| `debounceMs`        | `number`                           | `150`   | Search debounce delay (0 for sync sources)                                                  |
| `size`              | `'sm' \| 'md'`                     | `'md'`  | Input and token size                                                                        |

## Change Types

The `onChange` callback's second argument tells you what happened:

| `change.type` | Meaning                                          |
| ------------- | ------------------------------------------------ |
| `'add'`       | User selected an existing item from the dropdown |
| `'create'`    | User created a new token from typed free-text    |
| `'remove'`    | User removed a token                             |
| `'reorder'`   | Tokens were reordered                            |

## Keyboard

- **Enter** — Select highlighted item, or create a token from typed text when `isCreatable` is true
- **Backspace** — On empty input, removes the last token
- **Arrow keys** — Navigate dropdown items
- **Escape** — Close dropdown
