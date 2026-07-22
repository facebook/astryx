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
    'sliding indicator',
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
      {className: 'astryx-outline', visualProps: ['density']},
      {className: 'astryx-outline-indicator'},
      {className: 'astryx-outline-item', visualProps: ['level'], states: ['active']},
    ],
  },
  components: [
    {
      name: 'Outline',
      displayName: 'Outline',
      description:
        'Document outline navigation with sliding indicator track. Renders a flat heading list as anchor links with a density variant and scroll-spy active state when uncontrolled.',
      props: [
        {
          name: 'items',
          type: 'OutlineItem[]',
          description:
            'Ordered heading items. Each item has id, label, and level (1-6). The id should match the target heading element id.',
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
          name: 'density',
          type: "'default' | 'compact'",
          description: "Density variant controlling item padding. 'compact' for dense UIs, 'default' for standard spacing.",
          default: "'default'",
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: `
import {Outline} from '@astryxdesign/core/Outline';

const items = [
  {id: 'overview', label: 'Overview', level: 2},
  {id: 'installation', label: 'Installation', level: 2},
  {id: 'theming', label: 'Theming', level: 2},
  {id: 'tokens', label: 'Tokens', level: 3},
  {id: 'accessibility', label: 'Accessibility', level: 2},
];

// Uncontrolled: built-in scroll-spy tracks the topmost visible heading.
<Outline items={items} />;
`,
        },
        {
          label: 'Compact (density="compact")',
          code: `
import {Outline} from '@astryxdesign/core/Outline';

// Dense sidebars use the compact variant; the sliding indicator
// automatically matches the shorter item height.
<Outline items={items} density="compact" />;
`,
        },
        {
          label: 'Controlled active section',
          code: `
import {useState} from 'react';
import {Outline} from '@astryxdesign/core/Outline';

function ControlledOutline() {
  const [activeId, setActiveId] = useState('overview');

  // Providing activeId disables built-in scroll-spy; you own the active state.
  return (
    <Outline
      items={items}
      activeId={activeId}
      onActiveIdChange={setActiveId}
    />
  );
}
`,
        },
        {
          label: 'Generate items from markdown',
          code: `
import {Outline, useOutlineFromMarkdown} from '@astryxdesign/core/Outline';

function MarkdownOutline({markdown}) {
  // Derives {id, label, level} items from headings in the source.
  const items = useOutlineFromMarkdown(markdown);
  return <Outline items={items} />;
}
`,
        },
      ],
    },
  ],
  usage: {
    description:
      'A table-of-contents sidebar for documentation pages, help centers, wikis, and long settings pages. Use it for navigation within a single page, not for app routes. Features a sliding indicator track that animates to the active heading.',
    bestPractices: [
      {guidance: true, description: 'Pass a flat ordered list of headings and let level control indentation.'},
      {guidance: true, description: 'Use activeId when custom scroll logic owns the active section.'},
      {guidance: true, description: 'Use density="compact" in dense sidebars where vertical space is tight.'},
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
      {className: 'astryx-outline', visualProps: ['density']},
      {className: 'astryx-outline-indicator'},
      {className: 'astryx-outline-item', visualProps: ['level'], states: ['active']},
    ],
  },
  components: [
    {
      name: 'Outline',
      displayName: 'Outline',
      description:
        '文档大纲导航，带有滑动指示器轨道。将扁平标题列表渲染为锚点链接，支持密度变体和非受控模式下的滚动监听。',
      props: [
        {
          name: 'items',
          type: 'OutlineItem[]',
          description:
            '有序标题项。每项包含 id、label 和 level (1-6)。id 应匹配目标标题元素的 id。',
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
          name: 'density',
          type: "'default' | 'compact'",
          description: "控制项目内边距的密度变体。'compact' 用于紧凑界面，'default' 为标准间距。",
          default: "'default'",
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
      {guidance: true, description: 'Use density="compact" in dense sidebars where vertical space is tight.'},
      {guidance: true, description: 'Use useOutlineFromMarkdown or useOutlineFromDOM when headings are generated from content.'},
      {guidance: false, description: 'Use Outline for application navigation - use SideNav or TopNav for routes.'},
      {guidance: false, description: 'Use Outline for expandable hierarchy - use TreeList when nodes need expand and collapse.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Document outline/table-of-contents nav with sliding indicator track. Flat items array {id,label,level}; anchor links; density variant (default/compact); uncontrolled scroll-spy by scroll position (last heading past its scroll-margin-top line; first item at top, last at bottom); controlled with activeId; smooth-scroll on click that pins the active item until the next manual scroll.',
  usage: {
    description:
      'A table-of-contents sidebar for documentation pages, help centers, wikis, and long settings pages. Use it for navigation within a single page, not for app routes.',
    bestPractices: [
      {guidance: true, description: 'Pass a flat ordered list of headings and let level control indentation.'},
      {guidance: true, description: 'Use activeId when custom scroll logic owns the active section.'},
      {guidance: true, description: 'Use density="compact" in dense sidebars where vertical space is tight.'},
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
    density: "Density variant: 'default' (standard) or 'compact'. Default: 'default'.",
    xstyle: 'StyleX styles for layout. Must be stylex.create() value.',
  },
  components: [
    {
      name: 'Outline',
      displayName: 'Outline',
      description:
        'Document outline nav with sliding indicator. Renders heading anchors with a density variant and manages scroll-spy active state when uncontrolled.',
      propDescriptions: {
        items: 'Ordered OutlineItem[]: {id,label,level}. id should match target heading DOM id.',
        activeId: 'Controlled active heading id. Disables built-in scroll-spy.',
        onActiveIdChange: 'Called when active id changes from scroll-spy or click.',
        label: "Accessible nav label. Default: 'Table of contents'.",
        density: "Density variant: 'default' | 'compact'. Default: 'default'.",
        xstyle: 'StyleX styles for layout. Must be stylex.create() value.',
      },
    },
  ],
};
