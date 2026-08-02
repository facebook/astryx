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
    'grid',
    'matrix',
    'custom',
    'rich',
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
        'A field and popover shell for building rich custom selector surfaces, including two-dimensional grids.',
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
          type: '(props: ComplexSelectorRenderProps<Value>) => ReactNode',
          description:
            'Custom selector content. Receives value, onChange, changeAction, close, isOpen, isBusy, IDs, and getOptionProps.',
          required: true,
        },
        {
          name: 'triggerLabel',
          type: 'ReactNode',
          description: 'Label/content shown in the closed trigger.',
        },
        {
          name: 'renderTrigger',
          type: '(props: ComplexSelectorTriggerRenderProps<Value>) => ReactNode',
          description:
            'Custom trigger content rendered inside the selector trigger while ComplexSelector owns the button semantics.',
        },
        {
          name: 'placeholder',
          type: 'ReactNode',
          description: 'Placeholder shown when triggerLabel is omitted.',
          default: "'Select...'",
        },
        {
          name: 'layout',
          type: "{type: 'grid', columns: number}",
          description:
            'Optional popup layout behavior. Grid layout wires arrow-key navigation and preserves columns on vertical movement.',
        },
        {
          name: 'hasCloseOnChange',
          type: 'boolean',
          description: 'Whether to close the popup after a value is committed.',
          default: 'true',
        },
        {
          name: 'getOptionProps',
          type: 'render prop helper',
          description:
            'Returned from children props. Spread onto selectable buttons/cells so the selector can apply grid semantics and commit values.',
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
          name: 'htmlName',
          type: 'string',
          description: 'HTML form field name. Renders a hidden input.',
        },
        {
          name: 'getFormValue',
          type: '(value: Value) => string',
          description: 'Converts value for the hidden input.',
        },
      ],
    },
  ],
  usage: {
    description:
      'Use ComplexSelector when a selection needs richer custom content than a Selector option row, such as a card picker, color matrix, or two-dimensional option grid. It is intentionally one component: consumers customize content through a render prop while the design system owns the field, popover, focus restore, changeAction flow, and optional grid navigation.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use layout={{type: \'grid\', columns}} for two-dimensional selectors so arrow navigation preserves columns.',
      },
      {
        guidance: true,
        description:
          'Spread getOptionProps onto each selectable cell/button; pass a clear label so screen readers announce the row and column meaning.',
      },
      {
        guidance: true,
        description:
          'Keep selectable cells as the only focusable elements inside grid content. Put decorative or explanatory content inside the cell.',
      },
      {
        guidance: false,
        description:
          'Do not rebuild trigger ARIA, popover focus management, or roving tabindex in product code.',
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
    'Field+popover shell for rich custom selectors. Content render prop gets value/onChange/changeAction/close/isBusy/getOptionProps. Grid layout owns roving focus + column-preserving arrows.',
  propDescriptions: {
    label: 'Accessible field label.',
    value: 'Controlled value.',
    onChange: 'Commit value.',
    changeAction: 'Async action after onChange; drives optimistic value/busy.',
    children:
      'Render custom content from {value,onChange,changeAction,close,isBusy,getOptionProps}.',
    triggerLabel: 'Closed trigger label/content.',
    renderTrigger: 'Custom trigger content inside owned button.',
    layout: "Optional {type:'grid', columns} for grid keyboard navigation.",
    hasCloseOnChange: 'Close popup after value commit; default true.',
    getOptionProps: 'Render helper to spread onto selectable cells/buttons.',
  },
};
