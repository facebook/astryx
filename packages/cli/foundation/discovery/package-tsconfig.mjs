// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Read a package's TypeScript project the way `tsc` reads it, so a
 * check that reads the package's types with its own compiler sees what the
 * package compiles against.
 *
 * - The config is the nearest `tsconfig.json`: the package's own, or a
 *   monorepo's root config for a local package. An app's config above an
 *   installed package (one below `node_modules`) is not the package's, and is
 *   not read.
 * - A solution-style config (`"files": []` with `references`) lends the
 *   referenced config, at any depth, that includes the files to read.
 * - The declaration files the config includes, included files that declare
 *   globals or augment a module, and included scripts (no import or export)
 *   join the files to read, so ambient types resolve as `tsc` resolves them.
 * - Without a config, defaults read TSX the way bundlers do. A config with
 *   errors is reported, never read as defaults.
 *
 * @input The project's own `typescript`, the package directory, and the
 *   source files to read.
 * @output Compiler options, the declaration files to add, and the config's
 *   error, if any.
 * @position Foundation discovery, used by the documented-props comparison.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Whether a file the config includes declares types every file sees: a
 * declaration file, a file that declares globals or augments a module, or a
 * script (a `.ts` file with no import or export).
 * @param {string} file
 */
function isAmbient(file) {
  if (/\.d\.[cm]?ts$/.test(file)) return true;
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch {
    return false;
  }
  return (
    /\bdeclare\s+(?:global|module)\b/.test(text) ||
    (/\.tsx?$/.test(file) && !/^\s*(?:import|export)\b/m.test(text))
  );
}

/**
 * @param {any} ts the project's own `typescript`
 * @param {string} packageDir
 * @param {string[]} sources the files to read
 * @returns {{options: any, declarations: string[], error?: string}}
 */
export function readPackageTsconfig(ts, packageDir, sources) {
  const defaults = {
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    allowJs: true,
    esModuleInterop: true,
    resolveJsonModule: true,
    allowImportingTsExtensions: true,
  };
  /** @type {string | undefined} */
  let error;
  /** @type {(configPath: string) => any} */
  const parse = configPath => {
    const read = ts.readConfigFile(configPath, ts.sys.readFile);
    const config = read.error
      ? {errors: [read.error], fileNames: [], options: {}}
      : ts.parseJsonConfigFileContent(
          read.config,
          ts.sys,
          path.dirname(configPath),
          undefined,
          configPath,
        );
    // "No inputs were found" is how a solution-style config reads.
    const problem = config.errors.find(
      /** @param {any} d */ d => d.code !== 18003,
    );
    // A `files` entry that does not exist parses, and `tsc` then reports it
    // (TS6053).
    const missing = config.fileNames.find(
      /** @param {string} file */ file => !fs.existsSync(file),
    );
    const where = path.relative(packageDir, configPath);
    if (problem) {
      config.error = `${where}: ${ts.flattenDiagnosticMessageText(problem.messageText, ' ')}`;
    } else if (missing) {
      config.error = `${where}: File '${path.relative(packageDir, missing)}' not found.`;
    }
    return config;
  };
  /** @type {any} */
  let parsed;
  try {
    const found = ts.findConfigFile(
      packageDir,
      ts.sys.fileExists,
      'tsconfig.json',
    );
    // A config above the package is an app's when the package is installed
    // below it (`node_modules`), and the package's own otherwise (a
    // monorepo's root config, as `tsc` reads it).
    const installed =
      found &&
      path
        .relative(path.dirname(found), packageDir)
        .split(path.sep)
        .includes('node_modules');
    parsed = found && !installed ? parse(found) : null;
    const own = new Set(sources.map(file => path.resolve(file)));
    /** @type {(config: any) => boolean} */
    const includes = config =>
      config.fileNames.some(
        /** @param {string} file */ file => own.has(path.resolve(file)),
      );
    // Every reference, at any depth, each config once (a cycle ends).
    const visited = new Set(found ? [path.resolve(found)] : []);
    /** @type {(config: any) => any} */
    const including = config => {
      if (includes(config)) return config;
      for (const ref of config.projectReferences ?? []) {
        const next = path.resolve(ts.resolveProjectReferencePath(ref));
        if (visited.has(next)) continue;
        visited.add(next);
        const hit = including(parse(next));
        if (hit) return hit;
      }
      return null;
    };
    if (parsed) parsed = including(parsed) ?? parsed;
  } catch {
    parsed = null;
  }
  error = parsed?.error;
  const options = parsed ? {...parsed.options} : defaults;
  if (options.jsx == null) options.jsx = defaults.jsx;
  return {
    options: {
      ...options,
      noEmit: true,
      skipLibCheck: true,
      incremental: false,
      composite: false,
    },
    ...(error ? {error} : {}),
    declarations: (parsed?.fileNames ?? []).filter(isAmbient),
  };
}
