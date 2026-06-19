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
      {guidance: true, description: 'Pick a size that matches the context: tiny or xsmall for inline mentions, small or medium for lists and cards, large for profile headers.'},
      {guidance: true, description: 'Add a status dot when knowing someone\'s availability matters, like in chat or team views.'},
      {guidance: false, description: 'Use Avatar for logos, product images, or anything that isn\'t a person or team. Use an image or icon instead.'},
      {guidance: false, description: 'Force a square or custom shape. Avatars are always circular to stay consistent across the system.'},
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
  description: 'Displays a user avatar with image, initials fallback, and optional status indicator.',
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
      slotElements: [
        {
          __element: 'XDSStatusDot',
          props: {
            variant: 'online',
          },
        },
      ],
    },
  ],
  components: [
    {name: 'XDSAvatarStatusDot'},
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'Avatar displays a user or entity\'s profile picture with automatic fallback to initials or a default icon. Use it alongside user information to visually represent people, teams, or entities throughout the interface.',
    bestPractices: [
      {guidance: true, description: 'Always provide a name prop so the component can generate meaningful initials and alt text when the image fails to load.'},
      {guidance: true, description: 'Use the status slot with XDSAvatarStatusDot to indicate online presence or availability when relevant to the context.'},
      {guidance: false, description: 'Use Avatar for decorative images or logos that aren\'t representing a person or entity. Use an image or icon component instead.'},
      {guidance: false, description: 'Override the circular shape. Avatars are always round to maintain visual consistency across the system.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'person/team avatar w/ photo → initials → icon fallback chain',
  usage: {
    description:
      'Avatar represents a person or team with a profile photo, initials, or a default icon. Falls back automatically. Use in comment headers, contact lists, chat, user cards.',
    bestPractices: [
      {guidance: true, description: 'Always pass a name for initials fallback and screen reader alt text.'},
      {guidance: true, description: 'Match size to context: tiny/xsmall inline, small/medium in lists, large for profiles.'},
      {guidance: true, description: 'Add a status dot in chat or team views where availability matters.'},
      {guidance: false, description: 'Use for logos or product images. Use an image or icon instead.'},
      {guidance: false, description: 'Force a square or custom shape. Avatars are always circular.'},
    ],
  },
};
