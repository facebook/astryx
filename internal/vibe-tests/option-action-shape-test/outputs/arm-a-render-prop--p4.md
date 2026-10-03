### Code

```tsx
import {useMemo} from 'react';
import {Button, MultiSelector} from '@astryxdesign/core';

type Project = {id: string; name: string};

type ProjectPickerProps = {
  projects: Project[];
  chosen: string[];
  setChosen: (ids: string[]) => void;
  pin: (id: string) => void;
};

export function ProjectPicker({
  projects,
  chosen,
  setChosen,
  pin,
}: ProjectPickerProps) {
  const options = useMemo(
    () => projects.map(project => ({value: project.id, label: project.name})),
    [projects],
  );

  return (
    <MultiSelector
      label="Projects"
      placeholder="Select projects..."
      options={options}
      value={chosen}
      onChange={setChosen}
      hasSearch
      emptyText="No projects match"
      renderOptionAction={option => (
        <Button
          label="Pin"
          variant="ghost"
          size="sm"
          onClick={() => pin(option.value)}
        />
      )}
    />
  );
}
```

### Notes

I reached for `renderOptionAction` first, because the task is exactly the case the Note at the bottom describes: pinning is something a person does _to_ a project that must not check it, and the reference says the panel becomes a grid with real buttons in an actions cell when that prop is passed. That covers the keyboard-only colleague without any extra work: Up/Down between rows, Space to check, Right to reach the pin button, Enter or Space to pin. `hasSearch` handles the few-hundred-projects concern. I mapped `projects` to `{value, label}` objects rather than strings so the row shows the name while `pin` receives the id.

Where I hesitated was the icon. The task says "pin button" and the example uses an `IconButton`, but the documented icon names are `info`, `wrench`, `copy`, `close`, `search`, `moreHorizontal`, `arrowUp` — there is no pin. I did not want to invent an icon name, and `arrowUp` would read as "move up" rather than "pin", so I used a text `Button` labelled "Pin" instead. The tradeoff is the accessible name: the example gives the icon button a per-row name like `Edit ${option.label}`, but on `Button` the label is also the visible text, so a per-row name would repeat the project name twice in each row. I kept it as a bare "Pin" and am relying on the surrounding grid row to give it context. If a pin icon exists, swapping to `IconButton` with `label={\`Pin ${option.label} to sidebar\`}` would be the better version.

I also briefly considered `renderOption` to draw the pin button inside the row, and rejected it: the reference is explicit that anything in `renderOption` is part of toggling the option, which is the one thing pinning must not do.

Things I wanted and could not find: a pin icon; whether the search box filters on `label` only or also on `description`; and any way to indicate that a project is already pinned (a pressed state or a toggle). The reference gives no state on the action control, so this pins but does not show pinned-ness or unpin.
