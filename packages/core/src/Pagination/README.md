# XDSPagination

Page navigation for paginated content. Controlled component with ellipsis truncation, arrow navigation, and two sizes.

## Usage

```tsx
import {XDSPagination} from '@xds/core/Pagination';

function PaginatedList() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <>
      <ItemList items={items.slice((page - 1) * pageSize, page * pageSize)} />
      <XDSPagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </>
  );
}
```

## Props

| Prop                 | Type                              | Default        | Description                                  |
| -------------------- | --------------------------------- | -------------- | -------------------------------------------- |
| `currentPage`        | `number`                          | —              | Current active page (1-indexed). Required.   |
| `totalPages`         | `number`                          | —              | Total number of pages. Required.             |
| `onPageChange`       | `(page: number) => void`          | —              | Callback when page changes. Required.        |
| `onPageChangeAction` | `(page: number) => Promise<void>` | —              | Async page change (React 19 transitions).    |
| `size`               | `'sm' \| 'md'`                    | `'md'`         | Size of pagination controls.                 |
| `maxVisiblePages`    | `number`                          | `7`            | Max page buttons before ellipsis truncation. |
| `hasArrows`          | `boolean`                         | `true`         | Show previous/next arrow buttons.            |
| `isDisabled`         | `boolean`                         | `false`        | Disable all pagination controls.             |
| `label`              | `string`                          | `'Pagination'` | Accessible label for the nav landmark.       |
| `xstyle`             | `StyleXStyles`                    | —              | StyleX overrides for the container.          |
| `data-testid`        | `string`                          | —              | Test ID for the container.                   |

## Sizes

- **`md`** — Standard (32px height). For standalone pagination.
- **`sm`** — Compact (28px height). For tables and dense UIs.

## Ellipsis Truncation

When `totalPages > maxVisiblePages`, the component truncates with ellipsis:

```
Page 1 of 20:    < 1 2 3 4 5 ... 20 >
Page 10 of 20:   < 1 ... 9 10 11 ... 20 >
Page 20 of 20:   < 1 ... 16 17 18 19 20 >
```

Always shows first page, last page, and pages around current.

## Accessibility

- Container is `<nav aria-label={label}>` landmark
- Page buttons have `aria-label="Page {n}"`
- Current page has `aria-current="page"`
- Previous/next buttons have descriptive `aria-label`
- Previous disabled on first page, next disabled on last page
- Ellipsis elements have `aria-hidden="true"`
- Full keyboard navigation via Tab and Enter/Space

## Design Decisions

- **1-indexed pages.** Matches user mental model. Page 1 is the first page.
- **`currentPage` + `totalPages`, not `offset`/`limit`.** Higher-level abstraction — offset/limit is a data concern, not UI.
- **No page size selector.** Page size is a separate concern (use XDSSelector). Keeps XDSPagination focused.
- **No "Showing X-Y of Z" text.** That is layout/text above the pagination, not part of the component.
- **Returns null for single page.** No point rendering pagination controls when there's only one page.
