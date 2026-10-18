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
 * - The declaration files the config includes, and included files that
 *   declare globals or augment a module, join the files to read, so ambient
 *   types resolve as `tsc` resolves them.
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
    if (problem) {
      config.error = `${path.relative(packageDir, configPath)}: ${ts.flattenDiagnosticMessageText(problem.messageText, ' ')}`;
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
    /** @type {(config: any, depth: number) => any} */
    const including = (config, depth) =>
      includes(config)
        ? config
        : depth < 4
          ? (config.projectReferences ?? [])
              .map(
                /** @param {any} ref */ ref =>
                  including(
                    parse(ts.resolveProjectReferencePath(ref)),
                    depth + 1,
                  ),
              )
              .find(Boolean)
          : null;
    if (parsed) parsed = including(parsed, 0) ?? parsed;
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
    declarations: (parsed?.fileNames ?? []).filter(
      /** @param {string} file */ file =>
        /\.d\.[cm]?ts$/.test(file) ||
        /\bdeclare\s+(?:global|module)\b/.test(fs.readFileSync(file, 'utf8')),
    ),
  };
}
