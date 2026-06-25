// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Collapsible',
  displayName: 'Collapsible',
  group: 'Collapsible',
  category: 'Container',
  keywords: ["accordion","collapse","expandable","disclosure","toggle","panel","foldable","expander","expand"],
  playground: {
    defaults: {
      trigger: 'Click to expand',
      children: {__element: 'Text', props: {type: 'body'}, children: 'This content is revealed when the collapsible is expanded. It can contain any components.'},
    },
  },
  theming: {
    targets: [
      {className: 'astryx-collapsible'},
    ],
  },
  description: 'A primitive that makes any content collapsible: a trigger button toggles visibility of the content area, managing its own state or deferring to a parent CollapsibleGroup.',
  props: [
    {
      name: 'trigger',
      type: 'ReactNode',
      description: 'Content shown in the trigger area (always visible).',
      required: true,
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
          },
          children: 'Trigger',
        },
      ],
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
      description: 'Identifier used for group coordination. Required when placed inside an CollapsibleGroup.',
    },
  ],
  components: [
    {name: 'CollapsibleGroup'},
  ],
  usage: {
    description: 'Collapsible hides and reveals content behind a trigger button. Use it in settings panels, FAQ pages, or detail views to keep the page scannable while letting users drill into sections they care about. Wrap multiple collapsibles in CollapsibleGroup for accordion behavior. For custom collapsible components, use the `useCollapsible` hook directly (`astryx hook useCollapsible`).',
    bestPractices: [
      { guidance: true, description: 'Wrap each Collapsible in an Card for visual separation in accordion layouts.' },
      { guidance: true, description: 'Use CollapsibleGroup with type="single" for settings or FAQ pages where only one section should be open at a time.' },
      { guidance: true, description: 'Use type="multiple" when users need to compare content across sections, like feature lists or pricing tiers.' },
      { guidance: true, description: 'Start sections open (defaultIsOpen) when the content is likely needed on first view; don\'t make users click to see essential info.' },
      { guidance: false, description: 'Hide critical or required content behind a collapsible; users may not discover it.' },
      { guidance: false, description: 'Nest collapsibles more than two levels deep; it makes content hard to find and navigate.' },
      { guidance: false, description: 'Use a collapsible for a single short paragraph; just show the text directly instead.' },
    ],
    anatomy: [
      { name: 'Trigger', required: true, description: 'The always-visible button that toggles the content. Shows a label and a chevron indicator.' },
      { name: 'Chevron', required: false, description: 'Animated arrow that rotates to show open or closed state.' },
      { name: 'Content', required: false, description: 'The area that hides or reveals when the trigger is clicked.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsZh = {
  usage: {
    description: 'Collapsible hides and reveals content behind a trigger button. Use it in settings panels, FAQ pages, or detail views to keep the page scannable while letting users drill into sections they care about. Wrap multiple collapsibles in CollapsibleGroup for accordion behavior.',
    bestPractices: [
      { guidance: true, description: 'Wrap each Collapsible in an Card for visual separation in accordion layouts.' },
      { guidance: true, description: 'Use CollapsibleGroup with type="single" for settings or FAQ pages where only one section should be open at a time.' },
      { guidance: true, description: 'Use type="multiple" when users need to compare content across sections, like feature lists or pricing tiers.' },
      { guidance: true, description: 'Start sections open (defaultIsOpen) when the content is likely needed on first view; don\'t make users click to see essential info.' },
      { guidance: false, description: 'Hide critical or required content behind a collapsible; users may not discover it.' },
      { guidance: false, description: 'Nest collapsibles more than two levels deep; it makes content hard to find and navigate.' },
      { guidance: false, description: 'Use a collapsible for a single short paragraph; just show the text directly instead.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'hide/reveal content behind a trigger; group for accordion behavior',
  usage: {
    description: 'Collapsible hides and reveals content behind a trigger button. Use in settings, FAQs, or detail views. Wrap in CollapsibleGroup for accordion behavior.',
    bestPractices: [
      { guidance: true, description: 'Wrap each Collapsible in an Card for visual separation in accordion layouts.' },
      { guidance: true, description: 'Use CollapsibleGroup with type="single" for settings or FAQ pages where only one section should be open at a time.' },
      { guidance: true, description: 'Use type="multiple" when users need to compare across sections.' },
      { guidance: true, description: 'Start sections open (defaultIsOpen) when content is needed on first view.' },
      { guidance: false, description: 'Hide critical content behind a collapsible; users may not discover it.' },
      { guidance: false, description: 'Nest collapsibles more than two levels deep; makes content hard to find and navigate.' },
      { guidance: false, description: 'Use a collapsible for a single short paragraph; just show the text directly instead.' },
    ],
  },
};
