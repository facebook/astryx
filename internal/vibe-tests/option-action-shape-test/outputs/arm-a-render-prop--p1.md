### Code

```tsx
import {Icon, IconButton, MultiSelector} from '@astryxdesign/core';
import type {MultiSelectorOptionData} from '@astryxdesign/core';
import {useMemo} from 'react';

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
  const options = useMemo<MultiSelectorOptionData[]>(
    () => labels.map(label => ({value: label.id, label: label.name})),
    [labels],
  );

  // Look up whether an option is a team-made label by its id.
  const customIds = useMemo(
    () =>
      new Set(labels.filter(label => label.isCustom).map(label => label.id)),
    [labels],
  );

  // The panel becomes a grid as soon as renderOptionAction is passed, so only
  // pass it when there is at least one team-made label to put a button beside.
  const renderOptionAction =
    customIds.size > 0
      ? (option: MultiSelectorOptionData) =>
          customIds.has(option.value) ? (
            <IconButton
              label={`Rename ${option.label}`}
              icon={<Icon icon="wrench" />}
              variant="ghost"
              size="sm"
              onClick={() => openRename(option.value)}
            />
          ) : null
      : undefined;

  return (
    <MultiSelector
      label="Labels"
      placeholder="Select labels..."
      options={options}
      value={selectedIds}
      onChange={setSelectedIds}
      hasSearch
      emptyText="No labels yet"
      renderOptionAction={renderOptionAction}
    />
  );
}
```

### Notes

I reached for `renderOptionAction` first, since the reference's "Note" section says plainly that anything a person does to an option other than checking it is a secondary action and belongs there. The example in the reference is almost exactly this task (edit button on a subset of options), so I followed its shape: an `IconButton` with a ghost variant and small size, returning `null` for built-in labels.

The main place I hesitated was the "team may not have made any yet" requirement. The reference warns that passing `renderOptionAction` at all turns the panel into a grid, and that it should only be passed when at least one option actually has an action. So I compute the set of custom ids up front and pass `undefined` when it is empty, keeping the panel a plain listbox in that case. I wanted a built-in way to say "here is the function, decide per row" without the grid switch, but the reference is explicit that the component cannot infer that, so the conditional at the callsite is the workaround.

I also hesitated over the icon. The task says "edit," and the available icon names are `info`, `wrench`, `copy`, `close`, `search`, `moreHorizontal`, `arrowUp` — there is no pencil or edit icon, so I used `wrench` as the reference example does. I phrased the accessible name as "Rename X" rather than "Edit X" so the screen-reader label matches what the button actually opens.

Mapping `labels` to options was straightforward: `id` to `value`, `name` to `label`. I wrapped that in `useMemo` since `options` is an array prop and a fresh array each render could cause unnecessary panel work, though the reference does not say whether the component cares about referential stability. I did not use `description` or `icon` on the options since the task did not call for them.

One thing I could not verify from the reference: whether `MultiSelectorOptionData` and `MultiSelectorOptionType` are exported as types from the package. The reference names them in the props table but does not show an import for them, so the type import is an assumption. If they are not exported, the `renderOptionAction` parameter type would need to be inferred from the component props instead. I also added `hasSearch` and a custom `emptyText` because label lists tend to grow; neither was required by the task.
