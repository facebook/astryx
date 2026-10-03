### Code

```tsx
import * as React from 'react';
import {Icon, IconButton, MultiSelector} from '@astryxdesign/core';

type SavedFilter = {
  id: string;
  name: string;
};

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
  const options = React.useMemo(
    () =>
      filters.map(filter => ({
        value: filter.id,
        label: filter.name,
        action: (
          <>
            <IconButton
              label={`Rename ${filter.name}`}
              icon={<Icon icon="wrench" />}
              variant="ghost"
              size="sm"
              onClick={() => rename(filter.id)}
            />
            <IconButton
              label={`Delete ${filter.name}`}
              icon={<Icon icon="close" />}
              variant="ghost"
              size="sm"
              onClick={() => remove(filter.id)}
            />
          </>
        ),
      })),
    [filters, rename, remove],
  );

  return (
    <MultiSelector
      label="Saved filters"
      options={options}
      value={activeIds}
      onChange={setActiveIds}
      placeholder="Choose saved filters"
      hasSearch
      hasSelectAll
      emptyText="No saved filters yet"
    />
  );
}
```

### Notes

I reached for the `action` key on each option first, since the reference is explicit that anything a person can do to an option besides checking it belongs there, and that a fragment of several controls is allowed. Every row needs both controls, so I always set `action` rather than leaving it undefined on some rows; that also means the panel is always a grid, which is the right shape for this task. I deliberately did not use `renderOption`, because the reference says anything placed there becomes part of the toggle click target, which is exactly what rename and delete must not do.

The main hesitation was icon choice. The documented icon set is small (`info`, `wrench`, `copy`, `close`, `search`, `moreHorizontal`, `arrowUp`) and has no pencil, edit, or trash glyph. I used `wrench` for rename because the reference's own example uses it for an edit action, and `close` for delete as the nearest fit; the accessible `label` on each `IconButton` carries the real meaning. I also considered `variant="destructive"` for delete but kept both buttons `ghost` so the row reads as two quiet secondary controls rather than a loud one; that is a judgement call the reference does not settle.

Two things I wanted and could not find: a confirmation affordance for delete (the reference has no dialog or confirm primitive, so I left that to `remove(id)`), and any statement of what `MultiSelector` does with a `value` entry whose option disappears after `remove`. I did not add a workaround for the second case since `setActiveIds` ownership lives outside this component; if stale ids matter, the caller's `remove` should also prune `activeIds`.
