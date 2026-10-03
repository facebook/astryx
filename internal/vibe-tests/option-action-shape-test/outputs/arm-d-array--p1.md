### Code

```tsx
import * as React from 'react';
import {Icon, IconButton, MultiSelector} from '@astryxdesign/core';

type Label = {
  id: string;
  name: string;
  isCustom: boolean;
};

type LabelPickerProps = {
  labels: Label[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  openRename: (id: string) => void;
};

export function LabelPicker({
  labels,
  selectedIds,
  setSelectedIds,
  openRename,
}: LabelPickerProps) {
  const options = React.useMemo(
    () =>
      labels.map(label => ({
        value: label.id,
        label: label.name,
        // Built-in labels get an empty list, so when the team has made no
        // custom labels yet the panel stays a plain listbox.
        actions: label.isCustom
          ? [
              <IconButton
                key="rename"
                label={`Rename ${label.name}`}
                icon={<Icon icon="wrench" />}
                variant="ghost"
                size="sm"
                onClick={() => openRename(label.id)}
              />,
            ]
          : [],
      })),
    [labels, openRename],
  );

  return (
    <MultiSelector
      label="Labels"
      options={options}
      value={selectedIds}
      onChange={setSelectedIds}
      hasSearch
      emptyText="No labels yet"
    />
  );
}
```

### Notes

I reached for `actions` on the option first. The closing note in the reference says anything a person can do to an option besides checking it is a secondary action that goes in `actions`, and the "Options with a secondary action" example is almost exactly this task, so I followed its shape: an `IconButton` with a ghost variant and small size, keyed, with an accessible `label` naming the specific label it renames. I deliberately did not use `renderOption`, because the reference says anything drawn there is part of toggling the option, which is the opposite of what an edit button needs.

I hesitated over the icon. There is no "edit" or "pencil" in the listed icon names (`info`, `wrench`, `copy`, `close`, `search`, `moreHorizontal`, `arrowUp`), so I used `wrench` as the example does. A pencil would read more clearly as "rename" to most people; that is the main thing I wanted and could not find.

I also hesitated over whether the button's `onClick` needed to stop propagation so the click would not also check the label. The reference states that activating an action never toggles the option, so I trusted that and left the handler plain rather than guessing at an event signature the reference does not document.

For the "team may not have made any yet" case, the reference says the panel only becomes a grid when some option has a non-empty `actions`, and to pass an empty array on options without one, so built-in labels get `[]` and the all-built-in case falls back to the ordinary listbox with no extra work. I turned on `hasSearch` because label lists in issue trackers tend to grow, and set `emptyText` to something more specific than the default; both are documented props, but neither was strictly required by the task.

One small typing gap: the reference names `MultiSelectorOptionData` and `MultiSelectorOptionType` but does not say they are exported, so I did not import them and let the option array's type be inferred from the map instead.
