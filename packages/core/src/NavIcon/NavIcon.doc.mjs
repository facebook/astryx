/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'NavIcon',
  description:
    'Circular icon container with accent background for navigation headers.',
  showcase: {
    aspectRatio: 16 / 4,
    code: '<XDSNavIcon label="Home" />',
  },
  keywords: ["navicon","iconbutton","toolbar icon","appbar icon","nav button"],
  features: [
    'Shared — used in both XDSTopNavHeading and XDSPageNavHeader',
    'Accent background — uses --color-accent with --color-on-accent contrast',
    'Fixed size — renders at the medium (--size-element-md) design token size',
  ],
  props: [
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'The icon element to render inside the circular background. Should be an XDSIcon or similar icon component.',
      required: true,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-navicon'},
    ],
  },
  usage: {
    summary: 'Circular icon container with accent background for navigation headers.',
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'NavIcon',
  description:
    '用于导航头部的带强调色背景的圆形图标容器。',
  features: [
    '共享 — 同时用于 XDSTopNavHeading 和 XDSPageNavHeader',
    '强调色背景 — 使用 --color-accent 配合 --color-on-accent 对比色',
    '固定尺寸 — 以中等尺寸 (--size-element-md) 设计令牌渲染',
  ],
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
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Circular icon container w/ accent background for navigation headers.',
  features: [
    'Shared; used in both XDSTopNavHeading + XDSPageNavHeader',
    'Accent background; uses --color-accent w/ --color-on-accent contrast',
    'Fixed size; renders at medium (--size-element-md) design token size',
  ],
  propDescriptions: {
    icon: 'Icon element inside circular background. Should be XDSIcon or similar.',
  },
};
