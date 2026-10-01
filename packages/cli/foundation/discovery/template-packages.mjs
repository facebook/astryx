// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The packages a template imports that a project does not list.
 *
 * A template is starter source: scaffolding it copies its imports into the
 * project verbatim. Most templates import packages beyond Astryx (an icon set,
 * a chart library), and a project that does not list them fails to build the
 * moment the page is wired in. This module reads a template's imports, checks
 * them against the project's package.json files, and names what is missing
 * with the one command that installs it in that project's package manager.
 *
 * @input A template's source and file path; the directory it is scaffolded to
 *   (or, before scaffolding, the directory a command runs in).
 * @output `{missingPackages, installCommand}`: package names, sorted, and the
 *   install command, or `[]` and null when the project lists everything.
 * @position packages/cli/foundation/discovery — beside template discovery;
 *   used by the template copy leaf and by the build subject's adapter.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {builtinModules, createRequire} from 'node:module';
import {getAddPrefix} from '../env/package-manager.mjs';

const require = createRequire(import.meta.url);

/** Dependency fields a package.json declares packages in. */
const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
];

const BUILTINS = new Set(builtinModules);

/**
 * The package an import specifier resolves from, or null when it is not a
 * package: a relative or absolute path, a Node builtin, a URL or other
 * `scheme:` id, a `#` subpath import, or a path alias such as `@/lib`.
 * `@scope/name/sub` is `@scope/name`; `name/sub` is `name`.
 * @param {string} specifier
 * @returns {string | null}
 */
export function packageOfSpecifier(specifier) {
  const match =
    /^(@[a-z0-9][\w.-]*\/[a-z0-9][\w.-]*|[a-z0-9][\w.-]*)(?:\/|$)/i.exec(
      specifier,
    );
  if (!match || specifier.includes(':')) return null;
  const name = match[1];
  if (BUILTINS.has(name)) return null;
  return name;
}

/**
 * Every package a module imports or re-exports from, sorted. Type-only imports
 * count: a type checker needs them resolved as much as a bundler needs the
 * rest. Source that does not parse imports nothing we can name.
 * @param {string} source TSX/TS/JSX/JS source.
 * @returns {string[]}
 */
export function importedPackages(source) {
  let program;
  try {
    const {parse} = require('@babel/parser');
    program = parse(source, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
      errorRecovery: true,
    }).program;
  } catch {
    return [];
  }
  /** @type {Set<string>} */
  const names = new Set();
  for (const node of program.body) {
    const from =
      node.type === 'ImportDeclaration' ||
      node.type === 'ExportAllDeclaration' ||
      (node.type === 'ExportNamedDeclaration' && node.source)
        ? node.source?.value
        : null;
    const name = typeof from === 'string' ? packageOfSpecifier(from) : null;
    if (name) names.add(name);
  }
  return [...names].sort();
}

/**
 * @param {string} file
 * @returns {Record<string, any> | null}
 */
function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * What a project can import: every package declared by the package.json in
 * `startDir` or any directory above it (node resolution walks up, so a
 * workspace root's dependencies resolve from its packages), plus each of those
 * packages' own names. `projectDir` is the nearest directory with a
 * package.json, the one an install adds to; null when there is none.
 * @param {string} startDir
 * @returns {{declared: Set<string>, projectDir: string | null}}
 */
export function declaredPackages(startDir) {
  /** @type {Set<string>} */
  const declared = new Set();
  /** @type {string | null} */
  let projectDir = null;
  let dir = path.resolve(startDir);
  for (;;) {
    const pkg = readJson(path.join(dir, 'package.json'));
    if (pkg) {
      projectDir ??= dir;
      if (typeof pkg.name === 'string') declared.add(pkg.name);
      for (const field of DEPENDENCY_FIELDS) {
        for (const name of Object.keys(pkg[field] ?? {})) declared.add(name);
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return {declared, projectDir};
}

/**
 * The range the package that ships a template declares for `name`: the
 * versions the template was written and checked against. Read from the
 * nearest package.json above the template file.
 * @param {string} templateFile
 * @param {string} name
 * @returns {string | null}
 */
function declaredRange(templateFile, name) {
  let dir = path.dirname(path.resolve(templateFile));
  for (;;) {
    const pkg = readJson(path.join(dir, 'package.json'));
    if (pkg) {
      for (const field of DEPENDENCY_FIELDS) {
        const range = pkg[field]?.[name];
        if (typeof range === 'string') return range;
      }
      return null;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * The install spec for one package: pinned to the major line (or the minor
 * line below 1.0) the shipping package declares, so a later major the template
 * was never checked against is not installed. `^2.2.0` is `name@2`, `~1.4.0`
 * is `name@1.4`, `0.19.1` is `name@0.19`. A range it cannot read that way
 * (`*`, a workspace or catalog protocol, a union) installs the bare name.
 * Every spec is free of shell metacharacters, so the command runs as printed
 * in any shell.
 * @param {string} name
 * @param {string} templateFile
 * @returns {string}
 */
function installSpec(name, templateFile) {
  const range = declaredRange(templateFile, name);
  const match = range && /^([\^~]?)(\d+)\.(\d+)\.\d+$/.exec(range.trim());
  if (!match) return name;
  const [, op, major, minor] = match;
  return op === '^' && major !== '0'
    ? `${name}@${major}`
    : `${name}@${major}.${minor}`;
}

/**
 * The packages a template imports that the project at `targetDir` does not
 * list, and the command that installs them there with the project's package
 * manager. When the project's package.json is not in `cwd`, the command
 * changes into it first, so it is still runnable as printed from `cwd`.
 *
 * @param {object} input
 * @param {string} input.source The template source, as it is (or will be) written.
 * @param {string} input.templateFile The template file, for the versions its package declares.
 * @param {string} input.targetDir Where the template is (or would be) scaffolded.
 * @param {string} input.cwd Where the command runs.
 * @returns {{missingPackages: string[], installCommand: string | null}}
 */
export function templatePackageNeeds({source, templateFile, targetDir, cwd}) {
  const {declared, projectDir} = declaredPackages(targetDir);
  const missingPackages = importedPackages(source).filter(
    name => !declared.has(name),
  );
  if (missingPackages.length === 0) {
    return {missingPackages, installCommand: null};
  }
  const installDir = projectDir ?? path.resolve(cwd);
  const specs = missingPackages.map(name => installSpec(name, templateFile));
  const install = `${getAddPrefix(installDir)} ${specs.join(' ')}`;
  const rel = path.relative(path.resolve(cwd), installDir);
  const where = /[\s"'$`&|;<>()]/.test(rel) ? JSON.stringify(rel) : rel;
  return {
    missingPackages,
    installCommand: rel ? `cd ${where} && ${install}` : install,
  };
}

/**
 * {@link templatePackageNeeds} for a template file on disk that has not been
 * scaffolded yet. An unreadable file needs nothing we can name.
 * @param {string} templateFile
 * @param {{targetDir: string, cwd: string}} where
 * @returns {{missingPackages: string[], installCommand: string | null}}
 */
export function templateFilePackageNeeds(templateFile, {targetDir, cwd}) {
  let source;
  try {
    source = fs.readFileSync(templateFile, 'utf-8');
  } catch {
    return {missingPackages: [], installCommand: null};
  }
  return templatePackageNeeds({source, templateFile, targetDir, cwd});
}
