/** @type {import('../../core/src/docs-types').ReferenceTranslationDoc} */

export const docsZh = {
  description: 'XDS 设计原则、规则和反模式。',
  sections: [
    { title: '规则', content: [{ type: 'list', items: ['所有支持的场景都使用 XDS 组件', '使用 StyleX 进行样式设置（不使用内联样式）', '使用语义化令牌，不使用硬编码值', '使用 CSS 变量设置颜色，不使用十六进制值', '表单输入为受控组件（value + onChange）'] }] },
    { title: '样式覆盖：xstyle 属性', content: [{ type: 'prose', text: '大多数 XDS 组件接受 xstyle 属性来自定义样式。支持三种格式。' }, null, null, null, { type: 'list', items: ['1-2 个简单属性：使用内联', '3+ 个属性、可复用或命名的：使用 stylex.create', '伪类（:hover、:focus-visible）：必须使用 stylex.create', '所有 :hover 必须使用 @media (hover: hover) 守卫'] }] },
    { title: '反模式', content: [{ type: 'list', items: ['不要在原始元素上使用内联样式。使用 XDS 组件的 xstyle', '不要硬编码颜色（#fff）。使用 var(--color-*)', '不要硬编码间距（16px）。使用间距令牌或 var(--spacing-*)', '不要自创属性。先阅读组件文档'] }] },
    { title: 'StyleX 用法', content: [null] },
    { title: '快速令牌参考', content: [{ type: 'prose', text: '完整列表请查看 `xds docs tokens`。主要值：' }, null] },
  ],
};
