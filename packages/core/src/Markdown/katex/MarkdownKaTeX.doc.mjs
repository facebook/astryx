// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'MarkdownKaTeX',
  displayName: 'Markdown KaTeX',
  category: 'Content',
  keywords: ['markdown', 'math', 'katex', 'latex', 'tex', 'formula', 'mathml'],
  description:
    'Optional lazy KaTeX renderer for inline and display math in Markdown.',
  import: '@astryxdesign/core/Markdown/katex',
  props: [
    {
      name: 'value',
      type: 'string',
      description: 'Delimiter-free TeX expression supplied by Markdown.',
      required: true,
    },
    {
      name: 'display',
      type: "'inline' | 'block'",
      description: 'Whether the expression is inline or a standalone block.',
      required: true,
    },
    {
      name: 'katexOptions',
      type: 'MarkdownKaTeXOptions',
      description:
        'Optional KaTeX configuration. displayMode, HTML-and-MathML output, strict logging, throwOnError, and trust are owned by the adapter and cannot be overridden.',
    },
    {
      name: 'onDiagnostic',
      type: '(diagnostic: MarkdownKaTeXDiagnostic) => void',
      description:
        'Receives a fixed source-free diagnostic when the optional module cannot load or an expression cannot be typeset.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization. Must be a stylex.create() value.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'CSS class name for the root element. Prefer xstyle for styling.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        'Inline styles for the root element. Prefer xstyle for static styling.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: 'Test selector for automated testing frameworks.',
    },
  ],
  playground: {
    defaults: {
      value: '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
      display: 'block',
    },
  },
  theming: {
    targets: [
      {
        className: 'astryx-markdown-katex',
        visualProps: ['display'],
      },
    ],
  },
  usage: {
    anatomy: [
      {
        name: 'Expression',
        required: true,
        description:
          'KaTeX visual output paired with MathML, or delimiter-bearing source while loading and after failure.',
      },
    ],
    description:
      'Use MarkdownKaTeX as Markdown components.math when documents contain TeX expressions. The optional KaTeX peer loads only after an expression mounts.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Install katex, import MarkdownKaTeX from @astryxdesign/core/Markdown/katex, and pass it as components.math.',
      },
      {
        guidance: true,
        description:
          'Call createMarkdownKaTeXRenderer once outside render when several expressions need shared KaTeX options or diagnostic handling.',
      },
      {
        guidance: false,
        description:
          'Enable trusted KaTeX commands for authored Markdown. The adapter deliberately keeps trust disabled.',
      },
    ],
  },
  examples: [
    {
      label: 'Markdown math',
      code: `
import {Markdown} from '@astryxdesign/core/Markdown';
import {MarkdownKaTeX} from '@astryxdesign/core/Markdown/katex';

<Markdown components={{math: MarkdownKaTeX}}>
  {'Inline $x + y$ and display math:\\n\\n$$\\n\\\\sum_i x_i\\n$$'}
</Markdown>;
`,
    },
    {
      label: 'Shared options',
      code: `
import {
  createMarkdownKaTeXRenderer,
} from '@astryxdesign/core/Markdown/katex';

const ProductMath = createMarkdownKaTeXRenderer({
  katexOptions: {macros: {'\\\\RR': '\\\\mathbb{R}'}},
});

<Markdown components={{math: ProductMath}}>{'$\\\\RR$'}</Markdown>;
`,
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsZh = {
  description: 'Markdown 行内与块级数学表达式的可选延迟加载 KaTeX 渲染器。',
  usage: {
    description:
      '当 Markdown 文档包含 TeX 表达式时，将 MarkdownKaTeX 传给 components.math。可选的 KaTeX peer 仅在表达式挂载后加载。',
    bestPractices: [
      {
        guidance: true,
        description:
          '安装 katex，从 @astryxdesign/core/Markdown/katex 导入 MarkdownKaTeX，并将其传给 components.math。',
      },
      {
        guidance: true,
        description:
          '当多个表达式需要共享 KaTeX 选项或诊断处理时，在渲染函数外调用一次 createMarkdownKaTeXRenderer。',
      },
      {
        guidance: false,
        description:
          '为编写的 Markdown 启用受信任的 KaTeX 命令。适配器会始终禁用 trust。',
      },
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'optional lazy KaTeX renderer for Markdown math; HTML+MathML, trust disabled, source fallback',
  usage: {
    description:
      'Pass MarkdownKaTeX as components.math; install the optional katex peer. Use createMarkdownKaTeXRenderer once outside render for shared options.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Import only from @astryxdesign/core/Markdown/katex so KaTeX stays outside default Markdown bundles.',
      },
      {
        guidance: false,
        description:
          'Expect katexOptions to override displayMode, output, strict, throwOnError, or trust; the adapter owns them.',
      },
    ],
  },
};
