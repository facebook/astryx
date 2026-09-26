// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file mermaid.tsx
 * @input Mermaid fenced-code blocks and optional host-owned Mermaid configuration
 * @output Lazy semantic-fence plugin with sanitized SVG output and CodeBlock fallback
 * @position Optional Markdown diagram adapter; excluded unless its package subpath is imported
 */

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type mermaid from 'mermaid';
import type {MermaidConfig} from 'mermaid';
import {CodeBlock} from '../../CodeBlock';
import {mergeProps} from '../../utils';
import {warnOnce} from '../../utils/devWarning';
import {themeProps} from '../../utils/themeProps';
import {sanitizeMarkdownLinkUrl} from '../url';
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

export type MarkdownMermaidConfig = Omit<
  MermaidConfig,
  | 'htmlLabels'
  | 'logLevel'
  | 'secure'
  | 'securityLevel'
  | 'startOnLoad'
  | 'suppressErrorRendering'
  | 'themeCSS'
>;

export type MarkdownMermaidDiagnosticCode =
  'module-load-failed' | 'render-failed' | 'invalid-svg';

export interface MarkdownMermaidDiagnostic {
  readonly code: MarkdownMermaidDiagnosticCode;
  readonly phase: 'load' | 'render';
  readonly severity: 'error';
}

export interface MarkdownMermaidPluginOptions {
  /** Host-owned Mermaid configuration; security-sensitive fields stay locked. */
  readonly config?: MarkdownMermaidConfig;
  /** Receives source-free failures while the original fence remains visible. */
  readonly onDiagnostic?: (diagnostic: MarkdownMermaidDiagnostic) => void;
  /** Styles the rendered diagram wrapper without changing CodeBlock fallback. */
  readonly xstyle?: stylex.StyleXStyles;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export type MarkdownMermaidData = {
  readonly code: string;
  readonly label?: string;
};

export type MarkdownMermaidNode = MarkdownExtensionNode<
  'markdown-mermaid',
  'diagram',
  MarkdownMermaidData,
  'block'
>;

type MermaidModule = {readonly default: typeof mermaid};

type MermaidRenderState = {
  readonly request: object;
  readonly status: 'ready' | 'failed';
};

const SECURE_CONFIG_KEYS = Object.freeze([
  'secure',
  'securityLevel',
  'startOnLoad',
  'maxTextSize',
  'maxEdges',
  'suppressErrorRendering',
  'htmlLabels',
  'theme',
  'themeVariables',
  'themeCSS',
  'fontFamily',
  'logLevel',
]);

const diagnostics: Readonly<
  Record<MarkdownMermaidDiagnosticCode, MarkdownMermaidDiagnostic>
> = Object.freeze({
  'module-load-failed': Object.freeze({
    code: 'module-load-failed',
    phase: 'load',
    severity: 'error',
  }),
  'render-failed': Object.freeze({
    code: 'render-failed',
    phase: 'render',
    severity: 'error',
  }),
  'invalid-svg': Object.freeze({
    code: 'invalid-svg',
    phase: 'render',
    severity: 'error',
  }),
});

let mermaidModulePromise: Promise<MermaidModule> | undefined;
let mermaidRenderQueue: Promise<void> = Promise.resolve();

async function loadMermaid(): Promise<MermaidModule> {
  // @ts-expect-error -- Mermaid exports this browser bundle without declarations.
  mermaidModulePromise ??= import('mermaid/dist/mermaid.esm.min.mjs');
  return mermaidModulePromise;
}

async function enqueueMermaidRender<T>(task: () => Promise<T>): Promise<T> {
  const result = mermaidRenderQueue.then(task, task);
  mermaidRenderQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function reportFailure(
  code: MarkdownMermaidDiagnosticCode,
  onDiagnostic: MarkdownMermaidPluginOptions['onDiagnostic'],
): void {
  const diagnostic = diagnostics[code];
  const message =
    code === 'module-load-failed'
      ? 'Mermaid could not be loaded; the source fence is shown instead.'
      : code === 'invalid-svg'
        ? 'Mermaid returned invalid SVG; the source fence is shown instead.'
        : 'Mermaid could not render a diagram; the source fence is shown instead.';
  warnOnce(`markdown-mermaid:${code}`, 'MarkdownMermaid', message);
  try {
    onDiagnostic?.(diagnostic);
  } catch {
    warnOnce(
      'markdown-mermaid:diagnostic-callback-failed',
      'MarkdownMermaid',
      'The onDiagnostic callback threw while handling a renderer diagnostic.',
    );
  }
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

function importSafeSvg(svgText: string): SVGSVGElement {
  const parsed = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const svg = parsed.documentElement;
  if (
    svg.localName.toLowerCase() !== 'svg' ||
    svg.namespaceURI !== 'http://www.w3.org/2000/svg'
  ) {
    throw new TypeError('invalid Mermaid SVG');
  }

  for (const element of [svg, ...Array.from(svg.querySelectorAll('*'))]) {
    const name = element.localName.toLowerCase();
    if (
      name === 'script' ||
      name === 'foreignobject' ||
      name === 'iframe' ||
      name === 'object' ||
      name === 'embed'
    ) {
      element.remove();
      continue;
    }
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.toLowerCase().startsWith('on')) {
        element.removeAttribute(attribute.name);
      }
    }
    const href =
      element.getAttribute('href') ??
      element.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
    if (href != null) {
      const safeHref = sanitizeMarkdownLinkUrl(href);
      element.removeAttributeNS('http://www.w3.org/1999/xlink', 'href');
      if (safeHref == null) {
        element.removeAttribute('href');
      } else {
        element.setAttribute('href', safeHref);
      }
    }
    element.removeAttribute('target');
  }

  return document.importNode(svg, true) as unknown as SVGSVGElement;
}

const styles = stylex.create({
  root: {
    display: 'block',
    maxWidth: '100%',
  },
  output: {
    display: 'block',
    maxWidth: '100%',
    overflowX: 'auto',
    overflowY: 'hidden',
    overscrollBehaviorInline: 'contain',
  },
});

type MermaidDiagramInput = MarkdownMermaidData & {
  readonly options: MarkdownMermaidPluginOptions;
};

function MermaidDiagram({code, label, options}: MermaidDiagramInput) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const renderId = useMemo(
    () => `astryx-mermaid-${reactId.replace(/[^A-Za-z0-9_-]/g, '')}`,
    [reactId],
  );
  const request = useMemo(
    () => ({code, config: options.config, renderId}),
    [code, options.config, renderId],
  );
  const [renderState, setRenderState] = useState<MermaidRenderState | null>(
    null,
  );
  const isReady =
    renderState?.request === request && renderState.status === 'ready';

  useEffect(() => {
    let active = true;
    const host = hostRef.current;
    if (host == null) {
      return;
    }
    host.replaceChildren();

    void loadMermaid().then(
      async module => {
        await enqueueMermaidRender(async () => {
          if (!active) {
            return;
          }
          module.default.initialize({
            ...options.config,
            htmlLabels: false,
            logLevel: 'fatal',
            secure: [...SECURE_CONFIG_KEYS],
            securityLevel: 'strict',
            startOnLoad: false,
            suppressErrorRendering: true,
            themeCSS: '',
          });
          const result = await module.default.render(renderId, code);
          if (!active) {
            return;
          }
          let svg: SVGSVGElement;
          try {
            svg = importSafeSvg(result.svg);
          } catch {
            reportFailure('invalid-svg', options.onDiagnostic);
            setRenderState({request, status: 'failed'});
            return;
          }
          host.replaceChildren(svg);
          setRenderState({request, status: 'ready'});
        }).catch(() => {
          if (active) {
            host.replaceChildren();
            reportFailure('render-failed', options.onDiagnostic);
            setRenderState({request, status: 'failed'});
          }
        });
      },
      () => {
        if (active) {
          reportFailure('module-load-failed', options.onDiagnostic);
          setRenderState({request, status: 'failed'});
        }
      },
    );

    return () => {
      active = false;
    };
  }, [code, options, renderId, request]);

  return (
    <div
      role={isReady && label != null ? 'img' : undefined}
      aria-label={isReady ? label : undefined}
      {...mergeProps(
        themeProps('markdown-mermaid'),
        stylex.props(styles.root, options.xstyle),
        options.className,
        options.style,
      )}>
      <div
        ref={hostRef}
        hidden={!isReady}
        aria-hidden={!isReady ? true : undefined}
        {...stylex.props(styles.output)}
      />
      {!isReady ? (
        <CodeBlock
          code={code}
          language="mermaid"
          title={label}
          width="100%"
          isCollapsible
        />
      ) : null}
    </div>
  );
}

function createMermaidNode(
  context: MarkdownFenceContext<'mermaid'>,
): MarkdownFenceNode<MarkdownMermaidNode> {
  const label = parseFenceLabel(context.meta);
  return {
    type: 'extension',
    plugin: 'markdown-mermaid',
    name: 'diagram',
    display: 'block',
    data: {
      code: context.code,
      ...(label == null ? {} : {label}),
    },
  };
}

/** Creates a semantic-fence plugin for `mermaid` code blocks. */
export function createMarkdownMermaidPlugin(
  options: MarkdownMermaidPluginOptions = {},
): MarkdownPluginEntry<MarkdownMermaidNode> {
  return createMarkdownPlugin<'markdown-mermaid', MarkdownMermaidNode>({
    name: 'markdown-mermaid',
    apiVersion: 1,
    transform: createMarkdownFenceTransform({
      languages: ['mermaid'],
      createNode: createMermaidNode,
    }),
    renderers: {
      diagram: {
        render: ({node}) => (
          <MermaidDiagram
            code={node.data.code}
            label={node.data.label}
            options={options}
          />
        ),
        toText: node => node.data.code,
      },
    },
  });
}

/** Default Mermaid fence plugin with strict rendering defaults. */
export const markdownMermaidPlugin = createMarkdownMermaidPlugin();
