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
import {XDSTheme} from '@xds/core/theme';
import type {ThemeMode} from '@xds/core/theme';
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
  | {type: 'preview-theme'; mode?: string; theme?: string}
  | {type: 'preview-highlight'; id: string};

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

  const theme = themeByValue[themeName] ?? FALLBACK_THEME;

  const postToParent = useCallback((msg: Record<string, unknown>) => {
    window.parent.postMessage(msg, '*');
  }, []);

  const handleCode = useCallback(
    (code: string) => {
      const result = runCode(code);
      if (result.Component) {
        setComponent(() => result.Component);
        setError(null);
        // Reset to fill so the next measurement runs against natural (block
        // flow) sizing rather than a previously-centered layout.
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

  const handleTheme = useCallback((msg: {mode?: string; theme?: string}) => {
    if (msg.mode === 'light' || msg.mode === 'dark' || msg.mode === 'system') {
      setThemeMode(msg.mode);
    }
    if (msg.theme && msg.theme in themeByValue) {
      setThemeName(msg.theme);
    }
  }, []);

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
        backgroundColor: 'var(--color-background-body)',
      }
    : {
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-4, 16px)',
        boxSizing: 'border-box',
        backgroundColor: 'var(--color-background-body)',
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
