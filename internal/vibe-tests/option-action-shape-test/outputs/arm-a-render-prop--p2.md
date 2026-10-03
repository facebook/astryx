### Code

```tsx
import * as React from 'react';
import {Icon, IconButton, MultiSelector} from '@astryxdesign/core';

type Teammate = {id: string; name: string; title: string};

type ReviewerPickerProps = {
  teammates: Teammate[];
  selected: string[];
  setSelected: (value: string[]) => void;
  showProfile: (id: string) => void;
};

export function ReviewerPicker({
  teammates,
  selected,
  setSelected,
  showProfile,
}: ReviewerPickerProps) {
  const options = React.useMemo(
    () =>
      teammates.map(teammate => ({
        value: teammate.id,
        label: teammate.name,
        description: teammate.title,
      })),
    [teammates],
  );

  return (
    <MultiSelector
      label="Reviewers"
      placeholder="Pick reviewers..."
      hasSearch
      options={options}
      value={selected}
      onChange={setSelected}
      renderOptionAction={option => (
        <IconButton
          label={`View ${option.label}'s profile`}
          icon={<Icon icon="info" />}
          variant="ghost"
          size="sm"
          onClick={() => showProfile(option.value)}
        />
      )}
    />
  );
}
```

### Notes

I reached for `renderOptionAction` first, because the task is exactly the case the reference's closing note describes: the info button is a secondary action that must not toggle the option and must stay keyboard-reachable. The reference says anything placed via `renderOption` is part of the option's click target, so putting the button there would have made pressing it check the teammate (or forced a `stopPropagation` workaround that the keyboard path wouldn't honor). `renderOptionAction` puts the button in its own actions cell, the panel becomes a grid, and activating the button is documented to never toggle the option — so no event-handling tricks were needed.

I mapped `teammates` to option objects with `value: id`, `label: name`, `description: title`, since the option shape supports a description and that's the natural place for a job title. I turned on `hasSearch` because a teammate list is the kind of thing people filter by name; the task didn't ask for it, so it's a judgment call and trivially removable.

Where I hesitated: I wanted to type the `renderOptionAction` callback explicitly and pull it out into a `useCallback`, but the reference names `MultiSelectorOptionData` without saying it's exported as a type, so I left the callback inline and let TypeScript infer the parameter. I also wanted the info button's accessible name to include the title, but `renderOptionAction` only receives the option (value/label/description as ReactNode), so I used the label alone rather than re-looking-up the teammate. The reference gives no way to mark the action as "open profile" semantically beyond its `label`, and no way to tell which option is currently focused or selected inside the action renderer; neither was needed here. Since every teammate gets a button, the "pass it only when at least one option has an action" caveat was satisfied without conditional logic.
