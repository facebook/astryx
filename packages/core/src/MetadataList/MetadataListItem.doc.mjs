// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'MetadataListItem',
  subComponentOf: 'MetadataList',
  displayName: 'Metadata List Item',
  isHiddenFromOverview: true,
  description: 'A single labeled metadata value within an XDSMetadataList.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content value for this metadata item.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Label text for this metadata item.',
      required: true,
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Icon rendered before the label text.',
      slotElements: [
        {
          __element: 'XDSIcon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
  ],
};

export const docsZh = {
  name: 'MetadataListItem',
  isHiddenFromOverview: true,
  displayName: 'Metadata List Item',
  description: 'XDSMetadataList 中的单个带标签元数据值。',
  propDescriptions: {
    children: '此元数据项的内容值。',
    label: '此元数据项的标签文本。',
    icon: '标签文本前渲染的图标。',
  },
};

export const docsDense = {
  name: 'MetadataListItem',
  isHiddenFromOverview: true,
  displayName: 'Metadata List Item',
  description: 'single labeled value in XDSMetadataList',
  propDescriptions: {
    children: 'value content',
    label: 'label text',
    icon: 'icon before label',
  },
};
