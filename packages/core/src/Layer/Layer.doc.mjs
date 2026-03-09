/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Layer',
  description:
    'Hooks and components for overlay content using CSS Anchor Positioning and the Popover API — no React portals needed.',
  features: [
    'CSS Anchor Positioning for automatic placement relative to trigger elements',
    'Popover API for top-layer rendering — no React portals needed',
    'Type-safe mode system: context mode (anchor positioning) and fixed mode (manual coordinates)',
    'TypeScript enforces correct render props per mode at compile time',
    'Hover/focus triggered layers with configurable show and hide delays',
    'Controlled and uncontrolled popover modes',
    'Light dismiss support (click outside or Escape to close)',
    'Focus trap inside open popovers',
    'ARIA button + dialog pattern applied automatically to trigger elements',
    'Graceful degradation in Firefox: Popover API works, anchor positioning degrades acceptably',
    'Full support in Chrome and Safari',
  ],
  notes: [
    'CSS Anchor Positioning is fully supported in Chrome and Safari. Firefox supports the Popover API but not anchor positioning — this is an acceptable degradation.',
    'useXDSLayer context mode: pass a ref to the trigger element, then call render(children, { placement?, alignment? }). Fixed mode: call show() to display, then render(children, { x, y }) with required coordinates.',
    'When using hooks directly, compose aria-describedby with your own IDs using a mergeIds utility: ids.filter(Boolean).join(" ") || undefined.',
    'XDSPopover locates the trigger button inside children by searching for <button> or [role="button"] — the child tree must contain one. It applies click/keydown handlers and aria-haspopup, aria-expanded, aria-controls automatically.',
    'XDSPopover uses an inline-flex anchor wrapper so that pressed-state transforms on the trigger (e.g. :active scale) do not shift the anchor position and cause popover jitter.',
    'In sibling mode (anchorRef prop), XDSPopover and XDSTooltip attach to an external ref rather than wrapping children — useful when the trigger and overlay are not parent/child.',
    'XDSHoverCard (hook) returns a describedBy id — pass it as aria-describedby on the trigger for screen reader support.',
    'LayerPlacement values: above | below | start | end. LayerAlignment values: start | center | end.',
  ],
  accessibility: [
    'XDSPopover implements the button + dialog ARIA pattern: aria-haspopup, aria-expanded, and aria-controls are set on the trigger button automatically.',
    'XDSTooltip links the tooltip content to the trigger via aria-describedby.',
    'useXDSHoverCard returns a describedBy id that should be spread onto the trigger element so screen readers announce the hover card content.',
    'When composing multiple aria-describedby sources, merge them with a utility: ids.filter(Boolean).join(" ") || undefined.',
    'XDSPopover traps focus inside the popover dialog while it is open.',
    'XDSPopover supports keyboard activation for role="button" elements (Enter and Space) in addition to native <button> click synthesis.',
  ],
  keyboard:
    'Escape closes any open layer. Enter/Space open a popover when the trigger has focus. Focus is trapped inside an open XDSPopover.',
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
    {
      label: 'useXDSHoverCard',
      code: `const hoverCard = useXDSHoverCard({placement: 'above'});

<XDSButton ref={hoverCard.ref} aria-describedby={hoverCard.describedBy}>
  Hover me
</XDSButton>
{hoverCard.renderHoverCard(<ProfileCard user={user} />)}`,
    },
    {
      label: 'XDSTooltip',
      code: `<XDSTooltip content="Save your changes" placement="above">
  <XDSButton label="Save" variant="primary" />
</XDSTooltip>`,
    },
    {
      label: 'XDSHoverCard',
      code: `<XDSHoverCard content={<ProfileCard user={user} />} placement="above">
  <XDSButton>Hover me</XDSButton>
</XDSHoverCard>`,
    },
    {
      label: 'XDSPopover — basic',
      code: `<XDSPopover label="Settings" content={<SettingsPanel />} placement="below">
  <XDSButton label="Settings" />
</XDSPopover>`,
    },
    {
      label: 'XDSPopover — controlled',
      code: `<XDSPopover
  isShown={isOpen}
  onToggle={setIsOpen}
  label="Filter"
  content={<FilterForm />}
>
  <XDSButton label="Filter" />
</XDSPopover>`,
    },
    {
      label: 'XDSPopover — sibling mode with anchorRef',
      code: `<XDSPopover
  anchorRef={myButtonRef}
  label="Actions"
  content={<ActionMenu />}
  placement="below"
/>`,
    },
    {
      label: 'Composing aria-describedby with useXDSHoverCard',
      code: `const hoverCard = useXDSHoverCard();

function mergeIds(...ids: (string | undefined)[]) {
  return ids.filter(Boolean).join(' ') || undefined;
}

<XDSInput
  ref={hoverCard.ref}
  aria-describedby={mergeIds(fieldErrorId, hoverCard.describedBy)}
/>`,
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
            'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
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
    {
      name: 'useXDSHoverCard',
      description:
        'Hook for hover/focus triggered layers with configurable show and hide timing.',
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
      examples: [
        {
          label: 'Basic usage',
          code: `const hoverCard = useXDSHoverCard({placement: 'above'});

<XDSButton ref={hoverCard.ref} aria-describedby={hoverCard.describedBy}>
  Hover me
</XDSButton>
{hoverCard.renderHoverCard(<ProfileCard user={user} />)}`,
        },
      ],
    },
    {
      name: 'XDSTooltip',
      description:
        'Component wrapper for tooltip display triggered on hover or focus.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Trigger element(s) that activate the tooltip.',
        },
        {
          name: 'anchorRef',
          type: 'RefObject<HTMLElement>',
          description:
            'External anchor ref for sibling mode — attaches the tooltip to this element instead of wrapping children.',
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
          description:
            'Shows a dashed underline on the trigger element to indicate a tooltip is available.',
          default: "'auto'",
        },
      ],
      examples: [
        {
          label: 'Basic tooltip',
          code: `<XDSTooltip content="Save your changes" placement="above">
  <XDSButton label="Save" variant="primary" />
</XDSTooltip>`,
        },
      ],
    },
    {
      name: 'XDSHoverCard',
      description:
        'Component wrapper for hover card display — a richer, larger overlay triggered on hover or focus.',
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
      ],
      examples: [
        {
          label: 'Basic hover card',
          code: `<XDSHoverCard content={<ProfileCard user={user} />} placement="above">
  <XDSButton>Hover me</XDSButton>
</XDSHoverCard>`,
        },
      ],
    },
    {
      name: 'XDSPopover',
      description:
        'A click-triggered popover for displaying interactive content anchored to a trigger element, implementing the button + dialog ARIA pattern.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Trigger element. Must contain a <button> or [role="button"] element — the popover finds it and applies click/keydown handlers and ARIA attributes.',
        },
        {
          name: 'anchorRef',
          type: 'React.RefObject<HTMLElement>',
          description:
            'External ref to use as the popover anchor in sibling mode. The referenced element must be a <button> or [role="button"].',
        },
        {
          name: 'content',
          type: 'ReactNode',
          description: 'Content to display inside the popover.',
          required: true,
        },
        {
          name: 'placement',
          type: 'LayerPlacement',
          description:
            'Position placement relative to the trigger using CSS anchor positioning.',
          default: "'below'",
        },
        {
          name: 'alignment',
          type: 'LayerAlignment',
          description: 'Alignment along the placement axis.',
          default: "'start'",
        },
        {
          name: 'isOpen',
          type: 'boolean',
          description:
            'Whether the popover is shown in controlled mode. Omit for uncontrolled behavior.',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description: 'Callback fired when the popover visibility changes.',
        },
        {
          name: 'isEnabled',
          type: 'boolean',
          description: 'When false, trigger interactions are ignored.',
          default: 'true',
        },
        {
          name: 'width',
          type: 'number | string',
          description:
            'Width of the popover container. Numbers are treated as px; strings are used as-is. Defaults to matching the trigger width.',
          default: "'auto'",
        },
        {
          name: 'label',
          type: 'string',
          description:
            'Accessible label for the popover dialog, used as aria-label on the dialog element. Recommended for accessibility.',
        },
      ],
      examples: [
        {
          label: 'Basic popover',
          code: `<XDSPopover label="Settings" content={<SettingsPanel />} placement="below">
  <XDSButton label="Settings" />
</XDSPopover>`,
        },
        {
          label: 'Controlled popover',
          code: `<XDSPopover
  isShown={isOpen}
  onToggle={setIsOpen}
  label="Filter"
  content={<FilterForm />}
>
  <XDSButton label="Filter" />
</XDSPopover>`,
        },
        {
          label: 'Sibling mode with anchorRef',
          code: `<XDSPopover
  anchorRef={myButtonRef}
  label="Actions"
  content={<ActionMenu />}
  placement="below"
/>`,
        },
      ],
    },
  ],
  theming: {
    targets: [
      {className: 'xds-popover'},
    ],
  },
};
