/** @type {import('../../core/src/docs-types').ReferenceTranslationDoc} */

export const docsZh = {
  description: 'XDSTheme 提供者、自定义主题、亮/暗模式和组件样式覆盖。',
  sections: [
    { title: '快速开始', content: [null] },
    { title: '可用主题', content: [null, { type: 'prose', text: '运行 `npx xds theme --list` 查看项目中的主题。' }] },
    { title: 'XDSTheme 属性', content: [null] },
    { title: '创建自定义主题', content: [{ type: 'prose', text: '使用 CLI 向导（推荐）或手动创建。只覆盖与默认值不同的令牌组，省略的组会自动使用 @xds/core 的 defineVars 默认值。' }, null, null, { type: 'prose', text: '令牌组（styles 中均为可选）：colors、spacing、size、radius、elevation、transition、typography、textSize、lineHeight、fontWeight。省略的组使用 defineVars 默认值。' }, { type: 'list', items: ['stylex.createTheme() 中不能使用变量引用。StyleX 需要内联对象字面量进行静态分析。', 'createTheme() 中不能使用展开表达式。同样的静态分析约束。'] }] },
    { title: '亮/暗模式', content: [{ type: 'prose', text: "在令牌值中使用 light-dark() 实现自动模式切换。在 XDSTheme 上使用 mode='system'（默认）跟随系统偏好。" }, null, null] },
    { title: '嵌套主题', content: [{ type: 'prose', text: '将不同部分包裹在独立的 <XDSTheme> 提供者中。' }, null] },
    { title: '页面背景', content: [{ type: 'prose', text: 'XDSTheme 使用 display: contents，不会创建视觉容器。通过 StyleX 将主题背景色应用到包裹元素。' }, null] },
    { title: '组件样式覆盖', content: [{ type: 'prose', text: '主题可以通过 components 字段覆盖单个组件样式。组件通过模块增强注册可主题化的属性，主题提供 StyleX 覆盖。' }, null, null, { type: 'prose', text: '运行 `npx xds --detail compact component <Name>` 查看组件的可主题化插槽。' }] },
    { title: 'useXDSTheme 钩子', content: [null, { type: 'prose', text: '这是只读的。要更改主题/模式，在应用层管理状态并传递给 <XDSTheme>。' }] },
  ],
};
