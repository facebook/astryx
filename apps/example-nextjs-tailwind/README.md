# XDS + Tailwind (Dist Build)

Example Next.js app using XDS pre-built dist CSS alongside Tailwind CSS v4. No StyleX build plugin needed: XDS components are consumed as a regular npm package with a CSS import.

## How it works

XDS ships pre-compiled CSS (`xds.css`) with all component styles as atomic classes in CSS cascade layers. Tailwind handles layout, spacing, and custom styling via utility classes. Both systems coexist through explicit layer ordering.

## CSS Layer Order

The key to coexistence is declaring **all** layers upfront in `globals.css`:

```css
@layer reset, theme, base, xds-base, xds-theme, components, utilities;
```

This gives the correct priority (lowest → highest):

| Layer         | Source   | What it does                                       |
| ------------- | -------- | -------------------------------------------------- |
| `reset`       | XDS      | CSS reset (`:where()` selectors, zero specificity) |
| `theme`       | Tailwind | Theme variables (colors, fonts, spacing)           |
| `base`        | Tailwind | Preflight reset (element-level normalization)      |
| `xds-base`    | XDS      | Component styles (buttons, cards, inputs, etc.)    |
| `xds-theme`   | XDS      | Theme overrides (typography, color mappings)       |
| `components`  | Tailwind | Component classes (if any)                         |
| `utilities`   | Tailwind | Utility classes: **wins over all layers**          |
| _(unlayered)_ | Consumer | Your custom CSS: highest priority                  |

Without this declaration, XDS layers are created _after_ Tailwind's declared layers, making XDS component styles outrank Tailwind utilities. That means `className="bg-red-500"` on an XDS component wouldn't work.

## Usage patterns

### XDS for components, Tailwind for layout

```tsx
<main className="flex min-h-screen items-center p-8">
  <XDSCard className="max-w-md">
    <XDSVStack gap={4}>
      <XDSHeading level={2}>Dashboard</XDSHeading>
      <XDSButton label="Save" variant="primary" />
    </XDSVStack>
  </XDSCard>
</main>
```

### XDS Tailwind Bridge (recommended)

Import `@xds/core/tailwind-theme.css` to register XDS tokens as Tailwind theme variables. This maps all XDS design tokens to native Tailwind utilities, with no `var()` needed:

```tsx
// Before (verbose arbitrary values):
<div className="rounded-[var(--radius-container)] bg-[var(--color-background-surface)] p-[var(--spacing-4)]">
  <p className="text-[var(--color-text-primary)]">Styled with XDS tokens</p>
</div>

// After (with tailwind-theme.css):
<div className="rounded-lg bg-surface p-4">
  <p className="text-primary">Styled with XDS tokens</p>
</div>
```

The bridge uses Tailwind v4's `@theme inline`: it tells Tailwind to generate utilities from XDS's existing CSS custom properties without emitting duplicate declarations. Theme switching just works.

Available utilities include `text-primary`, `text-secondary`, `bg-surface`, `bg-card`, `border-strong`, `text-error`, `bg-success`, `bg-blue-subtle`, `text-blue-vivid`, `border-blue-ring`, and 80+ more.

### XDS tokens via arbitrary values (escape hatch)

If you need a token the bridge doesn't cover, you can still use Tailwind's bracket syntax:

```tsx
<div className="bg-[var(--color-background-surface)]">
  <p className="text-[var(--color-text-primary)]">Escape hatch</p>
</div>
```

### Tailwind overrides on XDS components

All XDS components accept `className`. Tailwind utilities in the `utilities` layer override XDS component styles in `xds-base`:

```tsx
<XDSButton label="Custom" variant="primary" className="rounded-full shadow-xl" />
<XDSText type="body" className="text-blue-600 italic">Custom styled text</XDSText>
```

### Mixing XDS and Tailwind components

Shadcn-style Tailwind components render correctly alongside XDS. Both resets are nearly identical (shared modern-normalize lineage), so there are no conflicts:

```tsx
<div className="grid grid-cols-2 gap-6">
  <XDSCard>...</XDSCard>
  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    ...
  </div>
</div>
```

## Reset compatibility

XDS reset and Tailwind Preflight overlap ~80%. The meaningful differences:

- **Font smoothing**: XDS enables `-webkit-font-smoothing: antialiased`; Tailwind doesn't
- **Color scheme**: XDS maps `data-theme` to `color-scheme` for light/dark mode
- **Placeholder color**: XDS uses `var(--color-text-secondary)` token; Tailwind uses `color-mix()`

Both resets can run together without conflicts. Neither breaks the other's components.

## Running

```bash
pnpm install
pnpm dev  # or: cd apps/example-nextjs-tailwind && npx next dev
```
