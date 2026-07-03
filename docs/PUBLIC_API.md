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

## Distribution (GitHub Packages)

> **GitHub Packages is an implementation detail of JEDI v0.x. The public package identity remains `@jedi/*`. Distribution mechanisms may change without requiring application import changes.**

| Public identity | GitHub Packages (v0.1)  | Consumer install                                    |
| --------------- | ----------------------- | --------------------------------------------------- |
| `@jedi/core`    | `@jon4ohio/jedi-core`   | `"@jedi/core": "npm:@jon4ohio/jedi-core@0.1.0"`     |
| `@jedi/react`   | `@jon4ohio/jedi-react`  | `"@jedi/react": "npm:@jon4ohio/jedi-react@0.1.0"`   |
| `@jedi/themes`  | `@jon4ohio/jedi-themes` | `"@jedi/themes": "npm:@jon4ohio/jedi-themes@0.1.0"` |
| `@jedi/tokens`  | `@jon4ohio/jedi-tokens` | `"@jedi/tokens": "npm:@jon4ohio/jedi-tokens@0.1.0"` |

Future npm publish under `@jedi/*` is a `package.json` alias swap — no application import changes.
