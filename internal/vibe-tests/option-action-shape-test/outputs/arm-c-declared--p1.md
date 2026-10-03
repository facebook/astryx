### Code

```tsx
import {Icon, MultiSelector} from '@astryxdesign/core';

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
  const options = labels.map(label => ({
    value: label.id,
    label: label.name,
    // Built-in labels get no action, so when the team has made no custom
    // labels yet the panel stays a plain listbox.
    action: label.isCustom
      ? {
          label: `Rename ${label.name}`,
          icon: <Icon icon="wrench" />,
          onClick: () => openRename(label.id),
        }
      : undefined,
  }));

  return (
    <MultiSelector
      label="Labels"
      options={options}
      value={selectedIds}
      onChange={setSelectedIds}
      placeholder="Select labels..."
      hasSearch
    />
  );
}
```

### Notes

I reached first for the `action` key on each option, because the reference is explicit that anything a person can do to an option besides checking it is a secondary action declared as data, and that an action is a real button that never toggles the option. That matched the task shape exactly: custom labels get an action, built-in ones get `undefined`, and the panel decides on its own whether it needs to be a grid. The "team may not have made any yet" case falls out for free — with every `action` undefined, the panel stays a plain listbox.

I hesitated briefly over `renderOption`, since "put a button next to the label" sounds like custom rendering. The reference closed that door: whatever `renderOption` draws sits inside the option's click target and becomes part of toggling, so a button there would check the label when pressed. I left it alone.

Two things I wanted and couldn't find. First, there's no pencil or "edit" icon in the documented icon list (`info`, `wrench`, `copy`, `close`, `search`, `moreHorizontal`, `arrowUp`), so I used `wrench` and leaned on the action's accessible label ("Rename X") to carry the meaning. Second, the reference names the `MultiSelectorOptionData` and `MultiSelectorOptionType` types but never says they are exported, so I didn't import them and let the option array's type be inferred from the literal; if they are exported, annotating `options` with `MultiSelectorOptionData[]` would be a small improvement.

I took `labels`, `selectedIds`, `setSelectedIds`, and `openRename` as props rather than assuming they're in closure scope, since the task said they exist but not where. I added `hasSearch` because a label list in an issue tracker grows; that's a judgment call, not something the task asked for, and it's one line to remove.
