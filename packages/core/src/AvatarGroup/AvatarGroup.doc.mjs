// Copyright (c) Meta Platforms, Inc. and affiliates.
/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'AvatarGroup',
  group: 'Avatar',
  keywords: ['avatar', 'group', 'facepile', 'stack', 'overlap', 'participants', 'assignees', 'members', 'team'],
  usage: {
    description:
      'AvatarGroup displays multiple avatars in an overlapping row with an optional overflow count. Use it when showing group membership, participants, or assignees in a compact space.',
    bestPractices: [
      {guidance: true, description: 'Set maxVisibleCount to limit visible avatars when the list is long — 3-5 is typical.'},
      {guidance: true, description: 'Use overflowCount when the server knows more participants than you pass locally.'},
      {guidance: true, description: 'Provide an onClickOverflow handler to let users see the full participant list.'},
      {guidance: false, description: 'Pass more avatars than needed when the server total is known — use maxVisibleCount and overflowCount instead.'},
    ],
    anatomy: [
      {name: 'Avatar row', required: true, description: 'Horizontally overlapping avatars with border rings for visual separation.'},
      {name: 'Overflow indicator', required: false, description: 'A "+N" circle at the end showing how many additional participants are hidden.'},
    ],
  },
  theming: {
    targets: [
      {className: 'xds-avatar-group', visualProps: ['size']},
    ],
  },
  props: [
    {
      name: 'avatars',
      type: 'XDSAvatarGroupItem[]',
      description: 'Array of avatar data objects ({src, fallbackSrc, name, alt, key}) to display.',
      required: true,
    },
    {
      name: 'maxVisibleCount',
      type: 'number',
      description: 'Maximum avatars to show before the overflow indicator appears.',
    },
    {
      name: 'overflowCount',
      type: 'number',
      description: 'Additional count added to the overflow indicator beyond hidden avatars.',
    },
    {
      name: 'size',
      type: 'XDSAvatarSize',
      description: 'Size applied to all avatars for visual consistency.',
      default: "'small'",
    },
    {
      name: 'onClickOverflow',
      type: '() => void',
      description: 'Callback when the overflow indicator is clicked. Makes the indicator a focusable button.',
    },
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'AvatarGroup',
  group: 'Avatar',
  usage: {
    description:
      'AvatarGroup 以重叠排列方式显示多个头像，并可选择显示溢出计数。用于在紧凑空间中展示群组成员、参与者或被分配人。',
    bestPractices: [
      {guidance: true, description: '当列表较长时设置 max 来限制可见头像数量 — 通常 3-5 个为佳。'},
      {guidance: true, description: '当服务器知道的参与者数量多于本地传入时使用 overflowCount。'},
      {guidance: true, description: '提供 onClickOverflow 处理器让用户查看完整参与者列表。'},
      {guidance: false, description: '当已知服务器总数时传入过多头像 — 改用 max 和 overflowCount。'},
    ],
  },
  props: [
    {name: 'avatars', type: 'XDSAvatarGroupItem[]', description: '要显示的头像数据对象数组。', required: true},
    {name: 'maxVisibleCount', type: 'number', description: '溢出指示器出现前显示的最大头像数。'},
    {name: 'overflowCount', type: 'number', description: '溢出指示器中除隐藏头像外的额外计数。'},
    {name: 'size', type: 'XDSAvatarSize', description: '应用于所有头像的大小，确保视觉一致性。', default: "'small'"},
    {name: 'onClickOverflow', type: '() => void', description: '点击溢出指示器时的回调。使指示器成为可聚焦按钮。'},
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'overlapping avatar row w/ +N overflow indicator for groups/participants',
  usage: {
    description:
      'Stacked avatar display showing multiple avatars overlapping with an overflow count indicator. Used for showing group membership, participants, or assignees in a compact space.',
    bestPractices: [
      {guidance: true, description: 'Set maxVisibleCount to limit visible avatars (3-5 typical).'},
      {guidance: true, description: 'Use overflowCount for server-side total beyond rendered avatars.'},
      {guidance: true, description: 'Add onClickOverflow to show full participant list.'},
      {guidance: false, description: 'Pass excess avatars when server total is known — use maxVisibleCount + overflowCount.'},
    ],
  },
  propDescriptions: {
    avatars: 'array of avatar data ({src, name, key, ...})',
    maxVisibleCount: 'max avatars before overflow indicator',
    overflowCount: 'additional count beyond hidden avatars',
    size: 'size for all avatars',
    onClickOverflow: 'overflow click callback, makes indicator a button',
  },
};
