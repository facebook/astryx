# Component Swizzling

Exploration of how customized components could be distributed alongside themes.

## Problem

Themes in XDS control design tokens (colors, spacing, typography, etc.), but some design systems need deeper customization at the component level. For example:

- **shadcn buttons** handle variants differently than XDS buttons
- A brand might want different hover behaviors, animations, or structural changes
- Token-level theming can't always achieve the desired visual output

## Swizzling Concept

"Swizzling" (term from Docusaurus) means ejecting/overriding a component to customize it. The question: how could swizzled components be distributed as easily as themes?

## Current State

```
Theme Distribution:
├── defaultTheme.stylex.ts    (complete, copyable template)
├── neutralTheme.stylex.ts    (demonstrates customization)
└── Consumer creates custom themes by copying/modifying
```

Themes are self-contained files that can be copied and modified. Could components follow a similar pattern?

## Possible Approaches

### 1. Component Recipes (like shadcn)
Provide component source files that consumers copy into their project:
```
npx xds add XDSButton
→ copies XDSButton.tsx into your project
```

Pros: Full control, no abstraction leak
Cons: No automatic updates, divergence over time

### 2. Component Variants as Theme Extensions
Extend the theme object to include component-specific overrides:
```tsx
const myTheme = {
  ...defaultTheme,
  components: {
    XDSButton: {
      variants: {
        primary: { /* custom styles */ },
      },
    },
  },
};
```

Pros: Stays within theme system
Cons: Limited to style overrides, can't change structure

### 3. Component Slots/Composition
Design components with explicit customization points:
```tsx
<XDSButton
  renderIcon={(props) => <CustomIcon {...props} />}
  styles={{ hover: customHoverStyles }}
/>
```

Pros: Controlled flexibility
Cons: API complexity, can't anticipate all needs

### 4. Component Registry
Allow registering custom component implementations:
```tsx
import { registerComponent } from '@xds/core';
import { MyXDSButton } from './MyXDSButton';

registerComponent('XDSButton', MyXDSButton);
```

Pros: Clean swap mechanism
Cons: Runtime overhead, type safety challenges

## Questions to Explore

1. What level of customization do consumers actually need?
2. Should swizzled components be "blessed" variants or fully custom?
3. How do we handle breaking changes in base components?
4. Can we version component APIs separately from token APIs?

## Relationship to Themes

Ideally, swizzled components would:
- Be as portable as theme files
- Work with any theme (not coupled to specific tokens)
- Be discoverable/shareable across teams
- Have clear upgrade paths

## Next Steps

- Survey how shadcn, Radix, and other systems handle this
- Identify which XDS components are most likely to need swizzling
- Prototype one approach with Button component
