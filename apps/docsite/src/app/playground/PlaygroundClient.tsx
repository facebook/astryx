// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PlaygroundClient.tsx
 * @input URL hash (shared code), user edits, knob edits
 * @output Full-page two-panel playground (editor + live preview)
 * @position app/playground — the interactive XDS code playground.
 *
 * Left panel: back + tabs (Code · Property · Craft).
 *   - Code: Monaco editor (controlled) with real XDS .d.ts typedefs.
 *   - Property: component selector + instance picker + knobs that edit the code.
 *   - Craft: disabled AI chat placeholder.
 * Right panel: toolbar (theme + dark mode · viewport segmented control ·
 *   expand · reset · share) over a responsive /playground-preview iframe.
 *
 * The preview iframe is driven via postMessage (preview-code / preview-theme);
 * code lives in React state and is the single source of truth shared by Monaco,
 * the Property knobs, the URL hash, and the preview.
 */

'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import dynamic from 'next/dynamic';
import {loader} from '@monaco-editor/react';
import {useRouter} from 'next/navigation';
import * as stylex from '@stylexjs/stylex';
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import {XDSButton} from '@xds/core/Button';
import {XDSSelector} from '@xds/core/Selector';
import {XDSHStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSToolbar} from '@xds/core/Toolbar';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {useXDSResizable, XDSResizeHandle} from '@xds/core/Resizable';
import {XDSToggleButton} from '@xds/core/ToggleButton';
import {
  ArrowLeft,
  Moon,
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
  PLAYGROUND_THEME_OPTIONS,
  DEFAULT_PLAYGROUND_THEME,
} from './playgroundThemes';
import {PreviewStage, type Viewport} from './PreviewStage';
import {PropertyPanel} from './PropertyPanel';
import {annotateInstanceIds} from './babelParser';

import type * as MonacoTypes from 'monaco-editor';

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

const DEFAULT_CODE = `import {
  XDSButton,
  XDSText,
  XDSHeading,
  XDSVStack,
  XDSHStack,
  XDSCard,
  XDSBadge,
} from '@xds/core';

export default function Demo() {
  const [count, setCount] = useState(0);

  return (
    <XDSCard maxWidth={400}>
      <XDSVStack gap={4}>
        <XDSVStack>
          <XDSHeading level={3}>
            Astryx Playground
          </XDSHeading>
          <XDSText color="secondary">
            Edit the code and see live changes.
          </XDSText>
        </XDSVStack>
        <XDSHStack gap={2} align="center">
          <XDSButton
            label={\`Count: \${count}\`}
            onClick={() => setCount(c => c + 1)}
          />
          <XDSBadge variant="info" label={\`\${count} clicks\`} />
        </XDSHStack>
      </XDSVStack>
    </XDSCard>
  );
}`;

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

type LeftTab = 'code' | 'property' | 'craft';
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
  root: {
    display: 'flex',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-surface)',
  },
  leftPanel: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minWidth: 0,
  },
  panelHeader: {
    flexShrink: 0,
    padding: 'var(--spacing-2) var(--spacing-2) 0',
  },
  tabStretch: {
    flex: 1,
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
    marginBlockStart: 'var(--spacing-1)',
  },
  hidden: {
    display: 'none',
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
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
  const router = useRouter();
  // The editor chrome follows the docsite's own light/dark mode, not the OS
  // (operator) color-scheme preference.
  const {mode: siteMode} = useThemeMode();
  const editorTheme = siteMode === 'dark' ? 'github-dark' : 'github-light';
  const [code, setCode] = useState(getInitialCode);
  const [theme, setTheme] = useState(DEFAULT_PLAYGROUND_THEME);
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<LeftTab>('code');
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [buildStatus, setBuildStatus] = useState<BuildStatus>('idle');
  const [statusFading, setStatusFading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [isTargeting, setIsTargeting] = useState(false);
  const [targetedComponent, setTargetedComponent] = useState<string | null>(null);
  const [targetedInstance, setTargetedInstance] = useState(0);

  // The code the playground was seeded with (a shared/example snippet from the
  // URL hash, or the default). Reset restores this — not the hardcoded default.
  const seedCodeRef = useRef(code);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const pendingRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef<MonacoTypes.editor.IStandaloneCodeEditor | null>(
    null,
  );
  // Mirror activeTab in a ref so onMount can read the current tab without
  // re-creating the (stable) mount callback.
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

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
        // A new shared/example snippet became the seed — Reset targets it.
        seedCodeRef.current = newCode;
        setCode(newCode);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

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
        setActiveTab('property');
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
  // ran before the iframe was listening.
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {type: 'preview-theme', theme, mode},
      window.location.origin,
    );
  }, [theme, mode, previewReady]);

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
      // Focus on initial mount if the Code tab is the active one.
      if (activeTabRef.current === 'code') {
        editor.focus();
      }
    },
    [],
  );

  // Focus the editor (blinking cursor) whenever the Code tab becomes active.
  useEffect(() => {
    if (activeTab !== 'code') {
      return;
    }
    const id = requestAnimationFrame(() => editorRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [activeTab]);

  // Jump to a specific source offset in the editor (used by the Property tab's
  // "set in code" links). Switches to the Code tab, then reveals + selects the
  // position once Monaco is visible.
  const revealInCode = useCallback((offset: number) => {
    setActiveTab('code');
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
    <div {...stylex.props(s.root)} onPointerDownCapture={handleResizeProbe}>
      {/* Left panel — editor */}
      <div
        {...stylex.props(s.leftPanel)}
        style={{width: editorPanel.size || 440}}>
        <XDSHStack gap={2} vAlign="center" xstyle={s.panelHeader}>
          <XDSButton
            label="Back"
            tooltip="Back"
            variant="ghost"
            size="md"
            isIconOnly
            icon={<ArrowLeft size={20} />}
            onClick={() => router.back()}
          />
          <XDSTabList
            value={activeTab}
            onChange={v => setActiveTab(v as LeftTab)}
            size="md"
            xstyle={s.tabStretch}>
            <XDSTab value="code" label="Code" xstyle={s.tabStretch} />
            <XDSTab value="property" label="Properties" xstyle={s.tabStretch} />
          </XDSTabList>
        </XDSHStack>

        <div {...stylex.props(s.tabBody)}>
          {/* Code: Monaco stays mounted to preserve typedefs + editor state */}
          <div {...stylex.props(s.codePane, activeTab !== 'code' && s.hidden)}>
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

          {activeTab === 'property' && (
            <PropertyPanel
              code={code}
              onCodeChange={setCode}
              onRevealInCode={revealInCode}
              onFlashInstance={selectInstance}
              externalSelection={targetedComponent != null ? {
                component: targetedComponent,
                instanceIndex: targetedInstance,
              } : undefined}
              onExternalSelectionConsumed={() => {
                setTargetedComponent(null);
              }}
            />
          )}
        </div>
      </div>

      <XDSResizeHandle
        label="Resize editor panel"
        resizable={editorPanel.props}
        pillPlacement="center"
      />

      {/* Right panel — preview */}
      <div {...stylex.props(s.rightPanel)}>
        <XDSToolbar
          label="Preview controls"
          startContent={
            <XDSHStack gap={2} vAlign="center">
              <XDSSelector
                label="Theme"
                isLabelHidden
                options={PLAYGROUND_THEME_OPTIONS}
                value={theme}
                onChange={setTheme}
                size="md"
              />
              <XDSButton
                label={mode === 'light' ? 'Switch to dark' : 'Switch to light'}
                tooltip={mode === 'light' ? 'Dark mode' : 'Light mode'}
                variant="ghost"
                size="md"
                isIconOnly
                icon={mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                onClick={() => setMode(m => (m === 'light' ? 'dark' : 'light'))}
              />
              <XDSToggleButton
                label="Target element"
                tooltip={isTargeting ? 'Exit targeting (Esc)' : 'Click to select an element'}
                isPressed={isTargeting}
                onPressedChange={toggleTargeting}
                size="md"
                isIconOnly
                icon={<Crosshair size={20} />}
              />
            </XDSHStack>
          }
          centerContent={
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
          }
          endContent={
            <XDSHStack gap={2} vAlign="center">
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
                label="Expand"
                tooltip="Fullscreen preview"
                variant="ghost"
                size="md"
                isIconOnly
                icon={<Maximize2 size={20} />}
                onClick={() => setIsFullscreen(true)}
              />
              <XDSButton
                label="Reset"
                variant="ghost"
                size="md"
                onClick={() => setCode(seedCodeRef.current)}
              />
              <XDSButton
                label={copied ? '✓ Copied' : 'Share'}
                variant={copied ? 'primary' : 'secondary'}
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
      </div>
    </div>
  );
}
