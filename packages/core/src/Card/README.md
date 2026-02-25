# Card

Card container component with elevation and themed styling.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

XDSCard is a top-level container for elevated content. It provides card-specific appearance (background, shadow, border-radius) and sets CSS variables for child layout components.

## Import

```tsx
import {XDSCard} from '@xds/core/Card';
```

## Usage

```tsx
// Basic card with layout
<XDSCard width={400} height={300}>
  <XDSLayout
    header={<XDSLayoutHeader hasDivider>Title</XDSLayoutHeader>}
    content={<XDSLayoutContent>Content</XDSLayoutContent>}
    footer={<XDSLayoutFooter hasDivider>Actions</XDSLayoutFooter>}
  />
</XDSCard>

// Simple content
<XDSCard>
  <p>Card content with default padding</p>
</XDSCard>

// Collapsible card — compose XDSCollapsible inside
<XDSCard>
  <XDSCollapsible trigger="Details">
    <p>This content can be collapsed</p>
  </XDSCollapsible>
</XDSCard>

// Accordion of cards
<XDSCollapsibleGroup type="single" defaultValue="general">
  <XDSVStack gap="space2">
    <XDSCard>
      <XDSCollapsible trigger="General" value="general">
        <GeneralSettings />
      </XDSCollapsible>
    </XDSCard>
    <XDSCard>
      <XDSCollapsible trigger="Advanced" value="advanced">
        <AdvancedSettings />
      </XDSCollapsible>
    </XDSCard>
  </XDSVStack>
</XDSCollapsibleGroup>
```

## Props

| Prop          | Type        | Default | Description                                       |
| ------------- | ----------- | ------- | ------------------------------------------------- |
| `width`       | `SizeValue` | —       | Width (number = pixels, string = as-is)           |
| `height`      | `SizeValue` | —       | Height (number = pixels, string = as-is)          |
| `maxWidth`    | `SizeValue` | —       | Maximum width                                     |
| `minHeight`   | `SizeValue` | —       | Minimum height                                    |
| `children`    | `ReactNode` | —       | Content to render inside the card                 |
| `isFullBleed` | `boolean`   | `false` | Removes internal padding for edge-to-edge content |

## Theming

```tsx
declare module '@xds/core' {
  interface ComponentStyles {
    card?: {
      container?: StyleXStyles;
      content?: StyleXStyles;
    };
  }
}
```

## Files

| File          | Role      | Purpose                       |
| ------------- | --------- | ----------------------------- |
| `index.ts`    | Entry     | Exports component and types   |
| `XDSCard.tsx` | Component | Card container implementation |
| `README.md`   | Docs      | This documentation            |
