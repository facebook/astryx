/** @type {import('../../core/src/docs-types').ReferenceTranslationDoc} */

export const docsZh = {
  description: 'XDS 核心设计原则和规则。',
  sections: [
    { title: '设计哲学', content: [{ type: 'list', items: ['组件优于原始元素 — 优先使用 XDS 组件', '语义化令牌优于硬编码值', '主题无关的代码 — 深色模式自动生效', '开放的内部机制 — 所有基础组件均可导出和组合'] }] },
    { title: '规则', content: [{ type: 'list', items: ['所有支持的场景都使用 XDS 组件', '使用 StyleX 或 Tailwind 进行样式设置', '使用语义化令牌，不使用硬编码值', '使用 CSS 变量设置颜色，不使用十六进制值', '表单输入为受控组件（value + onChange）', '使用 useXDSLinkComponent() 进行导航'] }] },
    { title: '样式方法', content: [{ type: 'prose', text: '组件覆盖使用 xstyle 属性。布局使用 StyleX 或 Tailwind。详见 xds docs styling。' }] },
    { title: '反模式', content: [{ type: 'list', items: ['不要在原始元素上使用内联样式', '不要硬编码颜色 — 使用令牌或 Tailwind 语义类', '不要硬编码间距', '不要硬编码 <a> 元素 — 使用 useXDSLinkComponent()', '不要自创属性。先阅读组件文档'] }] },
    { title: '设计令牌', content: [{ type: 'prose', text: '运行 npx xds docs tokens 查看完整参考' }] },
  ],
};
