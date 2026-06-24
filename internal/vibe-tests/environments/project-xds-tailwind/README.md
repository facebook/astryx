# XDS + Tailwind CSS

This project uses XDS components with Tailwind CSS. Use the CLI to look up component props and usage before writing code:

```bash
npx astryx component --list              # list all available components
npx astryx component Button              # look up props, variants, and usage
npx astryx component IconButton          # each component has its own entry
```

Components use:

- Tailwind CSS utility classes for layout and custom styling
- XDS Tailwind bridge tokens (`bg-surface`, `text-primary`) for design tokens
- React 19

## Import Pattern

Each component is imported from its own subpath:

```tsx
import {XDSButton} from '@astryxdesign/core/Button';
import {XDSIconButton} from '@astryxdesign/core/IconButton';
import {XDSCard} from '@astryxdesign/core/Card';
import {XDSText, XDSHeading} from '@astryxdesign/core/Text';
import {XDSToggleButton, XDSToggleButtonGroup} from '@astryxdesign/core/ToggleButton';
import {XDSTheme} from '@astryxdesign/core/theme';
```

## Event Handlers

XDS is a React DOM library. Use standard React DOM event handler props such as
`onClick`, `onChange`, and `onKeyDown`. For button activation, use `onClick`:

```tsx
<XDSButton label="Save" onClick={() => handleSave()} />
```

Do NOT use cross-platform activation props like `onPress` unless a component
explicitly documents them.
