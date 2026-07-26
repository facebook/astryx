// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Guards the RSC server/client boundary of every public component (#823).
 * @input Reads packages/core/package.json export map + every source file under
 *   packages/core/src, parsed with the TypeScript compiler API
 * @output Two invariants tying the presence of `'use client'` to what a
 *   component's import graph actually needs
 * @position Cross-cutting meta-test; sibling of scripts/check-use-client.mjs
 *
 * `scripts/check-use-client.mjs` enforces one direction only, and only
 * directly: a file that *imports* a React client API must carry the directive.
 * It is blind to two things this test covers:
 *
 *   1. Components carrying `'use client'` that no longer need it. A stale
 *      directive is not a lint error, but it pins the component to the client
 *      bundle and blocks it from ever resolving through a `react-server`
 *      export condition (#823 Phase 2).
 *   2. Components that become client-only *transitively* — e.g. a directive-
 *      free `Badge.tsx` starting to import `Tooltip`. Badge itself imports no
 *      React client API, so check-use-client.mjs stays silent, yet Badge is no
 *      longer server-renderable.
 *
 * Both invariants below derive the server-safe set from the import graph, so
 * the safe list is never written down twice — adding a hook (or a client
 * import) to one of these components fails the test on its own.
 *
 * SYNC: When modified, update this header and scripts/check-use-client.mjs if
 * the client-API list changes.
 */

import {describe, it, expect} from 'vitest';
import {readdirSync, readFileSync, existsSync, statSync} from 'node:fs';
import {join, dirname, resolve, relative} from 'node:path';
import ts from 'typescript';

const SRC_DIR = __dirname;
const PKG_JSON = join(SRC_DIR, '..', 'package.json');

/**
 * React APIs that only exist in a client component. Kept in sync with
 * `CLIENT_APIS` in scripts/check-use-client.mjs.
 */
const CLIENT_APIS = new Set([
  'createContext',
  'useContext',
  'useState',
  'useEffect',
  'useRef',
  'useCallback',
  'useMemo',
  'useReducer',
  'useId',
  'useTransition',
  'useOptimistic',
  'useSyncExternalStore',
  'useLayoutEffect',
  'useInsertionEffect',
  'useImperativeHandle',
  'useDeferredValue',
]);

const EXTENSIONS = ['.tsx', '.ts', '.mjs', '.js', '.jsx'];

const isSourceFile = (name: string) =>
  /\.[jt]sx?$/.test(name) &&
  !/\.(test|test-violations|stories|doc|perf)\./.test(name) &&
  !name.endsWith('.d.ts');

/** Resolve a relative import specifier the way a bundler would. */
function resolveSpecifier(spec: string, fromFile: string): string | null {
  if (!spec.startsWith('.')) {
    return null;
  }
  const base = resolve(dirname(fromFile), spec);
  for (const ext of EXTENSIONS) {
    if (existsSync(base + ext)) {
      return base + ext;
    }
  }
  if (existsSync(base) && statSync(base).isDirectory()) {
    for (const ext of EXTENSIONS) {
      const index = join(base, `index${ext}`);
      if (existsSync(index)) {
        return index;
      }
    }
  }
  return null;
}

interface ReExport {
  target: string;
  exportedName: string;
  localName: string;
}

interface ModuleInfo {
  rel: string;
  hasUseClient: boolean;
  clientAPIs: string[];
  reactDom: string[];
  moduleMutableState: string[];
  /** Plain imports: the names pulled, or '*' for default/namespace/side-effect. */
  imports: {target: string; names: Set<string> | '*'}[];
  reExports: ReExport[];
  starReExports: string[];
  /** True when every top-level statement is an import or a re-export. */
  isPureBarrel: boolean;
}

const moduleCache = new Map<string, ModuleInfo>();

/** Every named binding in the clause is `type`-only, so the import is erased. */
function isTypeOnlyImport(clause: ts.ImportClause): boolean {
  if (clause.isTypeOnly) {
    return true;
  }
  if (clause.name) {
    return false;
  }
  const bindings = clause.namedBindings;
  if (!bindings || !ts.isNamedImports(bindings)) {
    return false;
  }
  return (
    bindings.elements.length > 0 &&
    bindings.elements.every(element => element.isTypeOnly)
  );
}

function isTypeOnlyExport(node: ts.ExportDeclaration): boolean {
  if (node.isTypeOnly) {
    return true;
  }
  const clause = node.exportClause;
  if (!clause || !ts.isNamedExports(clause)) {
    return false;
  }
  return (
    clause.elements.length > 0 &&
    clause.elements.every(element => element.isTypeOnly)
  );
}

function parseModule(file: string): ModuleInfo {
  const cached = moduleCache.get(file);
  if (cached) {
    return cached;
  }

  const text = readFileSync(file, 'utf-8');
  const sourceFile = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TSX,
  );

  const info: ModuleInfo = {
    rel: relative(SRC_DIR, file),
    hasUseClient: false,
    clientAPIs: [],
    reactDom: [],
    moduleMutableState: [],
    imports: [],
    reExports: [],
    starReExports: [],
    isPureBarrel: true,
  };

  // Directive prologue: only comments and blank lines may precede it, which
  // the parser has already stripped by the time we see `statements`.
  for (const statement of sourceFile.statements) {
    if (
      ts.isExpressionStatement(statement) &&
      ts.isStringLiteral(statement.expression) &&
      statement.expression.text === 'use client'
    ) {
      info.hasUseClient = true;
      continue;
    }
    break;
  }

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      const spec = (statement.moduleSpecifier as ts.StringLiteral).text;
      const clause = statement.importClause;
      const typeOnly = clause ? isTypeOnlyImport(clause) : false;

      if (
        spec === 'react' &&
        clause &&
        !clause.isTypeOnly &&
        clause.namedBindings &&
        ts.isNamedImports(clause.namedBindings)
      ) {
        for (const element of clause.namedBindings.elements) {
          const imported = (element.propertyName ?? element.name).text;
          if (!element.isTypeOnly && CLIENT_APIS.has(imported)) {
            info.clientAPIs.push(imported);
          }
        }
      }
      if (!typeOnly && spec.startsWith('react-dom')) {
        info.reactDom.push(spec);
      }

      if (!typeOnly) {
        const target = resolveSpecifier(spec, file);
        if (target) {
          let names: Set<string> | '*' = '*';
          const bindings = clause?.namedBindings;
          if (bindings && ts.isNamedImports(bindings) && !clause?.name) {
            names = new Set(
              bindings.elements
                .filter(element => !element.isTypeOnly)
                .map(element => (element.propertyName ?? element.name).text),
            );
          }
          info.imports.push({target, names});
        }
      }
      continue;
    }

    if (ts.isExportDeclaration(statement) && statement.moduleSpecifier) {
      const spec = (statement.moduleSpecifier as ts.StringLiteral).text;
      if (!isTypeOnlyExport(statement)) {
        const target = resolveSpecifier(spec, file);
        if (target) {
          const clause = statement.exportClause;
          if (clause && ts.isNamedExports(clause)) {
            for (const element of clause.elements) {
              if (element.isTypeOnly) {
                continue;
              }
              info.reExports.push({
                target,
                exportedName: element.name.text,
                localName: (element.propertyName ?? element.name).text,
              });
            }
          } else {
            info.starReExports.push(target);
          }
        }
      }
      continue;
    }

    // Anything else is real code, so this module is not a pass-through barrel.
    info.isPureBarrel = false;

    if (ts.isVariableStatement(statement)) {
      const isLet = !(statement.declarationList.flags & ts.NodeFlags.Const);
      for (const decl of statement.declarationList.declarations) {
        const name = decl.name.getText(sourceFile);
        if (isLet) {
          info.moduleMutableState.push(`let ${name}`);
        } else if (decl.initializer) {
          const ctor = /^new (Map|Set|WeakMap|WeakSet)\b/.exec(
            decl.initializer.getText(sourceFile),
          );
          if (ctor) {
            info.moduleMutableState.push(`const ${name} = new ${ctor[1]}()`);
          }
        }
      }
    }
  }

  moduleCache.set(file, info);
  return info;
}

/**
 * Walk the runtime import graph from `entry` and report every client-only
 * surface it reaches.
 *
 * `packages/core/package.json` declares `sideEffects` as a narrow allowlist
 * (`*.stylex.ts`, `componentStyles.ts`, `*.css`), so every other module is
 * side-effect free and a bundler may drop unused re-exports. A pure
 * pass-through barrel is therefore followed by *used export* rather than
 * wholesale — otherwise importing `mergeProps` from `../utils` would appear to
 * drag in every unrelated sibling the barrel happens to re-export.
 *
 * @param ownDir When set, `'use client'` directives on files directly inside
 *   this directory are ignored, so the walk reports what the component's code
 *   actually *needs* rather than what it is currently *marked* as.
 */
function findClientSurfaces(
  entry: string,
  ownDir: string | null,
): {reason: string; file: string; via: string}[] {
  const problems: {reason: string; file: string; via: string}[] = [];
  const visited = new Set<string>();
  const queue: [string, Set<string> | '*', string[]][] = [
    [entry, '*', [relative(SRC_DIR, entry)]],
  ];

  while (queue.length > 0) {
    const [file, names, via] = queue.pop()!;
    if (!/\.(tsx?|jsx?|mjs)$/.test(file)) {
      continue;
    }
    const key = `${file}|${names === '*' ? '*' : [...names].sort().join(',')}`;
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);

    const info = parseModule(file);
    const chain = via.join(' -> ');
    const insideOwnDir = ownDir !== null && dirname(file) === ownDir;

    if (info.hasUseClient && !insideOwnDir) {
      problems.push({
        reason: 'depends on a "use client" module',
        file: info.rel,
        via: chain,
      });
    }
    if (info.clientAPIs.length > 0) {
      const apis = [...new Set(info.clientAPIs)].join(', ');
      problems.push({
        reason: `imports ${apis} from react`,
        file: info.rel,
        via: chain,
      });
    }
    if (info.reactDom.length > 0) {
      problems.push({
        reason: `imports ${info.reactDom.join(', ')}`,
        file: info.rel,
        via: chain,
      });
    }
    if (info.moduleMutableState.length > 0) {
      problems.push({
        reason: `module-level mutable state (${info.moduleMutableState.join('; ')})`,
        file: info.rel,
        via: chain,
      });
    }

    const push = (target: string, next: Set<string> | '*') =>
      queue.push([target, next, [...via, relative(SRC_DIR, target)]]);

    if (info.isPureBarrel && names !== '*') {
      for (const wanted of names) {
        const providers = info.reExports.filter(r => r.exportedName === wanted);
        if (providers.length > 0) {
          for (const p of providers) {
            push(p.target, new Set([p.localName]));
          }
        } else {
          for (const t of info.starReExports) {
            push(t, new Set([wanted]));
          }
        }
      }
      for (const imp of info.imports) {
        push(imp.target, imp.names);
      }
    } else {
      for (const imp of info.imports) {
        push(imp.target, imp.names);
      }
      for (const r of info.reExports) {
        push(r.target, new Set([r.localName]));
      }
      for (const t of info.starReExports) {
        push(t, '*');
      }
    }
  }

  return problems;
}

interface Component {
  subpath: string;
  dir: string;
  entry: string;
  /** Source files in the component's own directory that carry the directive. */
  directiveFiles: string[];
}

/**
 * Every component the package exposes as a `./Name` subpath backed by
 * `./src/Name/index.ts`. Driving off the export map keeps the test aligned
 * with the package's real public surface.
 */
function publicComponents(): Component[] {
  const pkg = JSON.parse(readFileSync(PKG_JSON, 'utf-8')) as {
    exports?: Record<string, {source?: string}>;
  };
  const components: Component[] = [];
  for (const [subpath, entryPoint] of Object.entries(pkg.exports ?? {})) {
    const source = entryPoint?.source;
    if (!source) {
      continue;
    }
    const match = /^\.\/src\/([^/]+)\/index\.ts$/.exec(source);
    if (!match) {
      continue;
    }
    const dir = join(SRC_DIR, match[1]);
    const entry = join(dir, 'index.ts');
    if (!existsSync(entry)) {
      continue;
    }
    const directiveFiles = readdirSync(dir)
      .filter(isSourceFile)
      .filter(name => parseModule(join(dir, name)).hasUseClient)
      .map(name => `${match[1]}/${name}`);
    components.push({subpath, dir, entry, directiveFiles});
  }
  return components;
}

const COMPONENTS = publicComponents();

const format = (problems: {reason: string; file: string; via: string}[]) =>
  [...new Map(problems.map(p => [`${p.file}|${p.reason}`, p])).values()]
    .map(p => `      ${p.file} ${p.reason}\n        via ${p.via}`)
    .join('\n');

describe('RSC server/client boundary (#823)', () => {
  it('finds the public component entry points', () => {
    expect(COMPONENTS.length).toBeGreaterThan(50);
  });

  it('does not mark server-safe components as "use client"', () => {
    const stale: string[] = [];
    for (const component of COMPONENTS) {
      if (component.directiveFiles.length === 0) {
        continue;
      }
      // Ignore this component's own directives so the graph reports what its
      // code needs, not what it is currently labelled.
      const problems = findClientSurfaces(component.entry, component.dir);
      if (problems.length === 0) {
        stale.push(
          `  ${component.subpath} is server-safe but still carries 'use client' in: ${component.directiveFiles.join(', ')}`,
        );
      }
    }
    expect(
      stale.join('\n'),
      `\nThese components import no client-only surface, so the directive pins them\n` +
        `to the client bundle for nothing. Remove it (source file *and* index.ts):\n`,
    ).toBe('');
  });

  it('keeps directive-free components free of client-only imports', () => {
    const leaked: string[] = [];
    for (const component of COMPONENTS) {
      if (component.directiveFiles.length > 0) {
        continue;
      }
      const problems = findClientSurfaces(component.entry, null);
      if (problems.length > 0) {
        leaked.push(`  ${component.subpath}:\n${format(problems)}`);
      }
    }
    expect(
      leaked.join('\n'),
      `\nThese components ship without 'use client', so they are server modules —\n` +
        `but they reach a client-only surface. Either drop the client dependency or\n` +
        `restore the directive. scripts/check-use-client.mjs cannot see this:\n`,
    ).toBe('');
  });
});
