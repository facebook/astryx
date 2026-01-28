# XDSText and XDSHeading Component Spec

> **Status:** Draft
> **Date:** 2026-01-26
> **Context:** [typography-tokens.md](../explorations/typography-tokens.md)

---

## Overview

This spec defines the API for `XDSText` and `XDSHeading` components, informed by the typography tokens exploration and analysis of the current implementation.

---

## Design Principles

1. **Constrained escape hatches** — `xstyle` allowed for layout only (margins, flex); typography locked
2. **Semantic-first** — Guide LLMs toward semantic types over raw sizes
3. **Smart defaults** — Minimize required props; sensible behavior out of the box
4. **Theme-driven** — Components pull styles from theme, not hardcoded mappings
5. **Explicit over magic** — Prefer explicit props (e.g., `color="inherit"`) over context-based behavior
6. **Boolean flags prefixed** — Use `is` or `has` prefix for boolean props (e.g., `hasCapsize`)

---

## XDSHeading

### API

```typescript
interface XDSHeadingProps {
  /**
   * Visual heading level (1-6). Determines styling from theme.
   * Required to ensure intentional visual hierarchy.
   */
  level: 1 | 2 | 3 | 4 | 5 | 6;

  /**
   * Accessibility level override. When set, the `aria-level` will differ
   * from the visual `level`. Use this when the visual hierarchy doesn't
   * match the document outline (e.g., sidebar headings, reused components).
   *
   * @default Same as `level`
   *
   * @example
   * // Visually styled as h2, but semantically h3 in document outline
   * <XDSHeading level={2} accessibilityLevel={3}>Sidebar Section</XDSHeading>
   */
  accessibilityLevel?: 1 | 2 | 3 | 4 | 5 | 6;

  /**
   * Visual variant. Themes define different scales for each variant.
   * @default 'default'
   */
  variant?: 'default' | 'editorial';

  /**
   * Text color.
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'disabled' | 'placeholder' | 'active' | 'inherit';

  /**
   * Display type. Headings default to block.
   * @default 'block'
   */
  display?: 'inline' | 'block';

  /**
   * Maximum lines before truncation. 0 = no truncation.
   * When set, shows tooltip on hover if content is truncated.
   * @default 0
   */
  maxLines?: number;

  /**
   * Control tooltip behavior for truncated text.
   * - `true` (default when maxLines > 0): show tooltip at default position
   * - `false`: disable tooltip
   * - Position value: show tooltip at specific position
   */
  truncateTooltip?: boolean | Position;

  /**
   * Enable optical alignment (textBoxTrim).
   * @default false
   */
  hasCapsize?: boolean;

  /**
   * Strikethrough decoration.
   * @default false
   */
  hasStrikethrough?: boolean;

  /**
   * Constrained styles for layout integration.
   * Allows margins, flex child props, text alignment.
   * See "Constrained xstyle" section for allowed properties.
   */
  xstyle?: StaticStyles<XDSTextXStyleAllowed>;

  children: React.ReactNode;

  'data-testid'?: string;
  id?: string;
}
```

### Rationale

**`level` as primary prop (visual):**
- Determines visual styling from theme
- Required to ensure intentional hierarchy
- TypeScript constrains to valid values (no h7)

**`accessibilityLevel` for document outline:**
- Defaults to `level` — visual and semantic match by default
- Override when visual hierarchy differs from document outline
- Common use cases:
  - Sidebar headings that shouldn't affect main content outline
  - Reusable card components used at different nesting depths
  - Fixed page sections where visual consistency > semantic correctness

**`variant` for scale switching:**
- `'default'` — standard XDS scale (denser)
- `'editorial'` — larger scale for content-heavy pages
- Extensible for future variants (e.g., `'display'`, `'marketing'`)

**No separate `semanticLevel` prop:**
- Current implementation has both `type` and `semanticLevel` which can diverge
- New design: `level` IS the semantic level; use `variant` for visual differences
- If truly needed (rare), can override via `aria-level` in future version

### Theme Integration

```typescript
// Theme defines complete styles per level + variant
const theme = {
  typography: {
    heading: {
      default: {
        1: { fontSize: '1.25rem', lineHeight: '1.2', fontWeight: 600, fontFamily: 'var(--font-heading)' },  // 20px
        2: { fontSize: '1.125rem', lineHeight: '1.33', fontWeight: 600, fontFamily: 'var(--font-heading)' }, // 18px
        3: { fontSize: '1rem', lineHeight: '1.25', fontWeight: 700, fontFamily: 'var(--font-heading)' },     // 16px
        4: { fontSize: '0.875rem', lineHeight: '1.43', fontWeight: 700, fontFamily: 'var(--font-heading)' }, // 14px
        5: { fontSize: '0.875rem', lineHeight: '1.43', fontWeight: 600, fontFamily: 'var(--font-heading)' }, // 14px
        6: { fontSize: '0.75rem', lineHeight: '1.33', fontWeight: 600, fontFamily: 'var(--font-heading)' },  // 12px
      },
      editorial: {
        1: { fontSize: '2rem', lineHeight: '1.5', fontWeight: 600, fontFamily: 'var(--font-heading)' },      // 32px
        2: { fontSize: '1.5rem', lineHeight: '1.33', fontWeight: 600, fontFamily: 'var(--font-heading)' },   // 24px
        3: { fontSize: '1.25rem', lineHeight: '1.4', fontWeight: 700, fontFamily: 'var(--font-heading)' },   // 20px
        4: { fontSize: '1rem', lineHeight: '1.5', fontWeight: 700, fontFamily: 'var(--font-heading)' },      // 16px
        5: { fontSize: '0.875rem', lineHeight: '1.43', fontWeight: 600, fontFamily: 'var(--font-heading)' }, // 14px (fallback)
        6: { fontSize: '0.75rem', lineHeight: '1.33', fontWeight: 600, fontFamily: 'var(--font-heading)' },  // 12px (fallback)
      },
    },
  },
};
```

### Usage Examples

```tsx
// Standard headings
<XDSHeading level={1}>Page Title</XDSHeading>
<XDSHeading level={2}>Section</XDSHeading>
<XDSHeading level={3}>Subsection</XDSHeading>

// Editorial variant (larger scale)
<XDSHeading level={1} variant="editorial">Article Title</XDSHeading>

// Truncated heading with tooltip
<XDSHeading level={2} maxLines={1}>Very Long Section Title That Might Truncate</XDSHeading>

// Inherit color from parent
<XDSHeading level={3} color="inherit">Inherits Parent Color</XDSHeading>
```

---

## XDSText

### API

```typescript
type XDSTextType = 'body' | 'large' | 'label' | 'large-label' | 'supporting' | 'code';
type XDSTextSize = '4xs' | '3xs' | '2xs' | 'xsm' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

interface XDSTextProps {
  /**
   * Semantic text type. Determines size, weight, and line-height from theme.
   * Required to ensure semantic usage.
   */
  type: XDSTextType;

  /**
   * Explicit font size override. When set, overrides the size from `type`
   * but preserves other type properties (font-family, default color).
   *
   * ⚠️ Lint rule: Prefer using `type` alone. Use `size` only for custom
   * UI elements that need explicit size control (metrics, callouts).
   */
  size?: XDSTextSize;

  /**
   * Text color. Defaults vary by type:
   * - 'supporting', 'label' → 'secondary'
   * - others → 'primary'
   */
  color?: 'primary' | 'secondary' | 'disabled' | 'placeholder' | 'active' | 'inherit';

  /**
   * Font weight override.
   */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';

  /**
   * Display type. Text defaults to inline.
   * @default 'inline'
   */
  display?: 'inline' | 'block';

  /**
   * Maximum lines before truncation. 0 = no truncation.
   * Note: truncated text renders as block.
   * @default 0
   */
  maxLines?: number;

  /**
   * Control tooltip behavior for truncated text.
   * @default true (when maxLines > 0)
   */
  truncateTooltip?: boolean | Position;

  /**
   * Word break behavior for truncated text.
   * @default 'break-all' for maxLines=1, 'break-word' otherwise
   */
  wordBreak?: 'break-word' | 'break-all';

  /**
   * Text wrapping behavior.
   */
  textWrap?: 'wrap' | 'nowrap';

  /**
   * Enable optical alignment (textBoxTrim).
   * @default false
   */
  hasCapsize?: boolean;

  /**
   * Strikethrough decoration.
   * @default false
   */
  hasStrikethrough?: boolean;

  /**
   * Use tabular (monospace) numbers for alignment.
   * @default false
   */
  hasTabularNumbers?: boolean;

  /**
   * Constrained styles for layout integration.
   * Allows margins, flex child props, text alignment.
   * See "Constrained xstyle" section for allowed properties.
   */
  xstyle?: StaticStyles<XDSTextXStyleAllowed>;

  children: React.ReactNode;

  'data-testid'?: string;
  id?: string;
}
```

### Type Values

| Type | Size | Weight | Line Height | Default Color | Use Case |
|------|------|--------|-------------|---------------|----------|
| `body` | 14px | Regular | 20px (1.43) | primary | The bulk of content |
| `large` | 16px | Regular | 24px (1.5) | primary | Emphasized content, quotes, descriptions |
| `label` | 14px | Bold | 20px (1.43) | primary | Form/chart/table column labels |
| `large-label` | 16px | SemiBold | 24px (1.5) | primary | Empty state labels, prominent labels |
| `supporting` | 12px | Regular | 16px (1.33) | secondary | Helper text, supplemental info |
| `code` | 14px | Regular | 20px (1.43) | primary | Inline code, monospace |

### Rationale

**Type-based (not size-based):**
- Semantic types guide correct usage
- Themes control actual sizes per type
- Weights and line-heights bundled with type
- LLMs learn patterns from codebase examples
- `size` prop available for overrides, with lint steering toward semantic usage

**Color defaults based on type:**
- `supporting` defaults to secondary color (helper text is de-emphasized)
- All other types default to primary color
- Override with `color` prop when needed

### Theme Integration

```typescript
const theme = {
  typography: {
    text: {
      body: { fontSize: '0.875rem', lineHeight: '1.43', fontWeight: 400, fontFamily: 'var(--font-heading)' },
      large: { fontSize: '1rem', lineHeight: '1.5', fontWeight: 400, fontFamily: 'var(--font-heading)' },
      label: { fontSize: '0.875rem', lineHeight: '1.43', fontWeight: 700, fontFamily: 'var(--font-heading)' },
      'large-label': { fontSize: '1rem', lineHeight: '1.5', fontWeight: 600, fontFamily: 'var(--font-heading)' },
      supporting: { fontSize: '0.75rem', lineHeight: '1.33', fontWeight: 400, fontFamily: 'var(--font-heading)' },
      code: { fontSize: '0.875rem', lineHeight: '1.43', fontWeight: 400, fontFamily: 'var(--font-code)' },
    },
  },
};
```

### Usage Examples

```tsx
// Standard body text (type is required)
<XDSText type="body">Body text</XDSText>

// Supporting/helper text (defaults to secondary color)
<XDSText type="supporting">Last updated 5 minutes ago</XDSText>

// Labels for form fields, chart columns, table headers
<XDSText type="label">Email address</XDSText>

// Large label for empty states, prominent labels
<XDSText type="large-label">No results found</XDSText>

// Large body for quotes, descriptions
<XDSText type="large">Important message</XDSText>

// Code
<XDSText type="code">const x = 1;</XDSText>

// Truncation
<XDSText type="body" maxLines={2}>Long text that will be clamped to two lines...</XDSText>

// Inherit color (for nested text)
<XDSText type="body" color="inherit">Inherits parent color</XDSText>

// Size override for custom UI elements (lint will warn if overused)
<XDSText type="body" size="4xl" weight="bold">
  {metricValue}
</XDSText>
```

---

## Component-Specific Text Styles

These styles are used internally by specific components, not exposed on XDSText:

| Style | Size | Weight | Line Height | Used By |
|-------|------|--------|-------------|---------|
| `data-viz-large` | 32px | Medium | 36px (1.125) | XDSMetricTile |
| `data-viz-small` | 24px | Medium | 28px (1.167) | XDSMetricTile |
| `app-name` | 20px | Bold | 24px (1.2) | Page navigation product name |
| `badge` | 12px | SemiBold | 16px (1.33) | XDSBadge |

These are defined in `theme.components.text.componentStyles` and accessed directly by their respective components.

---

## Size Scale

When using the `size` prop to override type-based sizing:

| Size | Value | Typical Usage |
|------|-------|---------------|
| `4xs` | 0.5rem (8px) | Citation, micro text |
| `3xs` | 0.625rem (10px) | Micro labels |
| `2xs` | 0.6875rem (11px) | Small micro text |
| `xsm` | 0.75rem (12px) | Captions, badges, supporting |
| `sm` | 0.8125rem (13px) | Secondary text |
| `base` | 0.875rem (14px) | Body (XDS default) |
| `lg` | 1rem (16px) | Large body, input text |
| `xl` | 1.125rem (18px) | Large emphasis, h2 |
| `2xl` | 1.25rem (20px) | h1, subtitle |
| `3xl` | 1.5rem (24px) | Editorial h2, card title |
| `4xl` | 2rem (32px) | Editorial h1, data viz |

### Line Height Coupling

Line height is automatically determined by size (not exposed as prop):

```typescript
const lineHeightBySize = {
  '4xs': 1.33,
  '3xs': 1.33,
  '2xs': 1.33,
  xsm: 1.33,
  sm: 1.43,
  base: 1.43,
  lg: 1.5,
  xl: 1.4,
  '2xl': 1.3,
  '3xl': 1.25,
  '4xl': 1.2,
};
```

### Lint Rules for Size Usage

```typescript
// Lint rule: xds/prefer-semantic-type
// Warns when `size` prop is used, suggesting to rely on `type` instead.
// Severity: warning (not error - size is valid for custom UI elements)

// Example lint output:
// ⚠️ Line 42: Consider removing `size` prop and using semantic `type` alone.
//    The `size` prop should only be used for custom UI elements like
//    dashboard metrics or data visualizations.
```

---

## Truncation Behavior

### Consolidated Props

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `maxLines` | `number` | `0` | 0 = no truncation |
| `truncateTooltip` | `boolean \| Position` | `true` | Shown only when actually overflowing |
| `wordBreak` | `'break-word' \| 'break-all'` | Smart | `break-all` for 1 line, `break-word` otherwise |

### Behavior

1. **maxLines=0**: No truncation, text wraps naturally
2. **maxLines=1**: Single-line truncation with ellipsis, defaults to `break-all`
3. **maxLines>1**: Multi-line clamp with `-webkit-line-clamp`
4. **Tooltip**: Only shown when content actually overflows (detected via ref)
5. **Tooltip content**: Clamped to 10 lines max to prevent huge tooltips
6. **Truncated text always renders as block** (required for line-clamp)

### Migration from Current API

| Current | New |
|---------|-----|
| `numberOfLines={2}` | `maxLines={2}` |
| `hasTooltipForTruncatedText={false}` | `truncateTooltip={false}` |
| `truncatedTextTooltipPosition="above"` | `truncateTooltip="above"` |

---

## Disabled State Handling

### Open Question

Current implementation uses `XDSInternalTextColorDisabledOverrideContext` to let parent components (like buttons) force disabled styling on child text.

**Options:**

1. **Keep context pattern** — Parent sets disabled, children inherit
2. **Explicit prop only** — `color="disabled"` must be set explicitly
3. **Both** — Support context but also allow explicit override

**Recommendation:** Keep context for component library internals (XDSButton disabling its label), but also support explicit `color="disabled"` for standalone usage.

---

## Constrained xstyle

Both XDSText and XDSHeading support a **constrained `xstyle` prop** for layout integration. This allows spacing and flex positioning without escaping typography styles.

### Allowed Properties

```typescript
xstyle?: StaticStyles<{
  // Margins (from XDSMarginXStyles)
  margin?: unknown;
  marginTop?: unknown;
  marginBottom?: unknown;
  marginStart?: unknown;
  marginEnd?: unknown;
  marginBlock?: unknown;
  marginInline?: unknown;

  // Width constraints (from XDSWidthXStyles)
  width?: unknown;
  minWidth?: unknown;
  maxWidth?: unknown;

  // Flex child properties
  alignSelf?: unknown;
  flexBasis?: unknown;
  flexGrow?: unknown;
  flexShrink?: unknown;
  flexWrap?: unknown;

  // Text layout (non-typography)
  overflow?: unknown;
  overflowWrap?: unknown;
  textAlign?: unknown;
  textAlignLast?: unknown;
  textOverflow?: unknown;
  verticalAlign?: unknown;
  whiteSpace?: unknown;
  wordBreak?: unknown;

  // Decoration (allowed since hasStrikethrough exists)
  textDecoration?: unknown;
}>;
```

### NOT Allowed (enforced by type)

- `fontSize`, `lineHeight`, `fontWeight`, `fontFamily` — use `type`/`level` props
- `color` — use `color` prop
- `padding` — internal to component
- `background`, `border` — not text concerns

### Rationale

This matches the internal Meta implementation pattern. It allows:
- Layout integration (margins for spacing rhythm)
- Flex positioning (alignSelf for cross-axis control)
- Text alignment (textAlign for content alignment)

While preventing:
- Typography escapes (can't override font-size)
- Color escapes (must use semantic color prop)
- Structural changes (no padding/background)

---

## Props NOT Included

| Prop | Reason |
|------|--------|
| `style` | Prevents escaping design system |
| `className` | Prevents escaping design system |
| `lineHeight` | Coupled to size/type internally |
| `fontSize` | Use `type` or `size` prop |
| `fontFamily` | Determined by type (body vs code vs heading) |

---

## Migration Notes

### XDSText Type Mapping

| Current | New | Notes |
|---------|-----|-------|
| `body` | `body` | Same |
| `large-body` | `large` | Renamed for brevity |
| `emphasized` | `label` | Renamed to match use case (form/chart labels) |
| `large-emphasized` | `large-label` | Renamed to match use case |
| `supporting` | `supporting` | Same |
| `label` | `label` | Same (if existed) |

### XDSHeading Type Mapping

| Current | New | Notes |
|---------|-----|-------|
| `header1` | `level={1}` | Semantic-first |
| `header2` | `level={2}` | Semantic-first |
| `header3` | `level={3}` | Semantic-first |
| `header4` | `level={4}` | Semantic-first |
| `display` | `level={1} variant="display"` | TBD: add display variant? |
| `editorialHeader1` | `level={1} variant="editorial"` | Variant-based |
| `header1_DO_NOT_USE` | Deprecated | Remove in migration |

---

## Open Questions

1. **Display variant for XDSHeading?** — Should we add `variant="display"` for hero/marketing use cases, or use XDSText with size override?

2. **Nested heading context** — Current impl prevents nested headings from both having `role="heading"`. Keep this behavior?

3. **`emphasized` type** — Should we keep as a type, or always use `weight` prop? Current decision: weight prop.

4. **textWrap prop** — Is this needed on XDSHeading, or only XDSText?

---

## Next Steps

1. [ ] Review and finalize type values
2. [ ] Define theme typography structure with tokens team
3. [ ] Implement XDSHeading
4. [ ] Implement XDSText
5. [ ] Create migration codemod for type changes
6. [ ] Add lint rule for `size` prop usage
