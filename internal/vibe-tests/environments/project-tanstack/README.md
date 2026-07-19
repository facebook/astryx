# Form project (TanStack Form)

This project builds forms with **TanStack Form** on top of the Astryx design
system, using the Astryx bindings.

Read the adapter README for the full API before writing code:

```bash
cat node_modules/@astryxdesign/astryx-tanstack/README.md
```

TanStack Form manages form state; the Astryx bindings render each field with an
Astryx component.

## Astryx components

This project renders forms with Astryx design-system components. Use the CLI to
look up component props and usage before writing code:

```bash
npx astryx component --list      # list all available components
npx astryx component TextInput   # look up props, variants, and usage
```

Components use StyleX (`@stylexjs/stylex`) and React 19. Import from subpaths:

```tsx
import {Button} from '@astryxdesign/core/Button';
import {TextInput} from '@astryxdesign/core/TextInput';
```
