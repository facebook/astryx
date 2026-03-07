# @xds/eslint-plugin

ESLint plugin for XDS design system token enforcement.

## Philosophy: Two-Tier Linting

This plugin implements a two-tier linting strategy:

| Mode            | Audience  | Behavior            | Trigger                          |
| --------------- | --------- | ------------------- | -------------------------------- |
| **Recommended** | Humans    | Warnings only       | Default (local dev)              |
| **Strict**      | Agents/CI | Errors (fail build) | `CI=true` or `XDS_STRICT_LINT=1` |

### Why Two Tiers?

- **Agents** should follow strict rules perfectly - they have no excuse for violations
- **Humans** need flexibility during development - warnings inform without blocking

## Rules

### `@xds/no-hardcoded-styles`

Detects hardcoded CSS values in `stylex.create()` that should use XDS tokens:

| Property                     | Should Use                          |
| ---------------------------- | ----------------------------------- |
| `fontSize`                   | `textSizeVars['--text-*']`          |
| `fontWeight`                 | `fontWeightVars['--font-weight-*']` |
| `color`, `backgroundColor`   | `colorVars['--color-*']`            |
| `padding*`, `margin*`, `gap` | `spacingVars['--spacing-*']`        |
| `borderRadius`               | `radiusVars['--radius-*']`          |

**Bad:**

```tsx
const styles = stylex.create({
  text: {
    fontSize: '14px', // ❌ Hardcoded
    fontWeight: 600, // ❌ Hardcoded
    color: '#FF0000', // ❌ Hardcoded
  },
});
```

**Good:**

```tsx
const styles = stylex.create({
  text: {
    fontSize: textSizeVars['--text-base'], // ✅ Token
    fontWeight: fontWeightVars['--font-weight-semibold'], // ✅ Token
    color: colorVars['--color-negative'], // ✅ Token
  },
});
```

### `@xds/require-letter-spacing`

Recommends adding `letterSpacing` when `fontSize` is defined (common design pattern for badges, labels).

**Strict mode only** - helps catch missing letter-spacing in compact text elements.

## Usage

### Local Development (Human Mode)

```bash
yarn lint
# ESLint running in RECOMMENDED (human) mode
# Shows warnings but doesn't fail
```

### CI / Agent Mode

```bash
yarn lint:strict
# or
XDS_STRICT_LINT=1 yarn lint
# or (automatic in GitHub Actions)
CI=true yarn lint

# ESLint running in STRICT (agent/CI) mode
# Errors cause build failure
```

## Testing the Plugin

A test file with intentional violations is provided:

```bash
# Human mode - shows warnings
yarn lint packages/core/src/Badge/XDSBadge.test-violations.tsx

# Strict mode - shows errors
yarn lint:strict packages/core/src/Badge/XDSBadge.test-violations.tsx
```

Expected output in strict mode:

```
  12:15  error  Use textSizeVars token instead of hardcoded fontSize  @xds/no-hardcoded-styles
  17:16  error  Use fontWeightVars token instead of hardcoded fontWeight  @xds/no-hardcoded-styles
  22:12  error  Use colorVars token instead of hardcoded color  @xds/no-hardcoded-styles
  ...
```

## Configuration

The plugin is configured in `eslint.config.js`:

```js
import xdsPlugin from "./internal/eslint-plugin-xds/index.js";

const isStrictMode = process.env.XDS_STRICT_LINT === '1' || process.env.CI === 'true';
const xdsConfig = isStrictMode ? xdsPlugin.configs.strict : xdsPlugin.configs.recommended;

// Applied to core package files
{
  files: ["packages/core/src/**/*.{ts,tsx}"],
  ...xdsConfig,
}
```

## Ignoring Specific Properties

If a property legitimately needs a hardcoded value:

```js
// In eslint.config.js
{
  files: ["packages/core/src/**/*.{ts,tsx}"],
  plugins: { '@xds': xdsPlugin },
  rules: {
    '@xds/no-hardcoded-styles': ['warn', {
      ignore: ['lineHeight']  // Allow hardcoded lineHeight
    }],
  },
}
```

### `@xds/presentational-component`

Enforces that presentational components remain server-component compatible by preventing:

1. **Remembering things** — `useState`, `useReducer`, `useTransition`
2. **Watching things** — `useEffect`, `useLayoutEffect`, `useRef`, `ResizeObserver`, etc.
3. **Coordinating children** — `createContext`

Allowed hooks: `useId`, `useMemo`, `useCallback`, `useContext` (read-only).

**Applies to these components:**

- AspectRatio, Badge, Card, Center, Divider, EmptyState, Field, FormLayout
- Grid, Layout, Link, NavIcon, ProgressBar, Section, Skeleton, Stack, StatusDot, Token

**Bad:**

```tsx
// In XDSBadge.tsx
import {useState} from 'react';
export function XDSBadge() {
  const [x, setX] = useState(0); // ❌ Presentational components must not remember things
  return <span>{x}</span>;
}
```

**Good:**

```tsx
// In XDSBadge.tsx
import {useId, useContext} from 'react';
export function XDSBadge({label}) {
  const id = useId(); // ✅ useId is RSC-compatible
  const theme = useContext(ThemeContext); // ✅ Reading context is fine
  return <span id={id}>{label}</span>;
}
```

**What to do when you need state/effects:**

- Move the behavior to a wrapper component (e.g. `XDSTextTruncation` wraps `XDSText`)
- Make state controlled via props (consumer owns the state)
- If the component legitimately needs client behavior, remove it from the presentational list

See: https://github.com/facebookexperimental/xds/issues/493
