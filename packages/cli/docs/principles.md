# XDS Principles

React design system for internal tools. Components use `XDS` prefix.

## Rules

1. Use XDS components for everything they cover
2. StyleX for styling (not inline styles)
3. Semantic tokens, not hardcoded values
4. CSS variables for colors, not hex
5. Form inputs are controlled (value + onChange)

## Anti-Patterns

❌ Inline styles → Use StyleX
❌ Hardcoded colors (#fff) → Use var(--color-_)
❌ Hardcoded spacing (16px) → Use spacing tokens or var(--spacing-_)
❌ Inventing props → Read component docs first

## StyleX Usage

```tsx
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    padding: 'var(--spacing-4)',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-element)',
  },
});

<div {...stylex.props(styles.container)}>
```

## Quick Token Reference

See `tokens.md` for the full list. Key values:

**Spacing**: 0=0px | 0.5=2px | 1=4px | 2=8px | 3=12px | 4=16px | 5=20px | 6=24px | 7=32px
**Radius**: rounded=pill | container=12px | element=8px | content=4px
**Colors**: accent, surface, wash, positive, negative, warning
