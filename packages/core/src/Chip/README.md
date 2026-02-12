# Chip

A chip component for displaying tags, filters, or selections. Optionally dismissible.

## Exports

| Export           | Type      | Description         |
| ---------------- | --------- | ------------------- |
| `XDSChip`        | Component | Main chip component |
| `XDSChipProps`   | Type      | Props interface     |
| `XDSChipVariant` | Type      | Variant union type  |

## Props

| Prop           | Type                                              | Default     | Description                              |
| -------------- | ------------------------------------------------- | ----------- | ---------------------------------------- |
| `variant`      | `'neutral' \| 'info' \| 'success' \| 'error'`     | `'neutral'` | Visual style variant                     |
| `children`     | `ReactNode`                                       | -           | Chip content (required)                  |
| `icon`         | `ReactNode`                                       | -           | Optional leading icon                    |
| `onDismiss`    | `() => void`                                      | -           | Callback on dismiss; shows dismiss button|
| `dismissLabel` | `string`                                          | `'Remove'`  | Accessible label for dismiss button      |

## Files

| File              | Purpose                  |
| ----------------- | ------------------------ |
| `XDSChip.tsx`     | Component implementation |
| `XDSChip.test.tsx`| Unit tests               |
| `index.ts`        | Barrel exports           |
