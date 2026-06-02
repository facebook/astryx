// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Outline',
  displayName: 'Outline',
  group: 'Outline',
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
      {className: 'xds-outline', visualProps: ['size']},
      {className: 'xds-outline-item', visualProps: ['level'], states: ['active']},
    ],
  },
  components: [
    {
      name: 'XDSOutline',
      displayName: 'Outline',
      description:
        'Document outline navigation with sliding indicator track. Renders a flat heading list as anchor links with keyboard navigation, size variants, and scroll-spy active state when uncontrolled.',
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
          name: 'size',
          type: "'sm' | 'md'",
          description: "Size variant controlling item padding. 'sm' for dense UIs, 'md' for standard spacing.",
          default: "'md'",
        },
        {
          name: 'offset',
          type: 'number',
          description: 'Pixel offset from the top for scroll-spy activation threshold. Useful with fixed headers.',
          default: '0',
        },
        {
          name: 'scrollContainerRef',
          type: 'React.RefObject<HTMLElement | null>',
          description: 'Ref to scope scroll tracking to a specific container. Defaults to viewport.',
        },
        {
          name: 'hasScrollOnClick',
          type: 'boolean',
          description: 'Whether clicking an item smooth-scrolls to the target section.',
          default: 'true',
        },
        {
          name: 'onNavigateStart',
          type: '(id: string) => void',
          description: 'Callback fired when programmatic scroll begins (item clicked).',
        },
        {
          name: 'onNavigateEnd',
          type: '(id: string) => void',
          description: 'Callback fired when programmatic scroll ends and the target section is in view.',
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
import {XDSOutline} from '@xds/core/Outline';

const items = [
  {id: 'overview', label: 'Overview', level: 2},
  {id: 'installation', label: 'Installation', level: 2},
  {id: 'theming', label: 'Theming', level: 2},
  {id: 'tokens', label: 'Tokens', level: 3},
  {id: 'accessibility', label: 'Accessibility', level: 2},
];

// Uncontrolled: built-in scroll-spy tracks the topmost visible heading.
<XDSOutline items={items} />;
`,
        },
        {
          label: 'Compact (size="sm")',
          code: `
import {XDSOutline} from '@xds/core/Outline';

// Dense sidebars use the small variant; the sliding indicator
// automatically matches the shorter item height.
<XDSOutline items={items} size="sm" />;
`,
        },
        {
          label: 'Controlled active section',
          code: `
import {useState} from 'react';
import {XDSOutline} from '@xds/core/Outline';

function ControlledOutline() {
  const [activeId, setActiveId] = useState('overview');

  // Providing activeId disables built-in scroll-spy — you own the active state.
  return (
    <XDSOutline
      items={items}
      activeId={activeId}
      onActiveIdChange={setActiveId}
    />
  );
}
`,
        },
        {
          label: 'Inside a scroll container with a fixed header',
          code: `
import {useRef} from 'react';
import {XDSOutline} from '@xds/core/Outline';

function PanelOutline() {
  const scrollRef = useRef(null);

  return (
    <div style={{display: 'flex', gap: 24}}>
      <XDSOutline
        items={items}
        scrollContainerRef={scrollRef}
        offset={64}
      />
      <div ref={scrollRef} style={{height: 480, overflowY: 'auto'}}>
        {/* sections with matching ids: <h2 id="overview">…</h2> */}
      </div>
    </div>
  );
}
`,
        },
        {
          label: 'Custom highlight via onNavigateEnd',
          code: `
import {XDSOutline} from '@xds/core/Outline';

// Flash the target section once the smooth-scroll settles.
function HighlightOnArrive() {
  const handleNavigateEnd = id => {
    const el = document.getElementById(id);
    el?.animate(
      [{backgroundColor: 'var(--color-accent-muted)'}, {backgroundColor: 'transparent'}],
      {duration: 800, easing: 'ease-out'},
    );
  };

  return <XDSOutline items={items} onNavigateEnd={handleNavigateEnd} />;
}
`,
        },
        {
          label: 'Generate items from markdown',
          code: `
import {XDSOutline, useOutlineFromMarkdown} from '@xds/core/Outline';

function MarkdownOutline({markdown}) {
  // Derives {id, label, level} items from headings in the source.
  const items = useOutlineFromMarkdown(markdown);
  return <XDSOutline items={items} />;
}
`,
        },
      ],
    },
  ],
  usage: {
    description:
      'A table-of-contents sidebar for documentation pages, help centers, wikis, and long settings pages. Use it for navigation within a single page, not for app routes. Features a sliding indicator track and smooth-scroll on click.',
    bestPractices: [
      {guidance: true, description: 'Pass a flat ordered list of headings and let level control indentation.'},
      {guidance: true, description: 'Use activeId when custom scroll logic owns the active section.'},
      {guidance: true, description: 'Use scrollContainerRef and offset when content is inside a scroll container with a fixed header.'},
      {guidance: true, description: 'Use onNavigateEnd for custom highlight effects on the target section after scroll.'},
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
      {className: 'xds-outline', visualProps: ['size']},
      {className: 'xds-outline-item', visualProps: ['level'], states: ['active']},
    ],
  },
  components: [
    {
      name: 'XDSOutline',
      displayName: 'Outline',
      description:
        '文档大纲导航，带有滑动指示器轨道。将扁平标题列表渲染为锚点链接，支持键盘导航、尺寸变体和非受控模式下的滚动监听。',
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
          name: 'size',
          type: "'sm' | 'md'",
          description: "控制项目内边距的尺寸变体。'sm' 用于紧凑界面，'md' 为标准间距。",
          default: "'md'",
        },
        {
          name: 'offset',
          type: 'number',
          description: '滚动监听激活阈值的顶部像素偏移。适用于固定头部。',
          default: '0',
        },
        {
          name: 'scrollContainerRef',
          type: 'React.RefObject<HTMLElement | null>',
          description: '指定滚动跟踪的容器。默认为视口。',
        },
        {
          name: 'hasScrollOnClick',
          type: 'boolean',
          description: '点击项目是否平滑滚动到目标区域。',
          default: 'true',
        },
        {
          name: 'onNavigateStart',
          type: '(id: string) => void',
          description: '程序化滚动开始时触发的回调（点击项目时）。',
        },
        {
          name: 'onNavigateEnd',
          type: '(id: string) => void',
          description: '程序化滚动结束且目标区域可见时触发的回调。',
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
      {guidance: true, description: 'Use scrollContainerRef and offset when content is inside a scroll container with a fixed header.'},
      {guidance: true, description: 'Use onNavigateEnd for custom highlight effects on the target section after scroll.'},
      {guidance: true, description: 'Use useOutlineFromMarkdown or useOutlineFromDOM when headings are generated from content.'},
      {guidance: false, description: 'Use Outline for application navigation - use SideNav or TopNav for routes.'},
      {guidance: false, description: 'Use Outline for expandable hierarchy - use TreeList when nodes need expand and collapse.'},
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description:
    'Document outline/table-of-contents nav with sliding indicator track. Flat items array {id,label,level}; anchor links; keyboard nav; size variants (sm/md); uncontrolled scroll-spy via hybrid IntersectionObserver+scroll; controlled with activeId; smooth-scroll on click with navigate callbacks.',
  usage: {
    description:
      'A table-of-contents sidebar for documentation pages, help centers, wikis, and long settings pages. Use it for navigation within a single page, not for app routes.',
    bestPractices: [
      {guidance: true, description: 'Pass a flat ordered list of headings and let level control indentation.'},
      {guidance: true, description: 'Use activeId when custom scroll logic owns the active section.'},
      {guidance: true, description: 'Use scrollContainerRef and offset for scoped scroll tracking with fixed headers.'},
      {guidance: true, description: 'Use onNavigateEnd for custom highlight effects after scroll.'},
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
    size: "Size variant: 'sm' (compact) or 'md' (standard). Default: 'md'.",
    offset: 'Pixel offset for scroll-spy threshold. Default: 0.',
    scrollContainerRef: 'Ref to scope scroll tracking to a container.',
    hasScrollOnClick: 'Whether click smooth-scrolls. Default: true.',
    onNavigateStart: 'Fired when click-initiated scroll begins.',
    onNavigateEnd: 'Fired when click-initiated scroll completes.',
    xstyle: 'StyleX styles for layout. Must be stylex.create() value.',
  },
  components: [
    {
      name: 'XDSOutline',
      description:
        'Document outline nav with sliding indicator. Renders heading anchors with keyboard nav, size variants, and manages scroll-spy active state when uncontrolled.',
      propDescriptions: {
        items: 'Ordered OutlineItem[]: {id,label,level}. id should match target heading DOM id.',
        activeId: 'Controlled active heading id. Disables built-in scroll-spy.',
        onActiveIdChange: 'Called when active id changes from scroll-spy or click.',
        label: "Accessible nav label. Default: 'Table of contents'.",
        size: "Size variant: 'sm' | 'md'. Default: 'md'.",
        offset: 'Pixel offset for scroll-spy. Default: 0.',
        scrollContainerRef: 'Ref for scoped scroll tracking.',
        hasScrollOnClick: 'Click smooth-scrolls. Default: true.',
        onNavigateStart: 'Fired when scroll begins.',
        onNavigateEnd: 'Fired when scroll ends.',
        xstyle: 'StyleX styles for layout. Must be stylex.create() value.',
      },
    },
  ],
};
