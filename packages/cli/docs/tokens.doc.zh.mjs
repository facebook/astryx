// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceTranslationDoc} */

export const docsZh = {
  description: '间距、颜色、圆角、排版和阴影设计令牌参考。',
  sections: [
    { title: '间距令牌', content: [{ type: 'prose', text: '所有设计令牌定义在 packages/core/src/theme/tokens.stylex.ts 中。组件的 gap 属性使用 space0-space12 映射到这些令牌。' }, null] },
    { title: '尺寸令牌', content: [{ type: 'prose', text: '控制按钮、输入框和选择器的一致高度。' }, null] },
    { title: '颜色令牌', content: [{ type: 'prose', text: '语义化颜色，支持 light-dark() 自动切换模式。' }, null, null, null] },
    { title: '圆角令牌', content: [null] },
    { title: '阴影令牌', content: [null] },
    { title: '排版令牌', content: [null, null, null, null] },
    { title: 'StyleX 用法', content: [null, null] },
  ],
};
