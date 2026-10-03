You are running a vibe test.

You have NO prior knowledge of the system under test. Do NOT use prior knowledge of any specific component library, product, or convention beyond React and TypeScript themselves.

## Reference

The reference below is your ONLY documentation. Use ONLY what is documented there. Do not invent props, components, or imports that it does not mention; if you need something it does not provide, say so and build it from plain React instead.

<reference>
# MultiSelector

```
import {MultiSelector} from '@astryxdesign/core';
```

`MultiSelector` is a form field that opens a panel of options; a person checks
any number of them. The field shows how many are chosen, and the panel can
carry a search box and a select-all row. Each option is one row with a
checkbox, a label, and an optional description and icon.

## Props

| prop           | type                                             | default        |
| -------------- | ------------------------------------------------ | -------------- |
| `label`        | `string`                                         | —              |
| `options`      | `MultiSelectorOptionType[]`                      | —              |
| `value`        | `string[]`                                       | —              |
| `onChange`     | `(value: string[]) => void`                      | —              |
| `placeholder`  | `string`                                         | `'Select...'`  |
| `hasSearch`    | `boolean`                                        | `false`        |
| `hasSelectAll` | `boolean`                                        | `false`        |
| `isDisabled`   | `boolean`                                        | `false`        |
| `emptyText`    | `ReactNode`                                      | `'No options'` |
| `renderOption` | `(option: MultiSelectorOptionData) => ReactNode` | —              |

## Options

Each entry of `options` is a plain string, or a `MultiSelectorOptionData`
object:

| key           | type        |
| ------------- | ----------- |
| `value`       | `string`    |
| `label`       | `string`    |
| `description` | `ReactNode` |
| `icon`        | `ReactNode` |
| `disabled`    | `boolean`   |

`renderOption` replaces what is drawn inside an option's own click target;
anything placed there is part of toggling the option.

`Icon`, `IconButton` and `Button` are also exported from
`@astryxdesign/core`. `<Icon icon="info" />` takes a name from `info`,
`wrench`, `copy`, `close`, `search`, `moreHorizontal`, `arrowUp`.
`IconButton` takes `label` (its accessible name), `icon`, `onClick`,
`variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'` and
`size?: 'sm' | 'md' | 'lg'`; `Button` takes the same and shows its `label`
as text.

## Actions beside an option

An option can carry a secondary action beside it — an Edit button beside
a saved label, say — that a person activates without toggling the option.
Some options have one and some do not, and an option may have more than
one. **The props or keys that do this are not listed in this reference.**

The panel is normally a listbox, which may contain only options, so a control
cannot sit beside an option inside it. When any option carries an action, the
panel becomes a grid instead: each row is one option and one actions cell
holding that option's action or actions. Up and Down move between rows; Left
and Right move between the option and its actions cell; Space toggles the
focused option. An action is a real button, activated with Enter or Space
while it has focus, and activating it never toggles the option. With no
actions, the panel stays a plain listbox and nothing changes.

## Examples

A plain picker:

```tsx
<MultiSelector
  label="Labels"
  options={labels}
  value={selected}
  onChange={setSelected}
/>
```

## Note

Checking an option is the option's own click. Anything else a person can do
to an option is a secondary action: it must not toggle the option and must
stay reachable by keyboard. Use the component's own API for it.
</reference>

## Task

The reference says an option can carry a secondary action but deliberately does not name the prop or key. For EACH of the three scenarios below, write the MultiSelector callsite you would EXPECT to work, inventing the prop or key names and shapes that feel most natural given the rest of the reference. Use the same invented API in all three. Then explain why you chose that shape (a prop on the component vs. a key on the option data; a node vs. described data vs. a list) and what alternatives you rejected.

### Scenario (p1)

Build a label picker for an issue tracker. People can check any number of labels. Some labels are built in (bug, feature, docs) and some were made by the team; the team-made ones can be renamed, so each of those needs a small edit button next to it that opens the rename form, while the built-in ones get nothing. The team may not have made any yet. Assume `labels` (each with `id`, `name`, `isCustom`), `selectedIds`, `setSelectedIds` and `openRename(id)` already exist.

### Scenario (p3)

Build a saved-filters picker for a dashboard. People can turn any number of saved filters on. Each saved filter can also be renamed or deleted right from its row, so every row needs those two controls. Assume `filters` (each with `id`, `name`), `activeIds`, `setActiveIds`, `rename(id)` and `remove(id)` already exist.

### Scenario (p4)

Build a project picker with a search box, since there are a few hundred projects. People can check several projects. Each project can be pinned to the sidebar from its row with a pin button. A colleague who uses only the keyboard must be able to pin any project and check any project. Assume `projects` (each with `id`, `name`), `chosen`, `setChosen` and `pin(id)` already exist.

## Output

Reply with exactly two sections:

### Code

One complete TSX component in a single ```tsx fenced block.

### Notes

Plain prose, no scores: what you reached for first, where you hesitated, anything you wanted but could not find in the reference, and any workarounds you used. Do not grade yourself.
