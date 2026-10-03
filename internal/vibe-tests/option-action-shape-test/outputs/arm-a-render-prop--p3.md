### Code

```tsx
import * as React from 'react';
import {Icon, IconButton, MultiSelector} from '@astryxdesign/core';

type SavedFilter = {id: string; name: string};

type Props = {
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
}: Props) {
  const options = React.useMemo(
    () => filters.map(filter => ({value: filter.id, label: filter.name})),
    [filters],
  );

  return (
    <MultiSelector
      label="Saved filters"
      placeholder="Choose saved filters..."
      options={options}
      value={activeIds}
      onChange={setActiveIds}
      hasSearch
      hasSelectAll
      emptyText="No saved filters yet"
      renderOptionAction={option => (
        <>
          <IconButton
            label={`Rename ${option.label}`}
            icon={<Icon icon="wrench" />}
            variant="ghost"
            size="sm"
            onClick={() => rename(option.value)}
          />
          <IconButton
            label={`Delete ${option.label}`}
            icon={<Icon icon="close" />}
            variant="ghost"
            size="sm"
            onClick={() => remove(option.value)}
          />
        </>
      )}
    />
  );
}
```

### Notes

I reached for `renderOptionAction` first, because the reference's closing note says anything a person can do to an option other than checking it is a secondary action and belongs there. Rename and delete are exactly that: they must not toggle the filter, and they need to stay keyboard-reachable. Returning a fragment of two `IconButton`s is explicitly allowed ("a fragment of several"), and since every row has both controls, the "pass it only when at least one option has an action" caveat is trivially satisfied, so the grid mode is always warranted.

I mapped `filters` to `{value: id, label: name}` objects rather than plain strings so the row shows the human name while callbacks get the id. I memoized the mapping only because it's a derived array handed to a child; the reference doesn't say whether identity matters, so this is cheap insurance, not something the docs asked for.

Where I hesitated was the icons. The icon set listed is `info`, `wrench`, `copy`, `close`, `search`, `moreHorizontal`, `arrowUp`. There's no pencil/edit icon and no trash icon. I used `wrench` for rename (the reference's own example uses it for "Edit") and `close` for delete. `close` is a stretch — it usually means "dismiss", not "destroy" — but it's the closest available glyph, and the accessible `label` carries the real meaning ("Delete X"). If a `trash` or `pencil` icon exists, this is where I'd swap it. I also considered `variant="destructive"` on the delete button but kept `ghost` so the row doesn't read as alarming on every line; that's a judgement call the reference doesn't inform.

Things I wanted but couldn't find: a confirmation affordance for delete (the reference has no dialog/confirm primitive, so I left it to `remove(id)` to handle); whether `renderOptionAction` controls are visible at all times or only on hover/focus; and whether `emptyText` applies when search yields no matches or only when `options` is empty. I turned on `hasSearch` and `hasSelectAll` on the assumption that a dashboard can accumulate many saved filters, but the reference gives no guidance on when those are appropriate, so they're optional. I did not add anything from plain React — the documented API covered the whole task.
