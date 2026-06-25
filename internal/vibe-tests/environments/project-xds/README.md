# XDS

This project uses XDS components. Use the CLI to look up component props and usage before writing code:

```bash
npx astryx component --list              # list all available components
npx astryx component Button              # look up props, variants, and usage
npx astryx component IconButton          # each component has its own entry
```

If the CLI is not available, install dependencies first:

```bash
npm install --include=dev
```

Components use:

- StyleX (`@stylexjs/stylex`) for styling
- React 19

## Styling with StyleX

Custom styles must use `stylex.create()`. Plain objects are not valid:

```tsx
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
});

// Apply to XDS components via the xstyle prop:
<XDSCard xstyle={styles.container}>...</XDSCard>

// Apply to HTML elements via stylex.props():
<div {...stylex.props(styles.container)}>...</div>
```

**Important:** Never pass plain `{padding: '16px'}` objects to `xstyle`. Always use `stylex.create()`.

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
