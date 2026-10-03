### Code

```tsx
import {useMemo} from 'react';
import {MultiSelector} from '@astryxdesign/core';

type Project = {id: string; name: string};

type ProjectPickerProps = {
  projects: Project[];
  chosen: string[];
  setChosen: (value: string[]) => void;
  pin: (id: string) => void;
};

export function ProjectPicker({
  projects,
  chosen,
  setChosen,
  pin,
}: ProjectPickerProps) {
  const options = useMemo(
    () =>
      projects.map(project => ({
        value: project.id,
        label: project.name,
        action: {
          label: `Pin ${project.name} to sidebar`,
          onClick: () => pin(project.id),
        },
      })),
    [projects, pin],
  );

  return (
    <MultiSelector
      label="Projects"
      placeholder="Select projects..."
      options={options}
      value={chosen}
      onChange={setChosen}
      hasSearch
    />
  );
}
```

### Notes

I reached for `action` on each option first. The reference's closing note is explicit that anything a person can do to an option besides checking it is a secondary action, that it must not toggle the option, and that it must stay keyboard-reachable — and `action` is the only documented way to get that. Giving every option an action flips the panel into grid mode, so the keyboard-only colleague gets Up/Down between projects, Right to reach the pin button, Enter or Space to pin, and Space on the option itself to check it. `hasSearch` covers the few-hundred-projects problem. I took `projects`, `chosen`, `setChosen`, and `pin` as props rather than closing over them, since "already exist" didn't say where.

I briefly considered `renderOption` with an `IconButton` inside it and rejected it: the reference says anything drawn there is part of the option's click target, so a pin button in there would check the project when clicked, and I had no documented way to stop that propagation or give it its own focus stop.

What I wanted and could not find: a pin icon. The `Icon` list is `info`, `wrench`, `copy`, `close`, `search`, `moreHorizontal`, `arrowUp` — none means "pin", and borrowing `wrench` or `arrowUp` would mislead sighted users. I left `icon` off and gave the action a descriptive `label`. That exposed a second uncertainty: the reference says the actions-cell button is "named by `label` and showing `icon` when given," which guarantees the accessible name but does not say whether the label is drawn as visible text when there is no icon. If it renders as a bare button, a sighted mouse user would see no affordance, and I would want either a pin icon added to `Icon` or a documented statement that the label is shown as text.

Smaller things: `MultiSelectorOptionData` is named in the reference but not stated to be exported, so I let TypeScript infer the option shape instead of importing a type that might not exist. I skipped `hasSelectAll` because the reference does not say whether select-all applies to the filtered results or to all few hundred projects, and that difference matters enough that I did not want to guess.
