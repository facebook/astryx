// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PlaygroundClient.tsx
 * @input URL hash (shared code), user edits, knob edits
 * @output Full-page two-panel playground (editor + live preview)
 * @position app/playground — the interactive XDS code playground.
 *
 * Sidebar: icon-only nav strip — back, Code view, Properties view.
 * Left panel: Monaco editor (Code) or knobs (Properties).
 *   - Code: Monaco editor (controlled) with real XDS .d.ts typedefs.
 *   - Property: component selector + instance picker + knobs that edit the code.
 * Right panel: toolbar (dark mode · target element · viewport
 *   segmented control · share · expand) over a responsive
 *   /playground-preview iframe.
 *
 * The preview iframe is driven via postMessage (preview-code / preview-theme);
 * code lives in React state and is the single source of truth shared by Monaco,
 * the Property knobs, the URL hash, and the preview.
 */

'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import dynamic from 'next/dynamic';
import {loader} from '@monaco-editor/react';
import * as stylex from '@stylexjs/stylex';
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import {XDSButton} from '@xds/core/Button';
import {XDSLink} from '@xds/core/Link';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSToolbar} from '@xds/core/Toolbar';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {useXDSResizable, XDSResizeHandle} from '@xds/core/Resizable';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';
import {
  Code2,
  Moon,
  Palette,
  SlidersHorizontal,
  Sun,
  Monitor,
  Smartphone,
  Maximize2,
  RotateCw,
  Crosshair,
} from 'lucide-react';
import githubLight from './themes/github-light.json';
import githubDark from './themes/github-dark.json';
import {useThemeMode} from '../providers';
import {
  DEFAULT_PLAYGROUND_THEME,
  PLAYGROUND_THEME_OPTIONS,
  themeByValue,
} from './playgroundThemes';
import {templates} from '../../generated/templateRegistry';
import {PreviewStage, type Viewport} from './PreviewStage';
import {BRAND_ICON} from '../../components/XDSWordmark';
import {PropertyPanel} from './PropertyPanel';
import {annotateInstanceIds} from './babelParser';
import {trackCopy} from '../../lib/analytics';
import {PlaygroundThemeEditor} from '../../components/themePlayground/PlaygroundThemeEditor';
import {DEFAULT_CODE} from './defaultCode';

import type * as MonacoTypes from 'monaco-editor';
import type {XDSDefinedTheme} from '@xds/core/theme';

// Self-host Monaco from public/monaco/vs — corpnet blocks the default
// jsdelivr CDN. Configure the singleton loader before the editor initializes.
if (typeof window !== 'undefined') {
  loader.config({paths: {vs: '/monaco/vs'}});
}

/** Monaco instance type — the full runtime object passed to onMount */
type MonacoInstance = typeof MonacoTypes & {
  languages: typeof MonacoTypes.languages & {
    typescript: {
      typescriptDefaults: {
        setCompilerOptions: (options: Record<string, unknown>) => void;
        setDiagnosticsOptions: (options: Record<string, unknown>) => void;
        addExtraLib: (content: string, filePath: string) => void;
      };
      ScriptTarget: Record<string, number>;
      ModuleKind: Record<string, number>;
      JsxEmit: Record<string, number>;
      ModuleResolutionKind: Record<string, number>;
    };
  };
  editor: typeof MonacoTypes.editor & {
    defineTheme: (name: string, data: Record<string, unknown>) => void;
  };
};

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <XDSText color="secondary">Loading editor…</XDSText>
    </div>
  ),
});

function getInitialCode(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_CODE;
  }
  const hash = window.location.hash.slice(1);
  if (!hash) {
    return DEFAULT_CODE;
  }
  const params = new URLSearchParams(hash);
  const compressed = params.get('code');
  if (!compressed) {
    return DEFAULT_CODE;
  }
  try {
    return decompressFromEncodedURIComponent(compressed) || DEFAULT_CODE;
  } catch {
    return DEFAULT_CODE;
  }
}

function updateURL(code: string) {
  const compressed = compressToEncodedURIComponent(code);
  window.history.replaceState(null, '', `#code=${compressed}`);
}

/**
 * Configure Monaco's TypeScript service with real XDS type definitions.
 * Loads .d.ts files from a pre-built JSON bundle (generated at build time).
 */
function configureMonaco(monaco: MonacoInstance) {
  const ts = monaco.languages.typescript.typescriptDefaults;

  ts.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    allowJs: true,
    strict: false,
  });

  ts.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
  });

  // Global declarations for React hooks (available without import in playground)
  ts.addExtraLib(
    `declare function useState<T>(init: T | (() => T)): [T, (v: T | ((prev: T) => T)) => void];
    declare function useEffect(fn: () => void | (() => void), deps?: readonly unknown[]): void;
    declare function useCallback<T extends Function>(fn: T, deps: readonly unknown[]): T;
    declare function useMemo<T>(fn: () => T, deps: readonly unknown[]): T;
    declare function useRef<T>(init: T): { current: T };
    declare function useReducer<S, A>(reducer: (state: S, action: A) => S, init: S): [S, (action: A) => void];
    declare function useContext<T>(ctx: unknown): T;`,
    'file:///globals.d.ts',
  );

  // Lucide icons wildcard stub — gives Monaco a sense of the
  // module's shape so import { Icon } from 'lucide-react' doesn't
  // light up with red squigglies in the playground editor.
  ts.addExtraLib(
    `declare module 'lucide-react' { const icons: Record<string, React.ComponentType<{size?: number | string; color?: string; strokeWidth?: number | string; className?: string}>>; export = icons; }`,
    'file:///node_modules/lucide-react/index.d.ts',
  );

  // Load real type definitions from the pre-built JSON bundle
  fetch('/playground-types.json')
    .then(r => r.json())
    .then((packages: Record<string, Record<string, string>>) => {
      const reactFiles = packages['react'] ?? {};
      for (const [fileName, content] of Object.entries(reactFiles)) {
        ts.addExtraLib(
          content,
          `file:///node_modules/@types/react/${fileName}`,
        );
        // Also register react/jsx-runtime as a resolvable module path
        if (fileName === 'jsx-runtime.d.ts') {
          ts.addExtraLib(
            content,
            'file:///node_modules/react/jsx-runtime.d.ts',
          );
        }
      }

      const stylexFiles = packages['@stylexjs/stylex'] ?? {};
      for (const [fileName, content] of Object.entries(stylexFiles)) {
        ts.addExtraLib(
          content,
          `file:///node_modules/@stylexjs/stylex/${fileName}`,
        );
      }

      // Heroicons ambient declarations, one per size/style variant. Template
      // and example code imports icons by name from
      // '@heroicons/react/{16,20,24}/{outline,solid}', so each declaration
      // exposes the variant's icons as named exports. Without these, every
      // heroicons import lights up with a "Cannot find module" red squiggle
      // once semantic validation turns on below.
      const heroiconFiles = packages['@heroicons/react'] ?? {};
      for (const [fileName, content] of Object.entries(heroiconFiles)) {
        const variant = fileName.replace(/\.d\.ts$/, '');
        ts.addExtraLib(
          content,
          `file:///node_modules/@heroicons/react/${variant}/index.d.ts`,
        );
      }

      const xdsFiles = packages['@xds/core'] ?? {};
      const submoduleReexports: string[] = [];

      for (const [relPath, content] of Object.entries(xdsFiles)) {
        ts.addExtraLib(
          content,
          `file:///node_modules/@xds/core/dist/${relPath}`,
        );

        if (relPath.endsWith('/index.d.ts')) {
          const moduleName = relPath.replace('/index.d.ts', '');
          ts.addExtraLib(
            content,
            `file:///node_modules/@xds/core/${moduleName}/index.d.ts`,
          );
          submoduleReexports.push(moduleName);
        }
      }

      const barrelContent = submoduleReexports
        .map(m => `export * from '@xds/core/${m}';`)
        .join('\n');
      ts.addExtraLib(
        `declare module '@xds/core' {\n${barrelContent}\n}`,
        'file:///node_modules/@xds/core/index.d.ts',
      );

      ts.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });
    })
    .catch(() => {
      // Types unavailable — keep semantic validation disabled
    });
}

type LeftView = 'code' | 'property' | 'theme';
type BuildStatus = 'idle' | 'building' | 'finished' | 'error';

const BUILD_STATUS_META: Record<
  Exclude<BuildStatus, 'idle'>,
  {variant: 'warning' | 'success' | 'error'; label: string}
> = {
  building: {variant: 'warning', label: 'Building…'},
  finished: {variant: 'success', label: 'Build finished'},
  error: {variant: 'error', label: 'Build error'},
};

const s = stylex.create({
  hidden: {
    display: 'none',
  },
  navGroup: {
    gap: 'var(--spacing-2)',
  },
  root: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-surface)',
  },
  sidebar: {
    flexShrink: 0,
    backgroundColor: 'var(--color-background-surface)',
    borderInlineEndWidth: '1px',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'var(--color-border)',
    padding: 'var(--spacing-3)',
  },
  leftPanel: {
    flexShrink: 0,
    overflow: 'hidden',
    minWidth: 0,
  },
  leftPanelHeader: {
    flexShrink: 0,
    paddingBlock: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-3)',
    minHeight: 48,
  },
  tabBody: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  codePane: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },
  themePane: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  rightPanel: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
  },
  buildStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    transitionProperty: 'opacity',
    transitionDuration: '0.5s',
    transitionTimingFunction: 'ease',
  },
});

export function PlaygroundClient() {
  // The editor chrome follows the docsite's own light/dark mode, not the OS
  // (operator) color-scheme preference.
  const {mode: siteMode} = useThemeMode();
  const editorTheme = siteMode === 'dark' ? 'github-dark' : 'github-light';
  const [code, setCode] = useState(getInitialCode);
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  // A ?theme=<value> query param (e.g. from the themes gallery's "Open in
  // Playground") seeds the Theme view with that theme and applies it to the
  // preview. useSearchParams reads it reliably across App Router client-side
  // navigation (a window.location read at mount can be stale on soft nav).
  // Validated against the registered themes; null when absent or unknown so
  // the playground keeps its default, unseeded behavior.
  const searchParams = useSearchParams();
  const rawThemeParam = searchParams.get('theme');
  const themeParam =
    rawThemeParam && rawThemeParam in themeByValue ? rawThemeParam : null;
  const theme = themeParam ?? DEFAULT_PLAYGROUND_THEME;
  // The theme whose values seed the Theme editor: the ?theme= theme on first
  // load, then whichever theme the user picks from the "Apply Theme" dropdown.
  // Changing it remounts the editor (via key) so it re-populates from that theme.
  const [selectedTheme, setSelectedTheme] = useState(theme);
  // The theme object the editor is seeded from. Always defined so the always-
  // mounted Theme editor reflects the active theme and stays the source of truth.
  const editorInitialTheme =
    themeByValue[selectedTheme] ?? themeByValue[DEFAULT_PLAYGROUND_THEME];
  const [activeView, setActiveView] = useState<LeftView>('code');
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [buildStatus, setBuildStatus] = useState<BuildStatus>('idle');
  const [statusFading, setStatusFading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [isTargeting, setIsTargeting] = useState(false);
  const [targetedComponent, setTargetedComponent] = useState<string | null>(
    null,
  );
  const [targetedInstance, setTargetedInstance] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const pendingRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef<MonacoTypes.editor.IStandaloneCodeEditor | null>(
    null,
  );
  // Mirror activeView in a ref so onMount can read the current view without
  // re-creating the (stable) mount callback.
  const activeViewRef = useRef(activeView);
  activeViewRef.current = activeView;
  // Latest theme authored in the Theme view, retained so a mode toggle can
  // re-post it (the iframe clears the custom theme on any string-only push).
  const customThemeRef = useRef<XDSDefinedTheme | null>(null);

  const editorPanel = useXDSResizable({
    defaultSize: 440,
    minSizePx: 340,
    maxSizePx: 760,
    autoSaveId: 'xds-playground-left-width',
  });

  // Seed the initial preview mode from the docsite's mode so the preview opens
  // consistent with the rest of the site. (The toolbar toggle can still switch
  // the preview independently afterward.)
  // Seed once on mount with the current docsite mode; afterward the preview
  // toggle owns this state, so siteMode is intentionally read only initially.
  const initialSiteModeRef = useRef(siteMode);
  useEffect(() => {
    setMode(initialSiteModeRef.current);
  }, []);

  // Re-read code from hash on hashchange (e.g. SPA navigation with new code)
  useEffect(() => {
    const onHashChange = () => {
      const newCode = getInitialCode();
      if (newCode !== DEFAULT_CODE) {
        setCode(newCode);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // When a ?theme= param seeds the playground, open the Theme view so the
  // populated theme editor is visible (and drives the preview) on arrival.
  // Done in an effect (not the initial activeView state) to avoid an
  // SSR/client hydration mismatch on the panel that renders.
  useEffect(() => {
    if (themeParam) {
      setActiveView('theme');
    }
  }, [themeParam]);

  const send = useCallback((c: string) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) {
      return;
    }
    win.postMessage(
      c ? {type: 'preview-code', code: c} : {type: 'preview-clear'},
      window.location.origin,
    );
  }, []);

  // Send the preview an instance-annotated copy of the code (markers let the
  // preview map a selected component to its DOM node for the focus-ring flash).
  const postCode = useCallback(
    (c: string) => send(annotateInstanceIds(c)),
    [send],
  );

  // Push a theme authored in the Theme view to the preview. Sent as raw tokens
  // + components (see the preview-theme protocol) so it survives postMessage.
  const postCustomTheme = useCallback(
    (customTheme: XDSDefinedTheme) => {
      customThemeRef.current = customTheme;
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: 'preview-theme',
          customTokens: customTheme.tokens,
          customComponents: customTheme.components,
          mode,
        },
        window.location.origin,
      );
    },
    [mode],
  );

  // Persistently highlight the DOM node for a given component instance.
  const selectInstance = useCallback((component: string, index: number) => {
    iframeRef.current?.contentWindow?.postMessage(
      {type: 'preview-select', id: `${component}#${index}`},
      window.location.origin,
    );
  }, []);

  const toggleTargeting = useCallback((pressed?: boolean) => {
    setIsTargeting(prev => {
      const next = pressed ?? !prev;
      iframeRef.current?.contentWindow?.postMessage(
        {type: next ? 'targeting-enable' : 'targeting-disable'},
        window.location.origin,
      );
      return next;
    });
  }, []);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) {
        return;
      }
      if (e.data?.type === 'preview-ready') {
        readyRef.current = true;
        setPreviewReady(true);
        if (pendingRef.current != null) {
          postCode(pendingRef.current);
          pendingRef.current = null;
        }
      }
      if (e.data?.type === 'preview-rendered') {
        setBuildStatus('finished');
      }
      if (e.data?.type === 'preview-error') {
        setBuildStatus('error');
      }
      if (e.data?.type === 'targeting-select') {
        setTargetedComponent(e.data.component);
        setTargetedInstance(e.data.index);
        setActiveView('property');
        setIsTargeting(false);
        iframeRef.current?.contentWindow?.postMessage(
          {type: 'targeting-disable'},
          window.location.origin,
        );
      }
      if (e.data?.type === 'targeting-exit') {
        setIsTargeting(false);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [postCode]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (readyRef.current) {
        clearInterval(interval);
        return;
      }
      iframeRef.current?.contentWindow?.postMessage(
        {type: 'preview-ping'},
        window.location.origin,
      );
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Debounced push of code → preview + URL hash
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      if (code) {
        setBuildStatus('building');
      }
      if (!readyRef.current) {
        pendingRef.current = code;
      } else {
        postCode(code);
      }
      updateURL(code);
    }, 400);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [code, postCode]);

  // Theme + mode → preview. Also re-sent once the preview signals ready so a
  // non-default initial theme (e.g. neutral) applies even if this effect first
  // ran before the iframe was listening. Once the Theme editor has produced a
  // theme (seeded via ?theme= or edited by the user), it becomes the source of
  // truth and is applied across ALL views (Code / Properties / Theme) so the
  // preview stays consistent when switching tabs and when toggling light/dark.
  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) {
      return;
    }
    if (customThemeRef.current) {
      const custom = customThemeRef.current;
      win.postMessage(
        {
          type: 'preview-theme',
          customTokens: custom.tokens,
          customComponents: custom.components,
          mode,
        },
        window.location.origin,
      );
    } else {
      win.postMessage(
        {type: 'preview-theme', theme, mode},
        window.location.origin,
      );
    }
  }, [mode, previewReady, activeView, theme]);

  // While the resize handle is dragged, the cursor can pass over the preview
  // iframe — a separate document that swallows pointer events and stalls the
  // drag (the handle listens on window pointermove without pointer capture).
  // Detect the drag (capture phase, since the handle stops propagation) and
  // disable iframe pointer events so events keep reaching window during resize.
  const handleResizeProbe = useCallback((e: React.PointerEvent) => {
    const el = e.target as HTMLElement | null;
    if (el?.closest('[role="separator"]')) {
      setIsResizing(true);
    }
  }, []);

  useEffect(() => {
    if (!isResizing) {
      return;
    }
    const stop = () => setIsResizing(false);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [isResizing]);

  // "Build finished" lingers for 5s, then fades out (0.5s) and disappears.
  useEffect(() => {
    if (buildStatus !== 'finished') {
      setStatusFading(false);
      return;
    }
    const fade = setTimeout(() => setStatusFading(true), 5000);
    const hide = setTimeout(() => {
      setBuildStatus('idle');
      setStatusFading(false);
    }, 5500);
    return () => {
      clearTimeout(fade);
      clearTimeout(hide);
    };
  }, [buildStatus]);

  const handleRebuild = useCallback(() => {
    setBuildStatus('building');
    if (readyRef.current) {
      postCode(code);
    } else {
      pendingRef.current = code;
    }
  }, [postCode, code]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      trackCopy({page: 'playground', target: 'share_url'});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const handleMonacoBeforeMount = useCallback((monaco: MonacoInstance) => {
    monaco.editor.defineTheme('github-light', githubLight);
    monaco.editor.defineTheme('github-dark', githubDark);
  }, []);

  const handleMonacoMount = useCallback(
    (
      editor: MonacoTypes.editor.IStandaloneCodeEditor,
      monaco: MonacoInstance,
    ) => {
      editorRef.current = editor;
      configureMonaco(monaco);
      // Focus on initial mount if the Code view is the active one.
      if (activeViewRef.current === 'code') {
        editor.focus();
      }
    },
    [],
  );

  // Focus the editor (blinking cursor) whenever the Code view becomes active.
  useEffect(() => {
    if (activeView !== 'code') {
      return;
    }
    const id = requestAnimationFrame(() => editorRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [activeView]);

  // Jump to a specific source offset in the editor (used by the Property view's
  // "set in code" links). Switches to the Code view, then reveals + selects the
  // position once Monaco is visible.
  const revealInCode = useCallback((offset: number) => {
    setActiveView('code');
    requestAnimationFrame(() => {
      const editor = editorRef.current;
      const model = editor?.getModel();
      if (!editor || !model) {
        return;
      }
      const pos = model.getPositionAt(offset);
      editor.setPosition(pos);
      editor.revealPositionInCenter(pos);
      editor.focus();
    });
  }, []);

  // Dropdown items for "Apply Theme" — derived from the registered playground
  // themes (PLAYGROUND_THEME_OPTIONS) so any installed @xds/theme-* package
  // shows up automatically. Selecting one re-seeds the Theme editor (and thus
  // the preview) with that theme's values.
  const themeMenuItems = useMemo(
    () =>
      PLAYGROUND_THEME_OPTIONS.map(option => ({
        label: option.label,
        onClick: () => setSelectedTheme(option.value),
      })),
    [],
  );

  // Dropdown items for "Templates" — the published, ready templates from the
  // generated registry (the same source the /templates gallery renders), so any
  // new template shows up automatically. Selecting one loads its source into the
  // editor (setCode drives Monaco, the preview, and the URL hash).
  const templateMenuItems = useMemo(
    () =>
      templates
        .filter(t => !t.isHiddenFromOverview && t.isReady && t.source)
        .map(t => {
          const dash = t.category.indexOf(' - ');
          const group = dash === -1 ? t.category : t.category.slice(0, dash);
          const label =
            t.name.toLowerCase() === group.toLowerCase()
              ? t.name
              : `${group} · ${t.name}`;
          return {label, source: t.source};
        })
        .sort((a, b) => a.label.localeCompare(b.label))
        .map(({label, source}) => ({
          label,
          onClick: () => {
            setCode(source);
            requestAnimationFrame(() => editorRef.current?.focus());
          },
        })),
    [],
  );

  const editorOptions = useMemo(
    () => ({
      minimap: {enabled: false},
      fontSize: 13,
      lineNumbers: 'on' as const,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: 'on' as const,
      padding: {top: 12},
      accessibilitySupport: 'off' as const,
      // Hide scrollbars (wheel/keyboard scrolling still works) + the right-side
      // overview ruler, for a cleaner panel.
      scrollbar: {
        vertical: 'hidden' as const,
        horizontal: 'hidden' as const,
        verticalScrollbarSize: 0,
        horizontalScrollbarSize: 0,
        useShadows: false,
      },
      overviewRulerLanes: 0,
      overviewRulerBorder: false,
      hideCursorInOverviewRuler: true,
    }),
    [],
  );

  return (
    <XDSHStack align="stretch" height="100%" width="100%">
      {/* Playground navigation */}
      <XDSVStack align="center" xstyle={s.sidebar} gap={4}>
        <XDSLink href="/" label="Go to home">
          {BRAND_ICON}
        </XDSLink>
        <XDSToggleButtonGroup
          type="single"
          orientation="vertical"
          label="Playground view"
          value={activeView}
          // Single-select groups allow deselecting to null; guard against it so
          // one view is always active.
          onChange={v => v && setActiveView(v as LeftView)}
          size="md"
          xstyle={s.navGroup}>
          <XDSToggleButton
            value="code"
            label="Code"
            tooltip="Code"
            isIconOnly
            icon={<Code2 size={20} />}
          />
          <XDSToggleButton
            value="property"
            label="Properties"
            tooltip="Properties"
            isIconOnly
            icon={<SlidersHorizontal size={20} />}
          />
          <XDSToggleButton
            value="theme"
            label="Theme"
            tooltip="Theme"
            isIconOnly
            icon={<Palette size={20} />}
          />
        </XDSToggleButtonGroup>
      </XDSVStack>

      {/* Playground content */}
      <XDSHStack
        height="100%"
        xstyle={s.root}
        onPointerDownCapture={handleResizeProbe}>
        {/* Left panel — editor */}
        <XDSVStack xstyle={s.leftPanel} width={editorPanel.size || 440}>
          <XDSHStack
            justify="between"
            align="center"
            xstyle={s.leftPanelHeader}>
            <XDSHeading level={3}>Playground</XDSHeading>
            {activeView === 'code' && (
              <XDSHStack gap={2} align="center">
                <XDSDropdownMenu
                  button={{
                    label: 'Templates',
                    variant: 'secondary',
                    size: 'sm',
                  }}
                  hasChevron
                  items={templateMenuItems}
                />
                <XDSButton variant="secondary" size="sm" label="Copy Code" />
              </XDSHStack>
            )}
            {activeView === 'theme' && (
              <XDSHStack gap={2} align="center">
                <XDSDropdownMenu
                  button={{
                    label: 'Apply Theme',
                    variant: 'secondary',
                    size: 'sm',
                  }}
                  hasChevron
                  items={themeMenuItems}
                />
                <XDSButton variant="secondary" size="sm" label="Export Theme" />
              </XDSHStack>
            )}
          </XDSHStack>
          <div {...stylex.props(s.tabBody)}>
            {/* Code: Monaco stays mounted to preserve typedefs + editor state */}
            <div
              {...stylex.props(s.codePane, activeView !== 'code' && s.hidden)}>
              <MonacoEditor
                defaultLanguage="typescript"
                value={code}
                path="playground.tsx"
                theme={editorTheme}
                onChange={v => setCode(v ?? '')}
                beforeMount={handleMonacoBeforeMount}
                onMount={handleMonacoMount}
                options={editorOptions}
              />
            </div>

            {activeView === 'property' && (
              <PropertyPanel
                code={code}
                onCodeChange={setCode}
                onRevealInCode={revealInCode}
                onFlashInstance={selectInstance}
                externalSelection={
                  targetedComponent != null
                    ? {
                        component: targetedComponent,
                        instanceIndex: targetedInstance,
                      }
                    : undefined
                }
                onExternalSelectionConsumed={() => {
                  setTargetedComponent(null);
                }}
              />
            )}

            {/* Theme: stays mounted (hidden when inactive) to preserve the
                editor's token/component state across tab switches — it only
                changes when the user edits it, not on navigation. */}
            <div
              {...stylex.props(
                s.themePane,
                activeView !== 'theme' && s.hidden,
              )}>
              <PlaygroundThemeEditor
                key={selectedTheme}
                mode={mode}
                initialTheme={editorInitialTheme}
                onThemeChange={postCustomTheme}
              />
            </div>
          </div>
        </XDSVStack>

        <XDSResizeHandle
          label="Resize editor panel"
          resizable={editorPanel.props}
          pillPlacement="center"
          hasDivider
        />

        {/* Right panel — preview */}
        <XDSVStack xstyle={s.rightPanel}>
          <XDSToolbar
            label="Preview controls"
            startContent={
              <XDSToggleButton
                label="Target element"
                tooltip={
                  isTargeting
                    ? 'Exit targeting (Esc)'
                    : 'Click to select an element'
                }
                isPressed={isTargeting}
                onPressedChange={toggleTargeting}
                size="md"
                isIconOnly
                icon={<Crosshair size={20} />}
              />
            }
            centerContent={
              <XDSHStack gap={2} vAlign="center">
                <XDSButton
                  label={
                    mode === 'light' ? 'Switch to dark' : 'Switch to light'
                  }
                  tooltip={mode === 'light' ? 'Dark mode' : 'Light mode'}
                  variant="ghost"
                  size="md"
                  isIconOnly
                  icon={
                    mode === 'light' ? <Moon size={20} /> : <Sun size={20} />
                  }
                  onClick={() =>
                    setMode(m => (m === 'light' ? 'dark' : 'light'))
                  }
                />
                <XDSSegmentedControl
                  label="Viewport size"
                  size="md"
                  value={viewport}
                  onChange={v => setViewport(v as Viewport)}>
                  <XDSSegmentedControlItem
                    value="desktop"
                    label="Desktop"
                    isLabelHidden
                    icon={<Monitor size={20} />}
                  />
                  <XDSSegmentedControlItem
                    value="phone"
                    label="Phone"
                    isLabelHidden
                    icon={<Smartphone size={20} />}
                  />
                </XDSSegmentedControl>
                <XDSButton
                  label="Expand"
                  tooltip="Fullscreen preview"
                  variant="ghost"
                  size="md"
                  isIconOnly
                  icon={<Maximize2 size={20} />}
                  onClick={() => setIsFullscreen(true)}
                />
              </XDSHStack>
            }
            endContent={
              <XDSHStack gap={4} vAlign="center">
                {buildStatus !== 'idle' && (
                  <div
                    {...stylex.props(s.buildStatus)}
                    style={{opacity: statusFading ? 0 : 1}}>
                    <XDSStatusDot
                      variant={BUILD_STATUS_META[buildStatus].variant}
                      label={BUILD_STATUS_META[buildStatus].label}
                      isPulsing={buildStatus === 'building'}
                    />
                    <XDSText type="supporting" color="secondary">
                      {BUILD_STATUS_META[buildStatus].label}
                    </XDSText>
                    {buildStatus === 'error' && (
                      <XDSButton
                        label="Rebuild"
                        tooltip="Rebuild"
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        icon={<RotateCw size={16} />}
                        onClick={handleRebuild}
                      />
                    )}
                  </div>
                )}
                <XDSButton
                  label={copied ? '✓ Copied' : 'Share'}
                  variant="primary"
                  size="md"
                  onClick={handleShare}
                />
              </XDSHStack>
            }
          />
          <PreviewStage
            viewport={viewport}
            isFullscreen={isFullscreen}
            onExitFullscreen={() => setIsFullscreen(false)}
            iframeRef={iframeRef}
            isInteractionDisabled={isResizing}
          />
        </XDSVStack>
      </XDSHStack>
    </XDSHStack>
  );
}
