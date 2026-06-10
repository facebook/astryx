// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file runner.ts
 * @input User TSX source + the in-browser TypeScript compiler
 * @output A live React component (or a structured error)
 * @position Playground preview iframe — compiles & evaluates user code.
 *
 * Transpiles TSX → CommonJS with the self-hosted TypeScript compiler
 * (window.ts, served from /vendor/typescript.js — corpnet blocks CDNs), then
 * evaluates it with a custom `require` mapped to the preview scope plus a
 * global scope so unimported React hooks / XDS components still resolve.
 */

import type * as TS from 'typescript';
import {scope} from '@/generated/playground-scope';

/** Set by the page after loading /vendor/typescript.js */
let ts: typeof TS | null = null;

export function setTypeScript(instance: typeof TS) {
  ts = instance;
}

type RunPhase = 'compile' | 'runtime';

type RunResult =
  | {Component: React.ComponentType; error?: undefined}
  | {Component?: undefined; error: string; phase: RunPhase};

const ASSET_RE =
  /\.(png|jpe?g|gif|svg|webp|ico|bmp|css|scss|less|sass|woff2?|ttf|eot|otf|mp4|webm|ogg|mp3|wav)$/i;

const scopeLookup = new Map<string, Record<string, unknown>>();
for (const [key, value] of Object.entries(scope)) {
  scopeLookup.set(key.toLowerCase(), value as Record<string, unknown>);
}

/** A CommonJS-style require resolving against the preview scope. */
function makeRequire(): (id: string) => unknown {
  return (id: string) => {
    if (ASSET_RE.test(id)) {
      return {default: '', __esModule: true};
    }
    const mod = scopeLookup.get(id.toLowerCase());
    if (mod) {
      // Mark as an ES module so TS esModuleInterop uses `.default` correctly.
      return (mod as {__esModule?: boolean}).__esModule
        ? mod
        : {...mod, __esModule: true};
    }
    // Unknown module — return placeholders that render nothing.
    return new Proxy(
      {__esModule: true},
      {
        get(_target, prop) {
          if (prop === '__esModule') {
            return true;
          }
          if (typeof prop === 'string') {
            const placeholder = () => null;
            (placeholder as {displayName?: string}).displayName =
              `${id}/${prop}`;
            return placeholder;
          }
          return undefined;
        },
      },
    );
  };
}

/**
 * Build a scope with ALL named exports from every module so React hooks and
 * XDS components are available as globals without an explicit import.
 */
function buildGlobalScope(): Record<string, unknown> {
  const vars: Record<string, unknown> = {};
  for (const moduleExports of Object.values(scope)) {
    for (const [name, value] of Object.entries(moduleExports)) {
      if (name !== 'default' && name !== '__esModule') {
        vars[name] = value;
      }
    }
  }
  // React global for classic JSX (React.createElement).
  vars.React = scope['react']?.default ?? scope['react'];
  return vars;
}

function compile(code: string): string {
  if (ts == null) {
    throw new Error(
      'TypeScript has not been loaded yet — call setTypeScript()',
    );
  }
  const result = ts.transpileModule(code, {
    fileName: 'playground.tsx',
    reportDiagnostics: false,
    compilerOptions: {
      jsx: ts.JsxEmit.React, // emit React.createElement (classic runtime)
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
      allowJs: true,
    },
  });
  return result.outputText;
}

function evaluate(compiled: string): React.ComponentType {
  const exportsObj: Record<string, unknown> = {};
  const moduleObj = {exports: exportsObj};
  const requireFn = makeRequire();
  const globals = buildGlobalScope();

  const keys = ['module', 'exports', 'require', ...Object.keys(globals)];
  const values = [moduleObj, exportsObj, requireFn, ...Object.values(globals)];

  const fn = new Function(...keys, compiled);
  fn(...values);

  const defaultExport =
    (moduleObj.exports as Record<string, unknown>).default ??
    exportsObj.default;

  if (typeof defaultExport !== 'function') {
    throw new Error(
      'No default export found. Add `export default function YourComponent()`.',
    );
  }

  return defaultExport as React.ComponentType;
}

export function runCode(code: string): RunResult {
  if (!ts) {
    return {error: 'TypeScript compiler not loaded yet', phase: 'compile'};
  }

  let compiled: string;
  try {
    compiled = compile(code);
  } catch (e: unknown) {
    return {
      error: e instanceof Error ? e.message : String(e),
      phase: 'compile',
    };
  }

  try {
    const Component = evaluate(compiled);
    return {Component};
  } catch (e: unknown) {
    return {
      error: e instanceof Error ? e.message : String(e),
      phase: 'runtime',
    };
  }
}
