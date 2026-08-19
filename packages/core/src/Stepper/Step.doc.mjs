// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Step',
  subComponentOf: 'Stepper',
  displayName: 'Step',
  group: 'Stepper',
  category: 'Navigation',
  isHiddenFromOverview: true,
  description:
    'Individual step within a Stepper. Renders a progress-bar segment, an indicator, and a label with optional description. Progress (completed/active/not-started) is derived from the parent Stepper\u2019s activeStep and this step\u2019s step index.',
  props: [
    {
      name: 'step',
      type: 'number',
      description:
        'Zero-based index of this step. Used to derive progress (completed/active/not-started) relative to the parent activeStep.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Step label text.',
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description:
        'Optional description shown below the label for additional context.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Content rendered below the label and description. Useful in vertical steppers for form fields or detailed step content.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'Custom icon rendered inside the indicator. Accepts any node (e.g. an Icon). Takes precedence over the built-in number/check.',
      slotElements: [{__element: 'Icon', props: {icon: 'check', size: 'sm'}}],
    },
    {
      name: 'status',
      type: "'accent' | 'success' | 'warning' | 'error'",
      description:
        'Semantic color for the step. Controls color only and maps to the global Astryx semantic tokens. Leave unset for the progress-derived default coloring.',
    },
    {
      name: 'indicator',
      type: "'auto' | 'number' | 'none' | ReactNode",
      description:
        "What to show as the step indicator. 'auto' shows a number until completed then a check, 'number' always shows a numbered badge, 'none' hides it, or pass any ReactNode for a custom indicator.",
      default: "'auto'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Disables interaction and dims the step indicator and label.',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        'Marks the step as optional, appending an "Optional" affordance after the label.',
      default: 'false',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: 'Trailing content rendered at the end of the label row.',
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description:
        'Controls vertical padding of the step. Falls back to the stepper-level density when unset.',
    },
  ],
};
