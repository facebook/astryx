# /packages/core/src/Card

Card container component with elevation and themed styling.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

XDSCard is a top-level container for elevated content. It provides card-specific appearance (background, shadow, border-radius) and sets CSS variables for child layout components.

Supports collapsible behavior via the `isCollapsible` prop. When set, the card's `title` becomes a click trigger and the `children` content collapses/expands. Works standalone or coordinated by XDSCollapsibleGroup.

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

// Card with title
<XDSCard title="Settings">
  <p>Card content here</p>
</XDSCard>

// Collapsible card
<XDSCard title="Details" isCollapsible>
  <p>This content can be collapsed</p>
</XDSCard>

// Starts collapsed
<XDSCard title="Advanced" isCollapsible={{ initialIsOpen: false }}>
  <p>Hidden by default</p>
</XDSCard>

// Inside a collapsible group
<XDSCollapsibleGroup type="single" defaultValue="general">
  <XDSCard title="General" value="general" isCollapsible>...</XDSCard>
  <XDSCard title="Advanced" value="advanced" isCollapsible>...</XDSCard>
</XDSCollapsibleGroup>
```

## Props

| Prop            | Type                           | Default | Description                                       |
| --------------- | ------------------------------ | ------- | ------------------------------------------------- |
| `title`         | `ReactNode`                    | —       | Title displayed in card header                    |
| `width`         | `SizeValue`                    | —       | Width (number = pixels, string = as-is)           |
| `height`        | `SizeValue`                    | —       | Height (number = pixels, string = as-is)          |
| `maxWidth`      | `SizeValue`                    | —       | Maximum width                                     |
| `minHeight`     | `SizeValue`                    | —       | Minimum height                                    |
| `children`      | `ReactNode`                    | —       | Content (collapses when isCollapsible is set)     |
| `isFullBleed`   | `boolean`                      | `false` | Removes internal padding for edge-to-edge content |
| `isCollapsible` | `boolean \| CollapsibleConfig` | —       | Makes the card collapsible (requires title)       |
| `value`         | `string`                       | —       | Identifier for collapsible group coordination     |

## Types

```tsx
type SizeValue = number | string;

type CollapsibleConfig = {
  initialIsOpen?: boolean; // default true
  isOpen?: boolean; // controlled
  onOpenChange?: (isOpen: boolean) => void;
};
```

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
