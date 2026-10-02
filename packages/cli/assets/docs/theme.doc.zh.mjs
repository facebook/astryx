// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceTranslationDoc} */

export const docsZh = {
  description: 'Theme 提供者、自定义主题、生产/SSR 主题构建、亮/暗模式和组件样式覆盖。',
  sections: [
    { section: 'Wrap your app in a theme', title: '用主题包裹应用', content: [null, null, null, null, { type: 'prose', text: '默认导入使用运行时样式注入。/built 导入使用预编译 CSS（需配合 theme.css）。' }] },
    { section: 'Available Themes', title: '可用主题', content: [null, null, { type: 'prose', text: '已发布主题：neutral（推荐起点）、butter、chocolate、gothic（仅暗色）、matcha、stone、y2k。@astryxdesign/theme-{name} = 源码版（运行时注入）。@astryxdesign/theme-{name}/built = 优化版（配合 theme.css）。' }] },
    { section: 'Theme Props', title: 'Theme 属性', content: [{ type: 'prose', text: "`<Theme>` 接受 `theme`（必填）、`mode`（默认 `'system'`，也可以是 `'light'` 或 `'dark'`）和 `children`。运行 `astryx component Theme` 查看全部属性。" }] },
    { section: 'Custom themes', title: '自定义主题', content: [{ type: 'prose', text: '用 `theme list` + `theme add <slug>` 从内置主题或已安装集成提供的主题开始；重名时传 `--package`。也可以用 defineTheme 从零编写。只覆盖与默认值不同的令牌。' }, null, { type: 'prose', text: '新建完整调色板时，请运行 `astryx theme palette generate palette.config.json`，审核候选结果后，再将选定颜色显式分配给语义令牌。生成操作不会自动修改主题。' }, { type: 'prose', text: '`astryx theme template` 会写入 theme.template.ts：带注释的完整参考，涵盖每个 defineTheme 字段、令牌族和覆盖语法，并标明打印各自参考的 CLI 命令。' }] },
    { section: 'defineTheme', title: 'defineTheme', content: [{ type: 'prose', text: 'defineTheme 支持显式令牌覆盖、组件覆盖，以及 typography、radius 和 motion 的比例配置。现有主题仍可使用受支持的 color 配置；它会通过 HCT 从 accent 一并派生中性色、表面色、文本色和边框色，因此并非只修改 accent。新建完整调色板时，请使用 `astryx theme palette generate palette.config.json`，审核候选结果后，再将选定值显式映射到语义令牌。tokens 覆盖仍按令牌逐个生效。使用 color 配置时，若在 tokens 中覆盖 --color-accent，--color-accent-muted、--color-text-accent 和 --color-icon-accent 会跟随该覆盖，但 --color-on-accent 仍固定为 color.accent 种子生成的值；要保持配对，请优先为 color.accent 提供 [light, dark] 元组，而不要单独覆盖 --color-accent。' }, null, null] },
    { section: 'Build a theme', title: '构建主题', content: [{ type: 'prose', text: 'astryx theme build 将 defineTheme 编译为静态 CSS。输出 .css + .js（__built:true）+ .d.ts。' }] },
    { section: 'Built themes with an icon registry', title: '带图标注册表的构建主题', content: [{ type: 'prose', text: '当前 theme build 仅在检测到 icons: 字段使用的具名导入时，才在生成的模块中导入图标注册表；它不会编译注册表模块。defineTheme 在运行时接受的内联注册表（包括本地常量）目前会在构建产物中被省略。使用此构建流程时，请把注册表移到独立模块并使用具名导入。以下示例适用于使用 React 和 lucide-react 的注册表。' }, null, { type: 'prose', text: '上例中生成的主题从 dist 导入 ./icons.mjs。如果跳过第二条命令，theme build 仍可能成功，但加载或打包生成的模块都会因缺少 dist/icons.mjs 而失败。--icons-specifier 只更改生成的导入，不会创建或验证目标文件。路径应相对于生成的 JS 文件可解析。将 react 和图标库标记为 external，避免在注册表中重复打包这些依赖。' }, { type: 'prose', text: '不传 --icons-specifier 时，会原样保留检测到的源码导入路径。默认不传 --out 时，打包器可以把无扩展名的 ./icons 解析为旁边的 icons.tsx；Node ESM 不执行这种查找，会报 ERR_MODULE_NOT_FOUND。用 --out 移动输出位置也会改变相对导入的解析位置；使用打包器并不意味着它能自动找到原来的源码。' }] },
    { section: 'Runtime vs Built Themes', title: '运行时 vs 构建', content: [{ type: 'prose', text: '运行时：useInsertionEffect 在客户端注入样式。构建：静态 CSS 在首次渲染时就存在。SSR 应用请使用 /built + theme.css。' }, null, null, null] },
    { section: 'Dark mode', title: '亮/暗模式', content: [{ type: 'prose', text: "令牌值使用 [light, dark] 元组实现自动模式切换。Theme 上 mode='system'（默认）跟随系统偏好。" }, null, null] },
    { section: 'Nested themes', title: '嵌套主题', content: [{ type: 'prose', text: '将不同部分包裹在独立的 <Theme> 提供者中。' }, null] },
    { section: 'useTheme Hook', title: 'useTheme 钩子', content: [null, null, { type: 'prose', text: '普通样式优先使用 CSS 变量、StyleX 令牌导入、xstyle 或 className。useTheme() 是只读的：要更改主题或模式，在应用层管理状态并传递给 <Theme>。' }] },
  ],
};
