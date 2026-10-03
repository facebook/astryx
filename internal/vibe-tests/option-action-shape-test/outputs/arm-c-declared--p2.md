### Code

```tsx
import {Icon, MultiSelector} from '@astryxdesign/core';

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
  const options = teammates.map(teammate => ({
    value: teammate.id,
    label: teammate.name,
    description: teammate.title,
    // The info button is a secondary action, so it lives in `action`:
    // the panel renders it as its own button, and activating it never
    // toggles the teammate.
    action: {
      label: `View ${teammate.name}'s profile`,
      icon: <Icon icon="info" />,
      onClick: () => showProfile(teammate.id),
    },
  }));

  return (
    <MultiSelector
      label="Reviewers"
      options={options}
      value={selected}
      onChange={setSelected}
      placeholder="Pick reviewers..."
      hasSearch
    />
  );
}
```

### Notes

I reached for the option `action` first. The reference's closing note draws the line clearly: checking is the option's own click, and anything else a person can do to an option is a secondary action that goes in `action`. The info button is exactly that, so I declared it as data — a label for the accessible name, the `info` icon, and an `onClick` that calls `showProfile`. The reference says the panel handles the rest: it becomes a grid, the action is a real button, and activating it never toggles the option. That satisfies the "must not check or uncheck" requirement without me writing any event-handling code.

I briefly considered `renderOption`, since it's the only other hook for putting content in a row, and rejected it immediately: the reference says anything placed there is part of toggling the option, which is the opposite of what the task needs. I also considered whether to wire the button up myself with `stopPropagation`, but there's no documented way to put a control inside the listbox, and `action` already exists for this, so building it by hand would be fighting the component.

Smaller hesitations: I used `description` for the teammate's title, which seemed like the natural slot for secondary text. I added `hasSearch` because a teammate list is the kind of thing people filter; it's not required by the task. I took `teammates`, `selected`, `setSelected`, and `showProfile` as props rather than assuming them in module scope, since that makes the component complete on its own.

Things I wanted but couldn't find: the task asks for a _small_ info button, but `action` only accepts `label`, `icon`, and `onClick` — there's no size or variant, so I have no control over how the button looks and have to trust the panel's default. The reference names a `MultiSelectorOptionData` type but doesn't say it's exported, so I relied on inference rather than importing it. There's also nothing about where a profile card would anchor relative to the triggering button; `showProfile(id)` was given, so I treated positioning as its problem. No workarounds were needed beyond those choices.
