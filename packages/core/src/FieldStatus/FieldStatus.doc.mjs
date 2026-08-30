// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'FieldStatus',
  displayName: 'Field Status',
  group: 'Field',
  category: 'Form Controls',
  isHiddenFromOverview: true,
  description:
    'Status message component for form field validation feedback. Messages are announced to screen readers through persistent live regions (assertive for errors, polite otherwise), so conditional mounting is safe.',
  theming: {
    targets: [
      {className: 'astryx-field-status', visualProps: ['type', 'variant']},
      {className: 'astryx-field-status-icon', visualProps: ['type']},
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
      'FieldStatus renders validation feedback for fields and field-like controls. Use it directly for custom controls that need the same error, warning, or success presentation as Field.',
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
    accessibility: [
      {name: 'Message association', description: 'Connect the FieldStatus `id` to its control with `aria-describedby` so the visible feedback is announced with the field.'},
      {name: 'Text contrast', description: 'The validation message must meet 4.5:1 against its rendered status background.'},
      {name: 'Icon and boundary', description: 'A label-redundant status icon may be decorative. Meaningful icons and any required control or status boundary need 3:1 against adjacent colors.'},
      {name: 'Announcement', description: 'Errors use assertive announcement and warning or success uses polite announcement. Keep the visible message specific enough to explain how to resolve the issue.'},
      {name: 'Color meaning', description: 'Do not rely on status color alone; the message must identify the error, warning, or success in text.'},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'Validation feedback message for fields/custom controls. Supports error, warning, success and attached/detached variants. Announced via persistent live regions (assertive for errors, polite otherwise).',
  usage: {
    bestPractices: [
      {
        guidance: true,
        description:
          'Use attached status below bordered inputs when message belongs to that input.',
      },
      {
        guidance: true,
        description:
          'Use detached status for checkboxes, switches, and custom controls where overlap is visually awkward.',
      },
      {
        guidance: false,
        description:
          'Use FieldStatus for general alerts or page-level notices; use Banner or Toast instead.',
      },
    ],
  },
  propDescriptions: {
    type: 'error/warning/success status tone',
    message: 'visible validation feedback text',
    id: 'id for aria-describedby association',
    variant: 'attached overlaps input; detached floats below',
  },
};
