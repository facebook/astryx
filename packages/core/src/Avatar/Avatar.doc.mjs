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
      {guidance: true, description: 'Pick a size that matches the context: xsm or sm for inline mentions, md or lg for lists and cards, xl for profile headers.'},
      {guidance: true, description: 'Add a status dot when knowing someone\'s availability matters, like in chat or team views.'},
      {guidance: false, description: 'Use Avatar for logos, product images, or anything that isn\'t a person or team. Use an image or icon instead.'},
    ],
    anatomy: [
      {name: 'Photo', required: false, description: 'The profile image, loaded from the src URL. Shown when available.'},
      {name: 'Initials', required: false, description: 'One or two letters extracted from the name. Shown when no photo is available.'},
      {name: 'Default icon', required: false, description: 'A generic person silhouette. Shown when there is no photo or name.'},
      {name: 'Status dot', required: false, description: 'A small indicator in the bottom-right corner showing availability (online, away, busy). Each variant pairs colour with a distinct shape so status does not rely on colour alone.'},
    ],
  },
  theming: {
    targets: [
      {className: 'astryx-avatar', visualProps: ['size']},
      {className: 'astryx-avatar-status-dot', visualProps: ['variant']},
      {className: 'astryx-avatar-status-dot-glyph', visualProps: ['shape']},
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
      type: "'xsm' | 'sm' | 'md' | 'lg' | 'xl' | number",
      description: "Avatar size. Use a named size ('xsm' 20px, 'sm' 24px, 'md' 36px, 'lg' 48px, 'xl' 128px) or a numeric pixel value. Avatar shares Icon's abbreviated scale, but its tiers are larger because avatars align with media rather than glyphs.",
      default: "'md'",
    },
    {
      name: 'shape',
      type: "'circle' | 'rounded' | 'square'",
      description: 'The visual shape of the avatar.',
      default: "'circle'",
    },
    {
      name: 'status',
      type: 'ReactNode',
      description: 'Corner content for status indicators.',
      slotElements: [
        {
          __element: 'AvatarStatusDot',
          props: {
            variant: 'success',
            label: 'Online',
          },
        },
      ],
    },
  ],
  components: [
    {name: 'AvatarStatusDot'},
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description:
      'Avatar displays a user or entity\'s profile picture with automatic fallback to initials or a default icon. Use it alongside user information to visually represent people, teams, or entities throughout the interface.',
    bestPractices: [
      {guidance: true, description: 'Always provide a name prop so the component can generate meaningful initials and alt text when the image fails to load.'},
      {guidance: true, description: 'Use the status slot with AvatarStatusDot to indicate online presence or availability when relevant to the context.'},
      {guidance: false, description: 'Use Avatar for decorative images or logos that aren\'t representing a person or entity. Use an image or icon component instead.'},
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
      {guidance: true, description: 'Match size to context: xsm/sm inline, md/lg in lists, xl for profiles.'},
      {guidance: true, description: 'Add a status dot in chat or team views where availability matters.'},
      {guidance: false, description: 'Use for logos or product images. Use an image or icon instead.'},
    ],
  },
  propDescriptions: {
    src: 'primary image source URL',
    fallbackSrc: 'fallback image when primary fails',
    name: 'user name for initials and alt text',
    alt: 'alt text; falls back to name',
    size: "avatar size. Named ('xsm' 20px, 'sm' 24px, 'md' 36px, 'lg' 48px, 'xl' 128px) or numeric px.",
    shape: 'avatar shape: circle (default), rounded, square',
    status: 'corner content for status indicators',
  },
  components: [
    {name: 'AvatarStatusDot', description: 'size-aware status indicator rendered in the Avatar corner'},
  ],
};
