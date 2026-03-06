/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Collapsible',
  description: 'Collapsible content primitive and group coordination.',
  features: [
    'XDSCollapsible makes any content collapsible — a trigger toggles visibility of the content area',
    'Handles state management, accessibility (aria-expanded, keyboard activation), and a chevron indicator',
    'Supports uncontrolled (defaultIsOpen), controlled (isOpen / onOpenChange), and group-coordinated modes',
    'XDSCollapsibleGroup coordinates multiple XDSCollapsible instances so only one (single mode) or multiple (multiple mode) can be open at a time',
    'XDSCollapsibleGroup renders no wrapper DOM element',
    'When inside a group, XDSCollapsible defers open/close state to the group context via the value prop',
  ],
  keyboard:
    'Enter or Space activates the trigger button to toggle open/close state.',
  accessibility: [
    'Trigger renders as a <button> with aria-expanded reflecting the current open state',
    'A chevron indicator provides a visual affordance for the expanded/collapsed state',
  ],
  notes: [
    'XDSCollapsible manages its own open/close state by default (uncontrolled)',
    'When nested inside an XDSCollapsibleGroup with a matching value prop, it defers to the group context',
    'XDSCollapsibleGroup provides context with isOpen(value) and toggle(value) methods',
    'The group renders no wrapper DOM — layout is the responsibility of the consumer (e.g. XDSVStack)',
  ],
  examples: [
    {
      label: 'Standalone collapsible',
      code: `// Inside a card
<XDSCard>
  <XDSCollapsible trigger="Details">
    <p>This content can be collapsed</p>
  </XDSCollapsible>
</XDSCard>

// Starts collapsed
<XDSCard>
  <XDSCollapsible trigger="Advanced" defaultIsOpen={false}>
    <p>Hidden by default</p>
  </XDSCollapsible>
</XDSCard>

// Controlled
<XDSCard>
  <XDSCollapsible trigger="Settings" isOpen={open} onOpenChange={setOpen}>
    <p>Controlled externally</p>
  </XDSCollapsible>
</XDSCard>

// Without a card — works anywhere
<XDSCollapsible trigger="Show more">
  <p>Expandable content</p>
</XDSCollapsible>`,
    },
    {
      label: 'Coordinated group — single mode (accordion)',
      code: `// Single mode — only one open at a time (FAQ, settings panels)
<XDSCollapsibleGroup type="single" defaultValue="general">
  <XDSVStack gap="space2">
    <XDSCard>
      <XDSCollapsible trigger="General Settings" value="general">
        <GeneralContent />
      </XDSCollapsible>
    </XDSCard>
    <XDSCard>
      <XDSCollapsible trigger="Advanced Settings" value="advanced">
        <AdvancedContent />
      </XDSCollapsible>
    </XDSCard>
  </XDSVStack>
</XDSCollapsibleGroup>`,
    },
    {
      label: 'Coordinated group — multiple mode',
      code: `// Multiple mode — any number open
<XDSCollapsibleGroup type="multiple" defaultValue={["s1", "s2"]}>
  <XDSVStack gap="space2">
    <XDSCard>
      <XDSCollapsible trigger="Section 1" value="s1">...</XDSCollapsible>
    </XDSCard>
    <XDSCard>
      <XDSCollapsible trigger="Section 2" value="s2">...</XDSCollapsible>
    </XDSCard>
  </XDSVStack>
</XDSCollapsibleGroup>`,
    },
    {
      label: 'With Layout (structured header)',
      code: `<XDSCard>
  <XDSCollapsible trigger="Report Details" value="report">
    <XDSLayout
      content={<XDSLayoutContent>Report body</XDSLayoutContent>}
      footer={<XDSLayoutFooter hasDivider>Actions</XDSLayoutFooter>}
    />
  </XDSCollapsible>
</XDSCard>`,
    },
  ],
  components: [
    {
      name: 'XDSCollapsible',
      description:
        'A primitive that makes any content collapsible — a trigger button toggles visibility of the content area, managing its own state or deferring to a parent XDSCollapsibleGroup.',
      props: [
        {
          name: 'trigger',
          type: 'ReactNode',
          description: 'Content shown in the trigger area (always visible).',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Content that collapses and expands.',
        },
        {
          name: 'defaultIsOpen',
          type: 'boolean',
          description: 'Default open state (uncontrolled).',
          default: 'true',
        },
        {
          name: 'isOpen',
          type: 'boolean',
          description: 'Controlled open state.',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description: 'Callback invoked when the open state changes.',
        },
        {
          name: 'value',
          type: 'string',
          description:
            'Identifier used for group coordination. Required when placed inside an XDSCollapsibleGroup.',
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: `<XDSCollapsible trigger="Details">
  <p>This content can be collapsed</p>
</XDSCollapsible>`,
        },
        {
          label: 'Starts collapsed',
          code: `<XDSCollapsible trigger="Advanced" defaultIsOpen={false}>
  <p>Hidden by default</p>
</XDSCollapsible>`,
        },
        {
          label: 'Controlled',
          code: `<XDSCollapsible trigger="Settings" isOpen={open} onOpenChange={setOpen}>
  <p>Controlled externally</p>
</XDSCollapsible>`,
        },
      ],
    },
    {
      name: 'XDSCollapsibleGroup',
      description:
        'Coordinates multiple XDSCollapsible instances so only one (single mode) or any number (multiple mode) can be open at a time. Renders no wrapper DOM element.',
      props: [
        {
          name: 'type',
          type: "'single' | 'multiple'",
          description: 'Whether one or many items can be open simultaneously.',
          default: "'single'",
        },
        {
          name: 'defaultValue',
          type: 'string | string[]',
          description:
            'Default open item(s) for uncontrolled usage. Use a string for single mode and an array for multiple mode.',
        },
        {
          name: 'value',
          type: 'string | string[]',
          description: 'Controlled open item(s).',
        },
        {
          name: 'onChange',
          type: '(value: string | string[]) => void',
          description: 'Callback invoked when the set of open items changes.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'XDSCollapsible instances to coordinate.',
          required: true,
        },
      ],
      examples: [
        {
          label: 'Single mode (accordion)',
          code: `<XDSCollapsibleGroup type="single" defaultValue="general">
  <XDSCollapsible trigger="General" value="general">
    <p>General settings</p>
  </XDSCollapsible>
  <XDSCollapsible trigger="Advanced" value="advanced">
    <p>Advanced settings</p>
  </XDSCollapsible>
</XDSCollapsibleGroup>`,
        },
        {
          label: 'Multiple mode',
          code: `<XDSCollapsibleGroup type="multiple" defaultValue={["s1", "s2"]}>
  <XDSCollapsible trigger="Section 1" value="s1">...</XDSCollapsible>
  <XDSCollapsible trigger="Section 2" value="s2">...</XDSCollapsible>
</XDSCollapsibleGroup>`,
        },
      ],
    },
  ],
};
