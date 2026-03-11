/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'HoverCard',
  description:
    'A hover/focus triggered overlay for displaying rich, interactive content anchored to a trigger element.',
  features: [
    'CSS Anchor Positioning for automatic placement relative to trigger elements',
    'Popover API for top-layer rendering — no React portals needed',
    'Hover triggers with configurable show and hide delays',
    'Focus triggers with auto-detection for focusable elements',
    'Stay-open behavior when mouse/focus moves into the hover card',
    'display:contents wrapper preserves children refs',
    'Hover indication (dashed underline) for text-only triggers',
  ],
  notes: [
    'useXDSHoverCard returns a describedBy id — pass it as aria-describedby on the trigger for screen reader support.',
    'When composing multiple aria-describedby sources, merge them with a utility: ids.filter(Boolean).join(" ") || undefined.',
    'LayerPlacement values: above | below | start | end. LayerAlignment values: start | center | end.',
  ],
  accessibility: [
    'Links the hover card content to the trigger via aria-describedby.',
    'When composing multiple aria-describedby sources, merge them with a utility.',
    'Escape key dismisses the hover card and returns focus to the trigger.',
  ],
  keyboard:
    'Escape closes the hover card. Focus triggers show/hide based on the focusTrigger option.',
  examples: [
    {
      label: 'XDSHoverCard — basic',
      code: `<XDSHoverCard content={<ProfileCard user={user} />} placement="above">
  <XDSButton>Hover me</XDSButton>
</XDSHoverCard>`,
    },
    {
      label: 'useXDSHoverCard hook',
      code: `const hoverCard = useXDSHoverCard({placement: 'above'});

<XDSButton ref={hoverCard.ref} aria-describedby={hoverCard.describedBy}>
  Hover me
</XDSButton>
{hoverCard.renderHoverCard(<ProfileCard user={user} />)}`,
    },
  ],
  components: [
    {
      name: 'XDSHoverCard',
      description:
        'Component wrapper for hover card display — a richer, larger overlay triggered on hover or focus.',
      examples: [
        {
          label: 'Basic',
          code: `<XDSHoverCard content={<ProfileCard user={user} />} placement="above">
  <XDSButton>Hover me</XDSButton>
</XDSHoverCard>`,
        },
        {
          label: 'With delay',
          code: `<XDSHoverCard content={<ProfileCard user={user} />} delay={500} hideDelay={300}>
  <span>Hover me</span>
</XDSHoverCard>`,
        },
      ],
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Trigger element that must accept a ref.',
        },
        {
          name: 'content',
          type: 'ReactNode',
          description: 'Hover card content.',
          required: true,
        },
        {
          name: 'placement',
          type: 'LayerPlacement',
          description: 'Position relative to the anchor element.',
          default: "'above'",
        },
        {
          name: 'alignment',
          type: 'LayerAlignment',
          description: 'Alignment along the placement axis.',
          default: "'center'",
        },
        {
          name: 'delay',
          type: 'number',
          description: 'Show delay in milliseconds.',
          default: '300',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: 'Hide delay in milliseconds.',
          default: '200',
        },
        {
          name: 'focusTrigger',
          type: "'auto' | 'always' | 'never'",
          description: 'Controls when focus events trigger the hover card.',
          default: "'auto'",
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: 'Enables or disables the hover and focus triggers.',
          default: 'true',
        },
        {
          name: 'hasHoverIndication',
          type: "'auto' | boolean",
          description: 'Shows a dashed underline on the trigger element.',
          default: "'auto'",
        },
      ],
    },
    {
      name: 'useXDSHoverCard',
      description:
        'Hook for hover card behavior with hover/focus triggers. Builds on useXDSLayer.',
      examples: [
        {
          label: 'Basic hook usage',
          code: `const hoverCard = useXDSHoverCard({placement: 'above'});

<XDSButton ref={hoverCard.ref} aria-describedby={hoverCard.describedBy}>
  Hover me
</XDSButton>
{hoverCard.renderHoverCard(<ProfileCard user={user} />)}`,
        },
      ],
      props: [
        {
          name: 'placement',
          type: 'LayerPlacement',
          description: 'Position relative to the anchor element.',
          default: "'above'",
        },
        {
          name: 'alignment',
          type: 'LayerAlignment',
          description: 'Alignment along the placement axis.',
          default: "'center'",
        },
        {
          name: 'delay',
          type: 'number',
          description: 'Show delay in milliseconds.',
          default: '300',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: 'Hide delay in milliseconds.',
          default: '200',
        },
        {
          name: 'focusTrigger',
          type: "'auto' | 'always' | 'never'",
          description: 'Controls when focus events trigger the layer.',
          default: "'auto'",
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: 'Enables or disables all hover and focus triggers.',
          default: 'true',
        },
        {
          name: 'onShow',
          type: '() => void',
          description: 'Callback fired when the hover card becomes visible.',
        },
        {
          name: 'onHide',
          type: '() => void',
          description: 'Callback fired when the hover card is hidden.',
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {...docs};
