# Pagination

Standalone pagination controls for navigating through pages of content.

## Files

| File                     | Purpose                       |
| ------------------------ | ----------------------------- |
| `XDSPagination.tsx`      | Main component implementation |
| `XDSPagination.test.tsx` | Unit tests                    |
| `index.ts`               | Public exports                |
| `README.md`              | This file                     |

## Exports

- `XDSPagination` — Main pagination component
- `generatePageRange` — Utility to compute visible page numbers with ellipsis
- `XDSPaginationProps` — Props type
- `XDSPaginationVariant` — Variant type (`'pages' | 'count' | 'compact' | 'dots' | 'none'`)
- `XDSPaginationSize` — Size type (`'sm' | 'md'`)

## Usage

```tsx
import {XDSPagination} from '@xds/core/Pagination';

// Page number buttons (default)
<XDSPagination
  page={page}
  onChange={setPage}
  totalItems={200}
  pageSize={20}
/>

// Count display with page size selector
<XDSPagination
  page={page}
  onChange={setPage}
  totalItems={200}
  variant="count"
  pageSizeOptions={[10, 20, 50]}
  onPageSizeChange={setPageSize}
/>

// Cursor-based (no total known)
<XDSPagination
  page={page}
  onChange={setPage}
  hasMore={data.hasNextPage}
/>

// Carousel dots
<XDSPagination
  page={slideIndex}
  onChange={setSlideIndex}
  totalPages={slides.length}
  variant="dots"
/>
```

## Props

| Prop               | Type                                      | Default        | Description                                  |
| ------------------ | ----------------------------------------- | -------------- | -------------------------------------------- |
| `page`             | `number`                                  | —              | Current page number (1-based, required)      |
| `onChange`         | `(page: number) => void`                  | —              | Called when page changes (required)          |
| `onChangeAction`   | `(page: number) => void \| Promise<void>` | —              | Async action on page change                  |
| `totalItems`       | `number`                                  | —              | Total item count (calculates pages)          |
| `totalPages`       | `number`                                  | —              | Total page count (alternative to totalItems) |
| `hasMore`          | `boolean`                                 | —              | Whether more pages exist (cursor-based)      |
| `pageSize`         | `number`                                  | `10`           | Items per page                               |
| `pageSizeOptions`  | `number[]`                                | —              | Shows page size selector when provided       |
| `onPageSizeChange` | `(pageSize: number) => void`              | —              | Called when page size changes                |
| `variant`          | `XDSPaginationVariant`                    | `'pages'`      | Visual variant                               |
| `siblingCount`     | `number`                                  | `1`            | Pages shown around current (pages variant)   |
| `size`             | `XDSPaginationSize`                       | `'md'`         | Size of controls                             |
| `isDisabled`       | `boolean`                                 | `false`        | Whether the component is disabled            |
| `label`            | `string`                                  | `'Pagination'` | Accessible label for nav landmark            |
| `data-testid`      | `string`                                  | —              | Test ID                                      |
| `xstyle`           | `StyleXStyles`                            | —              | StyleX overrides                             |

## Variants

- **pages** — Clickable page number buttons with ellipsis truncation
- **count** — "1–20 of 200" text display
- **compact** — "Page 1 of 10" text display
- **dots** — Dot indicators (best for ≤10 pages)
- **none** — Just prev/next buttons

## Accessibility

- Root is `<nav>` with `aria-label`
- Current page has `aria-current="page"`
- Prev/next buttons have descriptive `aria-label`
- Ellipsis elements are `aria-hidden`
- All interactive elements are keyboard accessible

## Implementation Notes

- Page number buttons use `XDSButton` (`variant="ghost"` for inactive, `variant="primary"` for active page) for theming and swizzle compatibility.
- Prev/next buttons use `XDSButton` with `variant="ghost"` and icon-only mode.
- Dot indicators remain custom elements (intentionally different visual treatment from buttons).

## Theme Integration

```typescript
// Override via ComponentStyles
theme.components.pagination = {
  root: {
    /* root nav styles */
  },
};
// Page buttons inherit theming from XDSButton's component styles
```
