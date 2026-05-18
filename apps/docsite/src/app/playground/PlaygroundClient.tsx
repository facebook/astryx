// Copyright (c) Meta Platforms, Inc. and affiliates.

"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import dynamic from "next/dynamic";
import * as stylex from "@stylexjs/stylex";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import {XDSButton} from "@xds/core/Button";
import {XDSSelector} from "@xds/core/Selector";
import {XDSHStack} from "@xds/core/Layout";
import {XDSText} from "@xds/core/Text";
import {XDSStatusDot} from "@xds/core/StatusDot";
import {XDSDivider} from "@xds/core/Divider";
import {useXDSResizable, XDSResizeHandle} from "@xds/core/Resizable";
import githubLight from "./themes/github-light.json";
import githubDark from "./themes/github-dark.json";

import type * as MonacoTypes from "monaco-editor";

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

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div style={{flex: 1, display: "flex", alignItems: "center", justifyContent: "center"}}>
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
    <XDSCard padding={5} maxWidth={400}>
      <XDSVStack gap={12}>
        <XDSHeading level={3}>
          XDS Playground
        </XDSHeading>
        <XDSText color="secondary">
          Edit the code and see live changes.
        </XDSText>
        <XDSHStack gap={8} align="center">
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
  if (typeof window === "undefined") return DEFAULT_CODE;
  const hash = window.location.hash.slice(1);
  if (!hash) return DEFAULT_CODE;
  const params = new URLSearchParams(hash);
  const compressed = params.get("code");
  if (!compressed) return DEFAULT_CODE;
  try {
    return decompressFromEncodedURIComponent(compressed) || DEFAULT_CODE;
  } catch {
    return DEFAULT_CODE;
  }
}

function updateURL(code: string) {
  const compressed = compressToEncodedURIComponent(code);
  window.history.replaceState(null, "", `#code=${compressed}`);
}

const THEME_OPTIONS = [
  {value: "default", label: "Default"},
  {value: "neutral", label: "Neutral"},
  {value: "daily", label: "Daily"},
  {value: "matcha", label: "Matcha"},
];

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
    "file:///globals.d.ts",
  );

  // Heroicons wildcard stub
  ts.addExtraLib(
    `declare module '@heroicons/react/16/solid' { const icons: Record<string, React.ComponentType<{width?: number; height?: number; className?: string}>>; export = icons; }
    declare module '@heroicons/react/20/solid' { const icons: Record<string, React.ComponentType<{width?: number; height?: number; className?: string}>>; export = icons; }
    declare module '@heroicons/react/24/outline' { const icons: Record<string, React.ComponentType<{width?: number; height?: number; className?: string}>>; export = icons; }
    declare module '@heroicons/react/24/solid' { const icons: Record<string, React.ComponentType<{width?: number; height?: number; className?: string}>>; export = icons; }`,
    "file:///node_modules/@heroicons/react/index.d.ts",
  );

  // Load real type definitions from the pre-built JSON bundle
  fetch("/playground-types.json")
    .then((r) => r.json())
    .then((packages: Record<string, Record<string, string>>) => {
      // React types
      const reactFiles = packages["react"] ?? {};
      for (const [fileName, content] of Object.entries(reactFiles)) {
        ts.addExtraLib(content, `file:///node_modules/@types/react/${fileName}`);
      }

      // StyleX types
      const stylexFiles = packages["@stylexjs/stylex"] ?? {};
      for (const [fileName, content] of Object.entries(stylexFiles)) {
        ts.addExtraLib(
          content,
          `file:///node_modules/@stylexjs/stylex/${fileName}`,
        );
      }

      // XDS core types — register each .d.ts under its dist path AND subpath
      const xdsFiles = packages["@xds/core"] ?? {};
      const submoduleReexports: string[] = [];

      for (const [relPath, content] of Object.entries(xdsFiles)) {
        ts.addExtraLib(
          content,
          `file:///node_modules/@xds/core/dist/${relPath}`,
        );

        // Also register as @xds/core/<SubModule>/index.d.ts
        if (relPath.endsWith("/index.d.ts")) {
          const moduleName = relPath.replace("/index.d.ts", "");
          ts.addExtraLib(
            content,
            `file:///node_modules/@xds/core/${moduleName}/index.d.ts`,
          );
          submoduleReexports.push(moduleName);
        }
      }

      // Build @xds/core barrel from submodule re-exports
      const barrelContent = submoduleReexports
        .map((m) => `export * from '@xds/core/${m}';`)
        .join("\n");
      ts.addExtraLib(
        `declare module '@xds/core' {\n${barrelContent}\n}`,
        "file:///node_modules/@xds/core/index.d.ts",
      );

      // Types loaded — enable semantic validation
      ts.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });
    })
    .catch(() => {
      // Types unavailable — keep semantic validation disabled
    });
}

const s = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingInline: 16,
    paddingBlock: 6,
    flexShrink: 0,
  },
  main: {
    display: "flex",
    flex: 1,
    minHeight: 0,
    flexDirection: {
      default: "row",
      "@media (max-width: 768px)": "column",
    },
  },
  editorPane: {
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    minWidth: 0,
    minHeight: {
      default: 0,
      "@media (max-width: 768px)": 300,
    },
  },
  previewPane: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    minHeight: {
      default: 0,
      "@media (max-width: 768px)": 300,
    },
  },
  iframe: {
    flex: 1,
    border: "none",
    width: "100%",
    height: "100%",
  },
  previewBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingInline: 12,
    paddingBlock: 6,
    flexShrink: 0,
  },
});

export function PlaygroundClient() {
  const [code, setCode] = useState(getInitialCode);
  const [theme, setTheme] = useState("default");
  const [copied, setCopied] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const pendingRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editorPanel = useXDSResizable({
    defaultSize: "50%",
    minSizePx: 200,
    collapsible: true,
    snaps: [400, 600],
    autoSaveId: "xds-playground-editor-width",
  });

  const [editorTheme, setEditorTheme] = useState("github-dark");

  // Sync editor theme with system preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setEditorTheme(mq.matches ? "github-dark" : "github-light");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const send = useCallback((c: string) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      c ? {type: "preview-code", code: c} : {type: "preview-clear"},
      window.location.origin,
    );
  }, []);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      if (e.data?.type === "preview-ready") {
        readyRef.current = true;
        setPreviewReady(true);
        if (pendingRef.current != null) {
          send(pendingRef.current);
          pendingRef.current = null;
        }
      }
      if (e.data?.type === "preview-rendered") setPreviewError(null);
      if (e.data?.type === "preview-error") setPreviewError(e.data.message ?? "Unknown error");
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [send]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (readyRef.current) { clearInterval(interval); return; }
      iframeRef.current?.contentWindow?.postMessage({type: "preview-ping"}, window.location.origin);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!readyRef.current) pendingRef.current = code;
      else send(code);
      updateURL(code);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [code, send]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {type: "preview-theme", theme},
      window.location.origin,
    );
  }, [theme]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const handleMonacoBeforeMount = useCallback(
    (monaco: MonacoInstance) => {
      // Register themes before editor renders so initial theme applies
      monaco.editor.defineTheme("github-light", githubLight);
      monaco.editor.defineTheme("github-dark", githubDark);
    },
    [],
  );

  const handleMonacoMount = useCallback(
    (_editor: unknown, monaco: MonacoInstance) => {
      configureMonaco(monaco);
    },
    [],
  );

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  const editorOptions = useMemo(
    () => ({
      minimap: {enabled: false},
      fontSize: isMobile ? 16 : 13,
      lineNumbers: "on" as const,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: "on" as const,
      padding: {top: 12},
      accessibilitySupport: "off" as const,
    }),
    [isMobile],
  );

  return (
    <div {...stylex.props(s.root)}>
      <div {...stylex.props(s.toolbar)}>
        <XDSHStack gap={8} align="center">
          <XDSStatusDot
            variant={previewError ? "negative" : previewReady ? "positive" : "warning"}
            label={previewError ? "Error" : previewReady ? "Ready" : "Loading"}
          />
          <XDSText color="secondary" type="supporting">
            {previewError ? "Error" : previewReady ? "Ready" : "Loading…"}
          </XDSText>
        </XDSHStack>
        <XDSHStack gap={4} align="center">
          <XDSSelector
            label="Theme"
            isLabelHidden
            options={THEME_OPTIONS}
            value={theme}
            onChange={setTheme}
            size="sm"
          />
          <XDSButton
            label="Reset"
            variant="ghost"
            size="sm"
            onClick={() => setCode(DEFAULT_CODE)}
          />
          <XDSButton
            label={copied ? "✓ Copied!" : "Copy Link"}
            variant={copied ? "primary" : "secondary"}
            size="sm"
            onClick={handleShare}
          />
        </XDSHStack>
      </div>
      <XDSDivider />
      <div {...stylex.props(s.main)}>
        <div
          {...stylex.props(s.editorPane)}
          style={isMobile ? {height: editorPanel.size} : {width: editorPanel.size}}
        >
          <MonacoEditor
            defaultLanguage="typescript"
            defaultValue={code}
            path="playground.tsx"
            theme={editorTheme}
            onChange={(v) => setCode(v ?? "")}
            beforeMount={handleMonacoBeforeMount}
            onMount={handleMonacoMount}
            options={editorOptions}
          />
        </div>
        <XDSResizeHandle
          label="Resize editor panel"
          direction={isMobile ? "vertical" : "horizontal"}
          hasDivider
          pillPlacement={isMobile ? "end" : "auto"}
          resizable={editorPanel.props}
        />
        <div {...stylex.props(s.previewPane)}>
          <div {...stylex.props(s.previewBar)}>
            <XDSText color="secondary" type="supporting">Preview</XDSText>
            <XDSText color="disabled" type="supporting">
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </XDSText>
          </div>
          <XDSDivider />
          <iframe
            ref={iframeRef}
            src="/playground-preview"
            sandbox="allow-scripts allow-same-origin"
            title="Preview"
            {...stylex.props(s.iframe)}
          />
        </div>
      </div>
      {previewError && (
        <>
          <XDSDivider />
          <div style={{padding: "8px 16px", maxHeight: 120, overflow: "auto"}}>
            <XDSText type="code" color="inherit">
              <span style={{color: "var(--color-text-error, #ef4444)", whiteSpace: "pre-wrap"}}>
                {previewError}
              </span>
            </XDSText>
          </div>
        </>
      )}
    </div>
  );
}
