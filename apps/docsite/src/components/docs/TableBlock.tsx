// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {Text} from '@astryxdesign/core/Text';
import {Table, pixel, type TableColumn} from '@astryxdesign/core/Table';
import {Card} from '@astryxdesign/core/Card';
import {HStack} from '@astryxdesign/core/Layout';
import {Icon, getIconRegistry} from '@astryxdesign/core/Icon';
import type {IconName} from '@astryxdesign/core/Icon';
import {renderInlineMarkdown} from './inlineMarkdown';

const styles = stylex.create({
  tableCard: {maxWidth: 'var(--docs-table-max-width)'},
  iconNameCell: {minWidth: 0},
  iconNameText: {minWidth: 0},
});

const semanticIconNames = new Set<IconName>(
  Object.keys(getIconRegistry()) as IconName[],
);

function isIconName(value: string): value is IconName {
  return semanticIconNames.has(value as IconName);
}

function renderCellContent(value: string, header: string) {
  if (header === 'Name' && isIconName(value)) {
    return (
      <HStack gap={2} align="center" xstyle={styles.iconNameCell}>
        <Icon icon={value} size="sm" color="secondary" />
        <Text type="code" maxLines={1} xstyle={styles.iconNameText}>
          {value}
        </Text>
      </HStack>
    );
  }

  return <Text>{renderInlineMarkdown(value)}</Text>;
}

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

  const columns: TableColumn<Record<string, unknown>>[] = headers.map(h => ({
    key: h,
    header: h,
    width: h === 'Name' ? pixel(220) : undefined,
    renderCell: (item: Record<string, unknown>) =>
      renderCellContent((item[h] as string) ?? '', h),
  }));

  return (
    <Card xstyle={styles.tableCard}>
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
