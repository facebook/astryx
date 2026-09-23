// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTableStickyHeader',
  subComponentOf: 'Table',
  displayName: 'useTableStickyHeader',
  description:
    "Hook that returns a TablePlugin which pins the header row to the top of the table's scroll container, so column headings stay readable while the body scrolls. The header pins to a scrollport the table owns, so pass maxHeight unless an ancestor already bounds the table's height. Composes with useTableStickyColumns: install both to pin a column and the header at once, and the corner where they cross stays above both. Also composes with useTableGroupedRows' hasStickyGroupHeaders: this plugin measures its header and publishes the height as --table-sticky-header-height on the scroll container, which is what lets a pinned group heading come to rest below the header rather than on top of it.",
  props: [
    {
      name: 'maxHeight',
      type: 'number | string',
      description:
        "Height cap for the table's scroll container, as pixels (480) or any CSS length ('60vh'). Without a cap the container grows to fit its rows and never scrolls, leaving the page to scroll instead, and a header cannot pin to a scrollport it is not inside. Omit only when an ancestor already bounds the height.",
    },
  ],
};

export const docsZh = {
  name: 'useTableStickyHeader',
  displayName: 'useTableStickyHeader',
  description:
    '返回 TablePlugin 的 Hook，将表头行固定到表格滚动容器的顶部，使列标题在正文滚动时保持可见。表头固定在表格自身拥有的滚动视口上，因此除非祖先元素已限制表格高度，否则请传入 maxHeight。可与 useTableStickyColumns 组合使用：同时安装两者即可固定某一列和表头，二者交叉的角单元格会保持在最上层。也可与 useTableGroupedRows 的 hasStickyGroupHeaders 组合：本插件会测量表头高度并将其作为 --table-sticky-header-height 发布到滚动容器上，固定的分组标题据此停靠在表头下方，而不会覆盖表头。',
  props: [
    {
      name: 'maxHeight',
      type: 'number | string',
      description:
        "表格滚动容器的高度上限，可为像素值 (480) 或任意 CSS 长度 ('60vh')。若不设置上限，容器会撑满所有行而永不滚动，改由页面滚动，此时表头无法固定在它并不身处的滚动视口上。仅当祖先元素已限制高度时才可省略。",
    },
  ],
};

export const docsDense = {
  name: 'useTableStickyHeader',
  displayName: 'useTableStickyHeader',
  description:
    "Hook returning TablePlugin that pins the header row to the top of the table's scroll container. Needs a scrollport: pass maxHeight unless an ancestor bounds the height. Composes with useTableStickyColumns; the corner cell stays above both. Publishes its measured height as --table-sticky-header-height, which useTableGroupedRows' hasStickyGroupHeaders reads so a pinned heading rests below the header.",
  propDescriptions: {
    maxHeight:
      "Height cap for the table's scroll container, px number or CSS length. Omit only when an ancestor already bounds the height.",
  },
};
