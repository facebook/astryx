# List

```
import {List, ListItem} from '@astryxdesign/core/List';
```

`List` renders a vertical list of rows. Each `ListItem` shows a `label`, an
optional `description` beneath it, and optional `startContent` (an icon or
avatar) and `endContent` (a badge or a price). A row becomes clickable with
`onClick` or `href` and shows a highlight while the pointer is over it;
`isSelected` keeps the highlight on.

A list often sits under a heading, and often in a `Card`, `Section`, or
`Dialog`, each of which keeps its content a set distance from its own
borders. They come from `@astryxdesign/core/Card`, `@astryxdesign/core/Section`,
and `@astryxdesign/core/Dialog`; `Heading` comes from `@astryxdesign/core/Text`.

## Props

### List

| prop | type | default |
| --- | --- | --- |
| `children` | `ReactNode` | — |
| `header` | `ReactNode` | — |
| `density` | `'compact' \| 'balanced' \| 'spacious'` | `'balanced'` |
| `hasDividers` | `boolean` | `false` |

`header` renders a label above the rows. `hasDividers` draws a thin line
between rows.

Text sits a short distance away from the list's sides.
The highlight and dividers span the list and extend a little beyond the
text, and the text does not line up with a heading above the list: it
starts a short distance after it.

### ListItem

| prop | type |
| --- | --- |
| `label` | `ReactNode` (required) |
| `description` | `ReactNode` |
| `startContent` | `ReactNode` |
| `endContent` | `ReactNode` |
| `onClick` | `() => void` |
| `href` | `string` |
| `isSelected` | `boolean` |
| `isDisabled` | `boolean` |

## Examples

Default, no configuration:

```tsx
<List>
  <ListItem label="Notifications" description="Manage your alerts" />
  <ListItem label="Privacy" description="Control your data" />
</List>
```

