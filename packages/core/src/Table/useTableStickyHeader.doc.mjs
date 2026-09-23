// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'useTableStickyHeader',
  subComponentOf: 'Table',
  displayName: 'useTableStickyHeader',
  description:
    "Hook that returns a TablePlugin which pins the header row to the top of the table's scroll container, so column headings stay readable while the body scrolls. The header pins to a scrollport the table owns, so pass maxBlockSize unless an ancestor already bounds the table. The plugin hands the scroll container to Astryx's shared scroll behavior, which measures it: the header pins only while the container is really the thing scrolling, so a table that fits leaves a header pinned by an outer scrollport alone. Composes with useTableStickyColumns: install both to pin a column and the header at once, and the corner where they cross stays above both. Also composes with useTableGroupedRows' hasStickyGroupHeaders: this plugin measures its header and publishes the extent as --table-sticky-header-height on the scroll container, which is what lets a pinned group heading come to rest below the header rather than on top of it.",
  props: [
    {
      name: 'maxBlockSize',
      type: 'number | string',
      description:
        "Cap on the scroll container's size along the block axis — the axis the header pins on — as pixels (480) or any CSS length ('60vh'). Logical rather than a height, so it follows the axis the header travels on in a vertical writing mode too. Without a cap the container grows to fit its rows and never scrolls, leaving the page to scroll instead, and a header cannot pin to a scrollport it is not inside. Omit only when an ancestor already bounds the table.",
    },
    {
      name: 'hasPersistentContainment',
      type: 'boolean',
      default: 'false',
      description:
        'Keep the header pinned even while the table fits its container. By default a table with nothing to scroll is not a sticky boundary, so a header pinned by an ancestor scrollport keeps working; set this when the table should stay a boundary regardless.',
    },
  ],
};

export const docsZh = {
  name: 'useTableStickyHeader',
  displayName: 'useTableStickyHeader',
  description:
    '返回 TablePlugin 的 Hook，将表头行固定到表格滚动容器的顶部，使列标题在正文滚动时保持可见。表头固定在表格自身拥有的滚动视口上，因此除非祖先元素已限制表格尺寸，否则请传入 maxBlockSize。插件会把滚动容器交给 Astryx 的共享滚动行为进行测量：只有当该容器确实在滚动时表头才会固定，因此内容未溢出的表格不会抢走由外层滚动视口固定的表头。可与 useTableStickyColumns 组合使用：同时安装两者即可固定某一列和表头，二者交叉的角单元格会保持在最上层。也可与 useTableGroupedRows 的 hasStickyGroupHeaders 组合：本插件会测量表头并将其尺寸作为 --table-sticky-header-height 发布到滚动容器上，固定的分组标题据此停靠在表头下方，而不会覆盖表头。',
  props: [
    {
      name: 'maxBlockSize',
      type: 'number | string',
      description:
        "表格滚动容器在块轴（表头固定所在的轴）上的尺寸上限，可为像素值 (480) 或任意 CSS 长度 ('60vh')。使用逻辑属性而非 height，因此在纵向书写模式下同样跟随表头实际移动的轴。若不设置上限，容器会撑满所有行而永不滚动，改由页面滚动，此时表头无法固定在它并不身处的滚动视口上。仅当祖先元素已限制尺寸时才可省略。",
    },
    {
      name: 'hasPersistentContainment',
      type: 'boolean',
      default: 'false',
      description:
        '即使表格内容未溢出也保持表头固定。默认情况下无内容可滚动的表格不会成为 sticky 边界，因此由祖先滚动视口固定的表头仍然有效；若希望表格始终作为边界，请开启此项。',
    },
  ],
};

export const docsDense = {
  name: 'useTableStickyHeader',
  displayName: 'useTableStickyHeader',
  description:
    "Hook returning TablePlugin that pins the header row to the top of the table's scroll container. Needs a scrollport: pass maxBlockSize unless an ancestor bounds it. Pins only while the container measurably scrolls, so a fitting table leaves an outer scrollport's sticky header alone. Composes with useTableStickyColumns; the corner cell stays above both. Publishes its measured extent as --table-sticky-header-height, which useTableGroupedRows' hasStickyGroupHeaders reads so a pinned heading rests below the header.",
  propDescriptions: {
    maxBlockSize:
      "Cap on the scroll container's block-axis size, px number or CSS length. Omit only when an ancestor already bounds the table.",
    hasPersistentContainment:
      'Keep the header pinned while the table fits. Default false.',
  },
};
