// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceTranslationDoc} */

export const docsZh = {
  description: 'Theme 提供者、自定义主题、亮/暗模式和组件样式覆盖。',
  sections: [
    { section: 'Quick Start', title: '快速开始', content: [null, null, null, null, { type: 'prose', text: '默认导入使用运行时样式注入。/built 导入使用预编译 CSS（需配合 theme.css）。' }] },
    { section: 'Available Themes', title: '可用主题', content: [null, null, { type: 'prose', text: '已发布主题：neutral（推荐起点）、butter、chocolate、gothic（仅暗色）、matcha、stone、y2k。@astryxdesign/theme-{name} = 源码版（运行时注入）。@astryxdesign/theme-{name}/built = 优化版（配合 theme.css）。' }] },
    { section: 'Theme Props', title: 'Theme 属性', content: [null] },
    { section: 'Creating a Custom Theme', title: '创建自定义主题', content: [{ type: 'prose', text: '使用 CLI 向导（推荐）或手动 defineTheme。只覆盖与默认值不同的令牌。' }, null] },
    { section: 'defineTheme', title: 'defineTheme', content: [{ type: 'prose', text: '支持比例配置（typography、radius、motion）+ 显式令牌覆盖 + 组件覆盖。' }, null, null] },
    { section: 'Building Themes for Production', title: '生产构建', content: [{ type: 'prose', text: "`astryx theme build` 输出 `.css`、带有 `__built:true` 的 `.js` 和 `.d.ts`。当 `icons` 直接引用未使用别名的具名导入时（例如 `import {oceanIcons} from './icons'` 与 `icons: oceanIcons`），生成的 JavaScript 会导入配套图标模块；调用方必须另行编译该模块。" }, null, null, null, { type: 'prose', text: '`astryx theme build` 不会编译或打包图标源码。`--icons-specifier` 只会更改上述配套模块在生成的 JavaScript 中的模块说明符。该说明符相对于生成的 JavaScript 文件解析；调用方必须在该位置产出可加载的模块。' }, null, { type: 'prose', text: '`lucide-react` 是此示例注册表使用的图标依赖。请将其替换为你的注册表所用的图标依赖，或移除该 `--external` 标志，将此依赖打包进去。' }] },
    { section: 'Runtime vs Built Themes', title: '运行时 vs 构建', content: [{ type: 'prose', text: '运行时：useInsertionEffect 在客户端注入样式。构建：静态 CSS 在首次渲染时就存在。SSR 应用请使用 /built + theme.css。' }, null, null, null] },
    { section: 'Light/Dark Mode', title: '亮/暗模式', content: [{ type: 'prose', text: "令牌值使用 [light, dark] 元组实现自动模式切换。Theme 上 mode='system'（默认）跟随系统偏好。" }, null, null] },
    { section: 'Nesting Themes', title: '嵌套主题', content: [{ type: 'prose', text: '将不同部分包裹在独立的 <Theme> 提供者中。' }, null] },
    { section: 'useTheme Hook', title: 'useTheme 钩子', content: [null, { type: 'prose', text: '这是只读的。要更改主题/模式，在应用层管理状态并传递给 <Theme>。' }] },
  ],
};
