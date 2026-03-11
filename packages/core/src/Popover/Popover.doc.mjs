/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Popover',
  description:
    'A click-triggered popover for displaying interactive content anchored to a trigger element, implementing the button + dialog ARIA pattern.',
  features: [
    'CSS Anchor Positioning for automatic placement relative to trigger elements',
    'Popover API for top-layer rendering — no React portals needed',
    'Controlled and uncontrolled modes',
    'Light dismiss support (click outside or Escape to close)',
    'Focus trap inside open popovers',
    'ARIA button + dialog pattern applied automatically to trigger elements',
    'Sibling mode via anchorRef for external trigger elements',
    'Stable anchor wrapper immune to pressed-state transforms',
  ],
  notes: [
    'XDSPopover locates the trigger button inside children by searching for <button> or [role="button"] — the child tree must contain one. It applies click/keydown handlers and aria-haspopup, aria-expanded, aria-controls automatically.',
    'XDSPopover uses an inline-flex anchor wrapper so that pressed-state transforms on the trigger (e.g. :active scale) do not shift the anchor position and cause popover jitter.',
    'In sibling mode (anchorRef prop), XDSPopover attaches to an external ref rather than wrapping children — useful when the trigger and overlay are not parent/child.',
    'LayerPlacement values: above | below | start | end. LayerAlignment values: start | center | end.',
  ],
  accessibility: [
    'Implements the button + dialog ARIA pattern: aria-haspopup, aria-expanded, and aria-controls are set on the trigger button automatically.',
    'Traps focus inside the popover dialog while it is open.',
    'Supports keyboard activation for role="button" elements (Enter and Space) in addition to native <button> click synthesis.',
  ],
  keyboard:
    'Escape closes the popover. Enter/Space open the popover when the trigger has focus. Focus is trapped inside an open popover.',
  examples: [
    {
      label: 'XDSPopover — basic',
      code: `<XDSPopover label="Settings" content={<SettingsPanel />} placement="below">
  <XDSButton label="Settings" />
</XDSPopover>`,
    },
    {
      label: 'XDSPopover — controlled',
      code: `<XDSPopover
  isOpen={isOpen}
  onOpenChange={setIsOpen}
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
      label: 'useXDSPopover hook',
      code: `const popover = useXDSPopover({
  onHide: () => inputRef.current?.focus(),
  closeButtonLabel: 'Close calendar',
});

<button ref={popover.triggerRef} onClick={popover.toggle} {...popover.triggerProps}>
  Open Calendar
</button>
{popover.render(<Calendar />, { placement: 'below', alignment: 'start' })}`,
    },
  ],
  components: [
    {
      name: 'XDSPopover',
      description:
        'A click-triggered popover for displaying interactive content anchored to a trigger element.',
      examples: [
        {
          label: 'Basic',
          code: `<XDSPopover label="Settings" content={<SettingsPanel />} placement="below">
  <XDSButton label="Settings" />
</XDSPopover>`,
        },
        {
          label: 'Controlled',
          code: `<XDSPopover
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  label="Filter"
  content={<FilterForm />}
>
  <XDSButton label="Filter" />
</XDSPopover>`,
        },
      ],
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Trigger element. Must contain a <button> or [role="button"] element.',
        },
        {
          name: 'anchorRef',
          type: 'React.RefObject<HTMLElement>',
          description:
            'External ref to use as the popover anchor in sibling mode.',
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
          description: 'Position placement relative to the trigger.',
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
          description: 'Whether the popover is shown in controlled mode.',
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
          description: 'Width of the popover container.',
          default: "'auto'",
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the popover dialog.',
        },
      ],
    },
    {
      name: 'useXDSPopover',
      description:
        'Hook for creating popover dialogs with focus trapping. Combines useXDSLayer with useFocusTrap.',
      examples: [
        {
          label: 'Basic hook usage',
          code: `const popover = useXDSPopover({
  onHide: () => inputRef.current?.focus(),
});

<button ref={popover.triggerRef} onClick={popover.toggle} {...popover.triggerProps}>
  Open
</button>
{popover.render(<MyContent />, { placement: 'below', alignment: 'start' })}`,
        },
      ],
      props: [
        {
          name: 'onShow',
          type: '() => void',
          description: 'Callback fired when popover is shown.',
        },
        {
          name: 'onHide',
          type: '() => void',
          description: 'Callback fired when popover is hidden.',
        },
        {
          name: 'hasLightDismiss',
          type: 'boolean',
          description: 'Whether clicking outside should dismiss the popover.',
          default: 'true',
        },
        {
          name: 'hasAutoFocus',
          type: 'boolean',
          description: 'Whether to auto-focus the first focusable element when opened.',
          default: 'true',
        },
        {
          name: 'hasCloseButton',
          type: 'boolean',
          description: 'Whether to include a hidden close button for accessibility.',
          default: 'true',
        },
        {
          name: 'dialogLabel',
          type: 'string',
          description: 'Accessible label for the dialog.',
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

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {...docs};
