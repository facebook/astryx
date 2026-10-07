// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'CommandPaletteEmpty',
  subComponentOf: 'CommandPalette',
  displayName: 'Command Palette Empty',
  isHiddenFromOverview: true,
  description:
    'Empty state display for the results area. CommandPalette renders it for no-results and no-query states.',
  usage: {
    description:
      'CommandPalette renders CommandPaletteEmpty automatically. Pass message content through emptySearchText or emptyBootstrapText.',
    anatomy: [
      {
        name: 'Empty message',
        required: true,
        description:
          'Visible text or structured content explaining that no command result is available.',
      },
    ],
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Message or content to display.',
      required: true,
    },
  ],
  playground: {
    defaults: {
      children: 'No results found. Try a different search.',
    },
  },
  theming: {
    targets: [{className: 'astryx-command-palette-empty'}],
  },
};

export const docsZh = {
  name: 'CommandPaletteEmpty',
  isHiddenFromOverview: true,
  displayName: 'Command Palette Empty',
  description:
    '结果区域的空状态展示。由 CommandPalette 在无结果和无查询状态下自动渲染。',
  propDescriptions: {
    children: '要显示的消息或内容。',
  },
};

export const docsDense = {
  name: 'CommandPaletteEmpty',
  isHiddenFromOverview: true,
  displayName: 'Command Palette Empty',
  description:
    'empty state; auto-rendered by palette for no-results+no-query states',
  propDescriptions: {
    children: 'message or content to display',
  },
};
