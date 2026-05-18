// Copyright (c) Meta Platforms, Inc. and affiliates.

"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import {XDSTheme} from "@xds/core/theme";
import type {XDSDefinedTheme} from "@xds/core/theme";
import type {ThemeMode} from "@xds/core/theme";
import {defaultTheme} from "@xds/theme-default/built";
import {neutralTheme} from "@xds/theme-neutral/built";
import {dailyTheme} from "@xds/theme-daily/built";
import {matchaTheme} from "@xds/theme-matcha/built";
import {runCode, setBabel} from "./runner";

const THEME_MAP: Record<string, XDSDefinedTheme> = {
  default: defaultTheme,
  neutral: neutralTheme,
  daily: dailyTheme,
  matcha: matchaTheme,
};

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
  const preview = message.length > 120 ? message.slice(0, 120) + "…" : message;

  return (
    <div
      style={{
        padding: 16,
        fontFamily: "ui-monospace, monospace",
        fontSize: 13,
        color: "#ef4444",
        lineHeight: 1.5,
      }}>
      <div
        style={{fontWeight: 600, marginBottom: 8, cursor: "pointer"}}
        onClick={() => setExpanded((e) => !e)}>
        ⚠ Render Error {message.length > 120 && (expanded ? "▾" : "▸")}
      </div>
      <pre style={{whiteSpace: "pre-wrap", margin: 0}}>
        {expanded ? message : preview}
      </pre>
    </div>
  );
}

type PreviewMessage =
  | {type: "preview-ping"}
  | {type: "preview-code"; code: string}
  | {type: "preview-clear"}
  | {type: "preview-theme"; mode?: string; theme?: string};

function isPreviewMessage(data: unknown): data is PreviewMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    typeof (data as {type: unknown}).type === "string"
  );
}

export default function PreviewPage() {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [themeName, setThemeName] = useState("default");
  const [resetKey, setResetKey] = useState(0);
  const [babelReady, setBabelReady] = useState(false);
  const readyRef = useRef(false);

  // Load Babel from CDN — avoids bundling the 5MB package through Next.js
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/@babel/standalone@7/babel.min.js";
    script.onload = () => {
      const w = window as unknown as Record<string, unknown>;
      if (w.Babel) {
        setBabel(w.Babel as Parameters<typeof setBabel>[0]);
        setBabelReady(true);
      }
    };
    document.head.appendChild(script);
  }, []);

  const theme = THEME_MAP[themeName] ?? defaultTheme;

  const postToParent = useCallback((msg: Record<string, unknown>) => {
    window.parent.postMessage(msg, "*");
  }, []);

  const handleCode = useCallback(
    (code: string) => {
      const result = runCode(code);
      if (result.Component) {
        setComponent(() => result.Component);
        setError(null);
        setResetKey((k) => k + 1);
        postToParent({type: "preview-rendered"});
      } else {
        setComponent(null);
        setError(`[${result.phase}] ${result.error}`);
        postToParent({
          type: "preview-error",
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
    (msg: {mode?: string; theme?: string}) => {
      if (msg.mode === "light" || msg.mode === "dark" || msg.mode === "system") {
        setThemeMode(msg.mode);
      }
      if (msg.theme && msg.theme in THEME_MAP) {
        setThemeName(msg.theme);
      }
    },
    [],
  );

  useEffect(() => {
    if (!babelReady) return;

    function onMessage(event: MessageEvent) {
      if (!isPreviewMessage(event.data)) return;

      switch (event.data.type) {
        case "preview-ping":
          postToParent({type: "preview-ready"});
          break;
        case "preview-code":
          handleCode(event.data.code);
          break;
        case "preview-clear":
          handleClear();
          break;
        case "preview-theme":
          handleTheme(event.data);
          break;
      }
    }

    window.addEventListener("message", onMessage);

    if (!readyRef.current) {
      readyRef.current = true;
      postToParent({type: "preview-ready"});
    }

    return () => window.removeEventListener("message", onMessage);
  }, [babelReady, postToParent, handleCode, handleClear, handleTheme]);

  const handleBoundaryError = useCallback(
    (err: Error) => {
      postToParent({
        type: "preview-error",
        error: err.message,
        phase: "runtime",
      });
    },
    [postToParent],
  );

  return (
    <XDSTheme theme={theme} mode={themeMode}>
      <div style={{minHeight: "100%", padding: 24}}>
        {error && <ErrorDisplay message={error} />}
        {Component && (
          <ErrorBoundary
            resetKey={resetKey}
            onError={handleBoundaryError}>
            <Component />
          </ErrorBoundary>
        )}
      </div>
    </XDSTheme>
  );
}
