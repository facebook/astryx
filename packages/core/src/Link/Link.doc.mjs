/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Link',
  description:
    'XDSLink component for styled anchor links with multiple variants and features, plus polymorphic link infrastructure for rendering custom link components (Next.js Link, React Router Link, etc.).',
  features: [
    "Color control: Uses XDSText color prop ('active' default, 'secondary', 'inherit', etc.)",
    'External links: Opens in new tab with external link icon',
    'Tooltip support: Display tooltip text on hover',
    'Underline control: Always show underline or only on hover',
    'Inline support: Inherits parent font styles when used within text',
    'Standalone mode: Applies base font sizing for independent links',
    'Disabled state: Visual and interaction disabled',
    'Focus visible: Accessible focus outline',
    'Polymorphic link: Render as a custom component via `as` prop or XDSLinkProvider',
  ],
  examples: [
    {
      label: 'Basic link',
      code: '<XDSLink label="Documentation" href="/docs">Documentation</XDSLink>',
    },
    {
      label: 'External link (opens in new tab with icon)',
      code: '<XDSLink label="GitHub" href="https://github.com" isExternalLink>GitHub</XDSLink>',
    },
    {
      label: 'Link with tooltip',
      code: `<XDSLink label="Settings" href="/settings" tooltip="Configure your preferences">
  Settings
</XDSLink>`,
    },
    {
      label: 'Always underlined link',
      code: '<XDSLink label="Privacy Policy" href="/privacy" hasUnderline>Privacy Policy</XDSLink>',
    },
    {
      label: 'Inline within text (inherits parent font styles)',
      code: '<XDSText>Read the <XDSLink label="docs" href="/docs">documentation</XDSLink> for more info.</XDSText>',
    },
    {
      label: 'Standalone link',
      code: '<XDSLink label="Settings" href="/settings" isStandalone>Settings</XDSLink>',
    },
    {
      label: 'Disabled link',
      code: '<XDSLink label="Disabled" href="/disabled" isDisabled>Disabled Link</XDSLink>',
    },
    {
      label: 'Provider (global default) — Next.js',
      code: `import Link from 'next/link';
import {XDSLinkProvider} from '@xds/core/Link';

<XDSLinkProvider component={Link}>
  <App />
</XDSLinkProvider>`,
    },
    {
      label: 'Per-component override (as prop)',
      code: `import {Link as RouterLink} from 'react-router-dom';

<XDSLink label="Docs" href="/docs" as={RouterLink}>
  Docs
</XDSLink>`,
    },
    {
      label: 'Hook: useXDSLinkComponent',
      code: `import {useXDSLinkComponent} from '@xds/core/Link';

function MyComponent({as}: {as?: XDSLinkComponentType}) {
  const LinkComponent = useXDSLinkComponent(as);
  return <LinkComponent href="/foo">Click me</LinkComponent>;
}`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-link', visualProps: ['color']},
    ],
  },
  notes: [
    'By default, links inherit font family, size, line-height, and weight from parent elements',
    'Use isStandalone prop when the link is not inline within other text content',
    'isExternalLink automatically sets target="_blank" and rel="noopener noreferrer" for security',
    'Disabled state uses aria-disabled and pointer-events: none for accessibility',
    'Tooltip wraps the link in XDSTooltip component when provided',
    'XDSLinkComponentType is React.ElementType, allowing both string tags ("a") and custom components',
    'XDSLinkContext is separated from XDSLinkProvider (mirrors ThemeContext/XDSTheme pattern) so consumers can import the context without the full provider',
    'XDSLinkProvider memoizes its context value to prevent unnecessary re-renders',
    'Polymorphic link resolution order: (1) per-component as prop (highest priority), (2) XDSLinkProvider context, (3) native <a> element (default)',
    'All XDS components that render links (XDSLink, XDSTopNavItem, XDSSideNavItem, XDSBreadcrumbItem, XDSTab) support rendering as a custom link component',
  ],
  components: [
    {
      name: 'XDSLink',
      description:
        'Styled anchor link with variants, external link support, and polymorphic rendering.',
      props: [
        {
          name: 'as',
          type: 'XDSLinkComponentType',
          description: 'Custom component to render instead of <a>',
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label',
          required: true,
        },
        {
          name: 'href',
          type: 'string',
          description: 'Link destination URL',
        },
        {
          name: 'hasUnderline',
          type: 'boolean',
          description: 'Always show underline',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: 'Disables the link',
          default: 'false',
        },
        {
          name: 'isExternalLink',
          type: 'boolean',
          description: 'Opens in new tab with external icon',
          default: 'false',
        },
        {
          name: 'target',
          type: 'string',
          description: 'Where to open linked document',
        },
        {
          name: 'onClick',
          type: 'MouseEventHandler',
          description: 'Click event handler',
        },
        {
          name: 'tooltip',
          type: 'string',
          description: 'Tooltip text displayed on hover',
        },
        {
          name: 'isStandalone',
          type: 'boolean',
          description: 'Applies base font sizing',
          default: 'false',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Link content',
          required: true,
        },
      ],
      examples: [
        {
          label: 'Basic',
          code: '<XDSLink label="Documentation" href="/docs">Documentation</XDSLink>',
        },
        {
          label: 'External link',
          code: '<XDSLink label="GitHub" href="https://github.com" isExternalLink>GitHub</XDSLink>',
        },
        {
          label: 'With tooltip',
          code: `<XDSLink label="Settings" href="/settings" tooltip="Configure your preferences">
  Settings
</XDSLink>`,
        },
        {
          label: 'With custom component (as prop)',
          code: `<XDSLink label="Docs" href="/docs" as={RouterLink}>
  Docs
</XDSLink>`,
        },
      ],
    },
    {
      name: 'XDSLinkProvider',
      description:
        'Provider that sets the default link component for all XDS link components in the subtree.',
      props: [
        {
          name: 'component',
          type: 'XDSLinkComponentType',
          description: 'Component to use for all link elements',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Subtree',
          required: true,
        },
      ],
      examples: [
        {
          label: 'With Next.js Link',
          code: `import Link from 'next/link';
import {XDSLinkProvider} from '@xds/core/Link';

<XDSLinkProvider component={Link}>
  <App />
</XDSLinkProvider>`,
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').ComponentDoc} */
export const docsZh = {
  name: 'Link',
  description:
    'XDSLink 组件，用于创建带有多种变体和功能的样式化锚点链接，以及用于渲染自定义链接组件（Next.js Link、React Router Link 等）的多态链接基础设施。',
  features: [
    "颜色控制：使用 XDSText 的 color 属性（默认 'active'、'secondary'、'inherit' 等）",
    '外部链接：在新标签页中打开，带有外部链接图标',
    '工具提示支持：悬停时显示提示文本',
    '下划线控制：始终显示下划线或仅在悬停时显示',
    '内联支持：在文本中使用时继承父级字体样式',
    '独立模式：为独立链接应用基础字体大小',
    '禁用状态：视觉和交互均被禁用',
    '焦点可见：无障碍焦点轮廓',
    '多态链接：通过 `as` 属性或 XDSLinkProvider 渲染为自定义组件',
  ],
  examples: [
    {
      label: '基础链接',
      code: '<XDSLink label="Documentation" href="/docs">Documentation</XDSLink>',
    },
    {
      label: '外部链接（在新标签页中打开，带图标）',
      code: '<XDSLink label="GitHub" href="https://github.com" isExternalLink>GitHub</XDSLink>',
    },
    {
      label: '带工具提示的链接',
      code: `<XDSLink label="Settings" href="/settings" tooltip="Configure your preferences">
  Settings
</XDSLink>`,
    },
    {
      label: '始终带下划线的链接',
      code: '<XDSLink label="Privacy Policy" href="/privacy" hasUnderline>Privacy Policy</XDSLink>',
    },
    {
      label: '文本内联（继承父级字体样式）',
      code: '<XDSText>Read the <XDSLink label="docs" href="/docs">documentation</XDSLink> for more info.</XDSText>',
    },
    {
      label: '独立链接',
      code: '<XDSLink label="Settings" href="/settings" isStandalone>Settings</XDSLink>',
    },
    {
      label: '禁用链接',
      code: '<XDSLink label="Disabled" href="/disabled" isDisabled>Disabled Link</XDSLink>',
    },
    {
      label: 'Provider（全局默认）— Next.js',
      code: `import Link from 'next/link';
import {XDSLinkProvider} from '@xds/core/Link';

<XDSLinkProvider component={Link}>
  <App />
</XDSLinkProvider>`,
    },
    {
      label: '单组件覆盖（as 属性）',
      code: `import {Link as RouterLink} from 'react-router-dom';

<XDSLink label="Docs" href="/docs" as={RouterLink}>
  Docs
</XDSLink>`,
    },
    {
      label: 'Hook：useXDSLinkComponent',
      code: `import {useXDSLinkComponent} from '@xds/core/Link';

function MyComponent({as}: {as?: XDSLinkComponentType}) {
  const LinkComponent = useXDSLinkComponent(as);
  return <LinkComponent href="/foo">Click me</LinkComponent>;
}`,
    },
  ],
  theming: {
    targets: [
      {className: 'xds-link', visualProps: ['color']},
    ],
  },
  notes: [
    '默认情况下，链接从父元素继承字体族、大小、行高和字重',
    '当链接不在其他文本内容中内联使用时，使用 isStandalone 属性',
    'isExternalLink 自动设置 target="_blank" 和 rel="noopener noreferrer" 以确保安全',
    '禁用状态使用 aria-disabled 和 pointer-events: none 以确保无障碍性',
    '提供 tooltip 时，链接会被包裹在 XDSTooltip 组件中',
    'XDSLinkComponentType 是 React.ElementType，允许字符串标签（"a"）和自定义组件',
    'XDSLinkContext 与 XDSLinkProvider 分离（与 ThemeContext/XDSTheme 模式一致），以便消费者可以在不引入完整 Provider 的情况下导入上下文',
    'XDSLinkProvider 对其上下文值进行缓存以防止不必要的重新渲染',
    '多态链接解析顺序：（1）单组件 as 属性（最高优先级），（2）XDSLinkProvider 上下文，（3）原生 <a> 元素（默认）',
    '所有渲染链接的 XDS 组件（XDSLink、XDSTopNavItem、XDSSideNavItem、XDSBreadcrumbItem、XDSTab）都支持渲染为自定义链接组件',
  ],
  components: [
    {
      name: 'XDSLink',
      description:
        '带有变体、外部链接支持和多态渲染的样式化锚点链接。',
      props: [
        {
          name: 'as',
          type: 'XDSLinkComponentType',
          description: '用于替代 <a> 渲染的自定义组件',
        },
        {
          name: 'label',
          type: 'string',
          description: '无障碍标签',
          required: true,
        },
        {
          name: 'href',
          type: 'string',
          description: '链接目标 URL',
        },
        {
          name: 'hasUnderline',
          type: 'boolean',
          description: '始终显示下划线',
          default: 'false',
        },
        {
          name: 'isDisabled',
          type: 'boolean',
          description: '禁用链接',
          default: 'false',
        },
        {
          name: 'isExternalLink',
          type: 'boolean',
          description: '在新标签页中打开，带外部图标',
          default: 'false',
        },
        {
          name: 'target',
          type: 'string',
          description: '链接文档的打开位置',
        },
        {
          name: 'onClick',
          type: 'MouseEventHandler',
          description: '点击事件处理器',
        },
        {
          name: 'tooltip',
          type: 'string',
          description: '悬停时显示的工具提示文本',
        },
        {
          name: 'isStandalone',
          type: 'boolean',
          description: '应用基础字体大小',
          default: 'false',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '链接内容',
          required: true,
        },
      ],
      examples: [
        {
          label: '基础',
          code: '<XDSLink label="Documentation" href="/docs">Documentation</XDSLink>',
        },
        {
          label: '外部链接',
          code: '<XDSLink label="GitHub" href="https://github.com" isExternalLink>GitHub</XDSLink>',
        },
        {
          label: '带工具提示',
          code: `<XDSLink label="Settings" href="/settings" tooltip="Configure your preferences">
  Settings
</XDSLink>`,
        },
        {
          label: '使用自定义组件（as 属性）',
          code: `<XDSLink label="Docs" href="/docs" as={RouterLink}>
  Docs
</XDSLink>`,
        },
      ],
    },
    {
      name: 'XDSLinkProvider',
      description:
        '为子树中所有 XDS 链接组件设置默认链接组件的 Provider。',
      props: [
        {
          name: 'component',
          type: 'XDSLinkComponentType',
          description: '用于所有链接元素的组件',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: '子树',
          required: true,
        },
      ],
      examples: [
        {
          label: '搭配 Next.js Link',
          code: `import Link from 'next/link';
import {XDSLinkProvider} from '@xds/core/Link';

<XDSLinkProvider component={Link}>
  <App />
</XDSLinkProvider>`,
        },
      ],
    },
  ],
};

/** @type {string} */
export const docsDense = `TODO: apply dense protocol`;
