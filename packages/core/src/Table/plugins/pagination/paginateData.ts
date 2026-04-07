/**
 * @file paginateData.ts
 * @input Data array, page number, page size
 * @output Sliced data array for the current page
 * @position Pagination utility; used alongside useXDSTablePagination for client-side pagination
 */

/**
 * Slice a data array for the current page.
 *
 * Pure utility for client-side pagination. For server-side pagination
 * where data is already sliced, pass it directly to XDSTable.
 *
 * @param data - Full data array
 * @param page - Current page number (1-based)
 * @param pageSize - Number of items per page
 * @returns Slice of data for the current page
 *
 * @example
 * ```
 * const [page, setPage] = useState(1);
 * const pageSize = 10;
 *
 * <XDSTable data={paginateData(data, page, pageSize)} ... />
 * ```
 */
export function paginateData<T>(
  data: T[],
  page: number,
  pageSize: number,
): T[] {
  const start = (page - 1) * pageSize;
  return data.slice(start, start + pageSize);
}
