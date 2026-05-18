// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {XDSText} from '@xds/core/Text';
import {XDSTable} from '@xds/core/Table';

/**
 * Generic table renderer for ContentBlock type='table'.
 * Renders headers + rows as a simple data table.
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
    renderCell: (item: Record<string, unknown>) => (
      <XDSText>{item[h] as string}</XDSText>
    ),
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
