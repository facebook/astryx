// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Avatar',
  displayName: 'Avatar',
  group: 'Avatar',
  category: 'Content',
  keywords: ["avatar","profile","user","photo","thumbnail","initials","gravatar","pfp","userpic"],
  usage: {
    description:
      'Avatar represents a person or team with a profile photo, initials, or a default icon. Use it in comment headers, contact lists, chat messages, user cards, and anywhere you need to identify someone visually.',
    bestPractices: [
      {guidance: true, description: 'Always pass a name so the avatar can show initials if the photo fails to load, and so screen readers can announce who it represents.'},
      {guidance: true, description: 'Pick a size that matches the context — tiny or xsmall for inline mentions, small or medium for lists and cards, large for profile headers.'},
      {guidance: true, description: 'Add a status dot when knowing someone\'s availability matters, like in chat or team views.'},
      {guidance: false, description: 'Use Avatar for logos, product images, or anything that isn\'t a person or team — use an image or icon instead.'},
      {guidance: false, description: 'Force a square or custom shape — avatars are always circular to stay consistent across the system.'},
    ],
    anatomy: [
      {name: 'Photo', required: false, description: 'The profile image, loaded from the src URL. Shown when available.'},
      {name: 'Initials', required: false, description: 'One or two letters extracted from the name. Shown when no photo is available.'},
      {name: 'Default icon', required: false, description: 'A generic person silhouette. Shown when there is no photo or name.'},
      {name: 'Status dot', required: false, description: 'A small indicator in the bottom-right corner showing availability (online, away, busy).'},
    ],
  },
  theming: {
    targets: [
      {className: 'xds-avatar', visualProps: ['size']},
      {className: 'xds-avatar-status-dot', visualProps: ['variant']},
    ],
  },
  components: [
    {
      name: 'XDSAvatar',
      displayName: 'Avatar',
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
          type: "'tiny' | 'xsmall' | 'small' | 'medium' | 'large' | number",
          description: "Avatar size. Named sizes: 'tiny' (20px), 'xsmall' (24px), 'small' (36px), 'medium' (48px), 'large' (72px). Also accepts specific pixel values (16, 20, 24, 32, 36, 40, 48, 60, 64, 72, 80, 96, 120).",
          default: "'small'",
        },
        {
          name: 'status',
          type: 'ReactNode',
          description: 'Corner content for status indicators.',
          slotElements: [{__element: 'XDSStatusDot', props: {variant: 'online'}}],
        },
      ],    },
    {
      name: 'XDSAvatarStatusDot',
      isHiddenFromOverview: true,
      displayName: 'Avatar Status Dot',
      description:
        'Size-aware status indicator dot that reads avatar size from context and scales proportionally.',
      props: [
        {
          name: 'variant',
          type: "'success' | 'neutral' | 'error'",
          description: 'Semantic color variant of the dot.',
          default: "'success'",
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
          slotElements: [{__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}],
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Avatar',
  displayName: 'Avatar',
  group: 'Avatar',
  usage: {
    description:
      'Avatar displays a user or entity\'s profile picture with automatic fallback to initials or a default icon. Use it alongside user information to visually represent people, teams, or entities throughout the interface.',
    bestPractices: [
      {guidance: true, description: 'Always provide a name prop so the component can generate meaningful initials and alt text when the image fails to load.'},
      {guidance: true, description: 'Use the status slot with XDSAvatarStatusDot to indicate online presence or availability when relevant to the context.'},
      {guidance: false, description: 'Use Avatar for decorative images or logos that aren\'t representing a person or entity — use an image or icon component instead.'},
      {guidance: false, description: 'Override the circular shape — Avatars are always round to maintain visual consistency across the system.'},
    ],
  },
  theming: {
    targets: [
      {
        className: 'xds-avatar',
        visualProps: [
          'size',
        ],
      },
      {
        className: 'xds-avatar-status-dot',
        visualProps: [
          'variant',
        ],
      },
    ],
  },
  components: [
    {
      name: 'XDSAvatar',
      displayName: 'Avatar',
      description: '显示用户头像，支持图片、首字母回退和可选的状态指示器。',
      props: [
        {name: 'src', type: 'string', description: '主图片源 URL。'},
        {name: 'fallbackSrc', type: 'string', description: '主图片加载失败时的备用图片。'},
        {name: 'name', type: 'string', description: '用户姓名，用于生成首字母和替代文本。'},
        {name: 'alt', type: 'string', description: '替代文本（未提供时回退到 name）。'},
        {name: 'size', type: "'tiny' | 'xsmall' | 'small' | 'medium' | 'large' | number", description: "头像尺寸。命名值：'tiny' (20px)、'xsmall' (24px)、'small' (36px)、'medium' (48px)、'large' (72px)。也接受具体像素值。", default: "'small'"},
        {name: 'status', type: 'ReactNode', description: '角落内容，用于状态指示器。'},
      ],
    },
    {
      name: 'XDSAvatarStatusDot',
      isHiddenFromOverview: true,
      displayName: 'Avatar Status Dot',
      description: '尺寸感知的状态指示点，从上下文中读取头像尺寸并等比缩放。',
      props: [
        {name: 'variant', type: "'success' | 'neutral' | 'error'", description: '状态点的语义颜色变体。', default: "'success'"},
        {name: 'label', type: 'string', description: '屏幕阅读器的无障碍标签。'},
        {name: 'icon', type: 'ReactNode', description: '居中显示在状态点内的图标（tiny 尺寸时隐藏）。'},
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'person/team avatar w/ photo → initials → icon fallback chain',
  usage: {
    description:
      'Avatar represents a person or team with a profile photo, initials, or a default icon. Falls back automatically. Use in comment headers, contact lists, chat, user cards.',
    bestPractices: [
      {guidance: true, description: 'Always pass a name for initials fallback and screen reader alt text.'},
      {guidance: true, description: 'Match size to context — tiny/xsmall inline, small/medium in lists, large for profiles.'},
      {guidance: true, description: 'Add a status dot in chat or team views where availability matters.'},
      {guidance: false, description: 'Use for logos or product images — use an image or icon instead.'},
      {guidance: false, description: 'Force a square or custom shape — avatars are always circular.'},
    ],
  },
  components: [
    {
      name: 'XDSAvatar',
      displayName: 'Avatar',
      description: 'user avatar w/ image, initials fallback, optional status indicator',
      propDescriptions: {
        src: 'primary image URL',
        fallbackSrc: 'fallback image on primary fail',
        name: 'user name for initials+alt text',
        displayName: 'user name for initials+alt text',
        alt: 'alt text (falls back to name)',
        size: 'avatar size (named or numeric px)',
        status: 'corner content for status indicators',
      },
    },
    {
      name: 'XDSAvatarStatusDot',
      isHiddenFromOverview: true,
      displayName: 'Avatar Status Dot',
      description: 'size-aware status dot, reads avatar size from context + scales proportionally',
      propDescriptions: {
        variant: 'semantic color variant',
        label: 'accessible label for screen readers',
        icon: 'icon centered in dot (hidden at tiny sizes)',
      },
    },
  ],
};
