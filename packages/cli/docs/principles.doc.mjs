/**
 * @file principles reference doc
 *
 * English source of truth. Dense/zh translations only override prose.
 * The CLI merges translations at read time.
 */

/** @type {content: string} */
export const docs = {
  content: `# XDS Principles

React design system for internal tools. Components use \`XDS\` prefix.

## Rules

1. Use XDS components for everything they cover
2. StyleX for styling (not inline styles)
3. Semantic tokens, not hardcoded values
4. CSS variables for colors, not hex
5. Form inputs are controlled (value + onChange)

## Style Overrides: xstyle prop

Most XDS components accept an \`xstyle\` prop for customizing styles.
It supports three formats — pick the one that fits:

**Inline styles** — for simple one-off overrides:

\`\`\`tsx
<XDSTextInput label="Name" xstyle={{ maxWidth: 300 }} />
<XDSCard xstyle={{ height: 200, padding: 16 }} />
\`\`\`

**StyleX styles** — for complex, reusable, or pseudo-class overrides:

\`\`\`tsx
import * as stylex from '@stylexjs/stylex';
const overrides = stylex.create({
  hoverCard: {
    boxShadow: {
      default: 'none',
      ':hover': {'@media (hover: hover)': '0 4px 12px rgba(0,0,0,0.15)'},
    },
  },
});
<XDSCard xstyle={overrides.hoverCard} />;
\`\`\`

**CSS class name** — for Tailwind, CSS Modules, or external CSS:

\`\`\`tsx
<XDSCard xstyle="my-custom-card" />
<XDSCard xstyle={styles.customCard} />  // CSS Module
\`\`\`

Rules of thumb:

- 1-2 simple properties → inline
- 3+ properties, reusable, or named → \`stylex.create\`
- Pseudo-classes (\`:hover\`, \`:focus-visible\`) → \`stylex.create\` (required)
- All \`:hover\` MUST use \`@media (hover: hover)\` guards

## Anti-Patterns

❌ Inline styles on raw elements → Use \`xstyle\` on XDS components
❌ Hardcoded colors (#fff) → Use var(--color-_)
❌ Hardcoded spacing (16px) → Use spacing tokens or var(--spacing-_)
❌ Inventing props → Read component docs first

## StyleX Usage

\`\`\`tsx
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    padding: 'var(--spacing-4)',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-element)',
  },
});

<div {...stylex.props(styles.container)}>
\`\`\`

## Quick Token Reference

See \`tokens.md\` for the full list. Key values:

**Spacing**: 0=0px | 0.5=2px | 1=4px | 2=8px | 3=12px | 4=16px | 5=20px | 6=24px | 7=32px
**Radius**: rounded=pill | container=12px | element=8px | content=4px
**Colors**: accent, surface, wash, positive, negative, warning
`,
};

/** @type {content: string} */
export const docsDense = {
  content: `# XDS Principles

React design system for internal tools. Components use \`XDS\` prefix.

## Rules

1. Use XDS components for everything they cover
2. StyleX for styling (not inline styles)
3. Semantic tokens, not hardcoded values
4. CSS variables for colors, not hex
5. Form inputs controlled (value + onChange)

## Style Overrides: xstyle prop

Most XDS components accept \`xstyle\` prop for customizing styles.
Three formats:

**Inline styles** — simple one-off overrides:

\`\`\`tsx
<XDSTextInput label="Name" xstyle={{ maxWidth: 300 }} />
<XDSCard xstyle={{ height: 200, padding: 16 }} />
\`\`\`

**StyleX styles** — complex, reusable, or pseudo-class overrides:

\`\`\`tsx
import * as stylex from '@stylexjs/stylex';
const overrides = stylex.create({
  hoverCard: {
    boxShadow: {
      default: 'none',
      ':hover': {'@media (hover: hover)': '0 4px 12px rgba(0,0,0,0.15)'},
    },
  },
});
<XDSCard xstyle={overrides.hoverCard} />;
\`\`\`

**CSS class name** — Tailwind, CSS Modules, or external CSS:

\`\`\`tsx
<XDSCard xstyle="my-custom-card" />
<XDSCard xstyle={styles.customCard} />  // CSS Module
\`\`\`

Rules of thumb:

- 1-2 simple props → inline
- 3+ props, reusable, or named → \`stylex.create\`
- Pseudo-classes (\`:hover\`, \`:focus-visible\`) → \`stylex.create\` (required)
- All \`:hover\` MUST use \`@media (hover: hover)\` guards

## Anti-Patterns

❌ Inline styles on raw elements → use \`xstyle\` on XDS components
❌ Hardcoded colors (#fff) → use var(--color-_)
❌ Hardcoded spacing (16px) → use spacing tokens or var(--spacing-_)
❌ Inventing props → read component docs first

## StyleX Usage

\`\`\`tsx
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    padding: 'var(--spacing-4)',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-element)',
  },
});

<div {...stylex.props(styles.container)}>
\`\`\`

## Quick Token Reference

See \`tokens.md\` for full list. Key values:

**Spacing**: 0=0px | 0.5=2px | 1=4px | 2=8px | 3=12px | 4=16px | 5=20px | 6=24px | 7=32px
**Radius**: rounded=pill | container=12px | element=8px | content=4px
**Colors**: accent, surface, wash, positive, negative, warning
`,
};
