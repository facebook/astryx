### Code

```tsx
import {Icon, IconButton, MultiSelector} from '@astryxdesign/core';

type Teammate = {
  id: string;
  name: string;
  title: string;
};

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
  const options = teammates.map(person => ({
    value: person.id,
    label: person.name,
    description: person.title,
    action: (
      <IconButton
        label={`View ${person.name}'s profile`}
        icon={<Icon icon="info" />}
        variant="ghost"
        size="sm"
        onClick={() => showProfile(person.id)}
      />
    ),
  }));

  return (
    <MultiSelector
      label="Reviewers"
      placeholder="Choose reviewers..."
      options={options}
      value={selected}
      onChange={setSelected}
      hasSearch
    />
  );
}
```

### Notes

I reached for the `action` key on each option first, because the reference's "Note" section says exactly this: anything a person can do to an option other than checking it is a secondary action and belongs in `action`, where it won't toggle the option and stays keyboard-reachable. The `IconButton` example with `variant="ghost"` and `size="sm"` was a direct template, so I only swapped the icon to `info` and the handler to `showProfile`.

I hesitated briefly over whether to call `stopPropagation` in the `onClick`. The reference says activating an action "never toggles the option," so I trusted the component to isolate the actions cell and left the handler plain; adding `stopPropagation` would have been a guess at an implementation detail. I also hesitated over `renderOption` as an alternative for placing the button inline with the label, but the reference is explicit that anything inside `renderOption` is part of the click target, so that would have made the info button toggle the teammate — the opposite of what was asked.

Things I wanted but didn't find: the reference mentions `MultiSelectorOptionType` and `MultiSelectorOptionData` as types but doesn't say they're exported, so I let the options array's type be inferred rather than annotating it. There's no documented way to attach a popover or card to the action itself, so I relied entirely on the provided `showProfile(id)` to open the profile. The `title` field mapped naturally to `description`; there was no obvious slot for an avatar beyond `icon`, which I left unused. Giving each button a per-person accessible `label` was the one small addition beyond the example, since a dozen identical "Info" buttons would be indistinguishable to a screen reader user.
