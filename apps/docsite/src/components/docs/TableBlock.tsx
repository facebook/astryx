// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Text} from '@astryxdesign/core/Text';
import {Table} from '@astryxdesign/core/Table';
import {Card} from '@astryxdesign/core/Card';
import {renderInlineCode} from './renderInlineCode';

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
      <Text>{renderInlineCode(item[h] as string)}</Text>
    ),
  }));

  return (
    <Card>
      <Table
        data={data}
        columns={columns}
        density="spacious"
        dividers="rows"
        hasHover
      />
    </Card>
  );
}
