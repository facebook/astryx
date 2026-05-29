// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Outline',
  displayName: 'Outline',
  group: 'Outline',
  category: 'Navigation',
  keywords: [
    'outline',
    'table of contents',
    'toc',
    'heading navigation',
    'scroll spy',
    'documentation',
    'anchors',
  ],
  playground: {
    defaults: {
      items: [
        {id: 'overview', label: 'Overview', level: 2},
        {id: 'installation', label: 'Installation', level: 2},
        {id: 'configuration', label: 'Configuration', level: 3},
        {id: 'api-reference', label: 'API reference', level: 2},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'xds-outline'},
      {className: 'xds-outline-item', visualProps: ['level'], states: ['active']},
    ],
  },
  components: [
    {
      name: 'XDSOutline',
      displayName: 'Outline',
      description:
        'Document outline navigation. Renders a flat heading list as anchor links and manages scroll-spy active state when uncontrolled.',
      props: [
        {
          name: 'items',
          type: 'OutlineItem[]',
          description:
            'Ordered heading items. Each item has id, label, and level. The id should match the target heading element id.',
          required: true,
        },
        {
          name: 'activeId',
          type: 'string',
          description:
            'Currently active heading id. Providing this prop makes active state controlled and disables built-in scroll-spy.',
        },
        {
          name: 'onActiveIdChange',
          type: '(id: string) => void',
          description:
            'Called when the active item changes from built-in scroll-spy or from an outline link click.',
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the nav landmark.',
          default: "'Table of contents'",
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],
    },
  ],
  usage: {
    description:
      'A table-of-contents sidebar for documentation pages, help centers, wikis, and long settings pages. Use it for navigation within a single page, not for app routes.',
    bestPractices: [
      {guidance: true, description: 'Pass a flat ordered list of headings and let level control indentation.'},
      {guidance: true, description: 'Use activeId when custom scroll logic owns the active section.'},
      {guidance: true, description: 'Use useOutlineFromMarkdown or useOutlineFromDOM when headings are generated from content.'},
      {guidance: false, description: 'Use Outline for application navigation - use SideNav or TopNav for routes.'},
      {guidance: false, description: 'Use Outline for expandable hierarchy - use TreeList when nodes need expand and collapse.'},
    ],
  },
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Outline',
  displayName: 'Outline',
  group: 'Outline',
  theming: {
    targets: [
      {className: 'xds-outline'},
      {className: 'xds-outline-item', visualProps: ['level'], states: ['active']},
    ],
  },
  components: [
    {
      name: 'XDSOutline',
      displayName: 'Outline',
      description:
        '文档大纲导航。将扁平标题列表渲染为锚点链接，并在非受控模式下管理滚动监听的激活状态。',
      props: [
        {
          name: 'items',
          type: 'OutlineItem[]',
          description:
            '有序标题项。每项包含 id、label 和 level。id 应匹配目标标题元素的 id。',
          required: true,
        },
        {
          name: 'activeId',
          type: 'string',
          description:
            '当前激活的标题 id。提供后组件进入受控模式，并禁用内置滚动监听。',
        },
        {
          name: 'onActiveIdChange',
          type: '(id: string) => void',
          description: '当内置滚动监听或点击大纲链接改变激活项时调用。',
        },
        {
          name: 'label',
          type: 'string',
          description: 'nav 地标的无障碍标签。',
          default: "'Table of contents'",
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description: '用于布局自定义的 StyleX 样式。必须是 stylex.create() 值。',
        },
      ],
    },
  ],
  usage: {
    description:
      'A table-of-contents sidebar for documentation pages, help centers, wikis, and long settings pages. Use it for navigation within a single page, not for app routes.',
    bestPractices: [
      {guidance: true, description: 'Pass a flat ordered list of headings and let level control indentation.'},
      {guidance: true, description: 'Use activeId when custom scroll logic owns the active section.'},
      {guidance: true, description: 'Use useOutlineFromMarkdown or useOutlineFromDOM when headings are generated from content.'},
      {guidance: false, description: 'Use Outline for application navigation - use SideNav or TopNav for routes.'},
      {guidance: false, description: 'Use Outline for expandable hierarchy - use TreeList when nodes need expand and collapse.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Document outline/table-of-contents nav for same-page headings. Flat items array {id,label,level}; anchor links; uncontrolled scroll-spy via IntersectionObserver; controlled with activeId.',
  usage: {
    description:
      'A table-of-contents sidebar for documentation pages, help centers, wikis, and long settings pages. Use it for navigation within a single page, not for app routes.',
    bestPractices: [
      {guidance: true, description: 'Pass a flat ordered list of headings and let level control indentation.'},
      {guidance: true, description: 'Use activeId when custom scroll logic owns the active section.'},
      {guidance: true, description: 'Use useOutlineFromMarkdown or useOutlineFromDOM when headings are generated from content.'},
      {guidance: false, description: 'Use Outline for application navigation - use SideNav or TopNav for routes.'},
      {guidance: false, description: 'Use Outline for expandable hierarchy - use TreeList when nodes need expand and collapse.'},
    ],
  },
  propDescriptions: {
    items: 'Ordered OutlineItem[]: {id,label,level}. id should match target heading DOM id.',
    activeId: 'Controlled active heading id. Disables built-in scroll-spy.',
    onActiveIdChange: 'Called when active id changes from scroll-spy or click.',
    label: "Accessible nav label. Default: 'Table of contents'.",
    xstyle: 'StyleX styles for layout. Must be stylex.create() value.',
  },
  components: [
    {
      name: 'XDSOutline',
      displayName: 'Outline',
      description:
        'Document outline nav. Renders heading anchors and manages scroll-spy active state when uncontrolled.',
      propDescriptions: {
        items: 'Ordered OutlineItem[]: {id,label,level}. id should match target heading DOM id.',
        activeId: 'Controlled active heading id. Disables built-in scroll-spy.',
        onActiveIdChange: 'Called when active id changes from scroll-spy or click.',
        label: "Accessible nav label. Default: 'Table of contents'.",
        xstyle: 'StyleX styles for layout. Must be stylex.create() value.',
      },
    },
  ],
};
