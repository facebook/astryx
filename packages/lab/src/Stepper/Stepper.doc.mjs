// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Stepper',
  displayName: 'Stepper',
  category: 'Navigation',
  group: 'Stepper',
  keywords: ['stepper', 'steps', 'wizard', 'workflow', 'progress', 'multi-step', 'form wizard', 'onboarding'],
  usage: {
    description:
      'Steppers display progress through a sequence of logical and numbered steps. Use them for multi-step workflows like forms, onboarding flows, or checkout processes where users need to see their position and the steps ahead.',
    bestPractices: [
      {guidance: true, description: 'Keep step labels short and descriptive — "Payment" not "Enter your payment information".'},
      {guidance: true, description: 'Use the vertical orientation for narrow containers or when steps have longer descriptions.'},
      {guidance: true, description: 'Provide onStepClick for non-linear workflows where users may need to revisit earlier steps.'},
      {guidance: false, description: 'Use a stepper for fewer than 3 steps — a simple heading or progress bar works better.'},
      {guidance: false, description: 'Use more than 7 steps — consider grouping related steps or using a different pattern.'},
    ],
    anatomy: [
      {name: 'Step indicator', required: true, description: 'A numbered circle showing the step position. Shows a checkmark when completed.'},
      {name: 'Connector', required: true, description: 'A line between step indicators. Filled when the preceding step is completed.'},
      {name: 'Label', required: true, description: 'Text identifying the step.'},
      {name: 'Description', required: false, description: 'Supporting text below the label with additional context.'},
    ],
  },
  theming: {
    targets: [
      {className: 'xds-stepper', visualProps: ['orientation']},
      {className: 'xds-step', states: ['active', 'completed', 'upcoming', 'disabled', 'error']},
      {className: 'xds-step-indicator', states: ['active', 'completed', 'upcoming', 'disabled', 'error']},
      {className: 'xds-step-connector'},
    ],
  },
  components: [
    {
      name: 'XDSStepper',
      displayName: 'Stepper',
      description:
        'Container component that manages step state and renders steps in horizontal or vertical orientation.',
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
          description: 'XDSStep elements to render in the stepper.',
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
          description: 'Called when a step indicator is clicked. Enables non-linear navigation. Completed and active steps become clickable.',
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the stepper navigation landmark.',
          default: "'Progress'",
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description: 'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],
    },
    {
      name: 'XDSStep',
      displayName: 'Step',
      description:
        'Individual step within a stepper. Renders a numbered indicator, connector line, and label with optional description.',
      props: [
        {
          name: 'step',
          type: 'number',
          description: 'Zero-based index of this step. Used to determine active/completed state relative to the parent activeStep.',
          required: true,
        },
        {
          name: 'label',
          type: 'string',
          description: 'Step label text displayed below (horizontal) or beside (vertical) the indicator.',
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
          description: 'Custom icon to replace the step number or checkmark indicator.',
          slotElements: [{__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}],
        },
        {
          name: 'isCompleted',
          type: 'boolean',
          description: 'Override the auto-computed completed state. By default, steps before activeStep are completed.',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Disables interaction and dims the step indicator and label.',
          default: 'false',
        },
        {
          name: 'hasError',
          type: 'boolean',
          description: 'Shows an error state on the step indicator and label.',
          default: 'false',
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

/** @type {import('../docs-types').TranslationDoc} */
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
      name: 'XDSStepper',
      displayName: 'Stepper',
      description: 'container managing step state w/ horizontal/vertical layout',
      propDescriptions: {
        activeStep: 'zero-based active step index',
        children: 'XDSStep elements',
        orientation: 'horizontal or vertical layout',
        onStepClick: 'enables non-linear navigation',
        label: 'nav landmark aria-label',
        xstyle: 'StyleX layout customization',
      },
    },
    {
      name: 'XDSStep',
      displayName: 'Step',
      description: 'individual step w/ indicator, connector, label',
      propDescriptions: {
        step: 'zero-based step index',
        label: 'step label text',
        description: 'supporting text below label',
        icon: 'custom icon replacing number/check',
        isCompleted: 'override auto-completed state',
        isDisabled: 'disable interaction',
        hasError: 'error state on indicator and label',
      },
    },
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
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
      {className: 'xds-step', states: ['active', 'completed', 'upcoming', 'disabled', 'error']},
      {className: 'xds-step-indicator', states: ['active', 'completed', 'upcoming', 'disabled', 'error']},
      {className: 'xds-step-connector'},
    ],
  },
  components: [
    {
      name: 'XDSStepper',
      displayName: 'Stepper',
      description: '容器组件，管理步骤状态并以水平或垂直方向渲染步骤。',
      props: [
        {name: 'activeStep', type: 'number', description: '当前活动步骤的从零开始的索引。', required: true},
        {name: 'children', type: 'ReactNode', description: '要在步骤器中渲染的 XDSStep 元素。', required: true},
        {name: 'orientation', type: "'horizontal' | 'vertical'", description: '步骤器的布局方向。', default: "'horizontal'"},
        {name: 'onStepClick', type: '(index: number) => void', description: '点击步骤指示器时调用。启用非线性导航。'},
        {name: 'label', type: 'string', description: '步骤器导航地标的无障碍标签。', default: "'Progress'"},
        {name: 'xstyle', type: 'StyleXStyles', description: '用于布局自定义的 StyleX 样式。'},
      ],
    },
    {
      name: 'XDSStep',
      displayName: 'Step',
      description: '步骤器中的单个步骤。渲染编号指示器、连接线和带可选描述的标签。',
      props: [
        {name: 'step', type: 'number', description: '此步骤的从零开始的索引。', required: true},
        {name: 'label', type: 'string', description: '步骤标签文本。', required: true},
        {name: 'description', type: 'string', description: '标签下方的可选描述。'},
        {name: 'icon', type: 'ReactNode', description: '替换步骤编号或勾选指示器的自定义图标。'},
        {name: 'isCompleted', type: 'boolean', description: '覆盖自动计算的完成状态。'},
        {name: 'isDisabled', type: 'boolean', description: '禁用交互并使步骤指示器和标签变暗。', default: 'false'},
        {name: 'hasError', type: 'boolean', description: '在步骤指示器和标签上显示错误状态。', default: 'false'},
      ],
    },
  ],
};
