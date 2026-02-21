# /packages/core/src/Accordion

Coordination context for collapsible components. Renders no wrapper DOM.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

XDSAccordion coordinates multiple collapsible components (XDSCard, XDSSection, etc.) via React context. It renders only `{children}` — no wrapper DOM element. Any component that supports `isCollapsible` and `value` props can participate.

In "single" mode (default), only one item can be open at a time. In "multiple" mode, any number of items can be open simultaneously.

## Import

```tsx
import {XDSAccordion} from '@xds/core/Accordion';
```

## Usage

```tsx
// Single mode — only one open at a time
<XDSAccordion type="single" defaultValue="general">
  <XDSCard title="General Settings" value="general" isCollapsible>
    <GeneralContent />
  </XDSCard>
  <XDSCard title="Advanced Settings" value="advanced" isCollapsible>
    <AdvancedContent />
  </XDSCard>
</XDSAccordion>

// Multiple mode — any number open
<XDSAccordion type="multiple" defaultValue={["s1", "s2"]}>
  <XDSCard title="Section 1" value="s1" isCollapsible>...</XDSCard>
  <XDSCard title="Section 2" value="s2" isCollapsible>...</XDSCard>
</XDSAccordion>

// Controlled
const [open, setOpen] = useState("section1");
<XDSAccordion type="single" value={open} onValueChange={setOpen}>
  ...
</XDSAccordion>
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

1. `XDSAccordion` provides `AccordionContext` with `isOpen(value)` and `toggle(value)` methods
2. Each collapsible component (e.g. XDSCard) checks for this context
3. If context exists and the component has a `value` prop, it defers to the accordion
4. If no context, the component manages its own collapse state

## Files

| File                      | Role      | Purpose                     |
| ------------------------- | --------- | --------------------------- |
| `index.ts`                | Entry     | Exports component and types |
| `XDSAccordion.tsx`        | Component | Accordion context provider  |
| `XDSAccordionContext.tsx` | Context   | React context definition    |
| `XDSAccordion.test.tsx`   | Tests     | Unit tests                  |
| `README.md`               | Docs      | This documentation          |
