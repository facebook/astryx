// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MarkdownKaTeX.tsx
 * @input Inert Markdown math expressions and optional KaTeX renderer configuration
 * @output Lazy, accessible KaTeX rendering with a readable source fallback
 * @position Optional Markdown math adapter; excluded unless its package subpath is imported
 */

import {useEffect, useMemo, useRef, useState, type ComponentType} from 'react';
import * as stylex from '@stylexjs/stylex';
import type katex from 'katex';
import type {KatexOptions} from 'katex';
import type {BaseProps} from '../../BaseProps';
import {spacingVars} from '../../theme/tokens.stylex';
import {Code} from '../../Code';
import {mergeProps} from '../../utils';
import {themeProps} from '../../utils/themeProps';
import {warnOnce} from '../../utils/devWarning';

export interface MarkdownMathRendererInput {
  readonly value: string;
  readonly display: 'inline' | 'block';
}

export type MarkdownKaTeXOptions = Omit<
  KatexOptions,
  'displayMode' | 'output' | 'strict' | 'throwOnError' | 'trust'
>;

export type MarkdownKaTeXDiagnosticCode =
  'module-load-failed' | 'typeset-failed';

export interface MarkdownKaTeXDiagnostic {
  readonly code: MarkdownKaTeXDiagnosticCode;
  readonly phase: 'load' | 'render';
  readonly severity: 'error';
}

export interface MarkdownKaTeXProps
  extends BaseProps<HTMLSpanElement>, MarkdownMathRendererInput {
  ref?: React.Ref<HTMLSpanElement>;
  /** KaTeX options except the accessibility and safety values owned here. */
  katexOptions?: MarkdownKaTeXOptions;
  /** Receives a source-free diagnostic when loading or typesetting fails. */
  onDiagnostic?: (diagnostic: MarkdownKaTeXDiagnostic) => void;
}

export interface MarkdownKaTeXRendererOptions {
  readonly katexOptions?: MarkdownKaTeXOptions;
  readonly onDiagnostic?: (diagnostic: MarkdownKaTeXDiagnostic) => void;
  readonly xstyle?: stylex.StyleXStyles;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

type KaTeXModule = {readonly default: typeof katex};

let katexModulePromise: Promise<KaTeXModule> | undefined;

async function importKaTeX(): Promise<KaTeXModule> {
  const [, module] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Core sees the local shim; source-mapped consumers do not.
    // @ts-ignore KaTeX publishes this stylesheet without type declarations.
    import('katex/dist/katex.min.css'),
    import('katex'),
  ]);
  return module;
}

async function loadKaTeX(): Promise<KaTeXModule> {
  katexModulePromise ??= importKaTeX();
  return katexModulePromise;
}

const diagnostics: Readonly<
  Record<MarkdownKaTeXDiagnosticCode, MarkdownKaTeXDiagnostic>
> = Object.freeze({
  'module-load-failed': Object.freeze({
    code: 'module-load-failed',
    phase: 'load',
    severity: 'error',
  }),
  'typeset-failed': Object.freeze({
    code: 'typeset-failed',
    phase: 'render',
    severity: 'error',
  }),
});

function reportFailure(
  code: MarkdownKaTeXDiagnosticCode,
  onDiagnostic: MarkdownKaTeXProps['onDiagnostic'],
): void {
  const diagnostic = diagnostics[code];
  warnOnce(
    `markdown-katex:${code}`,
    'MarkdownKaTeX',
    code === 'module-load-failed'
      ? 'KaTeX could not be loaded; the source expression is shown instead.'
      : 'KaTeX could not typeset an expression; its source is shown instead.',
  );
  try {
    onDiagnostic?.(diagnostic);
  } catch {
    warnOnce(
      'markdown-katex:diagnostic-callback-failed',
      'MarkdownKaTeX',
      'The onDiagnostic callback threw while handling a renderer diagnostic.',
    );
  }
}

const styles = stylex.create({
  root: {
    color: 'inherit',
    maxWidth: '100%',
  },
  inline: {
    display: 'inline',
  },
  block: {
    display: 'block',
    marginBlock: spacingVars['--spacing-4'],
    overflowX: 'auto',
    overflowY: 'hidden',
    overscrollBehaviorInline: 'contain',
  },
  renderedBlock: {
    display: 'block',
    minWidth: 'max-content',
  },
  fallbackBlock: {
    display: 'block',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },
});

/**
 * Math renderer for Markdown that loads KaTeX only after an expression mounts.
 * It always requests MathML alongside visual HTML and never enables trusted
 * author commands. Import it from `@astryxdesign/core/Markdown/katex`.
 */
export function MarkdownKaTeX({
  value,
  display,
  katexOptions,
  onDiagnostic,
  xstyle,
  className,
  style,
  ref,
  ...props
}: MarkdownKaTeXProps) {
  const renderedRef = useRef<HTMLSpanElement>(null);
  const request = useMemo(
    () => ({display, katexOptions, value}),
    [display, katexOptions, value],
  );
  const [completedRequest, setCompletedRequest] = useState<object | null>(null);
  const isReady = completedRequest === request;

  useEffect(() => {
    let active = true;
    const host = renderedRef.current;
    if (host == null) {
      return;
    }

    host.replaceChildren();
    void loadKaTeX().then(
      module => {
        if (!active) {
          return;
        }
        try {
          module.default.render(value, host, {
            ...katexOptions,
            displayMode: display === 'block',
            output: 'htmlAndMathml',
            strict: 'ignore',
            throwOnError: true,
            trust: false,
          });
          setCompletedRequest(request);
        } catch {
          host.replaceChildren();
          reportFailure('typeset-failed', onDiagnostic);
        }
      },
      () => {
        if (active) {
          reportFailure('module-load-failed', onDiagnostic);
        }
      },
    );

    return () => {
      active = false;
    };
  }, [display, katexOptions, onDiagnostic, request, value]);

  const source = display === 'block' ? `$$${value}$$` : `$${value}$`;

  return (
    <span
      ref={ref}
      {...props}
      {...mergeProps(
        themeProps('markdown-katex', {display}),
        stylex.props(
          styles.root,
          display === 'block' ? styles.block : styles.inline,
          xstyle,
        ),
        className,
        style,
      )}>
      <span
        ref={renderedRef}
        hidden={!isReady}
        aria-hidden={!isReady ? true : undefined}
        {...stylex.props(display === 'block' && styles.renderedBlock)}
      />
      {!isReady ? (
        <Code
          size="inherit"
          xstyle={display === 'block' ? styles.fallbackBlock : undefined}>
          {source}
        </Code>
      ) : null}
    </span>
  );
}

MarkdownKaTeX.displayName = 'MarkdownKaTeX';

/** Creates a stable `components.math` renderer with shared KaTeX options. */
export function createMarkdownKaTeXRenderer(
  options: MarkdownKaTeXRendererOptions = {},
): ComponentType<MarkdownMathRendererInput> {
  function ConfiguredMarkdownKaTeX(props: MarkdownMathRendererInput) {
    return <MarkdownKaTeX {...options} {...props} />;
  }
  ConfiguredMarkdownKaTeX.displayName = 'ConfiguredMarkdownKaTeX';
  return ConfiguredMarkdownKaTeX;
}
