// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ComponentDoc} */

export const docs = {
  name: 'Stepper',
  displayName: 'Stepper',
  category: 'Navigation',
  group: 'Stepper',
  keywords: ['stepper', 'steps', 'wizard', 'workflow', 'progress', 'multi-step', 'form wizard', 'onboarding'],
  usage: {
    description:
      'Steppers display progress through a sequence of logical and numbered steps. Use them for multi-step workflows like forms, onboarding flows, or checkout processes where users need to see their position and the steps ahead. Rendered as an ordered list (not a navigation landmark).',
    bestPractices: [
      {guidance: true, description: 'Keep step labels short and descriptive: "Payment" not "Enter your payment information".'},
      {guidance: true, description: 'Use the vertical orientation for narrow containers or when steps have longer descriptions.'},
      {guidance: true, description: 'Provide onStepClick for non-linear workflows where users may need to revisit earlier steps.'},
      {guidance: true, description: 'Use status only to apply a semantic color (accent/success/warning/error); pass a custom icon for richer indicators.'},
      {guidance: false, description: 'Use a stepper for fewer than 3 steps; a simple heading or progress bar works better.'},
      {guidance: false, description: 'Use more than 7 steps; consider grouping related steps or using a different pattern.'},
    ],
    anatomy: [
      {name: 'Progress bar', required: true, description: 'A 4px segmented bar per step. Filled for completed and active steps.'},
      {name: 'Indicator', required: false, description: 'A numbered badge, a check, or any custom icon. Controlled via the indicator and icon props.'},
      {name: 'Label', required: true, description: 'Text identifying the step.'},
      {name: 'Description', required: false, description: 'Supporting text below the label with additional context.'},
    ],
  },
  theming: {
    targets: [
      {className: 'xds-stepper', visualProps: ['orientation']},
      {className: 'xds-step', visualProps: ['progress', 'status']},
      {className: 'xds-step-bar'},
    ],
  },
  components: [
    {
      name: 'Stepper',
      displayName: 'Stepper',
      description:
        'Container component that manages step state and renders steps in horizontal or vertical orientation as an ordered list.',
      props: [
        {
          name: 'activeStep',
          type: 'number',
          description: 'Zero-based index of the currently active step. Steps before this index are marked as completed.',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Step elements to render in the stepper.',
          required: true,
        },
        {
          name: 'orientation',
          type: "'horizontal' | 'vertical'",
          description: 'Layout direction of the stepper.',
          default: "'horizontal'",
        },
        {
          name: 'onStepClick',
          type: '(index: number) => void',
          description: 'Called when a step is clicked. Enables non-linear navigation. All non-disabled steps become clickable, including not-started steps.',
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label describing the set of steps (applied to the ordered list).',
          default: "'Progress'",
        },
        {
          name: 'density',
          type: "'compact' | 'balanced' | 'spacious'",
          description: 'Controls the padding of all steps.',
          default: "'balanced'",
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description: 'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],
    },
    {
      name: 'Step',
      displayName: 'Step',
      description:
        'Individual step within a stepper. Renders a progress-bar segment, an indicator, and a label with optional description.',
      props: [
        {
          name: 'step',
          type: 'number',
          description: 'Zero-based index of this step. Used to derive progress (completed/active/not-started) relative to the parent activeStep.',
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
          description: 'Optional description shown below the label for additional context.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Content rendered below the label and description. Useful in vertical steppers for form fields or detailed step content.',
        },
        {
          name: 'icon',
          type: 'ReactNode',
          description: 'Custom icon rendered inside the indicator. Accepts any node (e.g. an Icon). Takes precedence over the built-in number/check.',
          slotElements: [{__element: 'Icon', props: {icon: 'check', size: 'sm'}}],
        },
        {
          name: 'status',
          type: "'accent' | 'success' | 'warning' | 'error'",
          description: 'Semantic color for the step. Controls color only and maps to the global XDS semantic tokens. Leave unset for the progress-derived default coloring.',
        },
        {
          name: 'indicator',
          type: "'auto' | 'number' | 'none' | ReactNode",
          description: "What to show as the step indicator. 'auto' shows a number until completed then a check, 'number' always shows a numbered badge, 'none' hides it, or pass any ReactNode for a custom indicator.",
          default: "'auto'",
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Disables interaction and dims the step indicator and label.',
          default: 'false',
        },
        {
          name: 'isOptional',
          type: 'boolean',
          description: 'Marks the step as optional, appending an "Optional" affordance after the label.',
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
          description: 'Controls vertical padding of the step. Falls back to the stepper-level density when unset.',
        },
      ],
    },
  ],
  playground: {
    defaults: {
      activeStep: 1,
    },
  },
};

/** @type {import('../../core/src/docs-types').TranslationDoc} */
export const docsDense = {
  description: 'numbered step sequence for multi-step workflows',
  usage: {
    description:
      'Steppers show progress through numbered steps. Use for forms, onboarding, checkout.',
    bestPractices: [
      {guidance: true, description: 'Keep step labels short. Use vertical in narrow containers.'},
      {guidance: true, description: 'Provide onStepClick for non-linear workflows.'},
      {guidance: false, description: 'Use for fewer than 3 or more than 7 steps.'},
    ],
  },
  components: [
    {
      name: 'Stepper',
      displayName: 'Stepper',
      description: 'container managing step state w/ horizontal/vertical layout',
      propDescriptions: {
        activeStep: 'zero-based active step index',
        children: 'Step elements',
        orientation: 'horizontal or vertical layout',
        onStepClick: 'enables non-linear navigation',
        label: 'ordered-list aria-label',
        density: 'padding of all steps',
        xstyle: 'StyleX layout customization',
      },
    },
    {
      name: 'Step',
      displayName: 'Step',
      description: 'individual step w/ progress bar, indicator, label',
      propDescriptions: {
        step: 'zero-based step index',
        label: 'step label text',
        description: 'supporting text below label',
        icon: 'custom icon for the indicator',
        status: 'semantic color: accent/success/warning/error (color only)',
        indicator: "'auto' | 'number' | 'none' | custom node",
        isDisabled: 'disable interaction',
        isOptional: 'append Optional affordance',
        endContent: 'trailing content in label row',
        density: 'per-step padding override',
      },
    },
  ],
};

/** @type {import('../../core/src/docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Stepper',
  displayName: 'Stepper',
  group: 'Stepper',
  usage: {
    description:
      '步骤器显示通过一系列逻辑编号步骤的进度。用于多步骤工作流程，如表单、入职流程或结账流程。',
    bestPractices: [
      {guidance: true, description: '保持步骤标签简短和描述性。'},
      {guidance: true, description: '在窄容器中使用垂直方向，或当步骤有较长描述时。'},
      {guidance: true, description: '为非线性工作流程提供 onStepClick。'},
      {guidance: false, description: '少于3个步骤时使用步骤器。'},
      {guidance: false, description: '超过7个步骤时使用步骤器。'},
    ],
  },
  theming: {
    targets: [
      {className: 'xds-stepper', visualProps: ['orientation']},
      {className: 'xds-step', visualProps: ['progress', 'status']},
      {className: 'xds-step-bar'},
    ],
  },
  components: [
    {
      name: 'Stepper',
      displayName: 'Stepper',
      description: '容器组件，管理步骤状态并以水平或垂直方向渲染步骤。',
      props: [
        {name: 'activeStep', type: 'number', description: '当前活动步骤的从零开始的索引。', required: true},
        {name: 'children', type: 'ReactNode', description: '要在步骤器中渲染的 Step 元素。', required: true},
        {name: 'orientation', type: "'horizontal' | 'vertical'", description: '步骤器的布局方向。', default: "'horizontal'"},
        {name: 'onStepClick', type: '(index: number) => void', description: '点击步骤时调用。启用非线性导航。'},
        {name: 'label', type: 'string', description: '有序列表的无障碍标签。', default: "'Progress'"},
        {name: 'density', type: "'compact' | 'balanced' | 'spacious'", description: '控制所有步骤的内边距。', default: "'balanced'"},
        {name: 'xstyle', type: 'StyleXStyles', description: '用于布局自定义的 StyleX 样式。'},
      ],
    },
    {
      name: 'Step',
      displayName: 'Step',
      description: '步骤器中的单个步骤。渲染进度条、指示器和带可选描述的标签。',
      props: [
        {name: 'step', type: 'number', description: '此步骤的从零开始的索引。', required: true},
        {name: 'label', type: 'string', description: '步骤标签文本。', required: true},
        {name: 'description', type: 'string', description: '标签下方的可选描述。'},
        {name: 'icon', type: 'ReactNode', description: '指示器中的自定义图标。'},
        {name: 'status', type: "'accent' | 'success' | 'warning' | 'error'", description: '步骤的语义颜色，仅控制颜色。'},
        {name: 'indicator', type: "'auto' | 'number' | 'none' | ReactNode", description: '指示器显示内容。', default: "'auto'"},
        {name: 'isDisabled', type: 'boolean', description: '禁用交互并使步骤指示器和标签变暗。', default: 'false'},
        {name: 'isOptional', type: 'boolean', description: '标记步骤为可选。', default: 'false'},
        {name: 'endContent', type: 'ReactNode', description: '标签行末尾的尾随内容。'},
        {name: 'density', type: "'compact' | 'balanced' | 'spacious'", description: '步骤的内边距覆盖。'},
      ],
    },
  ],
};
