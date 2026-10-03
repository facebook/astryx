### Code

```tsx
import {useState} from 'react';
import {Button, Icon, MultiSelector} from '@astryxdesign/core';

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
  // The filter whose "Manage" action was activated; its Rename/Delete
  // controls are shown until one is chosen or the person cancels.
  const [managingId, setManagingId] = useState<string | null>(null);
  const managing = filters.find(filter => filter.id === managingId) ?? null;

  const options = filters.map(filter => ({
    value: filter.id,
    label: filter.name,
    action: {
      label: `Manage ${filter.name}`,
      icon: <Icon icon="moreHorizontal" />,
      onClick: () => setManagingId(filter.id),
    },
  }));

  return (
    <div>
      <MultiSelector
        label="Saved filters"
        options={options}
        value={activeIds}
        onChange={setActiveIds}
        placeholder="Choose saved filters..."
        hasSearch
        hasSelectAll
        emptyText="No saved filters yet"
      />

      {managing && (
        <div role="group" aria-label={`Manage ${managing.name}`}>
          <Button
            label={`Rename ${managing.name}`}
            icon={<Icon icon="wrench" />}
            variant="secondary"
            size="sm"
            onClick={() => {
              setManagingId(null);
              rename(managing.id);
            }}
          />
          <Button
            label={`Delete ${managing.name}`}
            icon={<Icon icon="close" />}
            variant="destructive"
            size="sm"
            onClick={() => {
              setManagingId(null);
              remove(managing.id);
            }}
          />
          <Button
            label="Cancel"
            variant="ghost"
            size="sm"
            onClick={() => setManagingId(null)}
          />
        </div>
      )}
    </div>
  );
}
```

### Notes

I reached for the option `action` first, because the reference is explicit that anything a person can do to an option other than toggling it is a secondary action and belongs there, and because it promises the grid keyboard model (Left/Right into the actions cell, Enter/Space on a real button) for free.

The hesitation was immediate: the task needs two controls per row, and `action` is typed as a single object. The prose says the actions cell holds "that option's action or actions", which suggests multiple are possible, but no array form or second key is documented, so I did not guess one. I considered `renderOption`, but the reference says anything drawn there is part of the toggle, which is exactly what a Rename or Delete control must not be, so I ruled it out.

The workaround is one "Manage" action per row that opens a plain-React group of Rename / Delete / Cancel buttons rendered below the field. Both operations stay off the toggle target and stay keyboard-reachable, but this is a step removed from "right from its row": the person activates an action in the panel and then finds the real controls outside it, and I don't know from the reference whether the panel closes or where focus lands when an action fires. If the panel stays open and covers the group, this would need repositioning.

Things I wanted and could not find: an `actions` array (or a documented way to declare two actions on one option), icons that read as rename and delete (I used `wrench` and `close` because `pencil`/`trash` are not in the icon list), a menu or popover component to anchor the Rename/Delete choices to the row, and any statement about panel open/close and focus behavior after an action's `onClick`.
