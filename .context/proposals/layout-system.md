# XDS Layout System Proposal

*Proposal — January 2026*

## Overview

A composable layout system for building consistent, structured layouts with zero styling customization. The system follows a container/content separation pattern with intelligent context-aware behavior.

### Design Principles

1. **Zero styling build** — No `xstyle` customization on layout components
2. **Context-aware defaults** — Components detect their environment and self-adjust
3. **LLM-friendly API** — Clear, discoverable props with self-documenting names
4. **Composition over configuration** — Simple primitives that combine into complex patterns

---

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│  HIGHER-ORDER PATTERNS                                          │
│  Card, HoverCard, Popover, Modal                                │
│  (Compose layouts into complete UI patterns)                    │
├─────────────────────────────────────────────────────────────────┤
│  LAYOUT STRUCTURE                                               │
│  XDSLayoutContainer + XDSLayout                                 │
│  (Container appearance + section arrangement)                   │
├─────────────────────────────────────────────────────────────────┤
│  CONTENT AREAS                                                  │
│  XDSLayoutHeader, XDSLayoutFooter, XDSLayoutContent,           │
│  XDSLayoutPanel                                                 │
│  (Regions that hold content)                                    │
├─────────────────────────────────────────────────────────────────┤
│  LAYOUT PRIMITIVES                                              │
│  HStack, VStack, SplitPane, Grid, Divider                       │
│  (Arrangement and spacing tools)                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### XDSLayoutContainer

Outer container that sets visual appearance and padding context.

| Prop | Type | Description |
|------|------|-------------|
| `variant` | `'page' \| 'card' \| 'modal' \| 'section' \| 'hovercard' \| 'popover'` | Visual variant determining elevation and padding |
| `children` | `React.Node` | Must be an `XDSLayout` component |

### XDSLayout

Arranges sections using named slots. Does not handle visual appearance — that's the Container's job.

```
┌─────────────────────────────────────────┐
│                 header                  │
├──────┬─────────────────────────┬────────┤
│start │        content          │  end   │
├──────┴─────────────────────────┴────────┤
│                 footer                  │
└─────────────────────────────────────────┘
```

| Prop | Type | Description |
|------|------|-------------|
| `header` | `React.Node` | Header slot |
| `footer` | `React.Node` | Footer slot |
| `start` | `React.Node` | Start panel slot (left in LTR) |
| `end` | `React.Node` | End panel slot (right in LTR) |
| `content` | `React.Node` | Main content slot |
| `height` | `'fill' \| 'auto'` | `fill`: layout fills container, content scrolls. `auto`: layout grows with content |
| `isFullBleed` | `boolean` | Removes padding at layout's outer edges |

### Content Areas

`XDSLayoutHeader`, `XDSLayoutFooter`, `XDSLayoutContent`, `XDSLayoutPanel`

| Prop | Type | Description |
|------|------|-------------|
| `children` | `React.Node` | Area content |
| `hasDivider` | `boolean` | Adds themed border (position auto-detected) |
| `isFullBleed` | `boolean` | Removes this area's internal padding |
| `role` | `string` | ARIA landmark role (e.g., `'banner'`, `'main'`, `'navigation'`, `'contentinfo'`) |

---

## Basic Usage

```jsx
<XDSLayoutContainer variant="card">
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
    content={<XDSLayoutContent>Body</XDSLayoutContent>}
    footer={<XDSLayoutFooter>Actions</XDSLayoutFooter>}
  />
</XDSLayoutContainer>
```

### With Sidebar

```jsx
<XDSLayoutContainer variant="card">
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Dashboard</XDSLayoutHeader>}
    start={<XDSLayoutPanel hasDivider><XDSList items={navItems} /></XDSLayoutPanel>}
    content={<XDSLayoutContent>Main content</XDSLayoutContent>}
  />
</XDSLayoutContainer>
```

### Full Bleed Content

```jsx
<XDSLayoutContainer variant="card">
  <XDSLayout
    header={<XDSLayoutHeader>Users</XDSLayoutHeader>}
    content={
      <XDSLayoutContent isFullBleed>
        <XDSTable ... />
      </XDSLayoutContent>
    }
  />
</XDSLayoutContainer>
```

---

## Why Separate Container + Layout

Separation enables **reusable layout structures** across different contexts:

```jsx
// Define layout structure once
const NavigationLayout = ({items, content}) => (
  <XDSLayout
    start={<XDSLayoutPanel><XDSList items={items} /></XDSLayoutPanel>}
    content={<XDSLayoutContent>{content}</XDSLayoutContent>}
  />
);

// Desktop: inside a popover menu
<XDSLayoutContainer variant="popover">
  <NavigationLayout items={navItems} content={<Details />} />
</XDSLayoutContainer>

// Mobile: full page layout
<XDSLayoutContainer variant="page">
  <NavigationLayout items={navItems} content={<Details />} />
</XDSLayoutContainer>
```

**Key benefit:** Author the layout once, adapt the container for responsive or contextual needs.

### LLM Considerations

The two-component pattern requires LLMs to remember the wrapper. Mitigations:

1. **Higher-order patterns are primary** — Most code uses `XDSCard`, `XDSModal`, etc.
2. **JSDoc on XDSLayout** — States "must be wrapped in XDSLayoutContainer"
3. **Examples emphasize the pattern** — All raw Layout examples show the Container wrapper
4. **TypeScript context check** — XDSLayout can warn if not inside a Container

---

## Full Bleed Behavior

`isFullBleed` exists at two levels with different scopes:

| Level | Effect |
|-------|--------|
| `XDSLayout isFullBleed` | Layout touches container edges (outer spacing removed) |
| `XDSLayoutContent isFullBleed` | Content area has no internal padding |

These are independent — use both when needed.

```
Layout isFullBleed=false          Layout isFullBleed=true
┌────────────────────────┐        ┌────────────────────────┐
│   ┌────────────────┐   │        │┌──────────────────────┐│
│   │    content     │   │   →    ││       content        ││
│   └────────────────┘   │        │└──────────────────────┘│
└────────────────────────┘        └────────────────────────┘
     outer padding                      no outer padding
```

---

## Padding via Variants

Padding is controlled entirely through container variants. Each variant defines spacing as CSS variables.

| Variant | Outer Spacing | Inner Spacing | Use Case |
|---------|---------------|---------------|----------|
| `page` | 16px | 16px | Full page layouts |
| `card` | 16px | 16px | Elevated content containers |
| `modal` | 16px | 16px | Dialog overlays |
| `section` | 16px | 16px | Content sections within a page |
| `hovercard` | 12px | 12px | Hover-triggered content |
| `popover` | 12px | 12px | Click-triggered overlays |

### How It Works

1. `XDSLayoutContainer` sets CSS variables based on `variant`
2. `XDSLayout` reads outer spacing variable
3. Content areas read inner spacing variable
4. `isFullBleed` overrides these to `0`

```css
/* card, section, page, modal */
--xds-layout-outer-spacing: 16px;
--xds-layout-inner-spacing: 16px;

/* hovercard, popover */
--xds-layout-outer-spacing: 12px;
--xds-layout-inner-spacing: 12px;
```

### Theming

Since spacing is controlled via CSS variables, themes can override these values. A theme with denser spacing might use:

```css
/* Dense theme overrides */
--xds-layout-outer-spacing: 12px;
--xds-layout-inner-spacing: 12px;
```

This allows the same component code to adapt to different visual densities across themes.

---

## Auto-Adjusting Components

Components inside layout areas detect context and self-adjust. No explicit props needed.

| Component | Behavior |
|-----------|----------|
| `XDSList` | Applies spacing correction automatically |
| `XDSScrollableArea` | Pushes scrollbar to container edge |
| `XDSTable` | Extends edge-to-edge within container |

```jsx
// Just works — no props needed
<XDSLayoutPanel>
  <XDSList items={navItems} />
</XDSLayoutPanel>
```

---

## Dividers

`hasDivider` on content areas auto-places the divider on the correct edge:

| Component | Divider Position |
|-----------|------------------|
| Header | Bottom edge |
| Footer | Top edge |
| Panel (start) | End edge |
| Panel (end) | Start edge |

When `hasDivider` is false, spacing collapse is applied automatically for seamless visual flow.

---

## Scroll Behavior

| `height` | Behavior |
|----------|----------|
| `"fill"` (default) | Layout fills container, content scrolls internally |
| `"auto"` | Layout grows with content, container/page scrolls |

---

## Higher-Order Patterns

Pre-composed patterns for common use cases. These are the primary API for most users.

| Pattern | Use Case |
|---------|----------|
| `XDSCard` | Elevated content container |
| `XDSModal` | Dialog overlay |
| `XDSPopover` | Click-triggered overlay |
| `XDSHoverCard` | Hover-triggered content |

Each pattern internally composes `XDSLayoutContainer` + `XDSLayout`:

```jsx
// XDSCard usage (named slots)
<XDSCard
  header={<XDSCard.Header>Title</XDSCard.Header>}
  content={<XDSCard.Content>Body</XDSCard.Content>}
  footer={<XDSCard.Footer>Actions</XDSCard.Footer>}
/>

// XDSModal usage
<XDSModal
  isOpen={open}
  onClose={close}
  header={<XDSModal.Header>Confirm</XDSModal.Header>}
  content={<XDSModal.Content>Are you sure?</XDSModal.Content>}
  footer={<XDSModal.Footer>...</XDSModal.Footer>}
/>
```

---

## Additional Components (API TBD)

| Component | Description |
|-----------|-------------|
| `XDSSplitPane` | Resizable panels. Horizontal and vertical orientations. |
| `XDSGrid` | Responsive grid layout. |
| `XDSHStack` | Horizontal stack with gap. |
| `XDSVStack` | Vertical stack with gap. |
| `XDSDivider` | Themed divider with `isFullBleed` support. |

---

## Component Summary

| Component | Role | Key Props |
|-----------|------|-----------|
| `XDSLayoutContainer` | Visual appearance + padding context | `variant` |
| `XDSLayout` | Section arrangement | `header`, `footer`, `start`, `end`, `content`, `height`, `isFullBleed` |
| `XDSLayoutHeader` | Header area | `hasDivider`, `isFullBleed` |
| `XDSLayoutFooter` | Footer area | `hasDivider`, `isFullBleed` |
| `XDSLayoutContent` | Main content area | `isFullBleed` |
| `XDSLayoutPanel` | Side panel | `hasDivider`, `isFullBleed` |

---

## LLM Pattern Design

The API is designed for LLM pattern retention and consistency:

### Naming Symmetry

Slot names match component names, creating strong associations:

| Slot | Component |
|------|-----------|
| `header=` | `<XDSLayoutHeader>` |
| `footer=` | `<XDSLayoutFooter>` |
| `content=` | `<XDSLayoutContent>` |
| `start=` / `end=` | `<XDSLayoutPanel>` |

LLMs can infer: "the `header` slot takes the `Header` component."

### Typed Slots

Slot types reinforce what goes where:

```typescript
header?: React.ReactElement<XDSLayoutHeaderProps>;
footer?: React.ReactElement<XDSLayoutFooterProps>;
content?: React.ReactElement<XDSLayoutContentProps>;
start?: React.ReactElement<XDSLayoutPanelProps>;
end?: React.ReactElement<XDSLayoutPanelProps>;
```

### Canonical Examples in JSDoc

Every component includes a complete example in its JSDoc:

```typescript
/**
 * Container for XDSLayout. Sets visual appearance and padding.
 *
 * @example
 * <XDSLayoutContainer variant="card">
 *   <XDSLayout
 *     header={<XDSLayoutHeader>Title</XDSLayoutHeader>}
 *     content={<XDSLayoutContent>Body</XDSLayoutContent>}
 *   />
 * </XDSLayoutContainer>
 */
```

LLMs often pull from JSDoc examples directly.

### Consistent Pattern Repetition

All documentation examples follow the same structure:
1. `XDSLayoutContainer` wraps `XDSLayout`
2. Named slots receive matching components
3. No alternative patterns shown

This repetition builds strong pattern recognition.

---

## Open Questions

### 1. Should XDSLayoutContainer have variants?

**Current approach:** XDSLayoutContainer has variants (`card`, `modal`, `popover`, etc.) that set appearance and padding.

**Alternative approach:** Remove variants from XDSLayoutContainer. Instead:
- Higher-order components (XDSCard, XDSModal, XDSPopover) handle their own appearance
- Each component is individually themable without XDSLayoutContainer growing arbitrarily
- New containers with unique constraints (e.g., page content with max-width) don't need to be added as variants

**Arguments for removing variants:**
1. Higher-order components will exist anyway as the primary API
2. Each container type may have unique requirements (e.g., page content needs max-width constraints for forms)
3. Prevents XDSLayoutContainer from growing arbitrarily as new use cases emerge
4. Theming becomes per-component rather than per-variant, giving more control
5. Components can have domain-specific props (e.g., XDSPageContent with `maxWidth` prop)

**Arguments for keeping variants:**
1. Unified low-level API for custom use cases not covered by higher-order components
2. Guarantees consistent styling across similar containers
3. Enables layout reuse across contexts (same layout, different containers)

**Recommendation:** Treat XDSLayoutContainer as a **primitive**:
- Accepts `xstyle` for customization
- No variants — visual styling moves to higher-order components
- Only handles CSS variable propagation and flex container setup

Higher-order components (XDSCard, XDSModal, etc.) configure the primitive:

```jsx
// XDSCard internally uses XDSLayoutContainer as a primitive
function XDSCard({ children, xstyle, ...props }) {
  return (
    <XDSLayoutContainer
      xstyle={[cardStyles.base, xstyle]}
      {...props}
    >
      {children}
    </XDSLayoutContainer>
  );
}

// Usage - XDSCard handles appearance
<XDSCard>
  <XDSLayout
    header={<XDSLayoutHeader>...</XDSLayoutHeader>}
    content={<XDSLayoutContent>...</XDSLayoutContent>}
  />
</XDSCard>
```

**XDSLayoutContainer as primitive:**

| Prop | Type | Description |
|------|------|-------------|
| `xstyle` | `StyleXStyles` | Custom styles (background, shadow, radius, etc.) |
| `paddingOuterX` | `SpacingToken` | Outer horizontal padding (left/right) |
| `paddingOuterY` | `SpacingToken` | Outer vertical padding (top/bottom) |
| `paddingInnerX` | `SpacingToken` | Inner horizontal padding for content areas |
| `paddingInnerY` | `SpacingToken` | Inner vertical padding for content areas |
| `children` | `ReactNode` | Must be an `XDSLayout` component |

**What it provides:**
- Sets CSS variables based on padding props:
  - `--layout-padding-outer-x`, `--layout-padding-outer-y`
  - `--layout-padding-inner-x`, `--layout-padding-inner-y`
- Flex container setup for XDSLayout
- `height: 100%` default (overridable via xstyle)

**What it does NOT provide:**
- No backgroundColor, boxShadow, borderRadius — these come from higher-order components via `xstyle`
- No variants — each higher-order component is individually themable

### 2. Page Content Layout

A specific use case: page content that constrains central space to a max-width (for forms, articles, etc.).

**Requirements:**
- Content width constrained to a value like 800px
- On smaller screens, content fills available width with minimum padding
- Side panels (if present) remain at container edges

**Challenge:** With panels, you can't simply use `max-width` on the container since panels need to be at the edges.

**Solution:** Calculate padding dynamically to center content within the constraint:

```css
/* Centers content at 800px max, with minimum 16px padding */
padding-inline: max(16px, calc((100% - 800px) / 2));
```

This approach:
- Wide screens → padding grows to center the constrained content
- Narrow screens → minimum padding prevents content touching edges
- Panels stay at container edges, unaffected by content centering

**Architecture: Internal StyleX utility**

Content width constraints apply to a limited set of containers (page content, form modals). Rather than adding complexity to XDSLayoutContainer, create an **internal StyleX utility** that these specific components use:

```tsx
// Internal utility - not exported
const contentWidthStyles = stylex.create({
  form: {
    '--layout-padding-inner-x': `max(${spacingTokens.space4}, calc((100% - 800px) / 2))`,
  },
  capped: {
    '--layout-padding-inner-x': `max(${spacingTokens.space4}, calc((100% - 1200px) / 2))`,
  },
  full: {
    // No override - uses standard padding
  },
});
```

**Components that use content width:**

1. **XDSPageContent** - Exposes `contentWidth` prop for page layouts
2. **XDSModal** - May have `variant="form"` that applies the form constraint

```tsx
// XDSPageContent exposes contentWidth prop
<XDSPageContent contentWidth="form">
  <XDSLayout ... />
</XDSPageContent>

// XDSModal might have a variant for form modals
<XDSModal variant="form">
  <XDSLayout ... />
</XDSModal>
```

**Why this approach:**

1. **XDSLayoutContainer stays simple:** Pure primitive with token-based padding.

2. **Limited scope:** Only components that need content width get the prop.

3. **Internal utility:** The calc-based styles are implementation details, not public API.

4. **Explicit semantics:** `XDSPageContent contentWidth="form"` clearly communicates intent.

**Content width variants:**

| Variant | Use Case | Width |
|---------|----------|-------|
| `form` | Forms, focused content | 800px |
| `capped` | Articles, content-heavy pages | 1200px |
| `full` | Dashboards, data tables, no constraint (default) | 100% |

**LLM-friendliness:** Use-case-based naming (`form`) is more discoverable than descriptive naming (`narrow`). An LLM building a form knows immediately to use `contentWidth="form"` without having to decide if content is "narrow enough."

### 3. Nested layouts

How do contexts compose when layouts are nested?

### 4. SplitPane/Grid

Detailed API design.

### 5. Animation

Transition support for panels (collapse/expand)?

---

## RTL Support

The `start`/`end` naming (rather than `left`/`right`) enables automatic RTL handling via CSS logical properties:

| Direction | `start` panel | `end` panel |
|-----------|---------------|-------------|
| LTR | Left side | Right side |
| RTL | Right side | Left side |

Implementation uses logical CSS properties (`inset-inline-start`, `padding-inline-end`, etc.) so no additional props or configuration are needed. RTL layouts work automatically when `dir="rtl"` is set on a parent element.

---

## Accessibility

Content areas support ARIA landmark roles via the `role` prop:

| Component | Suggested Role | Renders As |
|-----------|----------------|------------|
| `XDSLayoutHeader` | `"banner"` | `<header>` or `<div role="banner">` |
| `XDSLayoutFooter` | `"contentinfo"` | `<footer>` or `<div role="contentinfo">` |
| `XDSLayoutContent` | `"main"` | `<main>` or `<div role="main">` |
| `XDSLayoutPanel` | `"navigation"` / `"complementary"` | `<aside>` or `<nav>` |

**Design decision:** Should content areas render semantic HTML elements by default, or require explicit `role` prop?

- **Option A:** Default to semantic elements (`<header>`, `<main>`, etc.) based on component type
- **Option B:** Default to `<div>`, require `role` prop for landmarks
- **Option C:** Default to semantic elements, allow `as` prop to override

Semantic defaults (Option A/C) provide better accessibility out-of-the-box but may cause issues with nested layouts (multiple `<main>` elements).

---

## Related Documentation

- `xds-architecture.md` — Overall XDS architecture and theming
- `zero-styling-architecture.md` — Zero styling philosophy
