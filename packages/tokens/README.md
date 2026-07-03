# @jedi/tokens

JEDI Design Language — three-tier token system (core → semantic → component).

## Tiers

- **Core** — Raw design language values (`color.blue.500`, `spacing.4`)
- **Semantic** — Intent-based aliases (`semantic.surface.primary`)
- **Component** — Component-specific (`component.button.paddingX`)

## Usage

```typescript
import {
  core,
  semantic,
  getAllCssVars,
  resolveToken,
  tokenToCssVar,
} from '@jedi/tokens';

const vars = getAllCssVars('light');
const blue = resolveToken('color.blue.500');
```

## Theme Contracts

Themes must implement the contract defined in `src/contracts/theme.ts`. See `@jedi/themes`.

## Governance

See [ADR-001](../../docs/adrs/ADR-001-token-architecture.md).
