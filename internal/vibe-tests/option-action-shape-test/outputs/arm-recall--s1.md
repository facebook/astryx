### Code

```tsx
import * as React from 'react';
import {MultiSelector} from '@astryxdesign/core';

// ---- Invented API -----------------------------------------------------------
// I am guessing that an option object may carry an `actions` list, and that
// each action is described with the same three things an IconButton needs.
// Nothing below this comment block is confirmed by the reference.
type IconName =
  | 'info'
  | 'wrench'
  | 'copy'
  | 'close'
  | 'search'
  | 'moreHorizontal'
  | 'arrowUp';

type OptionAction = {
  label: string; // accessible name of the real button
  icon: IconName;
  onClick: () => void;
};

type OptionWithActions = {
  value: string;
  label: string;
  actions?: OptionAction[]; // absent or empty => no actions cell for this row
};
// ----------------------------------------------------------------------------

// Scenario p1: issue-tracker labels. Built-ins get nothing; custom ones get Rename.
type Label = {id: string; name: string; isCustom: boolean};

function LabelPicker({
  labels,
  selectedIds,
  setSelectedIds,
  openRename,
}: {
  labels: Label[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  openRename: (id: string) => void;
}) {
  const options = React.useMemo<OptionWithActions[]>(
    () =>
      labels.map(label => ({
        value: label.id,
        label: label.name,
        actions: label.isCustom
          ? [
              {
                label: `Rename ${label.name}`,
                icon: 'wrench',
                onClick: () => openRename(label.id),
              },
            ]
          : undefined,
      })),
    [labels, openRename],
  );

  // If the team has made no custom labels yet, no option carries an action,
  // so per the reference the panel is simply a listbox.
  return (
    <MultiSelector
      label="Labels"
      options={options}
      value={selectedIds}
      onChange={setSelectedIds}
      placeholder="Add labels..."
    />
  );
}

// Scenario p3: dashboard saved filters. Every row gets Rename and Delete.
type SavedFilter = {id: string; name: string};

function SavedFilterPicker({
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
  const options = React.useMemo<OptionWithActions[]>(
    () =>
      filters.map(filter => ({
        value: filter.id,
        label: filter.name,
        actions: [
          {
            label: `Rename ${filter.name}`,
            icon: 'wrench',
            onClick: () => rename(filter.id),
          },
          {
            label: `Delete ${filter.name}`,
            icon: 'close',
            onClick: () => remove(filter.id),
          },
        ],
      })),
    [filters, rename, remove],
  );

  return (
    <MultiSelector
      label="Saved filters"
      options={options}
      value={activeIds}
      onChange={setActiveIds}
      placeholder="Apply saved filters..."
      emptyText="No saved filters yet"
    />
  );
}

// Scenario p4: searchable project picker, each row has Pin. Keyboard-only use
// relies on the documented grid behaviour: Up/Down across rows, Right into the
// actions cell, Enter/Space on the Pin button, Space on the option to check it.
type Project = {id: string; name: string};

function ProjectPicker({
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
  const options = React.useMemo<OptionWithActions[]>(
    () =>
      projects.map(project => ({
        value: project.id,
        label: project.name,
        actions: [
          {
            label: `Pin ${project.name} to sidebar`,
            icon: 'arrowUp',
            onClick: () => pin(project.id),
          },
        ],
      })),
    [projects, pin],
  );

  return (
    <MultiSelector
      label="Projects"
      options={options}
      value={chosen}
      onChange={setChosen}
      placeholder="Choose projects..."
      hasSearch
      emptyText="No matching projects"
    />
  );
}

export default function PickersDemo(props: {
  labels: Label[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  openRename: (id: string) => void;
  filters: SavedFilter[];
  activeIds: string[];
  setActiveIds: (ids: string[]) => void;
  rename: (id: string) => void;
  remove: (id: string) => void;
  projects: Project[];
  chosen: string[];
  setChosen: (ids: string[]) => void;
  pin: (id: string) => void;
}) {
  return (
    <>
      <LabelPicker
        labels={props.labels}
        selectedIds={props.selectedIds}
        setSelectedIds={props.setSelectedIds}
        openRename={props.openRename}
      />
      <SavedFilterPicker
        filters={props.filters}
        activeIds={props.activeIds}
        setActiveIds={props.setActiveIds}
        rename={props.rename}
        remove={props.remove}
      />
      <ProjectPicker
        projects={props.projects}
        chosen={props.chosen}
        setChosen={props.setChosen}
        pin={props.pin}
      />
    </>
  );
}
```

### Notes

The first thing I reached for was `renderOption`, because it is the only documented hook that lets me draw anything per option. I dropped it almost immediately: the reference says anything placed inside `renderOption` is part of the option's click target, and the Note says a secondary action must not toggle the option. So whatever the real API is, it has to live outside that render slot, and the reference's hint about the panel switching from listbox to grid "when any option carries an action" told me the component itself inspects the options to decide. That pointed at option data rather than a component prop.

That is why I put `actions` on the option object instead of adding something like `renderActions={(option) => ...}` on `MultiSelector`. Every per-option variation the reference already supports — `description`, `icon`, `disabled` — is a key on the option, and in p1 the variation is per option (custom labels have an action, built-ins do not), so a key keeps the "does this row have an actions cell?" question answerable from the data alone. A component-level render prop would force me to re-derive `isCustom` inside the render function and would also give the component no way to know, before rendering, whether to become a grid.

I chose described data (`label`, `icon`, `onClick`) over a `ReactNode` for two reasons. The reference insists that each action is a real button with Enter/Space activation that never toggles the option, and that Left/Right move between the option and its actions cell; the component can only guarantee that if it owns the button, so handing it a node felt like asking it to trust me. The shape I invented is deliberately the same three fields `IconButton` takes, so there is one less thing to learn. I chose a list rather than a single action because p3 needs Rename and Delete on the same row and the reference says "an option may have more than one"; p1 and p4 just pass one-element lists, and p1 passes `undefined` for built-ins.

Where I hesitated: the key name (`actions` vs. `secondaryActions`; I went with the reference's own word "actions cell"), and whether the component wants `actions: []` or `undefined` to mean "none" — I used `undefined` and hope empty arrays are treated the same. I also could not tell whether `onClick` receives the click event or whether `isDisabled` on the field, or `disabled` on an option, also disables that option's actions; p3's Delete button is exactly where I would want to know.

Things I wanted but could not find: icons that mean edit, delete, or pin. The documented set is `info`, `wrench`, `copy`, `close`, `search`, `moreHorizontal`, `arrowUp`, so I used `wrench` for rename, `close` for delete and `arrowUp` for pin, and leaned on the accessible `label` to carry the real meaning. Plain-string options cannot carry an action, so all three pickers map to object options even where strings would otherwise do. For p4 I did not add any extra keyboard code: the reference's grid description already covers moving Right from a project into its Pin button and Space on the option to check it, so I took that at its word rather than trying to supplement it, and `hasSearch` plus an `emptyText` covers the few-hundred-projects case.
