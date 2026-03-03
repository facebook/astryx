# Token

A chip/tag component for displaying entities inline. Renders as a `<span>` by default, `<button>` when `onClick` is provided, or `<a>` when `href` is provided.

## Import

```tsx
import {XDSToken} from '@xds/core/Token';
```

## Exports

| Export          | Type      | Description          |
| --------------- | --------- | -------------------- |
| `XDSToken`      | Component | Main token component |
| `XDSTokenProps` | Type      | Props interface      |
| `XDSTokenColor` | Type      | Color union type     |

## Props

| Prop            | Type                                                                                                                  | Default     | Description                                  |
| --------------- | --------------------------------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------- |
| `label`         | `string`                                                                                                              | —           | Text label (required)                        |
| `color`         | `'default' \| 'red' \| 'orange' \| 'yellow' \| 'green' \| 'teal' \| 'cyan' \| 'blue' \| 'purple' \| 'pink' \| 'gray'` | `'default'` | Color variant                                |
| `icon`          | `ReactNode`                                                                                                           | —           | Optional leading icon                        |
| `isDisabled`    | `boolean`                                                                                                             | `false`     | Whether the token is disabled                |
| `onRemove`      | `(e: MouseEvent \| KeyboardEvent) => void`                                                                            | —           | Remove handler; shows X button when provided |
| `onClick`       | `(e: MouseEvent) => void`                                                                                             | —           | Click handler; renders as `<button>`         |
| `href`          | `string`                                                                                                              | —           | Link URL; renders as `<a>`                   |
| `description`   | `string`                                                                                                              | —           | Accessible description                       |
| `endContent`    | `ReactNode`                                                                                                           | —           | Content after the label                      |
| `isLabelHidden` | `boolean`                                                                                                             | `false`     | Visually hide label (still accessible)       |
| `xstyle`        | `StyleXStyles`                                                                                                        | —           | Additional StyleX styles                     |
| `data-testid`   | `string`                                                                                                              | —           | Test ID for testing frameworks               |

## Usage

```tsx
import {XDSToken} from '@xds/core/Token';

// Basic
<XDSToken label="Tag" />

// Colored
<XDSToken label="Status" color="green" />

// Removable
<XDSToken label="Filter" onRemove={(e) => handleRemove(e)} />

// Clickable
<XDSToken label="Category" onClick={() => navigate('/category')} />

// As link
<XDSToken label="Profile" href="/user/123" />

// With icon
<XDSToken label="User" icon={<UserIcon />} />
```

## Files

| File                | Purpose                  |
| ------------------- | ------------------------ |
| `XDSToken.tsx`      | Component implementation |
| `XDSToken.test.tsx` | Unit tests               |
| `index.ts`          | Barrel exports           |
