// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The versions a project's lockfile resolved for its direct
 * dependencies.
 *
 * A project that declares a package without installing it still pins it: the
 * lockfile records the exact version an install would bring in. A hosted
 * runtime reads that pin so it can serve the same version from a matching
 * package set instead of the newest one (see package-set.mjs).
 *
 * Supported: pnpm-lock.yaml (importers and the older single-project shape),
 * package-lock.json / npm-shrinkwrap.json, yarn.lock (classic and Berry), and
 * the text bun.lock. The binary bun.lockb is not read. Every reader is
 * best-effort: an unreadable or unfamiliar lockfile yields no pins, and the
 * caller falls back to the installed version or the declared range.
 *
 * A lockfile above the project pins it only when the project is one of that
 * lockfile's workspaces: a pnpm importer, or a member the directory's
 * package.json `workspaces` globs name (npm, yarn, bun). An unrelated
 * lockfile further up resolves nothing for it.
 *
 * @position foundation/runtime — used by package-set.mjs only.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {isValidSemver} from '../env/semver.mjs';

/** Lockfile names, in the order one directory's files are tried. */
const LOCKFILE_NAMES = [
  'pnpm-lock.yaml',
  'package-lock.json',
  'npm-shrinkwrap.json',
  'yarn.lock',
  'bun.lock',
];

/**
 * @typedef {object} FoundLockfile
 * @property {string} dir directory holding the lockfile (the workspace root
 *   for a workspace member)
 * @property {string} file absolute lockfile path
 * @property {string} name lockfile basename
 */

/**
 * The nearest lockfile at or above `projectDir`.
 * @param {string} projectDir
 * @returns {FoundLockfile | null}
 */
export function findLockfile(projectDir) {
  let dir = path.resolve(projectDir);
  for (;;) {
    for (const name of LOCKFILE_NAMES) {
      const file = path.join(dir, name);
      if (fs.existsSync(file)) return {dir, file, name};
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * The exact version the lockfile resolved for each of `declared`, keyed by
 * package name. Names the lockfile does not resolve (or resolves to something
 * other than a plain semver version, such as a link) are absent.
 *
 * @param {string} projectDir directory holding the project's package.json
 * @param {Record<string, string>} declared declared dependency name → spec
 * @returns {{lockfile: FoundLockfile | null, versions: Map<string, string>}}
 */
export function readLockedVersions(projectDir, declared) {
  /** @type {Map<string, string>} */
  const versions = new Map();
  const lockfile = findLockfile(projectDir);
  if (!lockfile) return {lockfile, versions};

  let text;
  try {
    text = fs.readFileSync(lockfile.file, 'utf-8');
  } catch {
    return {lockfile, versions};
  }
  const importer =
    path
      .relative(lockfile.dir, path.resolve(projectDir))
      .split(path.sep)
      .join('/') || '.';

  // pnpm records every workspace as an importer, so its lookup already
  // answers only for members; the others need the workspace globs.
  if (
    lockfile.name !== 'pnpm-lock.yaml' &&
    !isWorkspaceMember(lockfile.dir, importer)
  ) {
    return {lockfile, versions};
  }

  /** @type {(name: string, spec: string) => string | undefined} */
  let lookup;
  try {
    switch (lockfile.name) {
      case 'pnpm-lock.yaml':
        lookup = pnpmLookup(text, importer);
        break;
      case 'package-lock.json':
      case 'npm-shrinkwrap.json':
        lookup = npmLookup(text, importer);
        break;
      case 'yarn.lock':
        lookup = yarnLookup(text);
        break;
      case 'bun.lock':
        lookup = bunLookup(text);
        break;
      default:
        return {lockfile, versions};
    }
  } catch {
    return {lockfile, versions};
  }

  for (const [name, spec] of Object.entries(declared)) {
    const raw = lookup(name, spec);
    const version = typeof raw === 'string' ? cleanVersion(raw) : null;
    if (version) versions.set(name, version);
  }
  return {lockfile, versions};
}

/**
 * Is `importer` (a `/`-separated path relative to `dir`, `.` for `dir`
 * itself) one of the workspaces `dir`'s package.json declares?
 * @param {string} dir
 * @param {string} importer
 * @returns {boolean}
 */
function isWorkspaceMember(dir, importer) {
  if (importer === '.') return true;
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'));
  } catch {
    return false;
  }
  const field = pkg?.workspaces;
  const patterns = Array.isArray(field)
    ? field
    : Array.isArray(field?.packages)
      ? field.packages
      : [];
  let member = false;
  for (const raw of patterns) {
    if (typeof raw !== 'string') continue;
    const negated = raw.startsWith('!');
    const pattern = (negated ? raw.slice(1) : raw)
      .replace(/^\.\//, '')
      .replace(/\/+$/, '');
    if (globToRegExp(pattern).test(importer)) member = !negated;
  }
  return member;
}

/**
 * A workspace glob (`packages/*`, `apps/**`, `site`) as an anchored RegExp.
 * @param {string} glob
 * @returns {RegExp}
 */
function globToRegExp(glob) {
  let source = '';
  for (let i = 0; i < glob.length; i++) {
    const char = glob[i];
    if (char === '*') {
      if (glob[i + 1] === '*') {
        source += '.*';
        i++;
      } else {
        source += '[^/]*';
      }
    } else if (char === '?') {
      source += '[^/]';
    } else {
      source += char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${source}$`);
}

/**
 * Strip pnpm's peer suffix (`1.2.3(react@19.0.0)`) and keep only a plain
 * semver version.
 * @param {string} raw
 * @returns {string | null}
 */
function cleanVersion(raw) {
  const version = raw.trim().replace(/\(.*$/, '').replace(/_.*$/, '');
  return isValidSemver(version) ? version : null;
}

// ── pnpm ────────────────────────────────────────────────────────────────

/**
 * Parse the block-mapping subset of YAML a pnpm lockfile uses into nested
 * objects. Sequences and flow collections are kept as raw strings; nothing
 * here needs them.
 * @param {string} text
 * @returns {Record<string, any>}
 */
function parseYamlMappings(text) {
  /** @type {Record<string, any>} */
  const rootObj = {};
  /** @type {Array<{indent: number, obj: Record<string, any>}>} */
  const stack = [{indent: -1, obj: rootObj}];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const indent = line.length - line.trimStart().length;
    const body = line.trim();
    if (body.startsWith('- ')) continue;
    const match =
      /^('(?:[^']|'')*'|"(?:[^"\\]|\\.)*"|[^:]+?):(?:\s+(.*))?$/.exec(body);
    if (!match) continue;
    const key = unquote(match[1]);
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    const parent = stack[stack.length - 1].obj;
    const value = match[2];
    if (value === undefined || value === '') {
      const child = {};
      parent[key] = child;
      stack.push({indent, obj: child});
    } else {
      parent[key] = unquote(value);
    }
  }
  return rootObj;
}

/** @param {string} value */
function unquote(value) {
  const v = value.trim();
  if (v.length >= 2 && v.startsWith("'") && v.endsWith("'")) {
    return v.slice(1, -1).replace(/''/g, "'");
  }
  if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) {
    return v.slice(1, -1).replace(/\\"/g, '"');
  }
  return v;
}

const DEPENDENCY_SECTIONS = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
];

/**
 * @param {string} text
 * @param {string} importer
 */
function pnpmLookup(text, importer) {
  const doc = parseYamlMappings(text);
  const scope =
    doc.importers && typeof doc.importers === 'object'
      ? doc.importers[importer]
      : importer === '.'
        ? doc
        : undefined;
  return (/** @type {string} */ name) => {
    if (scope == null || typeof scope !== 'object') return undefined;
    for (const section of DEPENDENCY_SECTIONS) {
      const entry = scope[section]?.[name];
      if (typeof entry === 'string') return entry;
      if (entry && typeof entry.version === 'string') return entry.version;
    }
    return undefined;
  };
}

// ── npm ─────────────────────────────────────────────────────────────────

/**
 * @param {string} text
 * @param {string} importer
 */
function npmLookup(text, importer) {
  const doc = JSON.parse(text);
  const prefix = importer === '.' ? '' : `${importer}/`;
  return (/** @type {string} */ name) => {
    const packages = doc.packages ?? {};
    return (
      packages[`${prefix}node_modules/${name}`]?.version ??
      packages[`node_modules/${name}`]?.version ??
      doc.dependencies?.[name]?.version
    );
  };
}

// ── yarn ────────────────────────────────────────────────────────────────

/** @param {string} text */
function yarnLookup(text) {
  /** @type {Map<string, Array<{range: string, version: string}>>} */
  const entries = new Map();
  /** @type {Array<{name: string, range: string}>} */
  let current = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      current = [];
      if (!line.endsWith(':')) continue;
      for (const raw of line.slice(0, -1).split(',')) {
        const descriptor = unquote(raw.trim());
        const at = descriptor.indexOf('@', 1);
        if (at <= 0) continue;
        current.push({
          name: descriptor.slice(0, at),
          range: descriptor.slice(at + 1),
        });
      }
      continue;
    }
    const version = /^\s+version:?\s+"?([^"\s]+)"?\s*$/.exec(line);
    if (version && current.length > 0) {
      for (const {name, range} of current) {
        const list = entries.get(name) ?? [];
        list.push({range, version: version[1]});
        entries.set(name, list);
      }
      current = [];
    }
  }
  return (/** @type {string} */ name, /** @type {string} */ spec) => {
    const list = entries.get(name);
    if (!list || list.length === 0) return undefined;
    const exact = list.find(
      entry => entry.range === spec || entry.range === `npm:${spec}`,
    );
    if (exact) return exact.version;
    const distinct = new Set(list.map(entry => entry.version));
    return distinct.size === 1 ? list[0].version : undefined;
  };
}

// ── bun ─────────────────────────────────────────────────────────────────

/** @param {string} text */
function bunLookup(text) {
  const doc = JSON.parse(text.replace(/,(\s*[}\]])/g, '$1'));
  return (/** @type {string} */ name) => {
    const entry = doc.packages?.[name];
    const id = Array.isArray(entry) ? entry[0] : undefined;
    if (typeof id !== 'string') return undefined;
    const at = id.indexOf('@', 1);
    return at > 0 ? id.slice(at + 1) : undefined;
  };
}
