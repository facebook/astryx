import type {ComponentDoc} from '../docs-types';

export const docs: ComponentDoc = {
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
    componentKey: 'avatar',
    surfaces: [
      {name: 'root', description: 'Root wrapper styles'},
      {name: 'fallback', description: 'Fallback/initials container styles'},
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
