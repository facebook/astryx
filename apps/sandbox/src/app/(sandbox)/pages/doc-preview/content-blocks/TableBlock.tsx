'use client';

import {XDSTable} from '@xds/core/Table';

/**
 * Generic table renderer for ContentBlock type='table'.
 * Renders headers + rows as a simple data table with no token awareness.
 */
export function TableBlock({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  const data = rows.map((row, i) => {
    const obj: Record<string, unknown> = {_idx: i};
    headers.forEach((h, j) => {
      obj[h] = row[j] ?? '';
    });
    return obj;
  });

  const columns = headers.map(h => ({
    key: h,
    header: h,
  }));

  return (
    <XDSTable
      data={data}
      columns={columns}
      density="spacious"
      dividers="rows"
      hasHover
    />
  );
}
