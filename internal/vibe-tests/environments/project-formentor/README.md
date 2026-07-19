# Form project (Formentor)

This project builds forms with **Formentor** on top of the Astryx design system.

Read the Formentor package README for the full API before writing code:

```bash
cat node_modules/@astryxdesign/formentor/README.md
```

Formentor crosses a schema with Astryx components to render form fields. Start
from `useFormentorForm` and the `XDSInputSet`.

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
