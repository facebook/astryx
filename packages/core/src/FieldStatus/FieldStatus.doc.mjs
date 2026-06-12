// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */
export const docs = {
  name: 'FieldStatus',
  displayName: 'Field Status',
  group: 'Field',
  category: 'Data Input',
  isHiddenFromOverview: true,
  description:
    'Status message component for form field validation feedback.',
  theming: {
    targets: [
      {className: 'xds-field-status', visualProps: ['type', 'variant']},
    ],
  },
  props: [
    {
      name: 'type',
      type: "'error' | 'warning' | 'success'",
      description: 'Status type.',
      required: true,
    },
    {
      name: 'message',
      type: 'string',
      description: 'Status message text.',
      required: true,
    },
    {
      name: 'id',
      type: 'string',
      description: 'ID for aria-describedby association.',
    },
    {
      name: 'variant',
      type: "'attached' | 'detached'",
      description:
        'Visual variant: attached overlaps the input, detached floats below.',
      default: "'attached'",
    },
  ],
  usage: {
    description:
      'FieldStatus renders validation feedback for fields and field-like controls. Use it directly for custom controls that need the same error, warning, or success presentation as XDSField.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use attached status below bordered inputs when the message belongs to that input.',
      },
      {
        guidance: true,
        description:
          'Use detached status for controls like checkboxes, switches, and custom controls where overlap would be visually awkward.',
      },
      {
        guidance: false,
        description:
          'Use FieldStatus for general alerts or page-level notices; use Banner or Toast instead.',
      },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Validation feedback message for fields/custom controls. Supports error, warning, success and attached/detached variants.',
  propDescriptions: {
    type: 'error/warning/success status tone',
    message: 'visible validation feedback text',
    id: 'id for aria-describedby association',
    variant: 'attached overlaps input; detached floats below',
  },
};
