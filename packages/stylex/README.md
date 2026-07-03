# @jedi/stylex

**Styling Infrastructure** — current implementation: [StyleX](https://stylexjs.com).

Provides token binding helpers that bridge `@jedi/tokens` CSS variables to StyleX authoring.

## Usage

```typescript
import { stylex, tokenVar, jediTokens, colors } from '@jedi/stylex';

const styles = stylex.create({
  box: {
    backgroundColor: colors.surfacePrimary,
    padding: jediTokens.spacing[4],
  },
});
```

The styling engine can be replaced without changing JEDI capabilities.
