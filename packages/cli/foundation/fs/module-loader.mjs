// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared module-loading + conventional-file-discovery primitives.
 *
 * Both config loading and integration loading need to (a) import a
 * user-authored module (`.ts` via jiti, `.mjs`/`.js` via native dynamic
 * import) and (b) find conventional files by basename in a fixed
 * load-precedence order. These helpers centralize that so the two callers stay
 * in lockstep.
 *
 * `loadModuleWithParser` builds on these primitives to provide the single
 * load/validation boundary shared by config, integration, codemod, and
 * template discovery: import the module, take its default export, and hand it
 * to the authoring parser (which seals its own zod schema).
 *
 * Because every user-authored module flows through here, this is also where
 * the project-code gate lives: importing a module executes it, which is the
 * right trade in a workspace the operator trusts and the wrong one in CI,
 * triage, or agent runs over arbitrary checkouts. ASTRYX_NO_PROJECT_CODE=1
 * keeps the whole CLI on built-in data — config loading skips cleanly
 * (Project.load checks the gate first) and any other user-module import
 * fails with an error that names the variable.
 */

import * as path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import * as fs from 'node:fs';
import {createJiti} from 'jiti';

/** @type {ReturnType<typeof createJiti> | undefined} */
let jitiInstance;
function getJiti() {
  if (!jitiInstance) {
    jitiInstance = createJiti(import.meta.url);
  }
  return jitiInstance;
}

/**
 * True unless this invocation opted out of executing code found in the
 * workspace (ASTRYX_NO_PROJECT_CODE=1).
 */
export function projectCodeAllowed() {
  return process.env.ASTRYX_NO_PROJECT_CODE !== '1';
}

// The CLI's own package root. Modules under it (assets/docs topics, shipped
// templates, command modules) are shipped code, not project code — the gate
// must not touch them, or "runs on built-in data" would break the built-ins.
const CLI_PACKAGE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

/**
 * True when `file` is one of the CLI's own shipped modules.
 * @param {string} file
 */
export function isCliShippedPath(file) {
  const resolved = path.resolve(file);
  return (
    resolved === CLI_PACKAGE_ROOT ||
    resolved.startsWith(CLI_PACKAGE_ROOT + path.sep)
  );
}

/**
 * Import a user-authored module. `.ts` is loaded via jiti; `.mjs`/`.js` via
 * native dynamic import (file:// URL). Returns the full module namespace.
 * Under ASTRYX_NO_PROJECT_CODE=1 this refuses everything except the CLI's own
 * shipped modules — importing executes the module.
 * @param {string} file absolute path
 * @returns {Promise<Record<string, unknown>>}
 */
export async function importUserModule(file) {
  if (!projectCodeAllowed() && !isCliShippedPath(file)) {
    throw new Error(
      `ASTRYX_NO_PROJECT_CODE=1 — refusing to import ${file}; unset the variable to let astryx load modules from this workspace`,
    );
  }
  if (file.endsWith('.ts')) {
    return await getJiti().import(file);
  }
  return await import(pathToFileURL(file).href);
}

/**
 * Return the conventional files (by basename, in the given precedence order)
 * that exist directly in `dir`, as absolute paths. Never throws.
 * @param {string} dir
 * @param {string[]} basenames precedence-ordered
 * @returns {string[]} absolute paths of present files, in basenames order
 */
export function findPresentFiles(dir, basenames) {
  return basenames
    .filter(name => fs.existsSync(path.join(dir, name)))
    .map(name => path.join(dir, name));
}

/**
 * Import a user-authored module, take its default export, and validate it
 * through an authoring parser. This is the single load/validation boundary for
 * all user-authored modules (config, integration, codemod, template): execute
 * the module, take the default export, and hand it to the parser, which returns
 * the typed value or throws a clear, readable error. Zod stays sealed inside
 * the parser — this boundary never touches it.
 *
 * @template T
 * @param {string} file absolute path
 * @param {(input: unknown, label?: string) => T} parse an authoring parser
 *   (parseConfig, parseIntegration, parseCodemod, parseTemplate)
 * @param {{label?: string}} [opts] label used in error messages
 * @returns {Promise<T>} parsed + typed value
 */
export async function loadModuleWithParser(file, parse, {label} = {}) {
  const mod = await importUserModule(file);
  return parse(mod?.default, label ?? file);
}
