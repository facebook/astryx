// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'AvatarGroupOverflow',
  subComponentOf: 'AvatarGroup',
  displayName: 'Avatar Group Overflow',
  isHiddenFromOverview: true,
  description: 'Slot for custom overflow content inside XDSAvatarGroup. Replaces the default "+N" indicator when present.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Custom overflow content (button, popover trigger, etc.).',
      required: true,
    },
  ],
};

export const docsZh = {
  name: 'AvatarGroupOverflow',
  isHiddenFromOverview: true,
  displayName: 'Avatar Group Overflow',
  description: 'XDSAvatarGroup 内的自定义溢出内容插槽。存在时替换默认的 "+N" 指示器。',
  propDescriptions: {
    children: '自定义溢出内容（按钮、弹出触发器等）。',
  },
};

export const docsDense = {
  name: 'AvatarGroupOverflow',
  isHiddenFromOverview: true,
  displayName: 'Avatar Group Overflow',
  description: 'custom overflow slot, replaces default +N',
  propDescriptions: {
    children: 'custom overflow content',
  },
};
