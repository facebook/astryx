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
    actions: [
      <IconButton
        key="profile"
        label={`View profile for ${person.name}`}
        icon={<Icon icon="info" />}
        variant="ghost"
        size="sm"
        onClick={() => showProfile(person.id)}
      />,
    ],
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

I reached for the option's `actions` array first, because the reference's closing note names exactly this case: anything a person can do to an option other than checking it is a secondary action and belongs in `actions`. That also gave me the "must not toggle" guarantee for free — the reference says an action is a real button and activating it never toggles the option — so I did not add any `stopPropagation` or event-handling workaround, and I would have hesitated to, since the reference never says what argument `onClick` receives.

I briefly considered `renderOption` for the info button and rejected it: the reference says anything drawn by `renderOption` is part of the option's own click target, which is precisely what the task forbids.

I used `description` for the teammate's title and `label` for the name; both are documented. I turned on `hasSearch` because a reviewer list is often long, but nothing in the task required it.

Things I wanted and could not find: a profile-card or popover primitive to anchor the card to the info button, so I lean entirely on the provided `showProfile(id)`; a documented `onClick` event signature on `IconButton`; and confirmation that `MultiSelectorOptionData` is exported as a type from the package (the reference names it but never shows it imported), so I left the options array inferred rather than annotated. I passed `teammates`, `selected`, `setSelected`, and `showProfile` in as props to keep the component self-contained; if they really live in the enclosing scope, the props can be dropped without changing anything else.
