// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file shiki.tsx
 * @input Declared code-fence languages and host-owned Shiki theme options
 * @output Lazy semantic-fence plugin with safe styled CodeBlock tokens and fallback
 * @position Optional Markdown Shiki adapter; excluded unless its package subpath is imported
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {
  BundledLanguage,
  BundledTheme,
  codeToTokens as shikiCodeToTokens,
  ThemedToken,
  TokensResult,
} from 'shiki';
import {
  CodeBlock,
  type CodeBlockProps,
  type SyntaxToken,
  type SyntaxTokenStyle,
} from '../../CodeBlock';
import {mergeProps} from '../../utils';
import {warnOnce} from '../../utils/devWarning';
import {themeProps} from '../../utils/themeProps';
import {
  createMarkdownFenceTransform,
  type MarkdownFenceContext,
  type MarkdownFenceNode,
} from '../plugins/semanticFence';
import {
  createMarkdownPlugin,
  type MarkdownExtensionNode,
  type MarkdownPluginEntry,
} from '../plugins/protocol';

export type MarkdownShikiLanguages = readonly [
  BundledLanguage,
  ...BundledLanguage[],
];

export const markdownShikiDefaultLanguages = Object.freeze([
  'javascript',
  'js',
  'typescript',
  'ts',
  'jsx',
  'tsx',
  'json',
  'jsonc',
  'html',
  'xml',
  'css',
  'scss',
  'bash',
  'sh',
  'shell',
  'shellscript',
  'python',
  'py',
  'rust',
  'rs',
  'go',
  'java',
  'c',
  'cpp',
  'csharp',
  'cs',
  'php',
  'hack',
  'ruby',
  'rb',
  'swift',
  'kotlin',
  'kt',
  'sql',
  'graphql',
  'gql',
  'yaml',
  'yml',
  'markdown',
  'md',
  'dockerfile',
  'diff',
  'toml',
] as const satisfies MarkdownShikiLanguages);

export type MarkdownShikiCodeBlockProps = Omit<
  CodeBlockProps,
  'code' | 'highlightMode' | 'language' | 'ref' | 'title' | 'tokenizer'
>;

export type MarkdownShikiDiagnosticCode =
  'module-load-failed' | 'tokenize-failed' | 'invalid-tokens';

export interface MarkdownShikiDiagnostic {
  readonly code: MarkdownShikiDiagnosticCode;
  readonly phase: 'load' | 'render';
  readonly severity: 'error';
}

export interface MarkdownShikiPluginOptions {
  /** Exact fence languages the plugin claims. */
  readonly languages?: MarkdownShikiLanguages;
  /** Optional Shiki theme. Omit it to use Astryx syntax-theme colors. */
  readonly theme?: BundledTheme;
  /** Maximum characters Shiki tokenizes on one line. */
  readonly maxLineLength?: number;
  /** Maximum milliseconds Shiki spends tokenizing one line. */
  readonly lineTimeLimit?: number;
  /** Configures the CodeBlock shell without replacing Shiki-owned values. */
  readonly codeBlockProps?: MarkdownShikiCodeBlockProps;
  /** Receives source-free failures while the ordinary CodeBlock remains visible. */
  readonly onDiagnostic?: (diagnostic: MarkdownShikiDiagnostic) => void;
  /** Styles the integration wrapper. */
  readonly xstyle?: stylex.StyleXStyles;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export type MarkdownShikiData = {
  readonly code: string;
  readonly label?: string;
  readonly language: BundledLanguage;
};

export type MarkdownShikiNode = MarkdownExtensionNode<
  'markdown-shiki',
  'highlighted-code',
  MarkdownShikiData,
  'block'
>;

type ShikiModule = {readonly codeToTokens: typeof shikiCodeToTokens};

type ShikiRenderState =
  | {
      readonly request: object;
      readonly status: 'failed';
    }
  | {
      readonly request: object;
      readonly status: 'ready';
      readonly tokens: SyntaxToken[];
    };

const ANALYSIS_THEME: BundledTheme = 'github-dark-default';
const DEFAULT_MAX_LINE_LENGTH = 20_000;
const DEFAULT_LINE_TIME_LIMIT = 250;

const diagnostics: Readonly<
  Record<MarkdownShikiDiagnosticCode, MarkdownShikiDiagnostic>
> = Object.freeze({
  'module-load-failed': Object.freeze({
    code: 'module-load-failed',
    phase: 'load',
    severity: 'error',
  }),
  'tokenize-failed': Object.freeze({
    code: 'tokenize-failed',
    phase: 'render',
    severity: 'error',
  }),
  'invalid-tokens': Object.freeze({
    code: 'invalid-tokens',
    phase: 'render',
    severity: 'error',
  }),
});

let shikiModulePromise: Promise<ShikiModule> | undefined;

async function loadShiki(): Promise<ShikiModule> {
  shikiModulePromise ??= import('shiki');
  return shikiModulePromise;
}

function reportFailure(
  code: MarkdownShikiDiagnosticCode,
  onDiagnostic: MarkdownShikiPluginOptions['onDiagnostic'],
): void {
  const diagnostic = diagnostics[code];
  const message =
    code === 'module-load-failed'
      ? 'Shiki could not be loaded; the ordinary code block is shown instead.'
      : code === 'invalid-tokens'
        ? 'Shiki returned invalid tokens; the ordinary code block is shown instead.'
        : 'Shiki could not highlight this code; the ordinary code block is shown instead.';
  warnOnce(`markdown-shiki:${code}`, 'MarkdownShiki', message);
  try {
    onDiagnostic?.(diagnostic);
  } catch {
    warnOnce(
      'markdown-shiki:diagnostic-callback-failed',
      'MarkdownShiki',
      'The onDiagnostic callback threw while handling a renderer diagnostic.',
    );
  }
}

function positiveInteger(value: number | undefined, fallback: number): number {
  return value == null || !Number.isFinite(value) || value <= 0
    ? fallback
    : Math.floor(value);
}

function shikiTokenType(token: ThemedToken): SyntaxToken['type'] {
  const scopes =
    token.explanation?.flatMap(explanation =>
      explanation.scopes.map(scope => scope.scopeName),
    ) ?? [];
  const hasScope = (pattern: RegExp) =>
    scopes.some(scope => pattern.test(scope));

  if (hasScope(/(?:^|\.)comment(?:\.|$)/)) {
    return 'comment';
  }
  if (hasScope(/(?:^|\.)(?:string|regexp)(?:\.|$)/)) {
    return 'string';
  }
  if (hasScope(/(?:^|\.)constant\.numeric(?:\.|$)/)) {
    return 'number';
  }
  if (
    hasScope(
      /(?:^|\.)(?:entity\.name\.function|support\.function|meta\.function-call)(?:\.|$)/,
    )
  ) {
    return 'function';
  }
  if (
    hasScope(/(?:^|\.)(?:entity\.name\.(?:class|type)|support\.type)(?:\.|$)/)
  ) {
    return 'type';
  }
  if (hasScope(/(?:^|\.)entity\.name\.tag(?:\.|$)/)) {
    return 'tag';
  }
  if (hasScope(/(?:^|\.)entity\.other\.attribute-name(?:\.|$)/)) {
    return 'attribute';
  }
  if (
    hasScope(
      /(?:^|\.)(?:variable\.other\.property|meta\.object-literal\.key)(?:\.|$)/,
    )
  ) {
    return 'property';
  }
  if (hasScope(/(?:^|\.)keyword\.operator(?:\.|$)/)) {
    return 'operator';
  }
  if (hasScope(/(?:^|\.)punctuation(?:\.|$)/)) {
    return 'punctuation';
  }
  if (hasScope(/(?:^|\.)(?:keyword|storage)(?:\.|$)/)) {
    return 'keyword';
  }
  if (hasScope(/(?:^|\.)(?:constant|support\.constant)(?:\.|$)/)) {
    return 'constant';
  }
  if (hasScope(/(?:^|\.)variable(?:\.|$)/)) {
    return 'variable';
  }
  return token.type === 1
    ? 'comment'
    : token.type === 2 || token.type === 3
      ? 'string'
      : 'variable';
}

function shikiTokenStyle(
  token: ThemedToken,
  useThemeColors: boolean,
): SyntaxTokenStyle | undefined {
  const htmlStyle = token.htmlStyle;
  const color = useThemeColors ? (htmlStyle?.color ?? token.color) : undefined;
  const backgroundColor = useThemeColors
    ? (htmlStyle?.backgroundColor ??
      htmlStyle?.['background-color'] ??
      token.bgColor)
    : undefined;
  const numericFontStyle = token.fontStyle ?? 0;
  const isItalic =
    htmlStyle?.fontStyle === 'italic' ||
    htmlStyle?.['font-style'] === 'italic' ||
    (numericFontStyle & 1) !== 0;
  const isBold =
    htmlStyle?.fontWeight === 'bold' ||
    htmlStyle?.['font-weight'] === 'bold' ||
    (numericFontStyle & 2) !== 0;
  const decoration =
    htmlStyle?.textDecorationLine ?? htmlStyle?.['text-decoration-line'];
  const isUnderline =
    decoration?.includes('underline') === true || (numericFontStyle & 4) !== 0;
  const isStrikethrough =
    decoration?.includes('line-through') === true ||
    (numericFontStyle & 8) !== 0;
  const textDecorationLine = [
    isUnderline ? 'underline' : null,
    isStrikethrough ? 'line-through' : null,
  ]
    .filter(value => value != null)
    .join(' ');

  if (
    color == null &&
    backgroundColor == null &&
    !isItalic &&
    !isBold &&
    textDecorationLine === ''
  ) {
    return undefined;
  }
  return {
    ...(color == null ? {} : {color}),
    ...(backgroundColor == null ? {} : {backgroundColor}),
    ...(isItalic ? {fontStyle: 'italic'} : {}),
    ...(isBold ? {fontWeight: 700} : {}),
    ...(textDecorationLine === '' ? {} : {textDecorationLine}),
  };
}

function toSyntaxTokens(
  source: string,
  result: TokensResult,
  useThemeColors: boolean,
): SyntaxToken[] {
  const reconstructed = result.tokens
    .map(line => line.map(token => token.content).join(''))
    .join('\n');
  if (reconstructed !== source) {
    throw new TypeError('Shiki tokens do not reproduce their source');
  }

  const tokens: SyntaxToken[] = [];
  let previousEnd = 0;
  for (const line of result.tokens) {
    for (const token of line) {
      const start = token.offset;
      const end = start + token.content.length;
      if (
        !Number.isSafeInteger(start) ||
        start < 0 ||
        !Number.isSafeInteger(end) ||
        token.content.includes('\n') ||
        start < previousEnd ||
        end > source.length ||
        source.slice(start, end) !== token.content
      ) {
        throw new TypeError('Shiki token offsets are invalid');
      }
      previousEnd = end;
      const type = shikiTokenType(token);
      const style = shikiTokenStyle(token, useThemeColors);
      if ((type !== 'variable' || style != null) && end > start) {
        tokens.push({type, start, end, ...(style == null ? {} : {style})});
      }
    }
  }
  return tokens;
}

function parseFenceLabel(meta: string | undefined): string | undefined {
  const trimmed = meta?.trim();
  if (!trimmed) {
    return undefined;
  }
  const title = /(?:^|\s)title=(?:"([^"]*)"|'([^']*)'|(\S+))/.exec(trimmed);
  const value = title?.[1] ?? title?.[2] ?? title?.[3] ?? trimmed;
  return value.trim() || undefined;
}

const styles = stylex.create({
  root: {
    display: 'block',
    maxWidth: '100%',
  },
});

type ShikiCodeBlockInput = MarkdownShikiData & {
  readonly options: MarkdownShikiPluginOptions;
};

function ShikiCodeBlock({code, label, language, options}: ShikiCodeBlockInput) {
  const theme = options.theme ?? ANALYSIS_THEME;
  const useThemeColors = options.theme != null;
  const maxLineLength = positiveInteger(
    options.maxLineLength,
    DEFAULT_MAX_LINE_LENGTH,
  );
  const lineTimeLimit = positiveInteger(
    options.lineTimeLimit,
    DEFAULT_LINE_TIME_LIMIT,
  );
  const request = useMemo(
    () => ({
      code,
      language,
      maxLineLength,
      lineTimeLimit,
      theme,
      useThemeColors,
    }),
    [code, language, maxLineLength, lineTimeLimit, theme, useThemeColors],
  );
  const [renderState, setRenderState] = useState<ShikiRenderState | null>(null);
  const readyTokens =
    renderState?.request === request && renderState.status === 'ready'
      ? renderState.tokens
      : null;
  const tokenizer = useCallback(() => readyTokens ?? [], [readyTokens]);

  useEffect(() => {
    let active = true;

    async function highlight(): Promise<void> {
      let shiki: ShikiModule;
      try {
        shiki = await loadShiki();
      } catch {
        if (active) {
          reportFailure('module-load-failed', options.onDiagnostic);
          setRenderState({request, status: 'failed'});
        }
        return;
      }

      let result: TokensResult;
      try {
        result = await shiki.codeToTokens(code, {
          lang: language,
          theme,
          includeExplanation: 'scopeName',
          tokenizeMaxLineLength: maxLineLength,
          tokenizeTimeLimit: lineTimeLimit,
        });
      } catch {
        if (active) {
          reportFailure('tokenize-failed', options.onDiagnostic);
          setRenderState({request, status: 'failed'});
        }
        return;
      }

      if (!active) {
        return;
      }
      try {
        setRenderState({
          request,
          status: 'ready',
          tokens: toSyntaxTokens(code, result, useThemeColors),
        });
      } catch {
        reportFailure('invalid-tokens', options.onDiagnostic);
        setRenderState({request, status: 'failed'});
      }
    }

    void highlight();
    return () => {
      active = false;
    };
  }, [
    code,
    language,
    maxLineLength,
    lineTimeLimit,
    options.onDiagnostic,
    request,
    theme,
    useThemeColors,
  ]);

  return (
    <div
      {...mergeProps(
        themeProps('markdown-shiki'),
        stylex.props(styles.root, options.xstyle),
        options.className,
        options.style,
      )}>
      <CodeBlock
        {...options.codeBlockProps}
        code={code}
        language={language}
        title={label}
        tokenizer={readyTokens == null ? undefined : tokenizer}
        highlightMode={readyTokens == null ? 'auto' : 'spans'}
      />
    </div>
  );
}

function createShikiNode(
  context: MarkdownFenceContext<string>,
): MarkdownFenceNode<MarkdownShikiNode> {
  const label = parseFenceLabel(context.meta);
  return {
    type: 'extension',
    plugin: 'markdown-shiki',
    name: 'highlighted-code',
    display: 'block',
    data: {
      code: context.code,
      language: context.language as BundledLanguage,
      ...(label == null ? {} : {label}),
    },
  };
}

/** Creates a lazy semantic-fence plugin for declared Shiki languages. */
export function createMarkdownShikiPlugin(
  options: MarkdownShikiPluginOptions = {},
): MarkdownPluginEntry<MarkdownShikiNode> {
  const languages = options.languages ?? markdownShikiDefaultLanguages;
  return createMarkdownPlugin<'markdown-shiki', MarkdownShikiNode>({
    name: 'markdown-shiki',
    apiVersion: 1,
    transform: createMarkdownFenceTransform({
      languages,
      createNode: createShikiNode,
    }),
    renderers: {
      'highlighted-code': {
        render: ({node}) => (
          <ShikiCodeBlock
            code={node.data.code}
            label={node.data.label}
            language={node.data.language}
            options={options}
          />
        ),
        toText: node => node.data.code,
      },
    },
  });
}

/** Default Shiki plugin for common web, systems, data, and scripting languages. */
export const markdownShikiPlugin = createMarkdownShikiPlugin();
