# @xds/core - AI Context

A React component library for building internal tools, powered by StyleX.

## Quick Start

```tsx
import {
  Theme,
  defaultTheme,
  XDSSection,
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutPanel,
  XDSButton,
} from '@xds/core';

function App() {
  return (
    <Theme theme={defaultTheme} mode="system">
      <XDSSection>
        <XDSLayout
          header={<XDSLayoutHeader hasDivider>Dashboard</XDSLayoutHeader>}
          start={
            <XDSLayoutPanel hasDivider role="navigation">
              <Navigation />
            </XDSLayoutPanel>
          }
          content={
            <XDSLayoutContent role="main">
              <MainContent />
            </XDSLayoutContent>
          }
        />
      </XDSSection>
    </Theme>
  );
}
```

Use `XDSLayout` with named slots (`header`, `content`, `footer`, `start`, `end`) wrapped in a container component (`XDSSection` or `XDSCard`).

## Components

### XDSButton

Interactive button with variants and loading state.

```tsx
import { XDSButton } from '@xds/core';

<XDSButton variant="primary">Click me</XDSButton>
<XDSButton variant="secondary">Secondary</XDSButton>
<XDSButton variant="ghost">Ghost</XDSButton>
<XDSButton variant="destructive" onClick={handleDelete}>Delete</XDSButton>
<XDSButton loading>Saving...</XDSButton>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'destructive'` | `'primary'` | Visual style |
| `loading` | `boolean` | `false` | Shows spinner, disables button |
| `disabled` | `boolean` | `false` | Disables interaction |
| `...rest` | `ButtonHTMLAttributes` | — | All standard button props |

### Layout Components

Flexbox-based layout primitives with theme-aware spacing.

#### XDSLayout (Page/Section Layout)

Slot-based layout for pages and cards. Must be wrapped in `XDSSection` or `XDSCard`.

```
┌─────────────────────────────────────────┐
│                 header                  │
├──────┬─────────────────────────┬────────┤
│      │                         │        │
│start │        content          │  end   │
│      │                         │        │
├──────┴─────────────────────────┴────────┤
│                 footer                  │
└─────────────────────────────────────────┘
```

```tsx
import {
  XDSCard,
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSLayoutPanel,
} from '@xds/core';

<XDSCard>
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
    start={<XDSLayoutPanel hasDivider role="navigation"><Nav /></XDSLayoutPanel>}
    content={<XDSLayoutContent role="main">Body</XDSLayoutContent>}
    footer={<XDSLayoutFooter hasDivider>Actions</XDSLayoutFooter>}
  />
</XDSCard>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `ReactNode` | — | Header slot |
| `footer` | `ReactNode` | — | Footer slot |
| `content` | `ReactNode` | — | Main content slot |
| `start` | `ReactNode` | — | Start panel (left in LTR) |
| `end` | `ReactNode` | — | End panel (right in LTR) |
| `height` | `'fill' \| 'auto'` | `'fill'` | `fill`: content scrolls. `auto`: page scrolls |
| `isFullBleed` | `boolean` | `false` | Remove outer padding |

**Content area props** (`XDSLayoutHeader`, `XDSLayoutFooter`, `XDSLayoutContent`, `XDSLayoutPanel`):

| Prop | Type | Description |
|------|------|-------------|
| `hasDivider` | `boolean` | Add themed border between areas |
| `isFullBleed` | `boolean` | Remove internal padding (for tables, images) |
| `role` | `AriaRole` | ARIA landmark (`'main'`, `'navigation'`, `'banner'`) |
| `label` | `string` | Accessible label for landmark |

#### Containers

```tsx
// Card - bordered container with background
<XDSCard>
  <XDSLayout content={...} />
</XDSCard>

// Section - full-width with optional background variant
<XDSSection variant="wash">
  <XDSLayout content={...} />
</XDSSection>
```

#### XDSHStack / XDSVStack (Stack Primitives)

Lower-level flexbox primitives for custom layouts within content areas.

```tsx
import { XDSHStack, XDSVStack, XDSStackItem } from '@xds/core';

<XDSHStack gap="space2" vAlign="center">
  <XDSStackItem size="static"><Logo /></XDSStackItem>
  <XDSStackItem size="fill"><Navigation /></XDSStackItem>
</XDSHStack>

<XDSVStack gap="space4" hAlign="center">
  <Heading />
  <Description />
</XDSVStack>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | `SpacingScale` | — | Space between items |
| `vAlign` / `hAlign` | `'start' \| 'center' \| 'end' \| 'stretch'` | `'stretch'` | Cross-axis alignment |
| `wrap` | `'nowrap' \| 'wrap' \| 'wrap-reverse'` | `'nowrap'` | Flex wrap |
| `element` | `ElementType` | `'div'` | Render as different element |
| `xstyle` | `StyleXStyles` | — | Additional StyleX styles |

**XDSStackItem props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'static' \| 'fill'` | `'static'` | `fill` grows to take remaining space |
| `crossAlignSelf` | `'start' \| 'center' \| 'end' \| 'stretch'` | — | Override parent alignment |

### Spacing Scale

Available values for `gap` prop:

- `space0` - No gap
- `space0.5` - Extra small (4px)
- `space1` - Small (8px)
- `space2` - Medium-small (12px)
- `space3` - Medium (16px)
- `space4` - Medium-large (20px)
- `space5` - Large (24px)
- `space6` - Extra large (28px)
- `space7` - Maximum (32px)

## Theming

### Theme Provider

Wrap your app with the Theme provider:

```tsx
import { Theme, defaultTheme } from '@xds/core';

<Theme theme={defaultTheme} mode="system">
  <App />
</Theme>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `theme` | `Theme` | Required | Theme object (`defaultTheme` or `neutralTheme`) |
| `mode` | `'system' \| 'light' \| 'dark'` | `'system'` | Color mode |

### Available Themes

- `defaultTheme` - Full-featured with accent colors, light/dark support
- `neutralTheme` - Grayscale theme

### useTheme Hook

```tsx
import { useTheme } from '@xds/core';

function MyComponent() {
  const { theme, mode } = useTheme();
  // mode is 'light' | 'dark'
}
```

## StyleX Integration

### Custom Styles via xstyle

Components accept `xstyle` prop for additional StyleX styles:

```tsx
import * as stylex from '@stylexjs/stylex';
import { XDSHStack } from '@xds/core';

const styles = stylex.create({
  container: { padding: '1rem' },
});

<XDSHStack xstyle={styles.container}>
  {children}
</XDSHStack>
```

### Using Theme Tokens

Access design tokens in your StyleX styles:

```tsx
import * as stylex from '@stylexjs/stylex';
import { colorTokens, spacingTokens } from '@xds/core';

const styles = stylex.create({
  card: {
    backgroundColor: colorTokens.surface,
    padding: spacingTokens.space4,
    color: colorTokens.textPrimary,
  },
});
```

### Utility Functions

For direct StyleX usage without components:

```tsx
import { stack, stackItem } from '@xds/core';
import * as stylex from '@stylexjs/stylex';

<div {...stylex.props(...stack({ direction: 'horizontal', gap: 'space2' }))}>
  <div {...stylex.props(...stackItem({ size: 'fill' }))}>Fills space</div>
</div>
```

## Common Patterns

### Page Layout with Sidebar

```tsx
<XDSSection>
  <XDSLayout
    header={<XDSLayoutHeader hasDivider role="banner">App Title</XDSLayoutHeader>}
    start={
      <XDSLayoutPanel hasDivider role="navigation">
        <Navigation />
      </XDSLayoutPanel>
    }
    content={<XDSLayoutContent role="main"><MainContent /></XDSLayoutContent>}
  />
</XDSSection>
```

### Card with Header and Footer

```tsx
<XDSCard>
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Edit User</XDSLayoutHeader>}
    content={<XDSLayoutContent><Form /></XDSLayoutContent>}
    footer={
      <XDSLayoutFooter hasDivider>
        <XDSHStack gap="space2">
          <XDSButton variant="secondary">Cancel</XDSButton>
          <XDSButton variant="primary">Save</XDSButton>
        </XDSHStack>
      </XDSLayoutFooter>
    }
  />
</XDSCard>
```

### Full Bleed Table

```tsx
<XDSCard>
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Users</XDSLayoutHeader>}
    content={
      <XDSLayoutContent isFullBleed>
        <Table />
      </XDSLayoutContent>
    }
  />
</XDSCard>
```

### Button Group

```tsx
<XDSHStack gap="space2">
  <XDSButton variant="secondary">Cancel</XDSButton>
  <XDSButton variant="primary">Save</XDSButton>
</XDSHStack>
```

### Centered Content

```tsx
<XDSVStack hAlign="center" gap="space4">
  <Heading />
  <Description />
  <XDSButton>Get Started</XDSButton>
</XDSVStack>
```

## Key Conventions

1. **XDS Prefix** - All components use `XDS` prefix (e.g., `XDSButton`, `XDSLayout`)
2. **Layout First** - Use `XDSLayout` with `XDSSection`/`XDSCard` for page structure
3. **No className** - Use `xstyle` prop for custom styles on Stack components
4. **Theme Required** - Wrap app in `<Theme>` provider for proper styling
5. **ARIA Roles** - Use `role` prop on layout areas for accessibility (`role="main"`, `role="navigation"`)
6. **Tree-shakeable** - Import from subpaths for smaller bundles: `@xds/core/Layout`

## Exports

```tsx
// All-in-one
import {
  XDSButton,
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSLayoutPanel,
  XDSCard,
  XDSSection,
  XDSHStack,
  XDSVStack,
  XDSStackItem,
  Theme,
  defaultTheme,
} from '@xds/core';

// Tree-shaking friendly
import { XDSButton } from '@xds/core/Button';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
  XDSLayoutPanel,
  XDSCard,
  XDSSection,
  XDSHStack,
  XDSVStack,
  XDSStackItem,
} from '@xds/core/Layout';
```
