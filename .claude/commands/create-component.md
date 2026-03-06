# Create XDS Component

Create a new XDS component following established patterns.

## Component Name

$ARGUMENTS

## Instructions

Create a new component in `/packages/core/src/{ComponentName}/` with the following files:

### 1. {ComponentName}.tsx (Main Component)

Use this structure based on Button.tsx:

```tsx
/**
 * @file {ComponentName}.tsx
 * @input Uses React forwardRef, HTMLAttributes, ReactNode
 * @output Exports {ComponentName} component, {ComponentName}Props, {ComponentName}Variant types
 * @position Core implementation
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/{ComponentName}/{ComponentName}.doc.mjs
 * - /packages/core/src/{ComponentName}/{ComponentName}.test.tsx
 * - /packages/core/src/{ComponentName}/index.ts
 * - /apps/storybook/stories/{ComponentName}.stories.tsx
 */

import { forwardRef, useContext, type HTMLAttributes, type ReactNode } from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorTokens,
  spacingTokens,
  radiusTokens,
  transitionTokens,
  typographyTokens,
} from '../theme/tokens.stylex';
import { ThemeContext } from '../theme/ThemeContext';
import type { StyleXStyles } from '../theme/types';

// Define styles first
const styles = stylex.create({
  base: {
    // Base styles using tokens
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
});

// Define variants - {ComponentName}Variant type will be derived from this
const variants = stylex.create({
  default: {
    // Variant styles using tokens
  },
});

// Derive variant type from the variants object
export type {ComponentName}Variant = keyof typeof variants;

// =============================================================================
// Module Augmentation - Register variant type with ComponentStyles
// =============================================================================
// This allows themes to provide type-safe variant overrides for this component

declare module '../theme/types' {
  interface ComponentStyles {
    {componentName}?: {
      variants?: Partial<Record<{ComponentName}Variant, StyleXStyles>>;
    };
  }
}

export interface {ComponentName}Props extends HTMLAttributes<HTMLElement> {
  variant?: {ComponentName}Variant;
  children: ReactNode;
}

export const {ComponentName} = forwardRef<HTMLElement, {ComponentName}Props>(
  ({ variant = 'default', children, ...props }, ref) => {
    // Get theme context for component-level variant overrides (optional)
    const themeContext = useContext(ThemeContext);
    const themeVariantOverride = themeContext?.theme.components?.{componentName}?.variants?.[variant];

    return (
      <div
        ref={ref}
        {...stylex.props(
          styles.base,
          variants[variant],
          themeVariantOverride
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

{ComponentName}.displayName = '{ComponentName}';
```

### 2. index.ts (Exports)

```tsx
export { {ComponentName} } from './{ComponentName}';
export type { {ComponentName}Props, {ComponentName}Variant } from './{ComponentName}';
```

### 3. {ComponentName}.doc.mjs

```js
/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: '{ComponentName}',
  description: 'Brief description of the component.',
  features: ['Variants: list available variants'],
  props: [
    {
      name: 'variant',
      type: "'{variant1}' | '{variant2}'",
      description: 'Visual style variant',
      default: "'default'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Component content',
      required: true,
    },
  ],
  examples: [
    {
      label: 'Basic',
      code: `<{ComponentName} variant="default">Content</{ComponentName}>`,
    },
  ],
  theming: {
    componentKey: '{componentName}',
    surfaces: [{name: 'root', description: 'Outer wrapper element'}],
  },
};
```

### 4. Update /packages/core/src/index.ts

Add export for the new component:

```tsx
export * from './{ComponentName}';
```

## Key Patterns to Follow

1. **Derive types from StyleX objects**: Use `keyof typeof variants` for variant types
2. **Use tokens**: Import from `../theme/tokens.stylex` - never use hardcoded values
3. **SYNC comments**: List all files that need updating when the component changes
4. **Theme variant ingestion**: Use `ThemeContext` to apply theme-level variant overrides on top of defaults
5. **Module augmentation**: Use `declare module` to register the component's variant type with `ComponentStyles` - this keeps theme types decoupled from component imports

## Token Reference

Available tokens from `tokens.stylex`:

- `colorTokens`: accent, surface, textPrimary, hoverOverlay, pressedOverlay, focusOutline, negative, etc.
- `spacingTokens`: space0, space0_5, space1, space2, space3, space4, space5, space6, space7
- `radiusTokens`: rounded, container, element, content
- `transitionTokens`: fast, normal
- `typographyTokens`: fontFamilyBody, fontFamilyCode, fontFamilyHeading

## Reference

See the [Component Authoring Guide](https://github.com/facebookexperimental/xds/wiki/Component-Authoring-Guide) on the wiki for the complete Button implementation with advanced patterns like loading states and hover overlays.

## After Creation

1. Run `yarn workspace @xds/core build` to verify the build
2. Create stories in `/apps/storybook/stories/{ComponentName}.stories.tsx` (import from `@xds/core/{ComponentName}`)
3. Add tests in `/packages/core/src/{ComponentName}/{ComponentName}.test.tsx`
