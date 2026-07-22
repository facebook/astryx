// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'AvatarStatusDot',
  subComponentOf: 'Avatar',
  displayName: 'Avatar Status Dot',
  isHiddenFromOverview: true,
  description:
    'Size-aware status indicator dot that reads avatar size from context and scales proportionally. Each variant pairs a colour with a distinct built-in shape (filled, ring, minus) so status is never conveyed by colour alone (WCAG 1.4.1).',
  props: [
    {
      name: 'variant',
      type: "'success' | 'neutral' | 'error'",
      description:
        'Semantic variant pairing colour with a distinct shape: success = filled green dot, neutral = grey ring, error = red dot with a minus bar.',
      default: "'success'",
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label describing the status. Not announced inside an Avatar today (the Avatar root is role="img", which prunes child semantics) — pass it anyway; an Avatar-level name-composition fix is planned.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'Icon centered inside the dot (hidden at tiny sizes). A rendered icon replaces the built-in shape glyph, so use a different icon per status.',
      slotElements: [
        {
          __element: 'Icon',
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
  name: 'AvatarStatusDot',
  isHiddenFromOverview: true,
  displayName: 'Avatar Status Dot',
  description:
    '尺寸感知的状态指示点，从上下文中读取头像尺寸并等比缩放。每个变体将颜色与独特形状（实心、圆环、横杠）配对，确保状态不仅靠颜色传达（WCAG 1.4.1）。',
  props: [
    {
      name: 'variant',
      type: "'success' | 'neutral' | 'error'",
      description:
        '语义变体，颜色与形状配对：success = 绿色实心点，neutral = 灰色圆环，error = 带横杠的红色点。',
      default: "'success'",
    },
    {
      name: 'label',
      type: 'string',
      description:
        '描述状态的无障碍标签。目前在 Avatar 内不会被朗读（Avatar 根元素为 role="img"，会裁剪子元素语义）——仍请传入；Avatar 层面的名称合成修复已在计划中。',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        '居中显示在状态点内的图标（tiny 尺寸时隐藏）。渲染的图标会替换内置形状标记，请为每个状态使用不同的图标。',
    },
  ],
};

export const docsDense = {
  name: 'AvatarStatusDot',
  isHiddenFromOverview: true,
  displayName: 'Avatar Status Dot',
  description:
    'size-aware status dot, reads avatar size from context + scales proportionally; variants pair colour with shape (filled/ring/minus) per WCAG 1.4.1',
  propDescriptions: {
    variant:
      'colour + shape variant: success filled, neutral ring, error minus',
    label:
      'accessible status label (not yet announced inside Avatar — role="img" prunes children)',
    icon: 'icon centered in dot (hidden at tiny sizes); replaces the built-in shape glyph — differ it per status',
  },
};
