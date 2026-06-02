# XDS

This project uses XDS components. Use the CLI to look up component props and usage before writing code:

```bash
npx xds component --list              # list all available components
npx xds component Button              # look up props, variants, and usage
npx xds component IconButton          # each component has its own entry
```

If the CLI is not available, install dependencies first:

```bash
npm install --include=dev
```

Components use:

- StyleX (`@stylexjs/stylex`) for styling
- React 19

## Import Pattern

Each component is imported from its own subpath:

```tsx
import {XDSButton} from '@xds/core/Button';
import {XDSIconButton} from '@xds/core/IconButton';
import {XDSCard} from '@xds/core/Card';
import {XDSText, XDSHeading} from '@xds/core/Text';
```
