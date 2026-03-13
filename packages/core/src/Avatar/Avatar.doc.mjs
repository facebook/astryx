/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Avatar',
  description:
    'Avatar component for displaying user profile pictures with fallback support.',
  features: [
    'Image loading: Primary and fallback image sources',
    'Initials fallback: Auto-generates initials from user name',
    'Default icon: Generic person icon when no image or name provided',
    'Sizes: tiny (20px), xsmall (24px), small (36px), medium (48px), large (128px), plus numeric pixel values',
    'Status slot: Corner position for status indicators or badges',
    'Size-aware status dot: Built-in XDSAvatarStatusDot that scales proportionally with avatar size',
    'Accessible: Proper role and aria-label support',
  ],
  examples: [
    {
      label: 'With image',
      code: '<XDSAvatar src="/user.jpg" name="John Doe" />',
    },
    {
      label: 'Initials fallback',
      code: '<XDSAvatar name="Jane Smith" size="large" />',
    },
    {
      label: 'With size-aware status indicator',
      code: `<XDSAvatar
  src="/user.jpg"
  name="John Doe"
  size="medium"
  status={<XDSAvatarStatusDot variant="positive" label="Online" />}
/>`,
    },
    {
      label: 'Status dot scales automatically across sizes',
      code: `<XDSAvatar name="AB" size="tiny" status={<XDSAvatarStatusDot />} />
<XDSAvatar name="CD" size="large" status={<XDSAvatarStatusDot />} />`,
    },
    {
      label: 'Different variants for different contexts',
      code: `<XDSAvatar name="EF" status={<XDSAvatarStatusDot variant="negative" label="Busy" />} />
<XDSAvatar name="GH" status={<XDSAvatarStatusDot variant="neutral" label="Away" />} />`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-avatar', visualProps: ['size']},
      {className: 'xds-avatar-status-dot', visualProps: ['variant']},
    ],
  },
  notes: [
    'Always circular shape (border-radius: 50%)',
    'Uses color.deemphasized and color.textSecondary for fallback background',
    'Initials extracted from first and last word of name',
    'XDSAvatarSizeContext provides the resolved numeric size to sub-components',
    'Status dot uses CIRCLE_EDGE_OFFSET_RATIO for positioning at the 45° point on the circle edge',
    'Fallback cascade: (1) src loads → show image; (2) src fails → try fallbackSrc; (3) fallbackSrc fails/missing → show initials from name; (4) no name → show generic person icon',
    'Status dot size tiers: avatar ≤ 36px → 8px dot with 1px border; avatar 40–72px → 16px dot with 2px border; avatar ≥ 96px → 24px dot with 4px border',
  ],
  components: [
    {
      name: 'XDSAvatar',
      description:
        'Displays a user avatar with image, initials fallback, and optional status indicator.',
      props: [
        {
          name: 'src',
          type: 'string',
          description: 'Primary image source URL.',
        },
        {
          name: 'fallbackSrc',
          type: 'string',
          description: 'Fallback image when primary fails.',
        },
        {
          name: 'name',
          type: 'string',
          description: 'User name for initials and alt text.',
        },
        {
          name: 'alt',
          type: 'string',
          description: 'Alt text (falls back to name).',
        },
        {
          name: 'size',
          type: 'XDSAvatarSize',
          description: 'Avatar size (named or numeric pixel value).',
          default: "'small'",
        },
        {
          name: 'status',
          type: 'ReactNode',
          description: 'Corner content for status indicators.',
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: '<XDSAvatar src="/user.jpg" name="John Doe" size="medium" />',
        },
        {
          label: 'With status dot',
          code: `<XDSAvatar
  src="/user.jpg"
  name="John Doe"
  size="medium"
  status={<XDSAvatarStatusDot variant="positive" label="Online" />}
/>`,
        },
      ],
    },
    {
      name: 'XDSAvatarStatusDot',
      description:
        'Size-aware status indicator dot that reads avatar size from context and scales proportionally.',
      props: [
        {
          name: 'variant',
          type: "'positive' | 'neutral' | 'negative'",
          description: 'Semantic color variant of the dot.',
          default: "'positive'",
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for screen readers.',
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description: 'Icon centered inside the dot (hidden at tiny sizes).',
        },
      ],
      examples: [
        {
          label: 'Online',
          code: '<XDSAvatarStatusDot variant="positive" label="Online" />',
        },
        {
          label: 'Busy',
          code: '<XDSAvatarStatusDot variant="negative" label="Busy" />',
        },
        {
          label: 'Away',
          code: '<XDSAvatarStatusDot variant="neutral" label="Away" />',
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Avatar',
  description:
    '头像组件，用于显示用户头像图片，支持降级回退。',
  features: [
    '图片加载：主图片源和备用图片源',
    '首字母回退：根据用户姓名自动生成首字母缩写',
    '默认图标：未提供图片或姓名时显示通用人物图标',
    '尺寸：tiny（20px）、xsmall（24px）、small（36px）、medium（48px）、large（128px），以及自定义数值像素',
    '状态插槽：角落位置用于状态指示器或徽章',
    '尺寸感知状态点：内置 XDSAvatarStatusDot，随头像尺寸等比缩放',
    '无障碍：支持正确的 role 和 aria-label',
  ],
  examples: [
    {
      label: '带图片',
      code: '<XDSAvatar src="/user.jpg" name="John Doe" />',
    },
    {
      label: '首字母回退',
      code: '<XDSAvatar name="Jane Smith" size="large" />',
    },
    {
      label: '带尺寸感知状态指示器',
      code: `<XDSAvatar
  src="/user.jpg"
  name="John Doe"
  size="medium"
  status={<XDSAvatarStatusDot variant="positive" label="Online" />}
/>`,
    },
    {
      label: '状态点随尺寸自动缩放',
      code: `<XDSAvatar name="AB" size="tiny" status={<XDSAvatarStatusDot />} />
<XDSAvatar name="CD" size="large" status={<XDSAvatarStatusDot />} />`,
    },
    {
      label: '不同变体用于不同场景',
      code: `<XDSAvatar name="EF" status={<XDSAvatarStatusDot variant="negative" label="Busy" />} />
<XDSAvatar name="GH" status={<XDSAvatarStatusDot variant="neutral" label="Away" />} />`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-avatar', visualProps: ['size']},
      {className: 'xds-avatar-status-dot', visualProps: ['variant']},
    ],
  },
  notes: [
    '始终为圆形（border-radius: 50%）',
    '回退背景使用 color.deemphasized 和 color.textSecondary',
    '首字母从姓名的第一个和最后一个单词中提取',
    'XDSAvatarSizeContext 向子组件提供解析后的数值尺寸',
    '状态点使用 CIRCLE_EDGE_OFFSET_RATIO 定位在圆形边缘的 45° 位置',
    '回退级联：(1) src 加载成功 → 显示图片；(2) src 加载失败 → 尝试 fallbackSrc；(3) fallbackSrc 失败/缺失 → 显示姓名首字母；(4) 无姓名 → 显示通用人物图标',
    '状态点尺寸层级：头像 ≤ 36px → 8px 点 + 1px 边框；头像 40–72px → 16px 点 + 2px 边框；头像 ≥ 96px → 24px 点 + 4px 边框',
  ],
  components: [
    {
      name: 'XDSAvatar',
      description:
        '显示用户头像，支持图片、首字母回退和可选的状态指示器。',
      props: [
        {
          name: 'src',
          type: 'string',
          description: '主图片源 URL。',
        },
        {
          name: 'fallbackSrc',
          type: 'string',
          description: '主图片加载失败时的备用图片。',
        },
        {
          name: 'name',
          type: 'string',
          description: '用户姓名，用于生成首字母和替代文本。',
        },
        {
          name: 'alt',
          type: 'string',
          description: '替代文本（未提供时回退到 name）。',
        },
        {
          name: 'size',
          type: 'XDSAvatarSize',
          description: '头像尺寸（命名值或数值像素值）。',
          default: "'small'",
        },
        {
          name: 'status',
          type: 'ReactNode',
          description: '角落内容，用于状态指示器。',
        },
      ],
      examples: [
        {
          label: '基础用法',
          code: '<XDSAvatar src="/user.jpg" name="John Doe" size="medium" />',
        },
        {
          label: '带状态点',
          code: `<XDSAvatar
  src="/user.jpg"
  name="John Doe"
  size="medium"
  status={<XDSAvatarStatusDot variant="positive" label="Online" />}
/>`,
        },
      ],
    },
    {
      name: 'XDSAvatarStatusDot',
      description:
        '尺寸感知的状态指示点，从上下文中读取头像尺寸并等比缩放。',
      props: [
        {
          name: 'variant',
          type: "'positive' | 'neutral' | 'negative'",
          description: '状态点的语义颜色变体。',
          default: "'positive'",
        },
        {
          name: 'label',
          type: 'string',
          description: '屏幕阅读器的无障碍标签。',
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description: '居中显示在状态点内的图标（tiny 尺寸时隐藏）。',
        },
      ],
      examples: [
        {
          label: '在线',
          code: '<XDSAvatarStatusDot variant="positive" label="Online" />',
        },
        {
          label: '忙碌',
          code: '<XDSAvatarStatusDot variant="negative" label="Busy" />',
        },
        {
          label: '离开',
          code: '<XDSAvatarStatusDot variant="neutral" label="Away" />',
        },
      ],
    },
  ],
};

/** @type {string} */
export const docsDense = `TODO: apply dense protocol`;
