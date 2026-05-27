// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import dynamic from 'next/dynamic';
import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';
import githubLight from '../../app/playground/themes/github-light.json';
import githubDark from '../../app/playground/themes/github-dark.json';

import type * as MonacoTypes from 'monaco-editor';

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
    <div {...stylex.props(s.loading)}>
      <XDSText color="secondary">Loading editor\u2026</XDSText>
    </div>
  ),
});

const s = stylex.create({
  root: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
  },
  loading: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

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

  ts.addExtraLib(
    `declare module '@heroicons/react/16/solid' { const icons: Record<string, React.ComponentType<{width?: number; height?: number; className?: string}>>; export = icons; }
    declare module '@heroicons/react/20/solid' { const icons: Record<string, React.ComponentType<{width?: number; height?: number; className?: string}>>; export = icons; }
    declare module '@heroicons/react/24/outline' { const icons: Record<string, React.ComponentType<{width?: number; height?: number; className?: string}>>; export = icons; }
    declare module '@heroicons/react/24/solid' { const icons: Record<string, React.ComponentType<{width?: number; height?: number; className?: string}>>; export = icons; }`,
    'file:///node_modules/@heroicons/react/index.d.ts',
  );

  fetch('/playground-types.json')
    .then(r => r.json())
    .then((packages: Record<string, Record<string, string>>) => {
      const reactFiles = packages['react'] ?? {};
      for (const [fileName, content] of Object.entries(reactFiles)) {
        ts.addExtraLib(
          content,
          `file:///node_modules/@types/react/${fileName}`,
        );
      }

      const stylexFiles = packages['@stylexjs/stylex'] ?? {};
      for (const [fileName, content] of Object.entries(stylexFiles)) {
        ts.addExtraLib(
          content,
          `file:///node_modules/@stylexjs/stylex/${fileName}`,
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
    .catch(() => {});
}

interface PlaygroundCodeEditorProps {
  value: string;
  onChange: (code: string) => void;
}

export function PlaygroundCodeEditor({
  value,
  onChange,
}: PlaygroundCodeEditorProps) {
  const [editorTheme, setEditorTheme] = useState('github-dark');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () =>
      setEditorTheme(mq.matches ? 'github-dark' : 'github-light');
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const handleBeforeMount = useCallback((monaco: MonacoInstance) => {
    monaco.editor.defineTheme('github-light', githubLight);
    monaco.editor.defineTheme('github-dark', githubDark);
  }, []);

  const handleMount = useCallback(
    (_editor: unknown, monaco: MonacoInstance) => {
      configureMonaco(monaco);
    },
    [],
  );

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const options = useMemo(
    () => ({
      minimap: {enabled: false},
      fontSize: isMobile ? 16 : 13,
      lineNumbers: 'on' as const,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: 'on' as const,
      padding: {top: 12},
      accessibilitySupport: 'off' as const,
    }),
    [isMobile],
  );

  return (
    <div {...stylex.props(s.root)}>
      <MonacoEditor
        defaultLanguage="typescript"
        defaultValue={value}
        path="playground.tsx"
        theme={editorTheme}
        onChange={v => onChange(v ?? '')}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        options={options}
      />
    </div>
  );
}
