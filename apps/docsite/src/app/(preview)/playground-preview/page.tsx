// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import {XDSTheme, defineTheme} from '@xds/core/theme';
import type {ThemeMode, XDSDefinedTheme} from '@xds/core/theme';
import {
  themeByValue,
  DEFAULT_PLAYGROUND_THEME,
} from '../../playground/playgroundThemes';
import {runCode, setTypeScript} from './runner';
import type * as TS from 'typescript';

const FALLBACK_THEME =
  themeByValue[DEFAULT_PLAYGROUND_THEME] ?? Object.values(themeByValue)[0];

// useLayoutEffect warns during SSR; the preview measures real DOM only on the
// client, so fall back to useEffect on the server.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface ErrorBoundaryProps {
  resetKey: unknown;
  children: ReactNode;
  onError: (error: Error) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {error: null};

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {error};
  }

  componentDidCatch(error: Error, _info: ErrorInfo): void {
    this.props.onError(error);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({error: null});
    }
  }

  render(): ReactNode {
    if (this.state.error) {
      return <ErrorDisplay message={this.state.error.message} />;
    }
    return this.props.children;
  }
}

function ErrorDisplay({message}: {message: string}) {
  const [expanded, setExpanded] = useState(false);
  const preview = message.length > 120 ? message.slice(0, 120) + '…' : message;

  return (
    <div
      style={{
        padding: 16,
        fontFamily: 'ui-monospace, monospace',
        fontSize: 13,
        color: '#ef4444',
        lineHeight: 1.5,
      }}>
      <div
        style={{fontWeight: 600, marginBottom: 8, cursor: 'pointer'}}
        onClick={() => setExpanded(e => !e)}>
        ⚠ Render Error {message.length > 120 && (expanded ? '▾' : '▸')}
      </div>
      <pre style={{whiteSpace: 'pre-wrap', margin: 0}}>
        {expanded ? message : preview}
      </pre>
    </div>
  );
}

type PreviewMessage =
  | {type: 'preview-ping'}
  | {type: 'preview-code'; code: string}
  | {type: 'preview-clear'}
  | {
      type: 'preview-theme';
      mode?: string;
      theme?: string;
      // A custom theme authored in the editor. Sent as raw token map +
      // components (not a defineTheme result) so the payload stays reliably
      // structured-clone-safe across postMessage; the iframe rebuilds it.
      customTokens?: Record<string, string>;
      customComponents?: unknown;
    }
  | {type: 'preview-highlight'; id: string}
  | {type: 'preview-select'; id: string}
  | {type: 'targeting-enable'}
  | {type: 'targeting-disable'};

/**
 * Persistent selection overlay — same visual treatment as the hover overlay
 * (blue border + tinted fill + component name label). Lives in a separate
 * DOM element so it can coexist with (or be hidden by) the hover overlay.
 */
const selectionState = {
  overlay: null as HTMLDivElement | null,
  label: null as HTMLDivElement | null,
  id: null as string | null,
  rafId: 0,
};

function ensureSelectionOverlay() {
  if (selectionState.overlay) {
    return;
  }
  const overlay = document.createElement('div');
  overlay.className = 'pg-target-selection';
  const label = document.createElement('div');
  label.className = 'pg-target-label';
  overlay.appendChild(label);
  document.body.appendChild(overlay);
  selectionState.overlay = overlay;
  selectionState.label = label;
}

function updateSelectionPosition() {
  const {overlay, label, id} = selectionState;
  if (!overlay || !label || !id) {
    return;
  }
  const el = document.querySelector<HTMLElement>(`[data-pg-id="${id}"]`);
  if (!el) {
    overlay.dataset.visible = 'false';
    return;
  }
  const rect = el.getBoundingClientRect();
  overlay.style.top = `${rect.top - 2}px`;
  overlay.style.left = `${rect.left - 2}px`;
  overlay.style.width = `${rect.width + 4}px`;
  overlay.style.height = `${rect.height + 4}px`;
  overlay.dataset.visible = 'true';

  const sep = id.lastIndexOf('#');
  label.textContent = sep >= 0 ? id.slice(0, sep) : id;

  if (rect.top < 28) {
    label.classList.add('pg-target-label-bottom');
  } else {
    label.classList.remove('pg-target-label-bottom');
  }
}

function selectElement(id: string) {
  ensureSelectionOverlay();
  selectionState.id = id;
  const el = document.querySelector<HTMLElement>(`[data-pg-id="${id}"]`);
  if (el) {
    el.scrollIntoView({block: 'nearest', behavior: 'smooth'});
  }
  updateSelectionPosition();

  // Keep the overlay positioned during scroll.
  cancelAnimationFrame(selectionState.rafId);
  const track = () => {
    updateSelectionPosition();
    if (selectionState.id === id) {
      selectionState.rafId = requestAnimationFrame(track);
    }
  };
  selectionState.rafId = requestAnimationFrame(track);
}

function clearSelectionOverlay() {
  cancelAnimationFrame(selectionState.rafId);
  selectionState.id = null;
  if (selectionState.overlay) {
    selectionState.overlay.dataset.visible = 'false';
  }
}

/** Briefly flash a focus ring on the element marked with the given data-pg-id. */
function flashElement(id: string) {
  const el = document.querySelector<HTMLElement>(`[data-pg-id="${id}"]`);
  if (!el) {
    return;
  }
  el.classList.remove('pg-flash');
  // Force reflow so re-adding the class restarts the animation.
  void el.offsetWidth;
  el.classList.add('pg-flash');
  el.scrollIntoView({block: 'nearest', behavior: 'smooth'});
  window.setTimeout(() => el.classList.remove('pg-flash'), 1000);
}

/**
 * Manages the targeting overlay lifecycle inside the iframe. When enabled,
 * intercepts pointer events to highlight hovered XDS components and report
 * clicks back to the parent frame.
 */
function createTargetingController(
  postToParent: (msg: Record<string, unknown>) => void,
) {
  let enabled = false;
  let overlayEl: HTMLDivElement | null = null;
  let labelEl: HTMLDivElement | null = null;
  let rafId = 0;
  let lastHoveredId: string | null = null;

  function ensureOverlay() {
    if (overlayEl) {
      return;
    }
    overlayEl = document.createElement('div');
    overlayEl.className = 'pg-target-overlay';
    labelEl = document.createElement('div');
    labelEl.className = 'pg-target-label';
    overlayEl.appendChild(labelEl);
    document.body.appendChild(overlayEl);
  }

  function findTargetable(el: Element | null): HTMLElement | null {
    let node = el;
    while (node && node !== document.body) {
      if (node instanceof HTMLElement && node.dataset.pgId) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  function parsePgId(id: string): {component: string; index: number} | null {
    const sep = id.lastIndexOf('#');
    if (sep < 0) {
      return null;
    }
    return {
      component: id.slice(0, sep),
      index: parseInt(id.slice(sep + 1), 10),
    };
  }

  function positionOverlay(target: HTMLElement) {
    if (!overlayEl || !labelEl) {
      return;
    }
    const rect = target.getBoundingClientRect();
    const pgId = target.dataset.pgId ?? '';
    overlayEl.style.top = `${rect.top - 2}px`;
    overlayEl.style.left = `${rect.left - 2}px`;
    overlayEl.style.width = `${rect.width + 4}px`;
    overlayEl.style.height = `${rect.height + 4}px`;
    overlayEl.dataset.visible = 'true';

    const parsed = parsePgId(pgId);
    labelEl.textContent = parsed ? parsed.component : pgId;

    // Flip label below if it would overflow above the viewport
    if (rect.top < 28) {
      labelEl.classList.add('pg-target-label-bottom');
    } else {
      labelEl.classList.remove('pg-target-label-bottom');
    }
  }

  function hideOverlay() {
    if (overlayEl) {
      overlayEl.dataset.visible = 'false';
    }
    lastHoveredId = null;
  }

  function clearSelection() {
    clearSelectionOverlay();
  }

  function onMouseMove(e: MouseEvent) {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      // Hide overlay temporarily to hit-test through it
      if (overlayEl) {
        overlayEl.style.display = 'none';
      }
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      if (overlayEl) {
        overlayEl.style.display = '';
      }

      const target = findTargetable(hit);
      if (!target) {
        hideOverlay();
        postToParent({type: 'targeting-hover', id: null});
        return;
      }

      const id = target.dataset.pgId ?? '';
      if (id !== lastHoveredId) {
        lastHoveredId = id;
        positionOverlay(target);
        const parsed = parsePgId(id);
        postToParent({
          type: 'targeting-hover',
          id,
          component: parsed?.component ?? null,
          index: parsed?.index ?? 0,
        });
      }
    });
  }

  function onClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (overlayEl) {
      overlayEl.style.display = 'none';
    }
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    if (overlayEl) {
      overlayEl.style.display = '';
    }

    const target = findTargetable(hit);
    if (!target) {
      return;
    }

    const id = target.dataset.pgId ?? '';
    const parsed = parsePgId(id);
    if (!parsed) {
      return;
    }

    clearSelection();
    selectElement(id);

    postToParent({
      type: 'targeting-select',
      id,
      component: parsed.component,
      index: parsed.index,
    });
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      disable();
      postToParent({type: 'targeting-exit'});
    }
  }

  function enable() {
    if (enabled) {
      return;
    }
    enabled = true;
    clearSelection();
    ensureOverlay();
    document.documentElement.classList.add('pg-targeting');
    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeyDown, true);
  }

  function disable() {
    if (!enabled) {
      return;
    }
    enabled = false;
    cancelAnimationFrame(rafId);
    document.documentElement.classList.remove('pg-targeting');
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
    hideOverlay();
  }

  return {enable, disable, clearSelection};
}

function isPreviewMessage(data: unknown): data is PreviewMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    typeof (data as {type: unknown}).type === 'string'
  );
}

export default function PreviewPage() {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [themeName, setThemeName] = useState(DEFAULT_PLAYGROUND_THEME);
  // A custom theme authored in the playground theme editor. When set it takes
  // precedence over the registered theme resolved from themeName.
  const [customTheme, setCustomTheme] = useState<XDSDefinedTheme | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [tsReady, setTsReady] = useState(false);
  // Whether the rendered output should fill the stage (full-page templates) vs
  // be centered as a small example. Defaults to fill so templates are never
  // shrunk; the layout effect downgrades small content to centered.
  const [fill, setFill] = useState(true);
  const readyRef = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load the TypeScript compiler from public/vendor — self-hosted because
  // corpnet blocks external CDNs. The UMD sets window.ts in the browser
  // (this iframe has no AMD loader, so there's no define() conflict).
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/vendor/typescript.js';
    script.onload = () => {
      const w = window as unknown as {ts?: typeof TS};
      if (w.ts) {
        setTypeScript(w.ts);
        setTsReady(true);
      }
    };
    document.head.appendChild(script);
  }, []);

  const theme = customTheme ?? themeByValue[themeName] ?? FALLBACK_THEME;

  const postToParent = useCallback((msg: Record<string, unknown>) => {
    window.parent.postMessage(msg, '*');
  }, []);

  const targetingRef = useRef<ReturnType<
    typeof createTargetingController
  > | null>(null);
  if (targetingRef.current == null && typeof window !== 'undefined') {
    targetingRef.current = createTargetingController(postToParent);
  }

  const handleCode = useCallback(
    (code: string) => {
      const result = runCode(code);
      if (result.Component) {
        setComponent(() => result.Component);
        setError(null);
        clearSelectionOverlay();
        setFill(true);
        setResetKey(k => k + 1);
        postToParent({type: 'preview-rendered'});
      } else {
        setComponent(null);
        setError(`[${result.phase}] ${result.error}`);
        postToParent({
          type: 'preview-error',
          error: result.error,
          phase: result.phase,
        });
      }
    },
    [postToParent],
  );

  const handleClear = useCallback(() => {
    setComponent(null);
    setError(null);
  }, []);

  const handleTheme = useCallback(
    (msg: {
      mode?: string;
      theme?: string;
      customTokens?: Record<string, string>;
      customComponents?: unknown;
    }) => {
      if (
        msg.mode === 'light' ||
        msg.mode === 'dark' ||
        msg.mode === 'system'
      ) {
        setThemeMode(msg.mode);
      }
      if (msg.customTokens) {
        setCustomTheme(
          defineTheme({
            name: 'custom',
            tokens: msg.customTokens,
            components: msg.customComponents as XDSDefinedTheme['components'],
          }),
        );
      } else {
        // No custom tokens — fall back to the registered theme by key.
        setCustomTheme(null);
        if (msg.theme && msg.theme in themeByValue) {
          setThemeName(msg.theme);
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!tsReady) {
      return;
    }

    function onMessage(event: MessageEvent) {
      if (!isPreviewMessage(event.data)) {
        return;
      }

      switch (event.data.type) {
        case 'preview-ping':
          postToParent({type: 'preview-ready'});
          break;
        case 'preview-code':
          handleCode(event.data.code);
          break;
        case 'preview-clear':
          handleClear();
          break;
        case 'preview-theme':
          handleTheme(event.data);
          break;
        case 'preview-highlight':
          flashElement(event.data.id);
          break;
        case 'preview-select':
          selectElement(event.data.id);
          break;
        case 'targeting-enable':
          targetingRef.current?.enable();
          break;
        case 'targeting-disable':
          targetingRef.current?.disable();
          break;
      }
    }

    window.addEventListener('message', onMessage);

    if (!readyRef.current) {
      readyRef.current = true;
      postToParent({type: 'preview-ready'});
    }

    return () => window.removeEventListener('message', onMessage);
  }, [tsReady, postToParent, handleCode, handleClear, handleTheme]);

  // After each successful render (measured in fill/block layout), decide
  // whether the content is a small example that should be centered. Full-page
  // templates (e.g. XDSAppShell at 100dvh) fill a dimension and stay as-is.
  useIsomorphicLayoutEffect(() => {
    const stage = stageRef.current;
    const root = contentRef.current?.firstElementChild as HTMLElement | null;
    if (!stage || !root) {
      return;
    }
    const rect = root.getBoundingClientRect();
    const fillsWidth = rect.width >= stage.clientWidth - 2;
    const fillsHeight = rect.height >= stage.clientHeight - 2;
    setFill(fillsWidth || fillsHeight);
  }, [resetKey]);

  const handleBoundaryError = useCallback(
    (err: Error) => {
      postToParent({
        type: 'preview-error',
        error: err.message,
        phase: 'runtime',
      });
    },
    [postToParent],
  );

  const stageStyle: CSSProperties = fill
    ? {
        minHeight: '100%',
        display: 'block',
        backgroundColor: 'var(--color-background-surface)',
      }
    : {
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-4, 16px)',
        boxSizing: 'border-box',
        backgroundColor: 'var(--color-background-surface)',
      };

  // In fill mode the wrapper has no box (display: contents) so the rendered
  // root participates directly in block flow and fills width/height naturally.
  const contentStyle: CSSProperties = fill ? {display: 'contents'} : {};

  return (
    <XDSTheme theme={theme} mode={themeMode}>
      <div ref={stageRef} style={stageStyle}>
        {error && <ErrorDisplay message={error} />}
        {Component && (
          <div ref={contentRef} style={contentStyle}>
            <ErrorBoundary resetKey={resetKey} onError={handleBoundaryError}>
              <Component />
            </ErrorBoundary>
          </div>
        )}
      </div>
    </XDSTheme>
  );
}
