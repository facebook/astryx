// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceTranslationDoc} */

export const docsZh = {
  description: '如何使用和创建主题：请参阅"使用主题"了解如何应用主题，参阅"创作主题"了解如何创建和自定义主题。',
  sections: [
    {
      section: 'Wrap your app in a theme',
      title: '为应用添加主题',
      content: [
        {
          type: 'prose',
          text: '安装主题包，用 `<Theme>` 包裹应用，选择浅色或深色模式。完整指南——可用主题、集成主题、深色模式、嵌套主题和生产构建——请参阅 {@link generic:use-a-theme}。',
        },
      ],
    },
    {
      section: 'Create a custom theme',
      title: '创建自定义主题',
      content: [
        {
          type: 'prose',
          text: '使用 `defineTheme` 进行令牌覆盖、比例配置和组件样式覆盖。完整指南——调色板生成、主题扩展、自适应、自定义变体和生产构建——请参阅 {@link generic:author-a-theme}。',
        },
      ],
    },
    {
      section: 'Dark mode',
      title: '深色模式',
      content: [
        {
          type: 'prose',
          text: '在令牌值中使用 [浅色, 深色] 元组来自动切换模式。在 Theme 上使用 mode=\'system\'（默认）来跟随操作系统偏好。完整指南：{@link generic:use-a-theme}。',
        },
      ],
    },
  ],
};
