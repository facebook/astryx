### Code

```tsx
import React, {useMemo} from 'react';
import {Icon, IconButton, MultiSelector} from '@astryxdesign/core';

type SavedFilter = {id: string; name: string};

type SavedFiltersPickerProps = {
  filters: SavedFilter[];
  activeIds: string[];
  setActiveIds: (ids: string[]) => void;
  rename: (id: string) => void;
  remove: (id: string) => void;
};

export function SavedFiltersPicker({
  filters,
  activeIds,
  setActiveIds,
  rename,
  remove,
}: SavedFiltersPickerProps) {
  const options = useMemo(
    () =>
      filters.map(filter => ({
        value: filter.id,
        label: filter.name,
        actions: [
          <IconButton
            key="rename"
            label={`Rename ${filter.name}`}
            icon={<Icon icon="wrench" />}
            variant="ghost"
            size="sm"
            onClick={() => rename(filter.id)}
          />,
          <IconButton
            key="delete"
            label={`Delete ${filter.name}`}
            icon={<Icon icon="close" />}
            variant="ghost"
            size="sm"
            onClick={() => remove(filter.id)}
          />,
        ],
      })),
    [filters, rename, remove],
  );

  return (
    <MultiSelector
      label="Saved filters"
      placeholder="Choose saved filters..."
      options={options}
      value={activeIds}
      onChange={setActiveIds}
      hasSearch
      emptyText="No saved filters yet"
    />
  );
}
```

### Notes

I reached for the option-level `actions` prop first. The reference's closing note says anything a person can do to an option other than checking it is a secondary action that must not toggle the option and must stay keyboard-reachable, and `actions` is the one place that promises both — it turns the panel into a grid with a real actions cell, Left/Right to reach it, and Enter/Space on the button that never toggles the row. I deliberately did not use `renderOption`, because the reference says anything placed there is part of the option's click target, which would make a click on "Delete" also toggle the filter.

Where I hesitated was the icons. The documented icon names are `info`, `wrench`, `copy`, `close`, `search`, `moreHorizontal`, `arrowUp`. There is no pencil/edit or trash icon, so I used `wrench` for rename (the reference's own example uses it for an edit action) and `close` for delete. That is a compromise: `close` reads as "dismiss" more than "delete", so the accessible `label` on each button carries the real meaning. If the icon set is bigger than the reference lists, a pencil and trash icon would be the better choice. I also considered the `destructive` variant for the delete button but left both as `ghost` so the row stays quiet; that is a visual call, not something the reference decides.

I also wondered about delete confirmation. The reference has no confirm or dialog primitive, and the task says `remove(id)` already exists, so I pass the click straight through and assume `remove` owns any confirmation.

I turned on `hasSearch` since a dashboard can accumulate many saved filters, and set `emptyText` for the no-filters state; neither was required. I skipped `hasSelectAll` since "turn on every saved filter at once" did not seem like a common action. One thing the mapping leans on that the reference does not state explicitly: an `IconButton` in a `useMemo`'d array with a `key` is fine as an `actions` entry — the reference's example does the same, so I followed it.
