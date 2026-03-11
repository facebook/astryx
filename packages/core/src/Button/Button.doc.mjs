/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Button',
  description:
    'XDSButton component with multiple variants, sizes, and isLoading state support.',

  features: [
    "Variants: 'primary', 'secondary', 'ghost', 'destructive'",
    'Sizes: sm (28px), md (32px), lg (36px)',
    'Loading state: Shows spinner, disables interaction',
    'Focus visible: Accessible focus outline with variant-specific colors',
    'Hover/active states: Uses overlay colors via backgroundImage for consistent layering',
  ],

  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label; used as aria-label for icon-only buttons.',
      required: true,
    },
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'ghost' | 'destructive'",
      description: 'Visual style variant.',
      default: "'secondary'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size variant.',
      default: "'md'",
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description: 'Shows a loading spinner and disables interaction.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the button.',
      default: 'false',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'Icon element. When provided without children the button renders as a square icon-only button.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Button content. When provided alongside icon, the text is rendered next to the icon.',
    },
    {
      name: 'endSlot',
      type: 'ReactElement<XDSIconProps> | ReactElement<XDSBadgeProps>',
      description:
        'Trailing icon or badge rendered after the label. Only accepts <XDSIcon> or <XDSBadge>. Ignored for icon-only buttons. Color is inherited from the button variant.',
    },
    {
      name: 'tooltip',
      type: 'string',
      description: 'Tooltip text shown on hover.',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description:
        'Standard click handler (passed through from ButtonHTMLAttributes).',
    },
    {
      name: 'onClickAction',
      type: '(e: MouseEvent) => void | Promise<void>',
      description:
        'Async click handler. Shows loading state while the returned promise is pending.',
    },
  ],

  examples: [
    {
      label: 'Basic',
      code: '<XDSButton label="Click me" variant="primary" />',
    },
    {
      label: 'With size',
      code: '<XDSButton label="Large button" variant="primary" size="lg" />',
    },
    {
      label: 'Loading state',
      code: '<XDSButton label="Saving..." variant="primary" isLoading />',
    },
    {
      label: 'Destructive action',
      code: '<XDSButton label="Delete" variant="destructive" />',
    },
    {
      label: 'Icon-only button',
      code: `// Pass \`icon\` without \`children\` — \`label\` becomes the aria-label
<XDSButton label="Settings" icon={<GearIcon />} variant="ghost" />`,
    },
    {
      label: 'Icon-only with emoji content',
      code: '<XDSButton label="Select rocket emoji" icon={<span>🚀</span>} variant="ghost" size="sm" />',
    },
    {
      label: 'Icon + visible label',
      code: '<XDSButton label="Edit" icon={<PencilIcon />}>Edit</XDSButton>',
    },
    {
      label: 'endSlot — badge after label',
      code: '<XDSButton label="Messages" endSlot={<XDSBadge>3</XDSBadge>} />',
    },
    {
      label: 'endSlot — icon, label, and badge',
      code: '<XDSButton label="Edit" icon={<PencilIcon />} endSlot={<XDSBadge>New</XDSBadge>}>Edit</XDSButton>',
    },
    {
      label: 'endSlot — settings with badge',
      code: `<XDSButton label="Settings" icon={<GearIcon />} endSlot={<XDSBadge>New</XDSBadge>}>
  Settings
</XDSButton>`,
    },
  ],

  theming: {
    targets: [
      {className: 'xds-button', visualProps: ['size', 'variant']},
    ],
  },
  notes: [
    'XDSButtonVariant type is derived from the variants StyleX object using keyof typeof variants.',
    'Hover/active states use backgroundImage with linear-gradient to layer overlay colors on top of the base background.',
    'Destructive variant uses colorTokens.negative for its focus outline color.',
    'endSlot is wrapped in a <span> with color: inherit so icons/badges match the button text color across all variants.',
    'When icon is provided without children, the button becomes icon-only: it renders as a perfect square (aspectRatio: 1/1), and label is used as aria-label (not rendered visually). Works with any ReactNode as the icon — SVG components, emoji, or text.',
    'endSlot is ignored for icon-only buttons (when icon is provided without children) to preserve the square aspect ratio.',
    'Prefer XDSButton over <div onClick> or <span onClick> for accessibility — it provides keyboard navigation, focus management, and screen reader support.',
    'Icon-only buttons are suitable for toolbars, action grids, and compact controls.',
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {...docs};
