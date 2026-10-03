### Code

```tsx
import * as React from 'react';
import {Icon, IconButton, MultiSelector} from '@astryxdesign/core';

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
  const options = React.useMemo(
    () =>
      projects.map(project => ({
        value: project.id,
        label: project.name,
        actions: [
          <IconButton
            key="pin"
            label={`Pin ${project.name} to sidebar`}
            icon={<Icon icon="arrowUp" />}
            variant="ghost"
            size="sm"
            onClick={() => pin(project.id)}
          />,
        ],
      })),
    [projects, pin],
  );

  return (
    <MultiSelector
      label="Projects"
      placeholder="Select projects..."
      hasSearch
      options={options}
      value={chosen}
      onChange={setChosen}
      emptyText="No projects match your search"
    />
  );
}
```

### Notes

I reached first for `hasSearch` on `MultiSelector` for the few-hundred-projects case, and for the `actions` array on each option for the pin button, because the reference is explicit that a secondary action belongs in `actions` and must not live inside `renderOption` (anything drawn there is part of the toggle click). Putting the pin in `actions` is also what makes the keyboard story work without extra code: the panel becomes a grid, Up/Down move between projects, Right moves to the pin button, Enter/Space activates it, and Space on the option itself checks it.

Where I hesitated: there is no pin icon in the documented icon list (`info`, `wrench`, `copy`, `close`, `search`, `moreHorizontal`, `arrowUp`), so I used `arrowUp` as a stand-in and leaned on the `IconButton` `label` to carry the real meaning ("Pin X to sidebar"). If a visible word matters more than the icon, swapping `IconButton` for `Button` with `label="Pin"` is the documented alternative. I also wasn't sure whether `hasSearch` filters client-side over `options` by label or expects me to filter `projects` myself; the reference doesn't say, so I assumed it is built in and passed the full list. Finally, the reference says nothing about whether the panel virtualizes long lists, so I didn't do anything special for a few hundred rows beyond memoizing the option objects.
