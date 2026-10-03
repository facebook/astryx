### Code

```tsx
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
  const options = labels.map(label => ({
    value: label.id,
    label: label.name,
    // Only team-made labels can be renamed; built-in ones get no action.
    // When no label has an action, the panel stays a plain listbox.
    action: label.isCustom ? (
      <IconButton
        label={`Rename ${label.name}`}
        icon={<Icon icon="wrench" />}
        variant="ghost"
        size="sm"
        onClick={() => openRename(label.id)}
      />
    ) : undefined,
  }));

  return (
    <MultiSelector
      label="Labels"
      options={options}
      value={selectedIds}
      onChange={setSelectedIds}
    />
  );
}
```

### Notes

I went straight to the option-level `action` prop, since the reference's "Options with a secondary action" example is almost exactly this task: map labels to `{value, label, action}` and leave `action` undefined on built-ins. The Note at the end confirmed the direction — the rename button must not toggle the option and must stay keyboard-reachable, and `action` is the documented place that guarantees both. I did not need to think about the "no custom labels yet" case, because the reference says the panel only becomes a grid when some option has an `action`; with none, it stays a plain listbox on its own, so there is nothing to branch on.

I hesitated in two places. First, the icon: the available names are `info`, `wrench`, `copy`, `close`, `search`, `moreHorizontal`, `arrowUp`, and there is no `edit` or `pencil`, so I used `wrench` as the example does. A pencil would read more clearly as "rename". Second, the types: the reference names `MultiSelectorOptionType` and `MultiSelectorOptionData` but never shows them in an import line, so I didn't import them and let TypeScript infer the option shape from the mapped array instead.

I considered `hasSearch` for a long label list but left it off since the task did not ask for it. I used the accessible name "Rename X" rather than "Edit X" because the action opens a rename form, and the reference says `label` is the button's accessible name, so screen-reader users hear what the button actually does.
