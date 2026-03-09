# Exploration: Ratio-Based Type Scale

**Status:** Draft  
**Author:** Navi  
**Date:** 2025-03-09

## Problem Statement

XDS currently has two parallel type scale systems:

1. **Default scale** — Functional, optimized for internal tools (base: 14px)
2. **Editorial scale** — Larger, optimized for content-heavy pages

This creates confusion:

- "When do I use editorial vs regular?"
- "Do I need to support both in my component?"
- "What if I want something in between?"

Products have varying needs — some want functional admin UIs, others want more editorial layouts. Today, they must choose between two fixed scales or manually override tokens.

## Proposed Solution

Replace explicit font size tokens with a **ratio-based type scale** system, inspired by [typescale.com](https://typescale.com/).

### How It Works

Instead of explicit tokens:

```typescript
// Current approach
textSizeDefaults = {
  '--text-xsm': '0.75rem', // 12px
  '--text-sm': '0.8125rem', // 13px
  '--text-base': '0.875rem', // 14px
  '--text-lg': '1rem', // 16px
  // ...
};
```

Define a base and ratio:

```typescript
// Proposed approach
typeScale: {
  base: 16,        // Base font size in px
  ratio: 1.25,     // Major Third scale
  lineHeightGrid: 4, // Snap line heights to 4px grid
}
```

The system generates sizes mathematically:

```
base × ratio^-2 = 10.24px → 10px (xs)
base × ratio^-1 = 12.8px  → 13px (sm)
base × ratio^0  = 16px    → 16px (md/base)
base × ratio^1  = 20px    → 20px (lg)
base × ratio^2  = 25px    → 25px (xl)
base × ratio^3  = 31.25px → 31px (2xl)
```

### Theme Presets

Products choose their density by adjusting two values:

| Preset     | Base | Ratio                | Character                 |
| ---------- | ---- | -------------------- | ------------------------- |
| Functional | 12px | 1.125 (Major Second) | Tight, data-heavy         |
| Default    | 16px | 1.25 (Major Third)   | Balanced                  |
| Editorial  | 16px | 1.25 (Major Third)   | Dramatic, content-focused |

Same semantic tokens (`fontSize.md`, `fontSize.lg`), different computed output.

### Line Height: 4px Grid Snapping

For each computed font size, line height snaps to the nearest 4px grid value within a readable range (1.2–1.6×):

```typescript
function computeLineHeight(fontSize: number, grid = 4): number {
  // Target ratio varies by size (tighter for large text)
  const targetRatio = fontSize < 20 ? 1.5 : fontSize < 32 ? 1.4 : 1.25;
  const ideal = fontSize * targetRatio;
  const snapped = Math.round(ideal / grid) * grid;

  // Ensure minimum breathing room
  const minimum = Math.ceil((fontSize + 4) / grid) * grid;
  return Math.max(snapped, minimum);
}
```

## Trade-off Analysis

### Advantages

| Benefit                       | Why It Matters                                                     |
| ----------------------------- | ------------------------------------------------------------------ |
| **Unified system**            | Eliminates editorial vs default confusion — one scale, themed      |
| **Mathematical harmony**      | Ratios create inherent visual rhythm — sizes feel "related"        |
| **Simpler theming**           | Change 2 values (base, ratio) instead of 10+ individual tokens     |
| **Density spectrum**          | Products can be anywhere on functional↔editorial spectrum          |
| **Scales naturally**          | Responsive scaling: change base at breakpoints, everything adjusts |
| **Fewer arbitrary decisions** | "What should fontSize500 be?" is answered by math, not debate      |

### Disadvantages

| Drawback                   | Why It Hurts                                                           |
| -------------------------- | ---------------------------------------------------------------------- |
| **Fractional pixels**      | `ratio^n` rarely lands on whole pixels — requires rounding             |
| **Loss of fine control**   | Can't say "I need exactly 14px" without breaking the system            |
| **Awkward gaps**           | Some ratios produce sizes too close (13, 14) or too far apart (20, 28) |
| **Line height tension**    | 4px grid + ratio-derived sizes = compromises (see below)               |
| **Harder to match specs**  | Designers often spec exact sizes; ratio math may not hit them          |
| **Semantic meaning drift** | `fontSize.sm` means different things in different themes               |

## The Core Tension: Ratios vs. Grids

**Ratios are multiplicative. Grids are additive.**

A 1.25 ratio from 16px: 16, 20, 25, 31.25, 39.06...  
A 4px grid wants: 16, 20, 24, 28, 32, 36, 40...

They don't align perfectly. We must choose:

1. **Round font sizes to grid** → breaks ratio's visual harmony
2. **Keep exact ratios** → accept non-grid font sizes, only snap line-height
3. **Hybrid** → use ratio as a guide, manually adjust to "close enough" grid values

This exploration recommends option 2: keep ratio-derived font sizes (rounded to nearest pixel), snap only line heights to the 4px grid.

## Computed Examples

### Functional Theme (12px base, 1.125 ratio)

| Token | Exponent | Raw     | Rounded | Line Height |
| ----- | -------- | ------- | ------- | ----------- |
| xs    | -2       | 9.48px  | 9px     | 16px (1.78) |
| sm    | -1       | 10.67px | 11px    | 16px (1.45) |
| md    | 0        | 12.00px | 12px    | 16px (1.33) |
| lg    | 1        | 13.50px | 14px    | 20px (1.43) |
| xl    | 2        | 15.19px | 15px    | 24px (1.60) |
| 2xl   | 3        | 17.09px | 17px    | 24px (1.41) |
| 3xl   | 4        | 19.22px | 19px    | 28px (1.47) |

### Default Theme (14px base, 1.125 ratio)

| Token | Exponent | Raw     | Rounded | Line Height |
| ----- | -------- | ------- | ------- | ----------- |
| xs    | -2       | 11.06px | 11px    | 16px (1.45) |
| sm    | -1       | 12.44px | 12px    | 16px (1.33) |
| md    | 0        | 14.00px | 14px    | 20px (1.43) |
| lg    | 1        | 15.75px | 16px    | 24px (1.50) |
| xl    | 2        | 17.72px | 18px    | 28px (1.56) |
| 2xl   | 3        | 19.93px | 20px    | 28px (1.40) |
| 3xl   | 4        | 22.43px | 22px    | 32px (1.45) |

### Editorial Theme (16px base, 1.25 ratio)

| Token | Exponent | Raw     | Rounded | Line Height |
| ----- | -------- | ------- | ------- | ----------- |
| xs    | -2       | 10.24px | 10px    | 16px (1.60) |
| sm    | -1       | 12.80px | 13px    | 20px (1.54) |
| md    | 0        | 16.00px | 16px    | 24px (1.50) |
| lg    | 1        | 20.00px | 20px    | 28px (1.40) |
| xl    | 2        | 25.00px | 25px    | 36px (1.44) |
| 2xl   | 3        | 31.25px | 31px    | 44px (1.42) |
| 3xl   | 4        | 39.06px | 39px    | 48px (1.23) |

## Open Questions

1. **Collision handling**: With tight ratios (1.125), adjacent sizes can round to the same value. Enforce minimum step (2px)?

2. **Escape hatch**: How do products specify exact sizes when needed? Raw values break theming.

3. **Token naming**: Keep numeric (`--text-100`, `--text-200`) or switch to semantic (`--text-xs`, `--text-sm`)?

4. **Runtime vs build-time**: Generate at build time (static CSS) or runtime (CSS custom properties with calc())?

5. **Migration path**: How do existing consumers migrate from explicit tokens to ratio-based?

## Prototype

A working prototype is available in the sandbox app at `/pages/type-scale-explorer/`.

It allows interactive adjustment of:

- Base font size (12–24px)
- Type ratio (1.067–1.618)
- Line height grid (2px, 4px, 8px)

With live preview of the computed scale applied to real typography.

## Recommendation

This approach **makes sense for XDS** given the goal of themeable density:

| Goal                                     | Achieved?                                       |
| ---------------------------------------- | ----------------------------------------------- |
| Eliminate editorial vs default confusion | ✅ Yes                                          |
| Enable functional ↔ editorial spectrum   | ✅ Yes                                          |
| Preserve 4px grid alignment              | ⚠️ Mostly (line heights snap, font sizes round) |
| Simple theming                           | ✅ Yes (2 values vs 10+)                        |
| Pixel-perfect control                    | ❌ No (trading precision for flexibility)       |

**Next steps:**

1. Validate the prototype feels right across different theme presets
2. Decide on collision handling and escape hatch strategies
3. Design the token API surface
4. Plan migration path from current tokens
