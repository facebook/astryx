### Code

```tsx
import {useMemo} from 'react';
import {MultiSelector} from '@astryxdesign/core';

// ---- Invented API --------------------------------------------------------
// I expect each option object to accept an optional `actions` key: a list of
// described buttons. The component renders each one as a real button in the
// row's actions cell (the grid mode the reference describes). The shape
// mirrors what `IconButton` already takes, so nothing new has to be learned.
type IconName =
  | 'info'
  | 'wrench'
  | 'copy'
  | 'close'
  | 'search'
  | 'moreHorizontal'
  | 'arrowUp';

type OptionAction = {
  label: string; // accessible name, same meaning as IconButton's `label`
  icon: IconName;
  onClick: () => void;
};

type ActionableOption = {
  value: string;
  label: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  actions?: OptionAction[]; // <-- the invented key
};

// ---- Scenario p1: issue labels, only custom ones are renameable ----------
type IssueLabel = {id: string; name: string; isCustom: boolean};

export function IssueLabelPicker({
  labels,
  selectedIds,
  setSelectedIds,
  openRename,
}: {
  labels: IssueLabel[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  openRename: (id: string) => void;
}) {
  const options = useMemo<ActionableOption[]>(
    () =>
      labels.map(l => ({
        value: l.id,
        label: l.name,
        // Built-in labels get no `actions`. If the team has made no custom
        // labels yet, no option carries an action and the panel should stay
        // a plain listbox per the reference.
        actions: l.isCustom
          ? [
              {
                label: `Rename ${l.name}`,
                icon: 'wrench',
                onClick: () => openRename(l.id),
              },
            ]
          : undefined,
      })),
    [labels, openRename],
  );

  return (
    <MultiSelector
      label="Labels"
      placeholder="Pick labels..."
      options={options}
      value={selectedIds}
      onChange={setSelectedIds}
      emptyText="No labels yet"
    />
  );
}

// ---- Scenario p3: saved filters, every row has rename + delete -----------
type SavedFilter = {id: string; name: string};

export function SavedFilterPicker({
  filters,
  activeIds,
  setActiveIds,
  rename,
  remove,
}: {
  filters: SavedFilter[];
  activeIds: string[];
  setActiveIds: (ids: string[]) => void;
  rename: (id: string) => void;
  remove: (id: string) => void;
}) {
  const options = useMemo<ActionableOption[]>(
    () =>
      filters.map(f => ({
        value: f.id,
        label: f.name,
        actions: [
          {
            label: `Rename ${f.name}`,
            icon: 'wrench',
            onClick: () => rename(f.id),
          },
          {
            label: `Delete ${f.name}`,
            icon: 'close',
            onClick: () => remove(f.id),
          },
        ],
      })),
    [filters, rename, remove],
  );

  return (
    <MultiSelector
      label="Saved filters"
      placeholder="Turn on filters..."
      options={options}
      value={activeIds}
      onChange={setActiveIds}
      emptyText="No saved filters"
    />
  );
}

// ---- Scenario p4: searchable projects, pin from the row ------------------
type Project = {id: string; name: string};

export function ProjectPicker({
  projects,
  chosen,
  setChosen,
  pin,
}: {
  projects: Project[];
  chosen: string[];
  setChosen: (ids: string[]) => void;
  pin: (id: string) => void;
}) {
  const options = useMemo<ActionableOption[]>(
    () =>
      projects.map(p => ({
        value: p.id,
        label: p.name,
        // No pin icon in the documented set; `arrowUp` is the closest.
        actions: [
          {
            label: `Pin ${p.name} to sidebar`,
            icon: 'arrowUp',
            onClick: () => pin(p.id),
          },
        ],
      })),
    [projects, pin],
  );

  // Keyboard path I'm relying on (from the reference's grid description):
  // Tab into the field, open the panel, type to search, Up/Down to a row,
  // Space to check it, Right to reach the pin button, Enter/Space to pin,
  // Left to return to the option. No extra work at the callsite.
  return (
    <MultiSelector
      label="Projects"
      placeholder="Search projects..."
      hasSearch
      hasSelectAll
      options={options}
      value={chosen}
      onChange={setChosen}
      emptyText="No matching projects"
    />
  );
}
```

### Notes

I reached for a key on the option object first, not a prop on the component. The reference's own description of the grid mode decided it: "each row is one option and one actions cell holding that option's action or actions", and "some options have one and some do not, and an option may have more than one." That is per-option, variable-count data, and the option object already carries per-option presentational things (`icon`, `description`, `disabled`), so an `actions` key beside them felt like the obvious home. It also makes the "no custom labels yet" case in p1 fall out for free — if no option has `actions`, nothing on the component changes and the panel stays a listbox, exactly as the reference says.

The shape I chose is a list of described data (`{label, icon, onClick}`) rather than a ReactNode. I hesitated here the longest. A node is more flexible, and `icon` and `description` on the option are already nodes, so there was precedent for it. But the reference insists an action "is a real button" with specific keyboard behavior and that activating it must never toggle the option. A component can only guarantee that if it renders the button itself; if I hand it arbitrary JSX, it has to trust me. Described data also mirrors `IconButton`'s documented props one-for-one, so there is nothing new to learn and the accessible `label` is required rather than optional. A list rather than a single item because p3 needs two per row, and I wanted one shape for all three scenarios.

Alternatives I rejected: a component-level `renderActions={(option) => ReactNode}` prop, which would keep the option data serializable and parallel `renderOption`, but it pushes the "which options have actions" decision into a render function and brings back the trust problem above. I also rejected stuffing buttons into `renderOption` — the reference is explicit that anything inside the option's click target is part of toggling it, so that would be exactly the bug the Note warns about.

Things I wanted but could not find: a pin icon (I used `arrowUp` and would flag that), the exported type names for option data (the table mentions `MultiSelectorOptionData`, but the import line only shows `MultiSelector`, so I declared a local type instead of importing one), any way to say an action is destructive (the `variant` on `IconButton` suggests the component could accept it, but I did not invent it), and any statement about whether the panel closes after an action fires — for a rename or delete I would want it to stay open. I also could not confirm whether `hasSelectAll` interacts sensibly with disabled options or with search filtering; I turned it on in p4 anyway since a few hundred projects makes it useful.

No workarounds beyond the local type and the substitute icon; the callsites are otherwise what I would expect to work as written.
