// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'useTableStickyColumns',
  subComponentOf: 'Table',
  displayName: 'useTableStickyColumns',
  description:
    'Hook that returns a TablePlugin which pins a contiguous run of columns to the start and/or end edge of the table. Pinned columns get cumulative offsets and a soft, scroll-aware shadow over the scrolling content. An empty config ({}) is a valid no-op that pins nothing.',
  props: [
    {
      name: 'startKeys',
      type: 'string[]',
      description:
        'Column keys pinned to the start (inline-start / left in LTR) edge — the contiguous run from the first column through the last listed key.',
    },
    {
      name: 'endKeys',
      type: 'string[]',
      description:
        'Column keys pinned to the end (inline-end / right in LTR) edge — the contiguous run from the first listed key through the last column.',
    },
  ],
};

export const docsZh = {
  name: 'useTableStickyColumns',
  displayName: 'useTableStickyColumns',
  description:
    '返回 TablePlugin 的 Hook，将一组连续的列固定到表格的起始和/或结束边缘。固定的列具有累积偏移量，并在滚动内容上方显示柔和的、随滚动感知的阴影。空配置 ({}) 是有效的空操作，不固定任何列。',
  props: [
    {
      name: 'startKeys',
      type: 'string[]',
      description:
        '固定到起始（inline-start / LTR 中为左侧）边缘的列键——从第一列到最后列出的键的连续范围。',
    },
    {
      name: 'endKeys',
      type: 'string[]',
      description:
        '固定到结束（inline-end / LTR 中为右侧）边缘的列键——从第一个列出的键到最后一列的连续范围。',
    },
  ],
};

export const docsDense = {
  name: 'useTableStickyColumns',
  displayName: 'useTableStickyColumns',
  description:
    'Hook returning TablePlugin that pins contiguous column runs to start/end edges w/ cumulative offsets + scroll-aware shadow. Empty config = no-op.',
  propDescriptions: {
    startKeys:
      'Column keys pinned to the start edge (contiguous run from column 0 through the last listed key).',
    endKeys:
      'Column keys pinned to the end edge (contiguous run from the first listed key through the last column).',
  },
};
