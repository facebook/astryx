### Code

```tsx
import * as React from 'react';
import {Icon, IconButton, MultiSelector} from '@astryxdesign/core';

type Project = {
  id: string;
  name: string;
};

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
  const options = React.useMemo(
    () =>
      projects.map(project => ({
        value: project.id,
        label: project.name,
        action: (
          <IconButton
            label={`Pin ${project.name} to sidebar`}
            icon={<Icon icon="arrowUp" />}
            variant="ghost"
            size="sm"
            onClick={() => pin(project.id)}
          />
        ),
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

I reached for `hasSearch` first because of the "few hundred projects" line, and then for the `action` key on each option because the reference says that is the one place a per-row control can live. The reference's keyboard description for the grid mode (Left/Right into the actions cell, Enter/Space on the button, activation never toggles the option) is what satisfies the keyboard-only colleague, so I didn't have to add any key handling myself. I gave every option an `action` rather than making it conditional, since every project can be pinned.

I hesitated briefly over `renderOption`: it looked like a plausible place to draw a pin button, but the reference is explicit that anything inside `renderOption` is part of the toggle click target, so a button there would both pin and check the project. That made `action` the only correct choice. I also considered `hasSelectAll` and left it off — with hundreds of projects, a select-all row is a footgun nobody asked for.

What I wanted but couldn't find: a pin icon. The documented `Icon` names are `info`, `wrench`, `copy`, `close`, `search`, `moreHorizontal`, `arrowUp`, so I used `arrowUp` as a stand-in and leaned on the `IconButton` `label` ("Pin … to sidebar") to carry the real meaning for screen readers and tooltips. I also had no way to show pinned state (a filled vs. outline pin, or a toggle to unpin) because the task only hands me `pin(id)` and the reference has no notion of an action's pressed state; if that matters, it would need a `pinned` flag on each project and a different label/icon per row. I wrapped the option mapping in `useMemo` so the few-hundred-element array isn't rebuilt on every render, which is plain React and not something the reference speaks to either way.
