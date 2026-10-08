// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceTranslationDoc} */

export const docsZh = {
  description: '颜色、数据可视化、语法高亮、间距、尺寸、圆角、阴影、动效和排版设计令牌参考。',
  sections: [
    { section: 'Color Tokens', title: '颜色令牌', content: [{ type: 'prose', text: '语义化颜色，支持 light-dark() 自动切换模式。' }, null, null, null] },
    { section: 'Spacing Tokens', title: '间距令牌', content: [{ type: 'prose', text: '用于内边距、间距和外边距的刻度。组件 gap 属性接受步长 0、0.5、1、1.5、2、3、4、5、6、8、10。' }, null] },
    { section: 'Size Tokens', title: '尺寸令牌', content: [{ type: 'prose', text: '控制按钮、输入框和选择器的一致高度。' }, null] },
    { section: 'Radius Tokens', title: '圆角令牌', content: [null] },
    { section: 'Shadow Tokens', title: '阴影令牌', content: [null] },
    { section: 'Usage in StyleX', title: 'StyleX 用法', content: [null, null] },
  ],
};
