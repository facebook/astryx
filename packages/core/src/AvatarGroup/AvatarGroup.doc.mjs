// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'AvatarGroup',
  displayName: 'Avatar Group',
  group: 'Avatar',
  category: 'Content',
  keywords: ['avatar', 'group', 'facepile', 'stack', 'overlap', 'participants', 'assignees', 'members', 'team'],
  usage: {
    description:
      'AvatarGroup displays multiple avatars in an overlapping row with an optional overflow indicator. Uses a compositional API: pass XDSAvatar children directly so each avatar can carry its own props (status dots, click handlers, etc.).',
    bestPractices: [
      {guidance: true, description: 'Set max to limit visible avatars when the list is long; 3-5 is typical.'},
      {guidance: true, description: 'Use XDSAvatarGroupOverflow for custom overflow content like a popover trigger or "add member" button.'},
      {guidance: true, description: 'Pass status dots, click handlers, or tooltips directly on each XDSAvatar child.'},
      {guidance: false, description: "Don't nest AvatarGroups; use a single group with all avatars."},
    ],
    anatomy: [
      {name: 'Avatar children', required: true, description: 'XDSAvatar elements that form the overlapping row. Each can have its own props.'},
      {name: 'Overflow indicator', required: false, description: 'A "+N" circle at the end showing hidden count, or a custom XDSAvatarGroupOverflow slot.'},
    ],
  },
  theming: {
    targets: [
      {className: 'xds-avatar-group', visualProps: ['size']},
    ],
  },
  description: 'Stacked avatar display with overlapping layout and optional overflow indicator. Children are XDSAvatar elements.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'XDSAvatar children, optionally followed by one XDSAvatarGroupOverflow. Consumers handle slicing to the desired visible count.',
      required: true,
      slotElements: [
        {
          __element: 'XDSAvatar',
          props: {
            name: 'User',
          },
        },
      ],
    },
    {
      name: 'size',
      type: 'XDSAvatarSize',
      description: 'Size applied to all avatars via context.',
      default: "'small'",
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: 'Ref forwarded to the root element.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: 'Test selector for automated testing frameworks.',
    },
  ],
  components: [
    {name: 'XDSAvatarGroupOverflow'},
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'AvatarGroup 以重叠排列方式显示多个头像，并可选择显示溢出指示器。使用组合式 API：直接传入 XDSAvatar 子元素，每个头像可携带自己的属性。',
    bestPractices: [
      {guidance: true, description: '当列表较长时设置 max 来限制可见头像数量，通常 3-5 个为佳。'},
      {guidance: true, description: '使用 XDSAvatarGroupOverflow 自定义溢出内容，如弹出触发器或"添加成员"按钮。'},
      {guidance: true, description: '直接在每个 XDSAvatar 子元素上传递状态点、点击处理器或工具提示。'},
      {guidance: false, description: '不要嵌套 AvatarGroup，使用单个组包含所有头像。'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'compositional overlapping avatar row w/ +N overflow or custom slot',
  usage: {
    description:
      'Stacked avatar display with overlapping layout. Compositional API: XDSAvatar children with per-avatar props (status dots, clicks). Optional XDSAvatarGroupOverflow slot for custom overflow.',
    bestPractices: [
      {guidance: true, description: 'Set max to limit visible avatars (3-5 typical).'},
      {guidance: true, description: 'Use XDSAvatarGroupOverflow for custom overflow (popover, add button).'},
      {guidance: true, description: 'Pass status dots / click handlers directly on each XDSAvatar.'},
      {guidance: false, description: "Don't nest AvatarGroups."},
    ],
  },
};
