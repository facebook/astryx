# XDSList

Vertical list component for rendering collections of items with consistent spacing, dividers, and marker styles. Uses a composition model: `XDSList` wraps `XDSListItem` sub-components.

## Import

```tsx
import {XDSList, XDSListItem} from '@xds/core/List';
```

## Files

<!-- SYNC: Update when files are added/removed -->

| File                 | Purpose                              |
| -------------------- | ------------------------------------ |
| `XDSList.tsx`        | List container component             |
| `XDSListItem.tsx`    | List item component                  |
| `XDSListContext.tsx` | Internal context for density sharing |
| `XDSList.test.tsx`   | Unit tests                           |
| `index.ts`           | Public exports                       |
| `README.md`          | This documentation                   |

## Usage

```tsx
import {XDSList, XDSListItem} from '@xds/core';

// Basic list
<XDSList>
  <XDSListItem label="Notifications" description="Manage your alerts" />
  <XDSListItem label="Privacy" description="Control your data" />
</XDSList>

// With dividers and header
<XDSList hasDividers header={<strong>Team Members</strong>}>
  <XDSListItem
    label="Alice Johnson"
    description="Engineering"
    startContent={<XDSIcon icon={UserIcon} />}
  />
  <XDSListItem
    label="Bob Smith"
    description="Design"
    startContent={<XDSIcon icon={UserIcon} />}
  />
</XDSList>

// Interactive items
<XDSList>
  <XDSListItem label="Settings" onClick={() => navigate('/settings')} />
  <XDSListItem label="Docs" href="/docs" target="_blank" />
</XDSList>

// Ordered list
<XDSList listStyle="decimal">
  <XDSListItem label="First step" />
  <XDSListItem label="Second step" />
</XDSList>
```

### XDSList

List container with density, dividers, and header support.

```tsx
<XDSList hasDividers header={<strong>Team Members</strong>}>
  <XDSListItem label="Alice" description="Engineering" />
  <XDSListItem label="Bob" description="Design" />
</XDSList>
```

| Prop          | Type                                        | Default      | Description                                      |
| ------------- | ------------------------------------------- | ------------ | ------------------------------------------------ |
| `children`    | `ReactNode`                                 | —            | List items (XDSListItem components)              |
| `density`     | `'compact' \| 'balanced' \| 'spacious'`     | `'balanced'` | Spacing density for items                        |
| `hasDividers` | `boolean`                                   | `false`      | Show dividers between items                      |
| `header`      | `ReactNode`                                 | —            | Header content, associated via `aria-labelledby` |
| `listStyle`   | `'none' \| 'disc' \| 'decimal' \| 'circle'` | `'none'`     | List marker style. `'decimal'` renders `<ol>`    |
| `xstyle`      | `StyleXStyles`                              | —            | Style overrides                                  |
| `data-testid` | `string`                                    | —            | Test ID                                          |

### XDSListItem

List item with label, description, start/end content slots, and interactive patterns.

```tsx
<XDSListItem
  label="Settings"
  description="Manage your preferences"
  startContent={<XDSIcon icon={CogIcon} />}
  onClick={() => navigate('/settings')}
/>
```

| Prop           | Type                      | Default | Description                                      |
| -------------- | ------------------------- | ------- | ------------------------------------------------ |
| `label`        | `string`                  | —       | Primary text (required)                          |
| `description`  | `string`                  | —       | Secondary text below label                       |
| `startContent` | `ReactNode`               | —       | Content before label area (icon, avatar)         |
| `endContent`   | `ReactNode`               | —       | Content after label area (badge, chevron)        |
| `onClick`      | `(e: MouseEvent) => void` | —       | Click handler (enables invisible button pattern) |
| `href`         | `string`                  | —       | Link URL (enables invisible anchor pattern)      |
| `target`       | `string`                  | —       | Link target (only with `href`)                   |
| `isDisabled`   | `boolean`                 | `false` | Disabled state                                   |
| `isSelected`   | `boolean`                 | `false` | Selected state (`aria-selected`)                 |
| `xstyle`       | `StyleXStyles`            | —       | Style overrides                                  |
| `data-testid`  | `string`                  | —       | Test ID                                          |

## Interactive Pattern

When `onClick` is provided, XDSListItem uses the **invisible button pattern**:

```
┌─ li (container, :focus-within outline, click area) ──────────┐
│  [startContent]  [button.invisible(label + desc)]  [endContent]  │
└──────────────────────────────────────────────────────────────────┘
```

- The `<li>` is the visual container with hover/press styles
- An invisible `<button>` wraps the label + description for accessibility
- `startContent` and `endContent` are siblings to the button (not inside it)
- Container click fires `onClick` unless the click originated from an interactive child
- `:focus-within` on the container shows the focus outline

When `href` is provided, the same pattern uses an invisible `<a>` instead.

## Accessibility

- Semantic `<ul>` / `<ol>` with `<li>` elements
- `role="list"` added when `listStyle='none'` (Safari fix)
- `aria-labelledby` links header to list
- `aria-selected` on selected items
- `aria-disabled` on disabled items
- Dividers are `aria-hidden="true"`
- Interactive items are keyboard-focusable via Tab
