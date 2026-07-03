# JEDI public API (v0.1.x)

Stable entrypoints for applications. See [JEDI-001](adrs/JEDI-001-public-api.md).

## Packages

| Package        | Import                                         | Purpose                     |
| -------------- | ---------------------------------------------- | --------------------------- |
| `@jedi/core`   | `JediProviders`, `resolveJediTheme`            | Root providers, theme mode  |
| `@jedi/react`  | `Button`, `Badge`, `Link`, `Card`, `TopNav`, … | UI primitives               |
| `@jedi/themes` | `gothicTheme`, `neutralTheme`                  | Theme objects + CSS paths   |
| `@jedi/tokens` | `@jedi/tokens/bridge.css`                      | Compatibility token aliases |

## Quick start (Next.js)

```bash
npm install @jedi/core @jedi/react @jedi/themes @jedi/tokens
```

```css
/* globals.css */
@import '@jedi/themes/reset.css';
@import '@jedi/themes/base.css';
@import '@jedi/themes/gothic.css';
@import '@jedi/tokens/bridge.css';
```

```tsx
'use client';
import Link from 'next/link';
import {JediProviders} from '@jedi/core';
import {Button} from '@jedi/react';

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <JediProviders mode="dark" linkComponent={Link}>
      {children}
    </JediProviders>
  );
}
```

## Theme modes

| Mode    | Theme object   | CSS                        |
| ------- | -------------- | -------------------------- |
| `dark`  | `gothicTheme`  | `@jedi/themes/gothic.css`  |
| `light` | `neutralTheme` | `@jedi/themes/neutral.css` |

## Forbidden in applications

- `@astryxdesign/*`
- `@jedi/internal/*`
- Monorepo-relative imports

## Versioning

Portfolio V2.0 pins `@jedi/*` at `0.1.x`. Breaking changes require a new minor within 0.1 only for additive API; removals wait for 0.2+.
