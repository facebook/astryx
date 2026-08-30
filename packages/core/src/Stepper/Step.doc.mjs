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
    'Individual step within a Stepper. Renders a progress-bar segment, an indicator, and a label with optional description. Progress (completed/active/not-started) is derived from the parent Stepper\'s activeStep and this step\'s step index.',
  usage: {
    description:
      'Use Step inside Stepper to present one stage of a sequence with its label, progress state, optional description, and optional content.',
    accessibility: [
      {name: 'Status semantics', description: 'The visible status glyph is aria-hidden, so the component must continue exposing equivalent localized status text and current-step semantics to assistive technology.'},
      {name: 'Status indicator contrast', description: 'Success, warning, error, current, and completed glyphs are meaningful state indicators and need 3:1 against every surface on which the Stepper is supported. Measure custom indicators independently.'},
      {name: 'Label and description', description: 'Visible label and description text keep their applicable text contrast in every progress and status state; a passing icon does not excuse dim supporting text.'},
      {name: 'Disabled state', description: 'A genuinely disabled Step may use the inactive-control contrast exception. Current, completed, warning, and error states are not disabled merely because the Step is not clickable.'},
    ],
  },
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
      name: 'status',
      type: "'accent' | 'success' | 'warning' | 'error'",
      description:
        'Semantic status for the step. With the default auto indicator, success, warning, and error render distinct status glyphs plus localized assistive text; accent uses the progress-derived current/completed shape. Custom or number indicators must preserve an equivalent non-color cue. Leave unset for progress-derived styling.',
    },
    {
      name: 'indicator',
      type: "'auto' | 'number' | 'none' | ReactNode",
      description:
        "What to show as the step indicator. 'auto' shows a number until completed then a check, 'number' always shows a numbered badge, 'none' hides it, or pass any ReactNode (e.g. an Icon) for a fully custom indicator.",
      slotElements: [{__element: 'Icon', props: {icon: 'check', size: 'sm'}}],
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
  // A Step reads its progress from the parent Stepper's context and throws
  // without one, so the preview needs a real Stepper around it. Without this
  // block Step inherits Stepper's playground, which renders it bare and hands
  // it the parent's `activeStep`. The wrapper is vertical because that is the
  // orientation where one step shows its whole anatomy — indicator, label, and
  // description stacked — and `step` matches the wrapper's `activeStep` so the
  // preview opens on the current step rather than an inert upcoming one.
  playground: {
    wrapper: {
      component: 'Stepper',
      props: {activeStep: 1, orientation: 'vertical'},
    },
    defaults: {
      step: 1,
      label: 'Billing address',
      description: 'Used for invoices and tax',
    },
  },
};
