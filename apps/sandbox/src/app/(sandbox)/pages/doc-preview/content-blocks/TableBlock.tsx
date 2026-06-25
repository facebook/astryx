// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Text} from '@astryxdesign/core/Text';
import {Table} from '@astryxdesign/core/Table';

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
      <Text>{item[h] as string}</Text>
    ),
  }));

  return (
    <Table
      data={data}
      columns={columns}
      density="spacious"
      dividers="rows"
      hasHover
    />
  );
}
