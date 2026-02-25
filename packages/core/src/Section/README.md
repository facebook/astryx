# Section

Section container component with background variants.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

XDSSection is a container with background variants for creating visually distinct regions. Sections automatically escape parent container padding for edge-to-edge fills.

## Import

```tsx
import {XDSSection} from '@xds/core/Section';
```

## Usage

```tsx
<XDSSection variant="wash" width={300} height={250}>
  <XDSLayout
    content={<XDSLayoutContent>Content in wash section</XDSLayoutContent>}
  />
</XDSSection>
```

## Props

| Prop          | Type                                     | Default     | Description                                       |
| ------------- | ---------------------------------------- | ----------- | ------------------------------------------------- |
| `variant`     | `'section' \| 'transparent' \| 'wash'`   | `'section'` | Background variant                                |
| `width`       | `SizeValue`                              | —           | Width (number = pixels, string = as-is)           |
| `height`      | `SizeValue`                              | —           | Height (number = pixels, string = as-is)          |
| `maxWidth`    | `SizeValue`                              | —           | Maximum width                                     |
| `minHeight`   | `SizeValue`                              | —           | Minimum height                                    |
| `children`    | `ReactNode`                              | —           | Content                                           |
| `dividers`    | `Array<'top'\|'bottom'\|'start'\|'end'>` | —           | Which sides have divider borders                  |
| `isFullBleed` | `boolean`                                | `false`     | Removes internal padding for edge-to-edge content |

## Files

| File             | Role      | Purpose                          |
| ---------------- | --------- | -------------------------------- |
| `index.ts`       | Entry     | Exports component and types      |
| `XDSSection.tsx` | Component | Section container implementation |
| `README.md`      | Docs      | This documentation               |
