// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceTranslationDoc} */

export const docsZh = {
  description:
    'Theme 提供者、自定义主题、生产/SSR 主题构建、亮/暗模式和组件样式覆盖。',
  sections: [
    {
      section: 'Wrap your app in a theme',
      title: '用主题包裹应用',
      content: [
        null,
        null,
        null,
        null,
        {
          type: 'prose',
          text: '`theme add --import` 会生成应用主题模块，并导入构建后的主题、生产 CSS 和可选字体 CSS。应用只需导入一次 themes/defaultThemeSlug；use/remove 会重新生成模块。普通定制应扩展构建主题，只有需要独立源码分支时才使用 eject。',
        },
      ],
    },
    {
      section: 'Migrating Earlier Theme Copies',
      title: '迁移早期复制的主题',
      content: [
        {
          type: 'prose',
          text: '早期 `theme add` 复制的主题仍是应用源码。upgrade 只写入缺失的、maintained: false 的描述文件。',
        },
        null,
        {
          type: 'prose',
          text: '运行 upgrade 前，主题命令会跳过这些复制；list 和 doctor 会指出它们。旧的复制脚本改用 `theme eject`，应用使用主题的脚本改用 `theme add --import`。',
        },
        {
          type: 'prose',
          text: '`ASTRYX_THEME` 不再读取。用 `theme use <slug>` 选择生成的应用主题模块中的默认主题。该模块存在时，组件元数据读取记录中的默认主题；没有该模块时，package.json#astryx.theme 保持原有含义。',
        },
      ],
    },
    {
      section: 'Available Themes',
      title: '可用主题',
      content: [
        null,
        null,
        {
          type: 'prose',
          text: '已发布主题：neutral（推荐起点）、butter、chocolate、gothic（仅暗色）、matcha、stone、y2k。先安装 @astryxdesign/theme-{name}，再运行 `theme add <name> --import`。包导出 /built、theme.css 和 fonts.css。',
        },
      ],
    },
    {
      section: 'Theme Props',
      title: 'Theme 属性',
      content: [
        {
          type: 'prose',
          text: "`<Theme>` 接受 `theme`（必填）、`mode`（默认 `'system'`，也可以是 `'light'` 或 `'dark'`）和 `children`。运行 `astryx component Theme` 查看全部属性。",
        },
      ],
    },
    {
      section: 'Custom themes',
      title: '自定义主题',
      content: [
        {
          type: 'prose',
          text: '普通定制应扩展已导入的构建主题，构建后再添加本地结果。`theme eject` 只用于创建独立维护的源码分支。只覆盖与基础主题不同的值。',
        },
        null,
        {
          type: 'prose',
          text: '`astryx theme template` 会写入 theme.template.ts：带注释的完整参考，涵盖每个 defineTheme 字段、令牌族和覆盖语法，并标明打印各自参考的 CLI 命令。',
        },
      ],
    },
    {
      section: 'defineTheme',
      title: 'defineTheme',
      content: [
        {
          type: 'prose',
          text: '支持比例配置（color、typography、radius、motion）+ 显式令牌覆盖 + 组件覆盖。color 通过 HCT 从 accent 派生完整调色板；accent 接受单个十六进制值或 [light, dark] 元组（每个模式使用各自的种子色）。tokens 覆盖按令牌逐个生效；--color-on-accent 始终由 color.accent 计算得出，因此优先使用元组 accent 而不是覆盖 --color-accent。',
        },
        null,
        null,
      ],
    },
    {
      section: 'Build a theme',
      title: '构建主题',
      content: [
        {
          type: 'prose',
          text: 'astryx theme build 将 defineTheme 编译为静态 CSS。输出 .css + .js（__built:true）+ .d.ts。',
        },
      ],
    },
    {
      section: 'Built themes with an icon registry',
      title: '带图标注册表的构建主题',
      content: [
        {
          type: 'prose',
          text: '当前 theme build 仅在检测到 icons: 字段使用的具名导入时，才在生成的模块中导入图标注册表；它不会编译注册表模块。defineTheme 在运行时接受的内联注册表（包括本地常量）目前会在构建产物中被省略。使用此构建流程时，请把注册表移到独立模块并使用具名导入。以下示例适用于使用 React 和 lucide-react 的注册表。',
        },
        null,
        {
          type: 'prose',
          text: '上例中生成的主题从 dist 导入 ./icons.mjs。如果跳过第二条命令，theme build 仍可能成功，但加载或打包生成的模块都会因缺少 dist/icons.mjs 而失败。--icons-specifier 只更改生成的导入，不会创建或验证目标文件。路径应相对于生成的 JS 文件可解析。将 react 和图标库标记为 external，避免在注册表中重复打包这些依赖。',
        },
        {
          type: 'prose',
          text: '不传 --icons-specifier 时，会原样保留检测到的源码导入路径。默认不传 --out 时，打包器可以把无扩展名的 ./icons 解析为旁边的 icons.tsx；Node ESM 不执行这种查找，会报 ERR_MODULE_NOT_FOUND。用 --out 移动输出位置也会改变相对导入的解析位置；使用打包器并不意味着它能自动找到原来的源码。',
        },
      ],
    },
    {
      section: 'Runtime vs Built Themes',
      title: '运行时 vs 构建',
      content: [
        {
          type: 'prose',
          text: '应用使用构建主题。生成的模块会为每个主题同时导入主题对象、生产 CSS 和可选字体 CSS。包主题继续接收包更新，本地主题由应用维护。不要手动编辑生成模块。',
        },
        null,
        null,
        null,
      ],
    },
    {
      section: 'Dark mode',
      title: '亮/暗模式',
      content: [
        {
          type: 'prose',
          text: "令牌值使用 [light, dark] 元组实现自动模式切换。Theme 上 mode='system'（默认）跟随系统偏好。",
        },
        null,
        null,
      ],
    },
    {
      section: 'Nested themes',
      title: '嵌套主题',
      content: [
        {type: 'prose', text: '将不同部分包裹在独立的 <Theme> 提供者中。'},
        null,
      ],
    },
    {
      section: 'useTheme Hook',
      title: 'useTheme 钩子',
      content: [
        null,
        null,
        {
          type: 'prose',
          text: '普通样式优先使用 CSS 变量、StyleX 令牌导入、xstyle 或 className。useTheme() 是只读的：要更改主题或模式，在应用层管理状态并传递给 <Theme>。',
        },
      ],
    },
  ],
};
