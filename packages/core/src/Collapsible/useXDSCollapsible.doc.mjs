/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useXDSCollapsible',
  keywords: ['collapsible', 'collapse', 'expand', 'toggle', 'accordion', 'disclosure', 'fold'],
  params: [
    {
      name: 'isCollapsible',
      type: "boolean | XDSCollapsibleConfig",
      description: 'Enable collapsible behavior. true = self-managed (starts open). Pass config object for controlled mode or custom defaults.',
    },
    {
      name: 'value',
      type: 'string',
      description: 'Unique identifier within an XDSCollapsibleGroup. When present and inside a group, state is managed by the group.',
    },
  ],
  returns: [
    {
      name: 'isEnabled',
      type: 'boolean',
      description: 'Whether collapsible behavior is active.',
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description: 'Whether the content is currently expanded.',
    },
    {
      name: 'toggle',
      type: '() => void',
      description: 'Toggle open/closed state. Dispatches to group, controlled callback, or internal state.',
    },
  ],
  usage: {
    description: 'Reusable hook that encapsulates the collapsible state machine. Supports three modes: group-controlled (inside XDSCollapsibleGroup), controlled (isOpen + onOpenChange), and uncontrolled (self-managed with defaultIsOpen). Used internally by XDSCard and XDSSection.',
    bestPractices: [
      {guidance: true, description: 'Use the hook directly when building custom collapsible components that need XDS collapsible behavior without XDSCollapsible wrapper.'},
      {guidance: true, description: 'For accordion behavior, wrap items in XDSCollapsibleGroup and pass unique value props.'},
      {guidance: false, description: 'Implement your own open/close state when useXDSCollapsible already provides it — the hook handles group coordination automatically.'},
    ],
  },
  relatedComponents: ['Collapsible', 'Card', 'Section'],
  relatedHooks: [],
  importPath: '@xds/core/Collapsible',
  category: 'interaction',
};
