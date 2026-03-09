/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Layer',
  description:
    'Core hook for overlay positioning using CSS Anchor Positioning and the Popover API — no React portals needed. Popover, HoverCard, and Tooltip build on this foundation and live in their own directories.',
  features: [
    'CSS Anchor Positioning for automatic placement relative to trigger elements',
    'Popover API for top-layer rendering — no React portals needed',
    'Type-safe mode system: context mode (anchor positioning) and fixed mode (manual coordinates)',
    'TypeScript enforces correct render props per mode at compile time',
    'Graceful degradation in Firefox: Popover API works, anchor positioning degrades acceptably',
    'Full support in Chrome and Safari',
  ],
  notes: [
    'CSS Anchor Positioning is fully supported in Chrome and Safari. Firefox supports the Popover API but not anchor positioning — this is an acceptable degradation.',
    'useXDSLayer context mode: pass a ref to the trigger element, then call render(children, { placement?, alignment? }). Fixed mode: call show() to display, then render(children, { x, y }) with required coordinates.',
    'LayerPlacement values: above | below | start | end. LayerAlignment values: start | center | end.',
    'For click-triggered popovers, use XDSPopover (in @xds/core/Popover). For hover overlays, use XDSHoverCard (in @xds/core/HoverCard). For tooltips, use XDSTooltip (in @xds/core/Tooltip).',
  ],
  accessibility: [
    'The Layer hook provides the positioning and visibility foundation. ARIA patterns are implemented by the higher-level components (XDSPopover, XDSHoverCard, XDSTooltip).',
  ],
  keyboard:
    'Escape closes any open layer.',
  examples: [
    {
      label: 'useXDSLayer — context mode',
      code: `const layer = useXDSLayer({mode: 'context'});

<button ref={layer.ref}>Trigger</button>
{layer.render(<Content />, {placement: 'above', alignment: 'center'})}`,
    },
    {
      label: 'useXDSLayer — fixed mode',
      code: `const layer = useXDSLayer({mode: 'fixed'});

layer.show();
{layer.render(<Content />, {x: mouseX, y: mouseY})}`,
    },
  ],
  components: [
    {
      name: 'useXDSLayer',
      description:
        'Core layer hook with type-safe modes for different positioning strategies (context mode for anchor positioning, fixed mode for manual coordinates).',
      props: [
        {
          name: 'mode',
          type: "'context' | 'fixed'",
          description:
            'Positioning strategy: context uses CSS anchor positioning relative to a trigger ref; fixed uses explicit x/y coordinates.',
          required: true,
        },
        {
          name: 'onShow',
          type: '() => void',
          description: 'Callback fired when the layer becomes visible.',
        },
        {
          name: 'onHide',
          type: '() => void',
          description: 'Callback fired when the layer is hidden.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization.',
        },
      ],
      examples: [
        {
          label: 'Context mode',
          code: `const layer = useXDSLayer({mode: 'context'});

<button ref={layer.ref}>Trigger</button>
{layer.render(<Content />, {placement: 'above', alignment: 'center'})}`,
        },
        {
          label: 'Fixed mode',
          code: `const layer = useXDSLayer({mode: 'fixed'});

layer.show();
{layer.render(<Content />, {x: mouseX, y: mouseY})}`,
        },
      ],
    },
  ],
};
