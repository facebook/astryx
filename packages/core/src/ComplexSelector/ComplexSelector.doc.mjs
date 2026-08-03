// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'ComplexSelector',
  displayName: 'Complex Selector',
  group: 'Selector',
  category: 'Data Input',
  keywords: [
    'selector',
    'picker',
    'popover',
    'dialog',
    'custom',
    'rich',
    'matrix',
    'grid',
  ],
  theming: {
    targets: [
      {className: 'astryx-complex-selector', visualProps: ['size', 'status']},
      {
        className: 'astryx-complex-selector-indicator-icon',
        states: ['state'],
      },
    ],
  },
  components: [
    {
      name: 'ComplexSelector',
      displayName: 'Complex Selector',
      description:
        'A field and dialog-popover shell for custom selector content.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Label text for accessibility and the field label.',
          required: true,
        },
        {
          name: 'value',
          type: 'Value',
          description: 'Current controlled value.',
          required: true,
        },
        {
          name: 'onChange',
          type: '(value: Value) => void',
          description: 'Called when custom content commits a new value.',
        },
        {
          name: 'changeAction',
          type: '(value: Value) => void | Promise<void>',
          description:
            'Async action after onChange. ComplexSelector exposes optimistic value and busy state while pending.',
        },
        {
          name: 'children',
          type: '(value: Value, onChange: (value: Value) => void, close: () => void, state: ComplexSelectorRenderState) => ReactNode',
          description:
            'Custom dialog content. Receives positional value, onChange, close, and state helpers.',
          required: true,
        },
        {
          name: 'triggerLabel',
          type: 'ReactNode',
          description: 'Label/content shown in the closed trigger.',
        },
        {
          name: 'placeholder',
          type: 'ReactNode',
          description: 'Placeholder shown when triggerLabel is omitted.',
          default: "'Select...'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Disables the selector.',
        },
        {
          name: 'isLoading',
          type: 'boolean',
          description: 'Shows loading state on the trigger.',
        },
        {
          name: 'status',
          type: "{type: 'warning' | 'error' | 'success', message?: string}",
          description: 'Validation status.',
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          description: 'Trigger and field size.',
          default: "'md'",
        },
        {
          name: 'width',
          type: 'SizeValue',
          description: 'Width of the field.',
        },
        {
          name: 'placement',
          type: "'above' | 'below' | 'start' | 'end'",
          description: 'Popup placement.',
          default: "'below'",
        },
        {
          name: 'contentXstyle',
          type: 'StyleXStyles',
          description: 'StyleX styles for the popup content container.',
        },
      ],
    },
  ],
  usage: {
    description:
      'Use ComplexSelector when a selection needs richer custom content than a Selector option row. It is intentionally one component: ComplexSelector owns the field, trigger, popover, focus restore, and changeAction flow, while the content render prop owns the selector-specific accessible structure.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Compose the dialog content from the appropriate accessible structure for the job: RadioList for a simple choice, Calendar/date inputs for date picking, TreeList or a searchable list for hierarchy, or a custom grid when two-dimensional arrow navigation is useful.',
      },
      {
        guidance: true,
        description:
          'Use the provided onChange helper from children; it already calls both onChange and changeAction and updates optimistic busy state.',
      },
      {
        guidance: true,
        description:
          'Call close() from custom content when a selection should dismiss the popup. Keep it open for multi-step content or freeform entry flows.',
      },
      {
        guidance: true,
        description:
          'Use Astryx focus hooks for custom content: useGridFocus for two-dimensional grids, useTreeFocus through TreeList for hierarchies, and useListFocus for custom linear collections.',
      },
      {
        guidance: true,
        description:
          'Evaluate custom content against WCAG 2.2: keyboard operation, focus visible/not obscured, names and roles, labels/instructions, target size, and contrast/non-text contrast are especially relevant for selector popovers.',
      },
      {
        guidance: false,
        description:
          'Do not rebuild trigger ARIA, popover focus management, or changeAction handling in product code.',
      },
      {
        guidance: false,
        description:
          'Do not use ComplexSelector for a plain single-column text list; use Selector instead.',
      },
    ],
  },
};

export const docsDense = {
  name: 'ComplexSelector',
  displayName: 'Complex Selector',
  group: 'Selector',
  category: 'Data Input',
  description:
    'Field+dialog-popover shell for rich custom selectors. Content gets value/onChange/close/state; content owns semantics. Use focus hooks and evaluate custom content against WCAG 2.2.',
  propDescriptions: {
    label: 'Accessible field label.',
    value: 'Controlled value.',
    onChange: 'Commit value.',
    changeAction: 'Async action after onChange; drives optimistic value/busy.',
    children:
      'Render custom dialog content from (value,onChange,close,state).',
    triggerLabel: 'Closed trigger label/content.',
    placement: 'Popup placement.',
    accessibility:
      'Custom content must provide its own accessible structure. Use focus hooks and evaluate against WCAG 2.2.',
  },
};
