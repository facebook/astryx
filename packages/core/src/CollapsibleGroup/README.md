# /packages/core/src/CollapsibleGroup

Groups collapsible components with coordinated open/close behavior. Renders no wrapper DOM.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

XDSCollapsibleGroup coordinates multiple collapsible components (XDSCard, XDSSection, etc.) via React context. It renders only `{children}` — no wrapper DOM element. Any component that supports `isCollapsible` and `value` props can participate.

In "single" mode (default), only one item can be open at a time. In "multiple" mode, any number of items can be open simultaneously.

## Import

```tsx
import {XDSCollapsibleGroup} from '@xds/core/CollapsibleGroup';
```

## Usage

```tsx
// Single mode — only one open at a time
<XDSCollapsibleGroup type="single" defaultValue="general">
  <XDSVStack gap="space2">
    <XDSCard title="General Settings" value="general" isCollapsible>
      <GeneralContent />
    </XDSCard>
    <XDSCard title="Advanced Settings" value="advanced" isCollapsible>
      <AdvancedContent />
    </XDSCard>
  </XDSVStack>
</XDSCollapsibleGroup>

// Multiple mode — any number open
<XDSCollapsibleGroup type="multiple" defaultValue={["s1", "s2"]}>
  <XDSVStack gap="space2">
    <XDSCard title="Section 1" value="s1" isCollapsible>...</XDSCard>
    <XDSCard title="Section 2" value="s2" isCollapsible>...</XDSCard>
  </XDSVStack>
</XDSCollapsibleGroup>

// Controlled
const [open, setOpen] = useState("section1");
<XDSCollapsibleGroup type="single" value={open} onValueChange={setOpen}>
  <XDSVStack gap="space2">
    ...
  </XDSVStack>
</XDSCollapsibleGroup>
```

## Props

| Prop            | Type                                  | Default    | Description                           |
| --------------- | ------------------------------------- | ---------- | ------------------------------------- |
| `type`          | `"single" \| "multiple"`              | `"single"` | Whether one or many items can be open |
| `defaultValue`  | `string \| string[]`                  | —          | Default open item(s) — uncontrolled   |
| `value`         | `string \| string[]`                  | —          | Controlled open item(s)               |
| `onValueChange` | `(value: string \| string[]) => void` | —          | Callback when open items change       |
| `children`      | `ReactNode`                           | —          | Collapsible components to coordinate  |

## How It Works

1. `XDSCollapsibleGroup` provides `CollapsibleGroupContext` with `isOpen(value)` and `toggle(value)` methods
2. Each collapsible component (e.g. XDSCard) checks for this context
3. If context exists and the component has a `value` prop, it defers to the group
4. If no context, the component manages its own collapse state

## Files

| File                             | Role      | Purpose                     |
| -------------------------------- | --------- | --------------------------- |
| `index.ts`                       | Entry     | Exports component and types |
| `XDSCollapsibleGroup.tsx`        | Component | Collapsible group provider  |
| `XDSCollapsibleGroupContext.tsx` | Context   | React context definition    |
| `XDSCollapsibleGroup.test.tsx`   | Tests     | Unit tests                  |
| `README.md`                      | Docs      | This documentation          |
