// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file monacoSetup.ts
 * @input The Monaco runtime instance passed to the editor's onMount
 * @output Self-hosted loader config + TypeScript-service setup with Astryx typedefs
 * @position Playground Code editor — keeps Monaco wiring out of PlaygroundClient.
 *
 * Configures Monaco's TypeScript service with real Astryx type definitions loaded
 * from a pre-built JSON bundle (generated at build time), so the editor offers
 * accurate autocomplete and diagnostics for @astryxdesign/core, React, StyleX, and icons.
 */

import {loader} from '@monaco-editor/react';
import type * as MonacoTypes from 'monaco-editor';

// Self-host Monaco from public/monaco/vs — corpnet blocks the default CDN.
if (typeof window !== 'undefined') {
  loader.config({paths: {vs: '/monaco/vs'}});
}

/** Monaco instance type — the full runtime object passed to onMount. */
export type MonacoInstance = typeof MonacoTypes & {
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

/**
 * Configure Monaco's TypeScript service with real Astryx type definitions.
 * Loads .d.ts files from a pre-built JSON bundle (generated at build time).
 */
export function configureMonaco(monaco: MonacoInstance) {
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

  // Lucide icons wildcard stub so named imports don't show as errors.
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

      // Heroicons ambient declarations, one per size/style variant
      // ('@heroicons/react/{16,20,24}/{outline,solid}'), so those imports
      // resolve once semantic validation turns on below.
      const heroiconFiles = packages['@heroicons/react'] ?? {};
      for (const [fileName, content] of Object.entries(heroiconFiles)) {
        const variant = fileName.replace(/\.d\.ts$/, '');
        ts.addExtraLib(
          content,
          `file:///node_modules/@heroicons/react/${variant}/index.d.ts`,
        );
      }

      const coreFiles = packages['@astryxdesign/core'] ?? {};
      const submoduleReexports: string[] = [];

      for (const [relPath, content] of Object.entries(coreFiles)) {
        ts.addExtraLib(
          content,
          `file:///node_modules/@astryxdesign/core/dist/${relPath}`,
        );

        if (relPath.endsWith('/index.d.ts')) {
          const moduleName = relPath.replace('/index.d.ts', '');
          ts.addExtraLib(
            content,
            `file:///node_modules/@astryxdesign/core/${moduleName}/index.d.ts`,
          );
          submoduleReexports.push(moduleName);
        }
      }

      const barrelContent = submoduleReexports
        .map(m => `export * from '@astryxdesign/core/${m}';`)
        .join('\n');
      ts.addExtraLib(
        `declare module '@astryxdesign/core' {\n${barrelContent}\n}`,
        'file:///node_modules/@astryxdesign/core/index.d.ts',
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
