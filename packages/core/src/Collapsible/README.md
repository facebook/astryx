# Collapsible

Collapsible content primitive and group coordination.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

XDSCollapsible is a primitive that makes any content collapsible — a trigger toggles visibility of the content area. It handles state management, accessibility (aria-expanded, keyboard activation), and a chevron indicator.

XDSCollapsibleGroup coordinates multiple XDSCollapsible instances so only one (or multiple) can be open at a time. It renders no wrapper DOM.

## Import

```tsx
import {XDSCollapsible, XDSCollapsibleGroup} from '@xds/core/Collapsible';
```

## Usage

### Standalone collapsible

```tsx
// Inside a card
<XDSCard>
  <XDSCollapsible trigger="Details">
    <p>This content can be collapsed</p>
  </XDSCollapsible>
</XDSCard>

// Starts collapsed
<XDSCard>
  <XDSCollapsible trigger="Advanced" defaultIsOpen={false}>
    <p>Hidden by default</p>
  </XDSCollapsible>
</XDSCard>

// Controlled
<XDSCard>
  <XDSCollapsible trigger="Settings" isOpen={open} onOpenChange={setOpen}>
    <p>Controlled externally</p>
  </XDSCollapsible>
</XDSCard>

// Without a card — works anywhere
<XDSCollapsible trigger="Show more">
  <p>Expandable content</p>
</XDSCollapsible>
```

### Coordinated group (accordion pattern)

```tsx
// Single mode — only one open at a time (FAQ, settings panels)
<XDSCollapsibleGroup type="single" defaultValue="general">
  <XDSVStack gap="space2">
    <XDSCard>
      <XDSCollapsible trigger="General Settings" value="general">
        <GeneralContent />
      </XDSCollapsible>
    </XDSCard>
    <XDSCard>
      <XDSCollapsible trigger="Advanced Settings" value="advanced">
        <AdvancedContent />
      </XDSCollapsible>
    </XDSCard>
  </XDSVStack>
</XDSCollapsibleGroup>

// Multiple mode — any number open
<XDSCollapsibleGroup type="multiple" defaultValue={["s1", "s2"]}>
  <XDSVStack gap="space2">
    <XDSCard>
      <XDSCollapsible trigger="Section 1" value="s1">...</XDSCollapsible>
    </XDSCard>
    <XDSCard>
      <XDSCollapsible trigger="Section 2" value="s2">...</XDSCollapsible>
    </XDSCard>
  </XDSVStack>
</XDSCollapsibleGroup>
```

### With Layout (structured header)

```tsx
<XDSCard>
  <XDSCollapsible trigger="Report Details" value="report">
    <XDSLayout
      content={<XDSLayoutContent>Report body</XDSLayoutContent>}
      footer={<XDSLayoutFooter hasDivider>Actions</XDSLayoutFooter>}
    />
  </XDSCollapsible>
</XDSCard>
```

## Props

### XDSCollapsible

```tsx
<XDSCollapsible trigger="Details">
  <p>This content can be collapsed</p>
</XDSCollapsible>
```

| Prop            | Type                        | Default | Description                                        |
| --------------- | --------------------------- | ------- | -------------------------------------------------- |
| `trigger`       | `ReactNode`                 | —       | Content shown in the trigger area (always visible) |
| `children`      | `ReactNode`                 | —       | Content that collapses/expands                     |
| `defaultIsOpen` | `boolean`                   | `true`  | Default open state (uncontrolled)                  |
| `isOpen`        | `boolean`                   | —       | Controlled open state                              |
| `onOpenChange`  | `(isOpen: boolean) => void` | —       | Callback when open state changes                   |
| `value`         | `string`                    | —       | Identifier for group coordination                  |

### XDSCollapsibleGroup

```tsx
<XDSCollapsibleGroup type="single" defaultValue="general">
  <XDSCollapsible trigger="General" value="general">
    <p>General settings</p>
  </XDSCollapsible>
  <XDSCollapsible trigger="Advanced" value="advanced">
    <p>Advanced settings</p>
  </XDSCollapsible>
</XDSCollapsibleGroup>
```

| Prop            | Type                                  | Default    | Description                            |
| --------------- | ------------------------------------- | ---------- | -------------------------------------- |
| `type`          | `"single" \| "multiple"`              | `"single"` | Whether one or many items can be open  |
| `defaultValue`  | `string \| string[]`                  | —          | Default open item(s) — uncontrolled    |
| `value`         | `string \| string[]`                  | —          | Controlled open item(s)                |
| `onValueChange` | `(value: string \| string[]) => void` | —          | Callback when open items change        |
| `children`      | `ReactNode`                           | —          | XDSCollapsible instances to coordinate |

## How It Works

1. XDSCollapsible manages its own open/close state by default
2. When inside an XDSCollapsibleGroup with a `value` prop, it defers to the group
3. XDSCollapsibleGroup provides context with `isOpen(value)` and `toggle(value)` methods
4. The trigger renders as a button with `aria-expanded` and a chevron indicator

## Files

| File                             | Role      | Purpose                         |
| -------------------------------- | --------- | ------------------------------- |
| `index.ts`                       | Entry     | Exports components, hook, types |
| `XDSCollapsibleGroup.tsx`        | Component | Collapsible group provider      |
| `XDSCollapsibleGroupContext.tsx` | Context   | React context definition        |
| `useXDSCollapsible.ts`           | Hook      | Collapsible state management    |
| `XDSCollapsibleGroup.test.tsx`   | Tests     | Unit tests                      |
| `README.md`                      | Docs      | This documentation              |
