/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Tooltip',
  description:
    'A hover/focus triggered tooltip for displaying short, non-interactive text anchored to a trigger element.',
  features: [
    'CSS Anchor Positioning for automatic placement relative to trigger elements',
    'Popover API for top-layer rendering — no React portals needed',
    'Hover triggers with configurable show and hide delays',
    'Focus triggers with auto-detection for focusable elements',
    'Inverted color palette (dark background, light text) for high contrast',
    'display:contents wrapper preserves children refs',
    'Hover indication (dashed underline) for text-only triggers',
    'Sibling mode via anchorRef for external trigger elements',
  ],
  notes: [
    'Unlike HoverCard, tooltips don\'t stay open when hovering the tooltip content.',
    'Tooltips have shorter delays and use inverted colors for high contrast.',
    'Tooltips are for short, non-interactive text. For interactive content, use XDSHoverCard or XDSPopover.',
    'In sibling mode (anchorRef prop), XDSTooltip attaches to an external ref rather than wrapping children.',
    'LayerPlacement values: above | below | start | end. LayerAlignment values: start | center | end.',
  ],
  accessibility: [
    'Links the tooltip content to the trigger via aria-describedby.',
    'When composing multiple aria-describedby sources, merge them with a utility.',
  ],
  keyboard:
    'Focus on the trigger shows the tooltip. Blur hides it.',
  examples: [
    {
      label: 'XDSTooltip — basic',
      code: `<XDSTooltip content="Save your changes" placement="above">
  <XDSButton label="Save" variant="primary" />
</XDSTooltip>`,
    },
    {
      label: 'useXDSTooltip hook',
      code: `const tooltip = useXDSTooltip({ placement: 'above' });

<XDSButton ref={tooltip.ref} aria-describedby={tooltip.describedBy}>
  Hover me
</XDSButton>
{tooltip.renderTooltip('Helpful tooltip text')}`,
    },
  ],
  components: [
    {
      name: 'XDSTooltip',
      description:
        'Component wrapper for tooltip display triggered on hover or focus.',
      examples: [
        {
          label: 'Basic',
          code: `<XDSTooltip content="Save your changes" placement="above">
  <XDSButton label="Save" variant="primary" />
</XDSTooltip>`,
        },
        {
          label: 'Sibling mode',
          code: `<XDSTooltip anchorRef={buttonRef} content="Save your changes" placement="above" />`,
        },
      ],
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Trigger element(s) that activate the tooltip.',
        },
        {
          name: 'anchorRef',
          type: 'RefObject<HTMLElement>',
          description: 'External anchor ref for sibling mode.',
        },
        {
          name: 'content',
          type: 'ReactNode',
          description: 'Tooltip content, typically short text.',
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
          default: '200',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: 'Hide delay in milliseconds.',
          default: '0',
        },
        {
          name: 'focusTrigger',
          type: "'auto' | 'always' | 'never'",
          description: 'Controls when focus events trigger the tooltip.',
          default: "'auto'",
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: 'Enables or disables the tooltip triggers.',
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
      name: 'useXDSTooltip',
      description:
        'Hook for tooltip behavior with hover/focus triggers. Builds on useXDSLayer.',
      examples: [
        {
          label: 'Basic hook usage',
          code: `const tooltip = useXDSTooltip({ placement: 'above' });

<XDSButton ref={tooltip.ref} aria-describedby={tooltip.describedBy}>
  Hover me
</XDSButton>
{tooltip.renderTooltip('Helpful tooltip text')}`,
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
          default: '200',
        },
        {
          name: 'hideDelay',
          type: 'number',
          description: 'Hide delay in milliseconds.',
          default: '0',
        },
        {
          name: 'focusTrigger',
          type: "'auto' | 'always' | 'never'",
          description: 'Controls when focus events trigger the tooltip.',
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
          description: 'Callback fired when the tooltip becomes visible.',
        },
        {
          name: 'onHide',
          type: '() => void',
          description: 'Callback fired when the tooltip is hidden.',
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {...docs};
