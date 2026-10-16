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

Each list uses one of four row looks. The looks set where each row's text,
highlight, and divider sit, relative to the list's sides and to the borders of
a surrounding `Card`, `Section`, or `Dialog`:

- Look 1 (the default): text sits a short distance away from the list's sides.
  The highlight and dividers span the list and extend a little beyond the
  text, and the text does not line up with a heading above the list: it
  starts a short distance after it.
- Look 2: text, highlight, and dividers all start and end at the
  list's sides, so the text is in line with a heading above the list. Works
  anywhere.
- Look 3: text is in line with a heading above the list. The
  highlight and dividers extend a little beyond the text, into the space
  between the list and the borders of the surrounding `Card`, `Section`, or
  `Dialog`, without reaching those borders.
- Look 4: text is in line with a heading above the list. The
  highlight and dividers stretch to the borders of the surrounding `Card`,
  `Section`, or `Dialog`, like table rows.

Without a surrounding `Card`, `Section`, or `Dialog`, look 3 and
look 4 place text, highlight, and dividers as look 1 does.

**The API for choosing a look is not listed in this reference.**

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

## Anti-pattern

Don't shift rows with your own styles:

```tsx
/* Don't do this */
<List style={{marginInline: -8}}>…</List>
```

The highlight and dividers stop matching the row text. Use the component's own API instead.
