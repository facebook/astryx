# Component Naming Conventions

## Context

XDS uses the `XDS` prefix for all design system components (e.g., `XDSButton`, `XDSCard`). This document explores how file naming affects LLM discoverability and future flexibility.

## Options Considered

### Option A: Internal files match export name

```
Button/
├── XDSButton.tsx       → exports XDSButton
├── XDSButton.test.tsx
├── XDSButton.stories.tsx
└── index.ts
```

**Pros:**
- Maximum clarity for LLMs contributing to codebase
- Editor tabs show full component name
- No mental translation needed between file name and component name

**Cons:**
- Redundancy with directory name (`Button/XDSButton.tsx`)
- Harder to change prefix in the future

### Option B: Internal files use unprefixed names

```
Button/
├── Button.tsx          → exports XDSButton
├── Button.test.tsx
├── Button.stories.tsx
└── index.ts            → re-exports with prefix
```

**Pros:**
- Simpler file names
- Easier to support prefix customization (forks can re-export with different prefix)
- Follows common library patterns (MUI, Radix)

**Cons:**
- `import { XDSButton } from './Button'` may briefly confuse LLM contributors
- Requires understanding re-export pattern

## LLM Discoverability Analysis

**For LLMs helping users consume the library:**
- File names are invisible - they use public imports: `import { XDSButton } from '@xds/core'`
- What matters: JSDoc, type exports, example code

**For LLMs contributing to the codebase:**
- File names are visible when editing/creating components
- Consistency between file name and export name reduces cognitive load
- The re-export pattern is learnable but adds a layer of indirection

## Recommendation

For XDS's goal of being LLM-friendly for both consumers and contributors:

1. **Use prefixed file names** (`XDSButton.tsx`) for maximum clarity
2. **Keep directory names unprefixed** (`Button/`) for organization
3. **Ensure JSDoc examples always use the full prefixed name**
4. **Set displayName to the prefixed name** for React DevTools

If prefix customization becomes a priority, this can be revisited with a re-export layer.

## Key Factors for LLM Discoverability

| Factor | Impact |
|--------|--------|
| Public API exports | High - this is what LLMs see in docs/examples |
| JSDoc examples | High - training data includes these |
| Type definitions | High - autocomplete and inference |
| File names | Medium - affects LLM contributors |
| Directory structure | Low - mostly organizational |
