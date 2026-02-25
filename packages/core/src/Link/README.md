# Link

XDSLink component for styled anchor links with multiple variants and features.

<!-- SYNC: When files in this directory change, update this document. -->

## Features

- **Variants**: `default`, `subtle`, `inherit`
- **External links**: Opens in new tab with external link icon
- **Tooltip support**: Display tooltip text on hover
- **Underline control**: Always show underline or only on hover
- **Inline support**: Inherits parent font styles when used within text
- **Standalone mode**: Applies base font sizing for independent links
- **Disabled state**: Visual and interaction disabled
- **Focus visible**: Accessible focus outline

## Usage

```tsx
import { XDSLink } from '@xds/core/Link';

// Basic link
<XDSLink label="Documentation" href="/docs">Documentation</XDSLink>

// External link (opens in new tab with icon)
<XDSLink label="GitHub" href="https://github.com" isExternalLink>GitHub</XDSLink>

// Link with tooltip
<XDSLink label="Settings" href="/settings" tooltip="Configure your preferences">
  Settings
</XDSLink>

// Always underlined link
<XDSLink label="Privacy Policy" href="/privacy" hasUnderline>Privacy Policy</XDSLink>

// Inline within text (inherits parent font styles)
<XDSText>Read the <XDSLink label="docs" href="/docs">documentation</XDSLink> for more info.</XDSText>

// Standalone link
<XDSLink label="Settings" href="/settings" isStandalone>Settings</XDSLink>

// Subtle variant
<XDSLink label="Privacy" href="/privacy" variant="subtle">Privacy Policy</XDSLink>

// Disabled link
<XDSLink label="Disabled" href="/disabled" isDisabled>Disabled Link</XDSLink>
```

## Props

| Prop             | Type                                 | Default     | Description                         |
| ---------------- | ------------------------------------ | ----------- | ----------------------------------- |
| `label`          | `string`                             | —           | Accessible label (required)         |
| `href`           | `string`                             | —           | Link destination URL                |
| `variant`        | `'default' \| 'subtle' \| 'inherit'` | `'default'` | Visual style variant                |
| `hasUnderline`   | `boolean`                            | `false`     | Always show underline               |
| `isDisabled`     | `boolean`                            | `false`     | Disables the link                   |
| `isExternalLink` | `boolean`                            | `false`     | Opens in new tab with external icon |
| `target`         | `string`                             | —           | Where to open linked document       |
| `onClick`        | `MouseEventHandler`                  | —           | Click event handler                 |
| `tooltip`        | `string`                             | —           | Tooltip text displayed on hover     |
| `isStandalone`   | `boolean`                            | `false`     | Applies base font sizing            |
| `children`       | `ReactNode`                          | —           | Link content (required)             |

## Theming

Themes can override `Link` styles via `ComponentStyles`:

```tsx
// In your theme definition
const theme: Theme = {
  // ...tokens...
  components: {
    link: {
      root: myStyles,
    },
  },
};
```

### Available surfaces

| Surface | Description                |
| ------- | -------------------------- |
| `root`  | Root anchor element styles |

## Files

| File               | Role  | Purpose                             |
| ------------------ | ----- | ----------------------------------- |
| `index.ts`         | Entry | Exports XDSLink component and types |
| `XDSLink.tsx`      | Core  | XDSLink component implementation    |
| `XDSLink.test.tsx` | Test  | Unit tests for XDSLink component    |

## Implementation Notes

- `XDSLinkVariant` type is derived from the `variants` StyleX object using `keyof typeof variants`
- By default, links inherit font family, size, line-height, and weight from parent elements
- Use `isStandalone` prop when the link is not inline within other text content
- `isExternalLink` automatically sets `target="_blank"` and `rel="noopener noreferrer"` for security
- Disabled state uses `aria-disabled` and `pointer-events: none` for accessibility
- Tooltip wraps the link in `XDSTooltip` component when provided
