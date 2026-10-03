### Code

```tsx
import * as React from 'react';
import {MultiSelector} from '@astryxdesign/core';

// ---- Invented API (not in the reference) ----------------------------------
// An option may carry `actions`: a list of described buttons the component
// renders in the row's actions cell. Each entry mirrors IconButton's props.
type OptionAction = {
  label: string; // accessible name, e.g. "Rename Urgent"
  icon:
    | 'info'
    | 'wrench'
    | 'copy'
    | 'close'
    | 'search'
    | 'moreHorizontal'
    | 'arrowUp';
  onClick: () => void;
};

// Local copy of the documented option shape plus the invented key.
type OptionData = {
  value: string;
  label: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  actions?: OptionAction[];
};
// ---------------------------------------------------------------------------

type Label = {id: string; name: string; isCustom: boolean};
type SavedFilter = {id: string; name: string};
type Project = {id: string; name: string};

type Props = {
  // p1
  labels: Label[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  openRename: (id: string) => void;
  // p3
  filters: SavedFilter[];
  activeIds: string[];
  setActiveIds: (ids: string[]) => void;
  rename: (id: string) => void;
  remove: (id: string) => void;
  // p4
  projects: Project[];
  chosen: string[];
  setChosen: (ids: string[]) => void;
  pin: (id: string) => void;
};

export function Pickers({
  labels,
  selectedIds,
  setSelectedIds,
  openRename,
  filters,
  activeIds,
  setActiveIds,
  rename,
  remove,
  projects,
  chosen,
  setChosen,
  pin,
}: Props) {
  // p1: only team-made labels get an action; built-ins get none.
  // If no custom labels exist yet, no option has `actions`, so the panel
  // stays a plain listbox.
  const labelOptions: OptionData[] = labels.map(l => ({
    value: l.id,
    label: l.name,
    description: l.isCustom ? 'Team label' : 'Built in',
    ...(l.isCustom
      ? {
          actions: [
            {
              label: `Rename ${l.name}`,
              icon: 'wrench',
              onClick: () => openRename(l.id),
            },
          ],
        }
      : {}),
  }));

  // p3: every row has two actions.
  const filterOptions: OptionData[] = filters.map(f => ({
    value: f.id,
    label: f.name,
    actions: [
      {label: `Rename ${f.name}`, icon: 'wrench', onClick: () => rename(f.id)},
      {label: `Delete ${f.name}`, icon: 'close', onClick: () => remove(f.id)},
    ],
  }));

  // p4: search plus one action per row. Keyboard: Up/Down rows, Right to the
  // pin button, Enter/Space on it pins; Space on the option checks it.
  const projectOptions: OptionData[] = projects.map(p => ({
    value: p.id,
    label: p.name,
    actions: [
      {
        label: `Pin ${p.name} to sidebar`,
        icon: 'arrowUp',
        onClick: () => pin(p.id),
      },
    ],
  }));

  return (
    <>
      <MultiSelector
        label="Labels"
        options={labelOptions}
        value={selectedIds}
        onChange={setSelectedIds}
        placeholder="Select labels..."
      />

      <MultiSelector
        label="Saved filters"
        options={filterOptions}
        value={activeIds}
        onChange={setActiveIds}
        placeholder="Select filters..."
        emptyText="No saved filters yet"
      />

      <MultiSelector
        label="Projects"
        options={projectOptions}
        value={chosen}
        onChange={setChosen}
        placeholder="Select projects..."
        hasSearch
        hasSelectAll
      />
    </>
  );
}
```

### Notes

I reached first for a key on the option data, `actions`, rather than a prop on the component. Everything else that varies per option (`description`, `icon`, `disabled`) already lives on the option object, and the reference stresses that "some options have one and some do not" — that's per-row data, and it falls out naturally in p1 by just omitting the key for built-in labels. A component-level prop like `renderActions={(option) => ...}` or `getActions` was the main alternative; I rejected it because it moves a per-row fact away from the row, and p1 would need an `isCustom` lookup inside the callback instead of at the point where the option is built. The one case where a component prop would win is when options are plain strings, which none of these scenarios are.

For the value, I chose a list of described data (`{label, icon, onClick}`) instead of a ReactNode. The reference is explicit that the panel becomes a grid, that each action is "a real button" with Enter/Space handling, and that activating it never toggles the option. Those guarantees only hold if the component owns the button, so it needs data it can render into its actions cell rather than arbitrary JSX. A ReactNode would also tempt people to drop it into `renderOption`, which the reference says is inside the toggle target and therefore wrong for this. I made it a list, not a single object, because p3 needs two controls on every row; a single `action` key would have forced a second invented key immediately. Mirroring `IconButton`'s props (`label`, `icon`, `onClick`) felt like the least surprising shape since that is the documented button vocabulary.

Hesitations and gaps: the reference names `MultiSelectorOptionData` but doesn't say it is exported, so I declared a local type instead of importing it. The icon set has no edit, trash, or pin glyph, so I used `wrench` for rename, `close` for delete, and `arrowUp` for pin, and leaned on the `label` text to carry the real meaning. I don't know whether `onClick` receives an event or whether an action can be `disabled`, so I kept the shape minimal. For p4 I relied entirely on the documented grid keyboard model (Right into the actions cell, Enter/Space on the button) and didn't verify how focus moves between the search box and the grid; the reference does not describe that. I did not add any workarounds beyond the icon substitutions — in particular I did not try to put buttons inside `renderOption`, since the reference rules that out.
