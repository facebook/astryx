// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file paginateData.ts
 * @input Data array, page number, page size
 * @output Sliced data array for the current page
 * @position Pagination utility; used alongside useTablePagination for client-side pagination
 */

/**
 * Slice a data array for the current page.
 *
 * Pure utility for client-side pagination. For server-side pagination
 * where data is already sliced, pass it directly to Table.
 *
 * @param data - Full data array
 * @param page - Current page number (1-based)
 * @param pageSize - Number of items per page; coerced to a positive integer,
 *   non-finite values fall back to 10
 * @returns Slice of data for the current page
 *
 * @example
 * ```
 * const [page, setPage] = useState(1);
 * const pageSize = 10;
 *
 * <Table data={paginateData(data, page, pageSize)} ... />
 * ```
 */
export function paginateData<T>(
  data: T[],
  page: number,
  pageSize: number,
): T[] {
  // Same coercion as Pagination and useTablePagination: a 0/NaN/negative
  // pageSize would slice every page empty while the pagination chrome still
  // renders page buttons.
  const size = Number.isFinite(pageSize)
    ? Math.max(1, Math.floor(pageSize))
    : 10;
  const start = (page - 1) * size;
  return data.slice(start, start + size);
}
