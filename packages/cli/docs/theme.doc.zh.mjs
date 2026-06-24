// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceTranslationDoc} */

export const docsZh = {
  description: 'Theme 提供者、自定义主题、亮/暗模式和组件样式覆盖。',
  sections: [
    { title: '快速开始', content: [null, null, { type: 'prose', text: '默认导入使用运行时样式注入。/built 导入使用预编译 CSS（需配合 theme.css）。' }] },
    { title: '可用主题', content: [null, { type: 'prose', text: '已发布主题：neutral（推荐起点）、butter、chocolate、gothic（仅暗色）、matcha、stone、y2k。@astryxdesign/theme-{name} = 源码版（运行时注入）。@astryxdesign/theme-{name}/built = 优化版（配合 theme.css）。' }] },
    { title: 'Theme 属性', content: [null] },
    { title: '创建自定义主题', content: [{ type: 'prose', text: '使用 CLI 向导（推荐）或手动 defineTheme。只覆盖与默认值不同的令牌。' }, null] },
    { title: 'defineTheme', content: [{ type: 'prose', text: '支持比例配置（typography、radius、motion）+ 显式令牌覆盖 + 组件覆盖。' }, null, null] },
    { title: '生产构建', content: [{ type: 'prose', text: 'npx astryx theme build 将 defineTheme 编译为静态 CSS。输出 .css + .js（__built:true）+ .d.ts。' }, null, null, null, null] },
    { title: '运行时 vs 构建', content: [{ type: 'prose', text: '运行时：useInsertionEffect 在客户端注入样式。构建：静态 CSS 在首次渲染时就存在。SSR 应用请使用 /built + theme.css。' }, null, null, null] },
    { title: '亮/暗模式', content: [{ type: 'prose', text: "令牌值使用 [light, dark] 元组实现自动模式切换。Theme 上 mode='system'（默认）跟随系统偏好。" }, null, null] },
    { title: '嵌套主题', content: [{ type: 'prose', text: '将不同部分包裹在独立的 <Theme> 提供者中。' }, null] },
    { title: 'useTheme 钩子', content: [null, { type: 'prose', text: '这是只读的。要更改主题/模式，在应用层管理状态并传递给 <Theme>。' }] },
  ],
};
