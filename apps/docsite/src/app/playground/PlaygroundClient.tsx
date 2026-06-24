// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file PlaygroundClient.tsx
 * @input URL hash (shared code), user edits, knob edits
 * @output Full-page two-panel playground (editor + live preview)
 * @position app/playground — the interactive XDS code playground.
 *
 * AppShell: side-nav-only shell; desktop nav is controlled collapsed to
 * an icon rail while AppShell owns the mobile top bar and drawer.
 * Left panel: Monaco editor (Code) or knobs (Properties).
 *   - Code: Monaco editor (controlled) with real XDS .d.ts typedefs.
 *   - Property: component selector + instance picker + knobs that edit the code.
 * Right panel: toolbar (dark mode · target element · viewport
 *   segmented control · share · expand) over a responsive
 *   /playground/preview iframe.
 *
 * The preview iframe is driven via postMessage (preview-code / preview-theme);
 * code lives in React state and is the single source of truth shared by Monaco,
 * the Property knobs, the URL hash, and the preview.
 */

'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import dynamic from 'next/dynamic';
import * as stylex from '@stylexjs/stylex';
import {AppShell} from '@astryxdesign/core/AppShell';
import {compressCode, decompressCode} from '../../lib/compress';
import {Button} from '@astryxdesign/core/Button';
import {Link} from '@astryxdesign/core/Link';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Center} from '@astryxdesign/core/Center';
import {Spinner} from '@astryxdesign/core/Spinner';
import {Popover} from '@astryxdesign/core/Popover';
import {TextInput} from '@astryxdesign/core/TextInput';
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from '@astryxdesign/core/SideNav';
import {Text, Heading} from '@astryxdesign/core/Text';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {TopNav, TopNavHeading} from '@astryxdesign/core/TopNav';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {useResizable, ResizeHandle} from '@astryxdesign/core/Resizable';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Moon,
  Palette,
  PenTool,
  Sun,
  Monitor,
  Smartphone,
  Maximize2,
  RotateCw,
  Crosshair,
} from 'lucide-react';
import githubLight from './codeEditorThemes/github-light.json';
import githubDark from './codeEditorThemes/github-dark.json';
import {useThemeMode} from '../providers';
import {PLAYGROUND_PRESETS, themeByValue} from './previewThemes';
import {templates} from '../../generated/templateRegistry';
import {PreviewStage, type Viewport} from './PreviewStage';
import {ConfirmDialog} from './ConfirmDialog';
import {AstryxIcon} from '../../components/logos';
import {annotateInstanceIds} from './propertyEditor/componentInstances';
import {trackCopy} from '../../lib/analytics';
import {ThemeEditor} from './themeEditor/ThemeEditor';
import {generateThemeCode} from './themeEditor/helpers';
import {
  readThemeModel,
  writeThemeModel,
  stripThemeWrapper,
  ensureThemeScaffold,
  coerceTokenMap,
  ALL_TOKEN_DEFAULTS,
} from './themeSource';
import {DEFAULT_CODE} from './defaultCode';
import {stripCodeExampleCopyrightHeader} from '../../lib/codeExamples';
import {configureMonaco, type MonacoInstance} from './monacoSetup';
import {DesignEditor, type DesignSelection} from './designEditor/DesignEditor';
import type {StyleApplyTarget} from './styleOverride/StyleScopeEditor';

import type * as MonacoTypes from 'monaco-editor';
import type {DefinedTheme} from '@astryxdesign/core/theme';

// Hidden from the generated registry (isHiddenFromOverview), so it's added
// explicitly as the first entry in the Templates dropdown.
const THEME_SHOWCASE_SOURCE =
  templates.find(t => t.slug === 'theme-showcase')?.source ?? '';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <Center height="100%">
      <Spinner label="Loading editor…" />
    </Center>
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
    return decompressCode(compressed) || DEFAULT_CODE;
  } catch {
    return DEFAULT_CODE;
  }
}

function updateURL(code: string) {
  const compressed = compressCode(code);
  window.history.replaceState(null, '', `#code=${compressed}`);
}

type LeftView = 'code' | 'design' | 'theme';
type MobileTopTab = 'preview' | 'code' | 'design' | 'theme';
type BuildStatus = 'idle' | 'building' | 'finished' | 'error';
const MOBILE_BREAKPOINT_QUERY = '(max-width: 768px)';

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
  targetingActive: {
    backgroundColor: 'var(--color-background-blue)',
    color: 'var(--color-icon-blue)',
  },
  shareInput: {
    width: 300,
  },
  popoverPadding: {
    padding: 'var(--spacing-4)',
  },
  root: {
    flex: 1,
    minWidth: 0,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-surface)',
  },
  leftPanel: {
    flexShrink: {
      default: 0,
      '@media (max-width: 768px)': 1,
    },
    overflow: 'hidden',
    minWidth: 0,
    maxWidth: '100%',
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
    overflow: 'hidden',
  },
  pane: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },
  rightPanel: {
    flex: 1,
    minWidth: 0,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
  },
  buildStatus: {
    transitionProperty: 'opacity',
    transitionDuration: '0.5s',
    transitionTimingFunction: 'ease',
  },
  buildStatusFaded: {
    opacity: 0,
  },
  sideNavHeading: {
    paddingInline: {
      default: null,
      '@media (min-width: 769px)': 'var(--spacing-1)',
    },
  },
  desktopCollapsedSideNav: {
    width: {
      default: null,
      '@media (min-width: 769px)': 'calc(var(--spacing-12) + var(--spacing-2))',
    },
  },
});

interface PlaygroundClientProps {
  defaultIsMobile?: boolean;
}

export function PlaygroundClient({defaultIsMobile}: PlaygroundClientProps) {
  const isMobile = useMediaQuery(MOBILE_BREAKPOINT_QUERY, defaultIsMobile);
  // The editor chrome follows the docsite's own light/dark mode, not the OS
  // (operator) color-scheme preference.
  const {mode: siteMode} = useThemeMode();
  const editorTheme = siteMode === 'dark' ? 'github-dark' : 'github-light';
  const [code, setCode] = useState(getInitialCode);
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  // A ?theme=<value> query param (e.g. from the themes gallery's "Open in
  // Playground") seeds the Theme view and preview. useSearchParams reads it
  // reliably across soft navigation; validated against registered themes.
  const searchParams = useSearchParams();
  const rawThemeParam = searchParams.get('theme');
  const themeParam =
    rawThemeParam && rawThemeParam in themeByValue ? rawThemeParam : null;
  const [activeView, setActiveView] = useState<LeftView>('code');
  // Bumped to remount the Theme editor so it re-seeds from the code (the single
  // source of truth) — on entering Theme view, applying a theme, or loading a
  // template. While editing inside the Theme view the key is stable, so the
  // editor keeps its own state and writes flow one way (editor → code).
  const [themeEditorKey, setThemeEditorKey] = useState(0);
  // Last preset applied from the Presets tab — drives the active card. Cleared
  // conceptually once the user customizes, but kept as a "starting point" hint.
  const [selectedPreset, setSelectedPreset] = useState(themeParam ?? '');
  // Active Theme-editor tab. Owned here (not inside ThemeEditor) so it persists
  // across the editor's remounts (preset apply, template load, view switches).
  const [themePanelTab, setThemePanelTab] = useState<
    'presets' | 'theme' | 'tokens'
  >('theme');
  const [mobileTab, setMobileTab] = useState<MobileTopTab>('code');
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [buildStatus, setBuildStatus] = useState<BuildStatus>('idle');
  const [statusFading, setStatusFading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [themeName, setThemeName] = useState('');
  const [previewReady, setPreviewReady] = useState(false);
  const [isTargeting, setIsTargeting] = useState(false);
  // The element selected in the preview (via targeting), edited in the Design
  // Editor view. selectionNonce bumps on each new selection to reseed the Style
  // draft even when re-selecting the same element.
  const [selection, setSelection] = useState<DesignSelection | null>(null);
  const [selectionNonce, setSelectionNonce] = useState(0);
  // Pending confirmations: applying an example theme / loading a template both
  // discard the user's current work, so the choice is held until they confirm.
  // The matching dialog is open whenever the value is non-null.
  const [pendingExampleTheme, setPendingExampleTheme] = useState<string | null>(
    null,
  );
  const [pendingTemplateSource, setPendingTemplateSource] = useState<
    string | null
  >(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const pendingRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef<MonacoTypes.editor.IStandaloneCodeEditor | null>(
    null,
  );
  // Points at the hidden theme-export download link (below); the Download button
  // clicks it for native download behavior from a real <a>.
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);
  // Mirror activeView in a ref so the stable onMount callback can read it.
  const activeViewRef = useRef(activeView);
  activeViewRef.current = activeView;

  const editorPanel = useResizable({
    defaultSize: 440,
    minSizePx: 340,
    maxSizePx: 760,
    autoSaveId: 'astryx-playground-left-width',
  });

  // Seed the preview mode once from the docsite's mode; afterward the toolbar
  // toggle owns it, so siteMode is intentionally read only on mount.
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

  // Re-read the hash once on mount. On soft navigation (e.g. the Themes page's
  // "Open in Playground" <Link>) the App Router commits the URL after first
  // render, so the synchronous seed above can miss the fragment, and no
  // hashchange fires. Adopt the committed hash's code here if present.
  useEffect(() => {
    const seeded = getInitialCode();
    if (seeded !== DEFAULT_CODE) {
      setCode(prev => (prev === seeded ? prev : seeded));
    }
    // Runs once on mount; the hashchange listener above covers later changes.
  }, []);

  // When a ?theme= param seeds the playground, open the Theme view so the
  // populated theme editor is visible (and drives the preview) on arrival.
  // Done in an effect (not the initial activeView state) to avoid an
  // SSR/client hydration mismatch on the panel that renders.

  // Single channel to the preview iframe; no-ops until the iframe exists.
  const postToPreview = useCallback((message: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(
      message,
      window.location.origin,
    );
  }, []);

  const send = useCallback(
    (c: string, source?: string) => {
      postToPreview(
        c ? {type: 'preview-code', code: c, source} : {type: 'preview-clear'},
      );
    },
    [postToPreview],
  );

  // Send the preview an instance-annotated copy of the code (markers let the
  // preview map a selected component to its DOM node for the focus-ring flash),
  // plus the clean source so the in-preview Properties popover can parse + edit
  // against un-annotated offsets.
  const postCode = useCallback(
    // Execute the user's UI without the in-code <Theme> wrapper — the preview
    // runtime neutralizes user-authored theming (see generate-scope.mjs), so we
    // strip it and apply the parsed theme via postThemeFromCode instead. The
    // FULL source is sent alongside so the in-preview popovers can parse + edit
    // the defineTheme literal and the component instances.
    (c: string) => send(annotateInstanceIds(stripThemeWrapper(c)), c),
    [send],
  );

  // Apply the theme declared in the code (parsed from its defineTheme literal)
  // to the preview. The code is the single source of truth for the theme.
  const postThemeFromCode = useCallback(
    (c: string) => {
      const parsed = readThemeModel(c);
      postToPreview({
        type: 'preview-theme',
        customTokens: parsed?.model.tokens ?? {},
        customComponents: parsed?.model.components ?? {},
        mode,
      });
    },
    [mode, postToPreview],
  );

  // Theme editor (Base Styles / Advanced) → write tokens into the code's
  // defineTheme literal. Components are preserved (they're edited via targeting).
  const handleThemeEditorChange = useCallback((nextTheme: DefinedTheme) => {
    setCode(prev => {
      const base = readThemeModel(prev) ? prev : ensureThemeScaffold(prev);
      const parsed = readThemeModel(base);
      if (!parsed) {
        return prev;
      }
      const next = writeThemeModel(base, {
        ...parsed.model,
        tokens: coerceTokenMap(nextTheme.tokens as Record<string, unknown>),
      });
      return next === prev ? prev : next;
    });
  }, []);

  // "Themes" dropdown / ?theme= → write the chosen theme's tokens + components
  // into the code's defineTheme literal, then re-seed the editor.
  const applyExampleTheme = useCallback((value: string) => {
    const t = themeByValue[value];
    if (!t) {
      return;
    }
    setCode(prev => {
      const base = readThemeModel(prev) ? prev : ensureThemeScaffold(prev);
      const parsed = readThemeModel(base);
      if (!parsed) {
        return prev;
      }
      return writeThemeModel(base, {
        name: value,
        tokens: coerceTokenMap((t.tokens ?? {}) as Record<string, unknown>),
        components: (t.components as Record<string, unknown>) ?? {},
      });
    });
    setSelectedPreset(value);
    setThemeEditorKey(k => k + 1);
  }, []);

  // When a ?theme= param seeds the playground, write that theme into the code
  // and open the Theme view so the populated editor is visible on arrival.
  useEffect(() => {
    if (themeParam) {
      applyExampleTheme(themeParam);
      setActiveView('theme');
    }
  }, [themeParam, applyExampleTheme]);

  // Default the playground to the Neutral theme — the same theme the docsite's
  // other component previews use (see ComponentPreviewTheme) — so a fresh
  // session matches the rest of the site. Seed it whenever the landing code
  // carries no theme of its own (a pristine load OR a shared link whose
  // appTheme has no overrides). Skipped when a ?theme= param or a real shared
  // theme is present, so we never clobber an intentional theme.
  const didSeedDefaultRef = useRef(false);
  useEffect(() => {
    if (didSeedDefaultRef.current) {
      return;
    }
    didSeedDefaultRef.current = true;
    if (themeParam) {
      return;
    }
    const model = readThemeModel(code)?.model;
    const hasTheme =
      model != null &&
      (Object.keys(model.tokens).length > 0 ||
        Object.keys(model.components).length > 0);
    if (hasTheme) {
      return;
    }
    // Runs once on mount (guarded by the ref); reads the initial code only.
    applyExampleTheme('neutral');
  }, [themeParam, applyExampleTheme]);

  const toggleTargeting = useCallback(
    (pressed?: boolean) => {
      setIsTargeting(prev => {
        const next = pressed ?? !prev;
        postToPreview({type: next ? 'targeting-enable' : 'targeting-disable'});
        return next;
      });
    },
    [postToPreview],
  );

  // Clear the Design Editor's selection and the preview's selection overlay.
  const handleDeselect = useCallback(() => {
    setSelection(null);
    postToPreview({type: 'selection-clear'});
  }, [postToPreview]);

  // Preview which elements a Style apply target would affect (hover the apply
  // buttons in the Design Editor) by outlining them in the preview iframe.
  const handlePreviewTarget = useCallback(
    (target: StyleApplyTarget | null) => {
      postToPreview({type: 'style-preview-target', target});
    },
    [postToPreview],
  );

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
        // Selecting an element opens the Design Editor on it. The preview draws
        // the selection badge/outline; editing happens in the left panel.
        setSelection({
          component: e.data.component,
          index: e.data.index ?? 0,
        });
        setSelectionNonce(n => n + 1);
        setActiveView('design');
        setMobileTab('design');
        setIsTargeting(false);
        postToPreview({type: 'targeting-disable'});
      }
      if (e.data?.type === 'targeting-deselect') {
        setSelection(null);
      }
      if (e.data?.type === 'targeting-exit') {
        setIsTargeting(false);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [postCode, postToPreview]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (readyRef.current) {
        clearInterval(interval);
        return;
      }
      postToPreview({type: 'preview-ping'});
    }, 300);
    return () => clearInterval(interval);
  }, [postToPreview]);

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

  // Code (parsed theme) + mode → preview. Re-sent on previewReady so the theme
  // still applies if this first ran before the iframe was listening.
  useEffect(() => {
    postThemeFromCode(code);
  }, [code, mode, previewReady, postThemeFromCode]);

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

  // Derive the export href (filename + data: URL of the generated defineTheme
  // source) from reactive state, so the download is a real <a> (downloadLinkRef)
  // rather than a fabricated element. Null until a theme name is entered.
  const themeExport = useMemo(() => {
    const name = themeName.trim();
    if (!name) {
      return null;
    }
    const model = readThemeModel(code)?.model;
    const tokens = {...ALL_TOKEN_DEFAULTS, ...(model?.tokens ?? {})};
    const source = generateThemeCode(
      name,
      tokens,
      ALL_TOKEN_DEFAULTS,
      14,
      1.2,
      [],
      model?.components ?? {},
    );
    return {
      filename: `${name}-theme.ts`,
      href: `data:text/typescript;charset=utf-8,${encodeURIComponent(source)}`,
    };
  }, [themeName, code]);

  const handleMonacoBeforeMount = useCallback((monaco: MonacoInstance) => {
    monaco.editor.defineTheme('github-light', githubLight);
    monaco.editor.defineTheme('github-dark', githubDark);
  }, []);

  // Collapse the `defineTheme({ … })` literal in the editor so the (often long)
  // theme tokens/components don't bury the component code. Folding the whole
  // call in one trigger is deterministic — folding nested blocks separately is
  // order/timing-sensitive. Deferred so Monaco's folding model has computed.
  const foldThemeLiteral = useCallback(
    (editor: MonacoTypes.editor.IStandaloneCodeEditor) => {
      const model = editor.getModel();
      if (!model) {
        return;
      }
      const lines = model.getLinesContent();
      const idx = lines.findIndex(l => /defineTheme\(\{/.test(l));
      if (idx >= 0) {
        editor.trigger('xds-playground', 'editor.fold', {
          selectionLines: [idx + 1],
        });
      }
    },
    [],
  );

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
      // Defer so the folding model + any initial theme seed have settled.
      window.setTimeout(() => foldThemeLiteral(editor), 600);
    },
    [foldThemeLiteral],
  );

  // Focus the editor (blinking cursor) whenever the Code view becomes active.
  useEffect(() => {
    if (activeView !== 'code') {
      return;
    }
    const id = requestAnimationFrame(() => editorRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [activeView]);

  // Re-collapse the theme blocks whenever a preset is applied (incl. the default
  // neutral seed), since selecting one replaces the defineTheme literal in place
  // without remounting the editor.
  useEffect(() => {
    if (!selectedPreset) {
      return;
    }
    const id = window.setTimeout(() => {
      if (editorRef.current) {
        foldThemeLiteral(editorRef.current);
      }
    }, 500);
    return () => window.clearTimeout(id);
  }, [selectedPreset, foldThemeLiteral]);

  // "Themes" dropdown — every registered playground theme. Selecting one prompts
  // for confirmation before re-seeding the Theme editor (and preview).
  // Switch to the Theme editor and re-seed it from the current code.
  const openThemeView = useCallback(() => {
    setActiveView('theme');
    setMobileTab('theme');
    setThemeEditorKey(k => k + 1);
  }, []);

  // "Templates" dropdown — the published, ready templates from the generated
  // registry. Selecting one prompts for confirmation before loading its source.
  const templateMenuItems = useMemo(
    () => [
      {
        label: 'Theme Showcase',
        onClick: () => setPendingTemplateSource(THEME_SHOWCASE_SOURCE),
      },
      ...templates
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
          onClick: () => setPendingTemplateSource(source),
        })),
    ],
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
      // Hide scrollbars and the overview ruler for a cleaner panel.
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

  const handleMobileTabChange = useCallback((tab: MobileTopTab) => {
    setMobileTab(tab);
    if (tab === 'code' || tab === 'design' || tab === 'theme') {
      setActiveView(tab);
    }
    // Re-seed the Theme editor from the code whenever it's reopened.
    if (tab === 'theme') {
      setThemeEditorKey(k => k + 1);
    }
  }, []);

  const togglePreviewMode = useCallback(() => {
    setMode(m => (m === 'light' ? 'dark' : 'light'));
  }, []);

  const expandPreview = useCallback(() => {
    setIsFullscreen(true);
  }, []);

  const mobileTopNav = isMobile ? (
    <TopNav
      label="Playground navigation"
      heading={
        <TopNavHeading
          logo={
            <AstryxIcon
              width={24}
              height={24}
              role="img"
              aria-label="Astryx"
              style={{display: 'block', color: 'var(--color-brand)'}}
            />
          }
          headingHref="/"
        />
      }
      centerContent={
        <TabList
          value={mobileTab}
          onChange={value => handleMobileTabChange(value as MobileTopTab)}
          size="sm">
          <Tab
            value="preview"
            label="Preview"
            icon={<Monitor size={14} />}
            isLabelHidden
          />
          <Tab
            value="code"
            label="Code"
            icon={<Code2 size={14} />}
            isLabelHidden
          />
          <Tab
            value="design"
            label="Design"
            icon={<PenTool size={14} />}
            isLabelHidden
          />
          <Tab
            value="theme"
            label="Theme"
            icon={<Palette size={14} />}
            isLabelHidden
          />
        </TabList>
      }
      endContent={
        <Button
          label={copied ? '✓ Copied' : 'Share'}
          variant="primary"
          size="md"
          onClick={handleShare}
        />
      }
    />
  ) : undefined;

  const playgroundSideNav = (
    <SideNav
      header={
        <SideNavHeading
          icon={
            <AstryxIcon
              width={24}
              height={24}
              role="img"
              aria-label="Astryx"
              style={{display: 'block', color: 'var(--color-brand)'}}
            />
          }
          heading="Home"
          headingHref="/"
          xstyle={s.sideNavHeading}
        />
      }
      collapsible={{isCollapsed: true, hasButton: false}}
      xstyle={s.desktopCollapsedSideNav}>
      <SideNavSection title="Playground views" isHeaderHidden>
        <SideNavItem
          label="Code Editor"
          icon={Code2}
          isSelected={activeView === 'code'}
          onClick={() => {
            setActiveView('code');
            setMobileTab('code');
          }}
        />
        <SideNavItem
          label="Design Editor"
          icon={PenTool}
          isSelected={activeView === 'design'}
          onClick={() => {
            setActiveView('design');
            setMobileTab('design');
          }}
        />
        <SideNavItem
          label="Theme Editor"
          icon={Palette}
          isSelected={activeView === 'theme'}
          onClick={openThemeView}
        />
      </SideNavSection>
    </SideNav>
  );

  const showEditorPanel = !isMobile || mobileTab !== 'preview';
  const showPreviewPanel = !isMobile || mobileTab === 'preview';

  return (
    <AppShell
      variant="section"
      height="fill"
      contentPadding={0}
      mobileNav={isMobile ? false : {defaultIsMobile}}
      topNav={mobileTopNav}
      sideNav={playgroundSideNav}>
      {/* Playground content */}
      <HStack
        data-playground-page="true"
        align="stretch"
        height="100%"
        width="100%"
        xstyle={s.root}
        onPointerDownCapture={handleResizeProbe}>
        {/* Left panel — editor */}
        <VStack
          xstyle={[s.leftPanel, !showEditorPanel && s.hidden]}
          width={isMobile ? '100%' : editorPanel.size || 440}>
          {!isMobile && (
            <HStack justify="between" align="center" xstyle={s.leftPanelHeader}>
              <Heading level={3}>
                {activeView === 'theme' ? 'Theme' : 'Playground'}
              </Heading>
            </HStack>
          )}
          {/* Both panes stay mounted (hidden when inactive) so Monaco's
              typedefs and the theme editor's state survive tab switches. */}
          <VStack xstyle={s.tabBody}>
            <VStack xstyle={[s.pane, activeView !== 'code' && s.hidden]}>
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
            </VStack>
            <VStack xstyle={[s.pane, activeView !== 'design' && s.hidden]}>
              <DesignEditor
                code={code}
                onCodeChange={setCode}
                selection={selection}
                seedKey={selectionNonce}
                isTargeting={isTargeting}
                onStartTargeting={() => toggleTargeting(true)}
                onDeselect={handleDeselect}
                onPreviewTarget={handlePreviewTarget}
              />
            </VStack>
            <VStack xstyle={[s.pane, activeView !== 'theme' && s.hidden]}>
              <ThemeEditor
                key={themeEditorKey}
                mode={mode}
                initialTheme={{
                  tokens: readThemeModel(code)?.model.tokens ?? {},
                }}
                onThemeChange={handleThemeEditorChange}
                presets={PLAYGROUND_PRESETS}
                selectedPreset={selectedPreset}
                onSelectPreset={setPendingExampleTheme}
                panelTab={themePanelTab}
                onPanelTabChange={setThemePanelTab}
              />
            </VStack>
          </VStack>
        </VStack>

        {!isMobile && (
          <ResizeHandle
            label="Resize editor panel"
            resizable={editorPanel.props}
            pillPlacement="start"
            hasDivider
          />
        )}

        {/* Right panel — preview */}
        <VStack xstyle={[s.rightPanel, !showPreviewPanel && s.hidden]}>
          {!isMobile && (
            <Toolbar
              label="Preview controls"
              startContent={
                <DropdownMenu
                  button={{
                    label: 'Preview',
                    variant: 'secondary',
                    size: 'md',
                  }}
                  hasChevron
                  items={templateMenuItems}
                />
              }
              centerContent={
                <HStack gap={2} vAlign="center">
                  <ToggleButton
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
                    pressedIcon={
                      <Crosshair size={20} color="var(--color-icon-blue)" />
                    }
                    xstyle={isTargeting ? s.targetingActive : undefined}
                  />
                  <Button
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
                    onClick={togglePreviewMode}
                  />
                  <Button
                    label="Expand"
                    tooltip="Fullscreen preview"
                    variant="ghost"
                    size="md"
                    isIconOnly
                    icon={<Maximize2 size={20} />}
                    onClick={expandPreview}
                  />
                  <SegmentedControl
                    label="Viewport size"
                    size="md"
                    value={viewport}
                    onChange={v => setViewport(v as Viewport)}>
                    <SegmentedControlItem
                      value="desktop"
                      label="Desktop"
                      isLabelHidden
                      icon={<Monitor size={20} />}
                    />
                    <SegmentedControlItem
                      value="phone"
                      label="Phone"
                      isLabelHidden
                      icon={<Smartphone size={20} />}
                    />
                  </SegmentedControl>
                </HStack>
              }
              endContent={
                <HStack gap={4} vAlign="center">
                  {buildStatus !== 'idle' && (
                    <HStack
                      gap={2}
                      vAlign="center"
                      xstyle={[
                        s.buildStatus,
                        statusFading && s.buildStatusFaded,
                      ]}>
                      <StatusDot
                        variant={BUILD_STATUS_META[buildStatus].variant}
                        label={BUILD_STATUS_META[buildStatus].label}
                        isPulsing={buildStatus === 'building'}
                      />
                      <Text type="supporting" color="secondary">
                        {BUILD_STATUS_META[buildStatus].label}
                      </Text>
                      {buildStatus === 'error' && (
                        <Button
                          label="Rebuild"
                          tooltip="Rebuild"
                          variant="ghost"
                          size="sm"
                          isIconOnly
                          icon={<RotateCw size={16} />}
                          onClick={handleRebuild}
                        />
                      )}
                    </HStack>
                  )}
                  <Popover
                    label="Share template"
                    placement="below"
                    alignment="end"
                    xstyle={s.popoverPadding}
                    onOpenChange={open => {
                      if (open) {
                        setShareUrl(window.location.href);
                      }
                    }}
                    content={
                      <VStack gap={6}>
                        <VStack gap={2}>
                          <Text type="label" weight="semibold">
                            Share Playground
                          </Text>
                          <HStack gap={2} vAlign="center" width="100%">
                            <TextInput
                              label="Share URL"
                              isLabelHidden
                              isDisabled
                              value={shareUrl}
                              onChange={() => {}}
                              xstyle={s.shareInput}
                            />
                            <Button
                              label={copied ? 'Copied' : 'Copy URL'}
                              tooltip={copied ? 'Copied' : 'Copy URL'}
                              variant="secondary"
                              size="md"
                              isIconOnly
                              icon={
                                copied ? (
                                  <Check size={16} />
                                ) : (
                                  <Copy size={16} />
                                )
                              }
                              onClick={handleShare}
                            />
                          </HStack>
                        </VStack>
                        <VStack gap={2}>
                          <Text type="label" weight="semibold">
                            Export Theme File
                          </Text>
                          <HStack gap={2} vAlign="center" width="100%">
                            <TextInput
                              label="Theme name"
                              isLabelHidden
                              placeholder="Enter theme name"
                              value={themeName}
                              onChange={v =>
                                setThemeName(v.replace(/[\s-]/g, ''))
                              }
                              xstyle={s.shareInput}
                            />
                            <Button
                              label="Download theme"
                              tooltip="Download theme"
                              variant="secondary"
                              size="md"
                              isIconOnly
                              isDisabled={themeExport == null}
                              icon={<Download size={16} />}
                              onClick={() => downloadLinkRef.current?.click()}
                            />
                            {themeExport && (
                              <a
                                ref={downloadLinkRef}
                                href={themeExport.href}
                                download={themeExport.filename}
                                {...stylex.props(s.hidden)}
                                aria-hidden="true"
                                tabIndex={-1}>
                                Download theme file
                              </a>
                            )}
                          </HStack>
                          <Link href="/docs/theme" hasUnderline>
                            Learn about using themes
                          </Link>
                        </VStack>
                      </VStack>
                    }>
                    <Button
                      label="Export"
                      variant="primary"
                      size="md"
                      endContent={<ExternalLink size={16} />}
                    />
                  </Popover>
                </HStack>
              }
            />
          )}
          <PreviewStage
            viewport={isMobile ? 'phone' : viewport}
            isFullscreen={isFullscreen}
            onExitFullscreen={() => setIsFullscreen(false)}
            iframeRef={iframeRef}
            isInteractionDisabled={isResizing}
            isFullBleed={isMobile}
          />
        </VStack>
      </HStack>

      <ConfirmDialog
        isOpen={pendingExampleTheme != null}
        title="Apply example theme"
        message="Applying an example theme will overwrite your current theme. Any changes you've made in the Theme editor will be lost. Do you want to continue?"
        onCancel={() => setPendingExampleTheme(null)}
        onConfirm={() => {
          if (pendingExampleTheme != null) {
            applyExampleTheme(pendingExampleTheme);
          }
          setPendingExampleTheme(null);
        }}
      />
      <ConfirmDialog
        isOpen={pendingTemplateSource != null}
        title="Load template"
        message="Loading this template will replace the current contents of the code editor. Any changes you've made there will be lost. Do you want to continue?"
        onCancel={() => setPendingTemplateSource(null)}
        onConfirm={() => {
          if (pendingTemplateSource != null) {
            // Templates author their own UI; ensure they carry the theme
            // scaffold so the Theme editor and targeting have a literal to bind.
            setCode(
              ensureThemeScaffold(
                stripCodeExampleCopyrightHeader(pendingTemplateSource),
              ),
            );
            setThemeEditorKey(k => k + 1);
            requestAnimationFrame(() => editorRef.current?.focus());
          }
          setPendingTemplateSource(null);
        }}
      />
    </AppShell>
  );
}
