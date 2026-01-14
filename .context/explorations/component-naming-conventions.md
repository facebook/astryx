# Component Naming Conventions

## Context

XDS uses the `XDS` prefix for all design system components (e.g., `XDSButton`, `XDSVStack`). This document explores how file naming affects LLM discoverability and contribution patterns.

## Empirical Observation

When asked to create a new component `XDSVStack`, an LLM (Claude) naturally created files with the prefix included:
- `XDSVStack.tsx`
- `XDSVStack.test.tsx`

This happened despite an earlier discussion about keeping files unprefixed. This suggests:

1. **Prefixed filenames are the natural LLM default** — When the component name includes a prefix, LLMs instinctively name files to match
2. **Re-export pattern requires extra context** — The pattern `Button.tsx → export as XDSButton` is a learned convention, not intuitive
3. **Consistency reduces cognitive load** — Matching file names to export names eliminates a layer of indirection

## Options

### Option A: Files match export names (prefixed)

```
Button/
├── XDSButton.tsx       → exports XDSButton
├── XDSButton.test.tsx
└── index.ts
```

**Evidence for:**
- LLMs naturally default to this pattern
- No mental translation between file name and component name
- Editor tabs show the exact component name
- Grep/search for "XDSButton" finds both file and component

**Evidence against:**
- Redundancy with directory name (`Button/XDSButton.tsx`)
- Harder to change prefix in the future (affects all file names)

### Option B: Files unprefixed, re-export with prefix

```
Button/
├── Button.tsx          → exports Button internally
├── Button.test.tsx
└── index.ts            → export { Button as XDSButton }
```

**Evidence for:**
- Simpler file names
- Easier to support prefix customization for forks
- Follows some existing library patterns

**Evidence against:**
- LLMs don't naturally follow this pattern without explicit instruction
- Requires learning and maintaining a convention
- `import { XDSButton } from './Button'` may cause confusion

## Decision

Given the empirical evidence that LLMs naturally default to prefixed file names:

**Use prefixed file names (`XDSButton.tsx`)** for maximum LLM-friendliness.

The slight redundancy with directory names is a minor cost compared to:
- More intuitive LLM contributions
- No need for explicit re-export conventions
- Direct match between file names and what developers see in code

## Key Insight

> When LLMs are given a component name with a prefix, they naturally create files with that prefix. Fighting this instinct requires explicit conventions that must be re-learned in each context. It's simpler to align file naming with LLM intuition.
