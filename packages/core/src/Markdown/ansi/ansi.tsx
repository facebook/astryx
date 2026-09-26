// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ansi.tsx
 * @input ANSI SGR terminal text and host-owned presentation options
 * @output Semantic-fence plugin that renders safe styled CodeBlock tokens
 * @position Optional Markdown ANSI adapter; excluded unless its package subpath is imported
 */

import {useCallback, useMemo, type CSSProperties} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  CodeBlock,
  type CodeBlockProps,
  type SyntaxToken,
  type SyntaxTokenStyle,
} from '../../CodeBlock';
import {mergeProps} from '../../utils';
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

export type MarkdownAnsiColorName =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'brightBlack'
  | 'brightRed'
  | 'brightGreen'
  | 'brightYellow'
  | 'brightBlue'
  | 'brightMagenta'
  | 'brightCyan'
  | 'brightWhite';

export type MarkdownAnsiPalette = Readonly<
  Record<MarkdownAnsiColorName | 'background' | 'foreground', string>
>;

export type MarkdownAnsiCodeBlockProps = Omit<
  CodeBlockProps,
  'code' | 'highlightMode' | 'language' | 'ref' | 'title' | 'tokenizer'
>;

export interface MarkdownAnsiPluginOptions {
  /** Overrides terminal colors; omitted entries retain theme-aware defaults. */
  readonly palette?: Partial<MarkdownAnsiPalette>;
  /** Configures the CodeBlock shell without replacing ANSI-owned values. */
  readonly codeBlockProps?: MarkdownAnsiCodeBlockProps;
  /** Styles the integration wrapper. */
  readonly xstyle?: stylex.StyleXStyles;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export type MarkdownAnsiData = {
  readonly code: string;
  readonly label?: string;
};

export type MarkdownAnsiNode = MarkdownExtensionNode<
  'markdown-ansi',
  'terminal',
  MarkdownAnsiData,
  'block'
>;

export const markdownAnsiDefaultPalette: MarkdownAnsiPalette = Object.freeze({
  background: 'var(--color-syntax-background)',
  foreground: 'var(--color-syntax-variable)',
  black: 'var(--color-syntax-comment)',
  red: 'var(--color-syntax-tag)',
  green: 'var(--color-syntax-string)',
  yellow: 'var(--color-syntax-number)',
  blue: 'var(--color-syntax-keyword)',
  magenta: 'var(--color-syntax-constant)',
  cyan: 'var(--color-syntax-type)',
  white: 'var(--color-syntax-variable)',
  brightBlack: 'var(--color-syntax-punctuation)',
  brightRed: 'var(--color-syntax-tag)',
  brightGreen: 'var(--color-syntax-property)',
  brightYellow: 'var(--color-syntax-constant)',
  brightBlue: 'var(--color-syntax-function)',
  brightMagenta: 'var(--color-syntax-attribute)',
  brightCyan: 'var(--color-syntax-type)',
  brightWhite: 'var(--color-syntax-variable)',
});

type AnsiState = {
  background?: string;
  bold: boolean;
  dim: boolean;
  foreground?: string;
  hidden: boolean;
  inverse: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
};

type ParsedAnsi = {
  readonly text: string;
  readonly tokens: SyntaxToken[];
};

const BASIC_COLORS: ReadonlyArray<MarkdownAnsiColorName> = [
  'black',
  'red',
  'green',
  'yellow',
  'blue',
  'magenta',
  'cyan',
  'white',
];

const BRIGHT_COLORS: ReadonlyArray<MarkdownAnsiColorName> = [
  'brightBlack',
  'brightRed',
  'brightGreen',
  'brightYellow',
  'brightBlue',
  'brightMagenta',
  'brightCyan',
  'brightWhite',
];

const C1_CSI = '\u009b';
const C1_OSC = '\u009d';
const C1_ST = '\u009c';
const ESC = '\u001b';
const BEL = '\u0007';

function createAnsiState(): AnsiState {
  return {
    bold: false,
    dim: false,
    hidden: false,
    inverse: false,
    italic: false,
    strikethrough: false,
    underline: false,
  };
}

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.trunc(value)));
}

function indexedColor(index: number, palette: MarkdownAnsiPalette): string {
  const value = clampByte(index);
  if (value < 8) {
    return palette[BASIC_COLORS[value]];
  }
  if (value < 16) {
    return palette[BRIGHT_COLORS[value - 8]];
  }
  if (value < 232) {
    const cube = value - 16;
    const levels = [0, 95, 135, 175, 215, 255];
    const red = levels[Math.floor(cube / 36)];
    const green = levels[Math.floor((cube % 36) / 6)];
    const blue = levels[cube % 6];
    return `rgb(${red} ${green} ${blue})`;
  }
  const gray = 8 + (value - 232) * 10;
  return `rgb(${gray} ${gray} ${gray})`;
}

function parseSgrParameters(value: string): number[] | null {
  if (value === '') {
    return [0];
  }
  if (!/^[\d:;]*$/.test(value)) {
    return null;
  }
  const result: number[] = [];
  for (const field of value.split(';')) {
    const parts = field.includes(':')
      ? field.split(':').filter(part => part !== '')
      : [field];
    if (parts.length === 0) {
      result.push(0);
      continue;
    }
    for (const part of parts) {
      const parsed = Number(part);
      if (!Number.isFinite(parsed)) {
        return null;
      }
      result.push(parsed);
    }
  }
  return result;
}

function extendedColor(
  parameters: ReadonlyArray<number>,
  index: number,
  palette: MarkdownAnsiPalette,
): {color?: string; consumed: number} {
  const mode = parameters[index + 1];
  if (mode === 5 && parameters[index + 2] != null) {
    return {
      color: indexedColor(parameters[index + 2], palette),
      consumed: 2,
    };
  }
  if (
    mode === 2 &&
    parameters[index + 2] != null &&
    parameters[index + 3] != null &&
    parameters[index + 4] != null
  ) {
    return {
      color: `rgb(${clampByte(parameters[index + 2])} ${clampByte(parameters[index + 3])} ${clampByte(parameters[index + 4])})`,
      consumed: 4,
    };
  }
  return {consumed: 0};
}

function applySgr(
  state: AnsiState,
  parameters: ReadonlyArray<number>,
  palette: MarkdownAnsiPalette,
): void {
  for (let index = 0; index < parameters.length; index++) {
    const parameter = parameters[index];
    if (parameter === 0) {
      Object.assign(state, createAnsiState());
    } else if (parameter === 1) {
      state.bold = true;
    } else if (parameter === 2) {
      state.dim = true;
    } else if (parameter === 3) {
      state.italic = true;
    } else if (parameter === 4 || parameter === 21) {
      state.underline = true;
    } else if (parameter === 7) {
      state.inverse = true;
    } else if (parameter === 8) {
      state.hidden = true;
    } else if (parameter === 9) {
      state.strikethrough = true;
    } else if (parameter === 22) {
      state.bold = false;
      state.dim = false;
    } else if (parameter === 23) {
      state.italic = false;
    } else if (parameter === 24) {
      state.underline = false;
    } else if (parameter === 27) {
      state.inverse = false;
    } else if (parameter === 28) {
      state.hidden = false;
    } else if (parameter === 29) {
      state.strikethrough = false;
    } else if (parameter >= 30 && parameter <= 37) {
      state.foreground = palette[BASIC_COLORS[parameter - 30]];
    } else if (parameter === 38) {
      const result = extendedColor(parameters, index, palette);
      state.foreground = result.color ?? state.foreground;
      index += result.consumed;
    } else if (parameter === 39) {
      state.foreground = undefined;
    } else if (parameter >= 40 && parameter <= 47) {
      state.background = palette[BASIC_COLORS[parameter - 40]];
    } else if (parameter === 48) {
      const result = extendedColor(parameters, index, palette);
      state.background = result.color ?? state.background;
      index += result.consumed;
    } else if (parameter === 49) {
      state.background = undefined;
    } else if (parameter >= 90 && parameter <= 97) {
      state.foreground = palette[BRIGHT_COLORS[parameter - 90]];
    } else if (parameter >= 100 && parameter <= 107) {
      state.background = palette[BRIGHT_COLORS[parameter - 100]];
    }
  }
}

function styleForState(
  state: Readonly<AnsiState>,
  palette: MarkdownAnsiPalette,
): SyntaxTokenStyle | undefined {
  const foreground = state.inverse
    ? (state.background ?? palette.background)
    : state.foreground;
  const background = state.inverse
    ? (state.foreground ?? palette.foreground)
    : state.background;
  const decoration = [
    state.underline ? 'underline' : null,
    state.strikethrough ? 'line-through' : null,
  ]
    .filter(value => value != null)
    .join(' ');
  if (
    foreground == null &&
    background == null &&
    !state.bold &&
    !state.dim &&
    !state.hidden &&
    !state.italic &&
    decoration === ''
  ) {
    return undefined;
  }
  return {
    ...(foreground == null ? {} : {color: foreground}),
    ...(background == null ? {} : {backgroundColor: background}),
    ...(state.bold ? {fontWeight: 700} : {}),
    ...(state.dim ? {opacity: 0.72} : {}),
    ...(state.hidden ? {visibility: 'hidden'} : {}),
    ...(state.italic ? {fontStyle: 'italic'} : {}),
    ...(decoration === '' ? {} : {textDecorationLine: decoration}),
  };
}

function consumeControlString(source: string, start: number): number {
  for (let index = start; index < source.length; index++) {
    if (source[index] === BEL || source[index] === C1_ST) {
      return index + 1;
    }
    if (source[index] === ESC && source[index + 1] === '\\') {
      return index + 2;
    }
  }
  return source.length;
}

function consumeCsi(
  source: string,
  start: number,
  state: AnsiState,
  palette: MarkdownAnsiPalette,
): number {
  for (let index = start; index < source.length; index++) {
    const code = source.charCodeAt(index);
    if (code >= 0x40 && code <= 0x7e) {
      if (source[index] === 'm') {
        const parameters = parseSgrParameters(source.slice(start, index));
        if (parameters != null) {
          applySgr(state, parameters, palette);
        }
      }
      return index + 1;
    }
  }
  return source.length;
}

function parseAnsi(source: string, palette: MarkdownAnsiPalette): ParsedAnsi {
  const state = createAnsiState();
  const tokens: SyntaxToken[] = [];
  let text = '';
  let runStart = 0;

  const flush = () => {
    if (text.length > runStart) {
      const style = styleForState(state, palette);
      if (style != null) {
        tokens.push({
          type: 'variable',
          start: runStart,
          end: text.length,
          style,
        });
      }
    }
    runStart = text.length;
  };

  for (let index = 0; index < source.length;) {
    const character = source[index];
    if (character === ESC && source[index + 1] === '[') {
      flush();
      index = consumeCsi(source, index + 2, state, palette);
      continue;
    }
    if (character === C1_CSI) {
      flush();
      index = consumeCsi(source, index + 1, state, palette);
      continue;
    }
    if (character === ESC && source[index + 1] === ']') {
      index = consumeControlString(source, index + 2);
      continue;
    }
    if (character === C1_OSC) {
      index = consumeControlString(source, index + 1);
      continue;
    }
    if (
      character === ESC &&
      (source[index + 1] === 'P' ||
        source[index + 1] === 'X' ||
        source[index + 1] === '^' ||
        source[index + 1] === '_')
    ) {
      index = consumeControlString(source, index + 2);
      continue;
    }
    if (character === ESC) {
      index += Math.min(2, source.length - index);
      continue;
    }

    const code = source.charCodeAt(index);
    if (character === '\n') {
      flush();
      text += character;
      runStart = text.length;
    } else if (
      character === '\t' ||
      (code >= 0x20 && (code < 0x7f || code > 0x9f))
    ) {
      text += character;
    }
    index++;
  }
  flush();
  return {text, tokens};
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

type AnsiCodeBlockInput = MarkdownAnsiData & {
  readonly options: MarkdownAnsiPluginOptions;
};

function AnsiCodeBlock({code, label, options}: AnsiCodeBlockInput) {
  const palette = useMemo(
    () => ({...markdownAnsiDefaultPalette, ...options.palette}),
    [options.palette],
  );
  const parsed = useMemo(() => parseAnsi(code, palette), [code, palette]);
  const tokenizer = useCallback(() => parsed.tokens, [parsed.tokens]);

  return (
    <div
      {...mergeProps(
        themeProps('markdown-ansi'),
        stylex.props(styles.root, options.xstyle),
        options.className,
        options.style,
      )}>
      <CodeBlock
        {...options.codeBlockProps}
        code={parsed.text}
        language="ansi"
        title={label}
        tokenizer={tokenizer}
        highlightMode="spans"
      />
    </div>
  );
}

function createAnsiNode(
  context: MarkdownFenceContext<'ansi'>,
): MarkdownFenceNode<MarkdownAnsiNode> {
  const label = parseFenceLabel(context.meta);
  return {
    type: 'extension',
    plugin: 'markdown-ansi',
    name: 'terminal',
    display: 'block',
    data: {
      code: context.code,
      ...(label == null ? {} : {label}),
    },
  };
}

/** Creates a semantic-fence plugin for exact `ansi` code blocks. */
export function createMarkdownAnsiPlugin(
  options: MarkdownAnsiPluginOptions = {},
): MarkdownPluginEntry<MarkdownAnsiNode> {
  return createMarkdownPlugin<'markdown-ansi', MarkdownAnsiNode>({
    name: 'markdown-ansi',
    apiVersion: 1,
    transform: createMarkdownFenceTransform({
      languages: ['ansi'],
      createNode: createAnsiNode,
    }),
    renderers: {
      terminal: {
        render: ({node}) => (
          <AnsiCodeBlock
            code={node.data.code}
            label={node.data.label}
            options={options}
          />
        ),
        toText: node =>
          parseAnsi(node.data.code, markdownAnsiDefaultPalette).text,
      },
    },
  });
}

/** Default ANSI fence plugin with theme-aware terminal colors. */
export const markdownAnsiPlugin = createMarkdownAnsiPlugin();
