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
| `edgeCompensation` | `'inline'` | — |

`header` renders a label above the rows. `hasDividers` draws a thin line
between rows.

`edgeCompensation` sets where each row's text, highlight, and divider sit,
relative to the list's sides and to the borders of a surrounding `Card`,
`Section`, or `Dialog`. A list leaves it unset or sets `'inline'`:

- Unset (the default): text sits a short distance away from the list's sides.
  The highlight and dividers span the list and extend a little beyond the
  text, and the text does not line up with a heading above the list: it
  starts a short distance after it.
- `edgeCompensation="inline"`: text is in line with a heading above the list. The
  highlight and dividers extend a little beyond the text, into the space
  between the list and the borders of the surrounding `Card`, `Section`, or
  `Dialog`, without reaching those borders.

Without a surrounding `Card`, `Section`, or `Dialog`, `edgeCompensation="inline"` places
text, highlight, and dividers as the default does.

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

Row text in line with a heading above the list, in a card:

```tsx
<Card>
  <Heading level={3}>Shortcuts</Heading>
  <List edgeCompensation="inline">
    <ListItem label="Search" endContent="⌘K" />
    <ListItem label="New file" endContent="⌘N" />
  </List>
</Card>
```

## Anti-pattern

Don't shift rows with your own styles:

```tsx
/* Don't do this */
<List style={{marginInline: -8}}>…</List>
```

The highlight and dividers stop matching the row text. Use `edgeCompensation` instead.
