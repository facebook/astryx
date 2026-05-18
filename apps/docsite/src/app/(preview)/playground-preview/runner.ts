// Copyright (c) Meta Platforms, Inc. and affiliates.

import {scope} from './scope';

interface BabelStandalone {
  transform(
    code: string,
    options: Record<string, unknown>,
  ): {code: string};
}

/** Set by the page after loading Babel from CDN */
let Babel: BabelStandalone | null = null;

export function setBabel(instance: BabelStandalone) {
  Babel = instance;
}

interface ParsedImport {
  source: string;
  specifiers: Array<{
    local: string;
    imported: string | null;
    type: 'default' | 'named' | 'namespace';
  }>;
}

type RunPhase = 'babel' | 'import' | 'runtime';

type RunResult =
  | {Component: React.ComponentType; error?: undefined}
  | {Component?: undefined; error: string; phase: RunPhase};

const ASSET_RE = /\.(png|jpe?g|gif|svg|webp|ico|bmp|css|scss|less|sass|woff2?|ttf|eot|otf|mp4|webm|ogg|mp3|wav)$/i;

const scopeLookup = new Map<string, Record<string, unknown>>();
for (const [key, value] of Object.entries(scope)) {
  scopeLookup.set(key.toLowerCase(), value as Record<string, unknown>);
}

function compileCode(code: string): {compiled: string; imports: ParsedImport[]} {
  const imports: ParsedImport[] = [];

  const importStripper = (): {visitor: Record<string, (path: {node: Record<string, unknown>; remove: () => void}) => void>} => ({
    visitor: {
      ImportDeclaration(path: {node: Record<string, unknown>; remove: () => void}) {
        const source = (path.node.source as {value: string}).value;
        const specifiers: ParsedImport['specifiers'] = [];

        for (const spec of path.node.specifiers as Array<{type: string; local: {name: string}; imported?: {name: string}}>) {
          if (spec.type === 'ImportDefaultSpecifier') {
            specifiers.push({local: spec.local.name, imported: null, type: 'default'});
          } else if (spec.type === 'ImportNamespaceSpecifier') {
            specifiers.push({local: spec.local.name, imported: null, type: 'namespace'});
          } else if (spec.type === 'ImportSpecifier') {
            specifiers.push({
              local: spec.local.name,
              imported: spec.imported?.name ?? spec.local.name,
              type: 'named',
            });
          }
        }

        imports.push({source, specifiers});
        path.remove();
      },
      ExpressionStatement(path: {node: Record<string, unknown>; remove: () => void}) {
        const expr = path.node.expression as Record<string, unknown> | undefined;
        if (
          expr &&
          typeof expr === 'object' &&
          expr.type === 'StringLiteral' &&
          expr.value === 'use client'
        ) {
          path.remove();
        }
      },
    },
  });

  const result = Babel!.transform(code, {
    filename: 'playground.tsx',
    presets: [
      ['typescript', {isTSX: true, allExtensions: true}],
      ['react', {runtime: 'classic'}],
    ],
    plugins: [importStripper, 'transform-modules-commonjs'],
  });

  return {compiled: result.code, imports};
}

function buildScope(imports: ParsedImport[]): Record<string, unknown> {
  const vars: Record<string, unknown> = {};

  for (const imp of imports) {
    if (ASSET_RE.test(imp.source)) {
      for (const spec of imp.specifiers) {
        vars[spec.local] = '';
      }
      continue;
    }

    const mod = scopeLookup.get(imp.source.toLowerCase());

    if (mod) {
      for (const spec of imp.specifiers) {
        if (spec.type === 'default') {
          vars[spec.local] = mod.default ?? mod;
        } else if (spec.type === 'namespace') {
          vars[spec.local] = mod;
        } else {
          vars[spec.local] = mod[spec.imported ?? spec.local];
        }
      }
    } else {
      for (const spec of imp.specifiers) {
        if (spec.type === 'namespace') {
          vars[spec.local] = new Proxy(
            {},
            {
              get(_target, prop) {
                if (typeof prop === 'string') {
                  const placeholder = () => null;
                  placeholder.displayName = `${imp.source}.${prop}`;
                  return placeholder;
                }
                return undefined;
              },
            },
          );
        } else {
          const placeholder = () => null;
          placeholder.displayName = `${imp.source}/${spec.local}`;
          vars[spec.local] = placeholder;
        }
      }
    }
  }

  return vars;
}

function evaluate(
  compiledCode: string,
  scopeVars: Record<string, unknown>,
): React.ComponentType {
  const exports: Record<string, unknown> = {};
  const module = {exports};

  const keys = ['module', 'exports', ...Object.keys(scopeVars)];
  const values = [module, exports, ...Object.values(scopeVars)];

  const fn = new Function(...keys, compiledCode);
  fn(...values);

  const defaultExport =
    (module.exports as Record<string, unknown>).default ?? exports.default;

  if (typeof defaultExport !== 'function') {
    throw new Error(
      'No default export found. Add `export default function YourComponent()`.',
    );
  }

  return defaultExport as React.ComponentType;
}

/**
 * Build a scope with ALL exports from every module in the scope map.
 * This makes React hooks and XDS components available as globals
 * without requiring explicit imports.
 */
function buildGlobalScope(): Record<string, unknown> {
  const vars: Record<string, unknown> = {};
  for (const [, moduleExports] of Object.entries(scope)) {
    for (const [name, value] of Object.entries(moduleExports)) {
      if (name !== 'default' && name !== '__esModule') {
        vars[name] = value;
      }
    }
  }
  // Also add React as a global (needed for JSX classic runtime)
  vars.React = scope['react']?.default ?? scope['react'];
  return vars;
}

export function runCode(code: string): RunResult {
  if (!Babel) {
    return {error: 'Babel compiler not loaded yet', phase: 'babel'};
  }

  let compiled: string;
  let imports: ParsedImport[];

  try {
    ({compiled, imports} = compileCode(code));
  } catch (e: unknown) {
    return {
      error: e instanceof Error ? e.message : String(e),
      phase: 'babel',
    };
  }

  let scopeVars: Record<string, unknown>;
  try {
    scopeVars = {...buildGlobalScope(), ...buildScope(imports)};
  } catch (e: unknown) {
    return {
      error: e instanceof Error ? e.message : String(e),
      phase: 'import',
    };
  }

  try {
    const Component = evaluate(compiled, scopeVars);
    return {Component};
  } catch (e: unknown) {
    return {
      error: e instanceof Error ? e.message : String(e),
      phase: 'runtime',
    };
  }
}
