// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceTranslationDoc} */

export const docsZh = {
  description: '间距、颜色、圆角、排版和阴影设计令牌参考。',
  sections: [
    {
      section: 'Color Tokens',
      title: '颜色令牌',
      blocks: [
        {
          id: 'color-desc',
          text: '语义化颜色，支持 light-dark() 自动切换模式。',
        },
      ],
    },
    {
      section: 'Spacing Tokens',
      title: '间距令牌',
      blocks: [
        {
          id: 'spacing-desc',
          text: '所有设计令牌定义在 packages/core/src/theme/tokens.stylex.ts 中。组件的 gap 属性使用 space0-space12 映射到这些令牌。',
        },
      ],
    },
    {
      section: 'Size Tokens',
      title: '尺寸令牌',
      blocks: [
        {
          id: 'size-desc',
          text: '控制按钮、输入框和选择器的一致高度。',
        },
      ],
    },
    {
      section: 'Radius Tokens',
      title: '圆角令牌',
    },
    {
      section: 'Shadow Tokens',
      title: '阴影令牌',
    },
    {
      section: 'Usage in StyleX',
      title: 'StyleX 用法',
    },
  ],
};
