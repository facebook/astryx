// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'FieldStatus',
  subComponentOf: 'Field',
  displayName: 'Field Status',
  isHiddenFromOverview: true,
  description: 'Status message component for form field validation feedback.',
  props: [
    {
      name: 'type',
      type: "'error' | 'warning' | 'success'",
      description: 'Status type.',
      required: true,
    },
    {
      name: 'message',
      type: 'string',
      description: 'Status message text.',
      required: true,
    },
    {
      name: 'id',
      type: 'string',
      description: 'ID for aria-describedby association.',
    },
    {
      name: 'variant',
      type: "'attached' | 'detached'",
      description: 'Visual variant — attached overlaps the input, detached floats below.',
      default: "'attached'",
    },
  ],
};

export const docsZh = {
  name: 'FieldStatus',
  isHiddenFromOverview: true,
  displayName: 'Field Status',
  description: '用于表单字段验证反馈的状态消息组件。',
  props: [
    {
      name: 'type',
      type: "'error' | 'warning' | 'success'",
      description: '状态类型。',
      required: true,
    },
    {
      name: 'message',
      type: 'string',
      description: '状态消息文本。',
      required: true,
    },
    {
      name: 'id',
      type: 'string',
      description: '用于 aria-describedby 关联的 ID。',
    },
    {
      name: 'variant',
      type: "'attached' | 'detached'",
      description: '视觉变体 - attached 覆盖在输入框上，detached 浮动在下方。',
      default: "'attached'",
    },
  ],
};

export const docsDense = {
  name: 'FieldStatus',
  isHiddenFromOverview: true,
  displayName: 'Field Status',
  description: 'Status message for form field validation feedback.',
  propDescriptions: {
    type: 'Status type.',
    message: 'Status message text.',
    id: 'ID for aria-describedby association.',
    variant: 'Visual variant; attached overlaps input, detached floats below.',
  },
};
