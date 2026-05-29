// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'NavIcon',
  displayName: 'Nav Icon',
  category: 'Navigation',
  isHiddenFromOverview: true,
  hidden: false,
  keywords: ["navicon","iconbutton","toolbar icon","appbar icon","nav button"],
  props: [
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'The icon element to render inside the circular background. Should be an XDSIcon or similar icon component.',
      required: true,
      slotElements: [{__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}}],
    },
  ],
  theming: {
    targets: [
      {className: 'xds-navicon'},
    ],
  },
  usage: {
    description:
      'NavIcon is a circular icon container with an accent-colored background. Use it in navigation headers such as TopNavHeading and PageNavHeader to visually identify a section or application.',
    bestPractices: [
      { guidance: true, description: 'Use in navigation headers to provide a recognizable visual anchor for the section.' },
      { guidance: true, description: 'Pass an XDSIcon or similarly sized icon component to ensure proper proportions.' },
      { guidance: false, description: 'Use NavIcon for interactive purposes — it is a display-only container, not a button.' },
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'NavIcon',
  displayName: 'Nav Icon',
  props: [
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        '在圆形背景内渲染的图标元素。应为 XDSIcon 或类似的图标组件。',
      required: true,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-navicon'},
    ],
  },
  usage: {
    description:
      'NavIcon is a circular icon container with an accent-colored background. Use it in navigation headers such as TopNavHeading and PageNavHeader to visually identify a section or application.',
    bestPractices: [
      { guidance: true, description: 'Use in navigation headers to provide a recognizable visual anchor for the section.' },
      { guidance: true, description: 'Pass an XDSIcon or similarly sized icon component to ensure proper proportions.' },
      { guidance: false, description: 'Use NavIcon for interactive purposes — it is a display-only container, not a button.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Circular icon container w/ accent background for navigation headers.',
  usage: {
    description:
      'NavIcon is a circular icon container with an accent-colored background. Use it in navigation headers such as TopNavHeading and PageNavHeader to visually identify a section or application.',
    bestPractices: [
      { guidance: true, description: 'Use in navigation headers to provide a recognizable visual anchor for the section.' },
      { guidance: true, description: 'Pass an XDSIcon or similarly sized icon component to ensure proper proportions.' },
      { guidance: false, description: 'Use NavIcon for interactive purposes — it is a display-only container, not a button.' },
    ],
  },
  propDescriptions: {
    icon: 'Icon element inside circular background. Should be XDSIcon or similar.',
  },
};
