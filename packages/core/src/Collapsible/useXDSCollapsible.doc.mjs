// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useXDSCollapsible',
  displayName: 'useXDSCollapsible',
  group: 'Collapsible',
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

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Collapsible state machine hook; 3 modes: group-controlled (inside XDSCollapsibleGroup), controlled (isOpen + onOpenChange), uncontrolled (self-managed w/ defaultIsOpen). Used internally by XDSCard + XDSSection.',
  usage: {
    bestPractices: [
      { guidance: true, description: 'Use hook directly when building custom collapsible components needing XDS collapsible behavior w/o XDSCollapsible wrapper.' },
      { guidance: true, description: 'For accordion behavior, wrap items in XDSCollapsibleGroup + pass unique value props.' },
      { guidance: false, description: 'Implement own open/close state when useXDSCollapsible already provides it — hook handles group coordination automatically.' },
    ],
  },
  paramDescriptions: {
    isCollapsible: 'Enable collapsible behavior; true = self-managed (starts open); pass config object for controlled mode/custom defaults.',
    value: 'Unique identifier within XDSCollapsibleGroup; when present + inside group, state managed by group.',
  },
  returnDescriptions: {
    isEnabled: 'Collapsible behavior active.',
    isOpen: 'Content currently expanded.',
    toggle: 'Toggle open/closed; dispatches to group, controlled callback, or internal state.',
  },
};
