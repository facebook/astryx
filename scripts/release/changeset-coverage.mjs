#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Changeset coverage: one classifier for pull requests and releases.
 *
 * A change to what a published package ships needs a Changeset naming that
 * package. Pull-request CI asks that question of the pull request's diff, and
 * the release coverage audit asks it of every commit in the cut range, through
 * the same `evaluateChange`. The two cannot disagree about what needed a
 * Changeset.
 *
 * Two rules:
 *
 *   1. Coverage. A changed path that ships in a stable package's tarball needs
 *      a Changeset, added or edited by the same change, that names that
 *      package. A path ships when the package is in the stable cut (not
 *      private, not canary-only, not ignored by Changesets) and the path is in
 *      its `files` list, is its root README, or is a consumer-facing
 *      package.json field. That covers package source, CLI behavior and
 *      output, and shipped documentation such as `packages/cli/assets/docs`
 *      and `*.doc.mjs`. Tests, fixtures, snapshots, stories, spec records,
 *      generated CHANGELOGs, files outside the tarball, and everything outside
 *      a stable package (the docsite app, Storybook, sandbox, CI, repository
 *      tooling) never reach a consumer and need none.
 *
 *   2. Released CLI JSON ids. A machine-readable id from the latest stable
 *      release — a response `type`, a field of a response type, a field of a
 *      golden JSON response, or a doctor check id — that is missing at head
 *      breaks a script reading it (spec:AST-017 FR3, FR13). A change that
 *      removes one, or that adds or edits a Changeset naming a missing
 *      response type or doctor check id, needs a `[breaking]` Changeset
 *      naming the id or a `Compatibility:` note naming it. Catalog
 *      values carried inside those responses (template slugs, docs routes,
 *      theme slugs) are mutable data (FR9, FR11, FR45) and are not compared.
 *
 * @input  git revisions: a pull request's base and head, or a release range
 * @output problems naming each package or id and the Changeset that resolves it
 * @position scripts/release — run by the lint workflow on every pull request
 *   and by the release coverage audit over the cut range
 */

import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {parseFrontmatter} from '../check-changesets.mjs';
import {parseWorkspaceGlobs} from '../lib/workspace-globs.mjs';
import {isStableReleasePackage} from './active-release.mjs';

const require = createRequire(import.meta.url);
const {parseEntry} = require('../changeset-entry-format.cjs');
const {
  isPackageReleasePath,
  parseNameStatus,
} = require('../../.github/scripts/change-scope.cjs');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const CLI_PACKAGE = '@astryxdesign/cli';
const CHANGESET_FILE = /^\.changeset\/(?!README\.md$)[^/]+\.md$/;

/**
 * package.json fields a consumer's install, import, or tooling reads. A change
 * to `version` is release bookkeeping, and scripts or devDependencies never
 * leave the repository, so neither needs a Changeset.
 */
export const CONSUMER_MANIFEST_FIELDS = Object.freeze([
  'name',
  'type',
  'main',
  'module',
  'types',
  'typings',
  'exports',
  'imports',
  'bin',
  'files',
  'sideEffects',
  'engines',
  'os',
  'cpu',
  'browser',
  'style',
  'dependencies',
  'peerDependencies',
  'peerDependenciesMeta',
  'optionalDependencies',
  'bundleDependencies',
  'bundledDependencies',
  'astryx',
]);

/** What each shipped surface is called in a failure, and its usual category. */
const SURFACES = Object.freeze({
  docs: {label: 'shipped documentation', categories: ['docs']},
  cli: {label: 'CLI behavior or output', categories: ['fix', 'feat']},
  source: {label: 'package source', categories: ['fix', 'feat']},
  manifest: {label: 'consumer-facing package.json', categories: ['fix']},
});

// ---------------------------------------------------------------------------
// Trees: the repository at one revision, from git or from memory (tests).
// ---------------------------------------------------------------------------

/**
 * @typedef {object} Tree
 * @property {string} label  revision or name, for messages
 * @property {(file: string) => string|null} read  file contents, or null when absent
 * @property {(dir: string) => string[]} list  every file under `dir`, repo-relative
 * @property {(files: string[]) => void} [prefetch]  read many files in one batch
 */

function git(root, args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

/**
 * The repository at `rev`, read through git and cached.
 *
 * @param {string} root
 * @param {string} rev
 * @returns {Tree}
 */
export function gitTree(root, rev) {
  const reads = new Map();
  const lists = new Map();
  return {
    label: rev,
    read(file) {
      if (!reads.has(file)) {
        let contents = null;
        try {
          contents = git(root, ['show', `${rev}:${file}`]);
        } catch {
          contents = null;
        }
        reads.set(file, contents);
      }
      return reads.get(file);
    },
    prefetch(files) {
      const wanted = files.filter(file => !reads.has(file));
      if (wanted.length === 0) return;
      const out = execFileSync('git', ['cat-file', '--batch'], {
        cwd: root,
        input: wanted.map(file => `${rev}:${file}`).join('\n') + '\n',
        maxBuffer: 256 * 1024 * 1024,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      let offset = 0;
      for (const file of wanted) {
        const newline = out.indexOf(10, offset);
        const header = out.toString('utf8', offset, newline);
        offset = newline + 1;
        const m = /^\S+ (\w+) (\d+)$/.exec(header);
        if (!m) {
          reads.set(file, null); // "<object> missing"
          continue;
        }
        const size = Number(m[2]);
        reads.set(file, m[1] === 'blob' ? out.toString('utf8', offset, offset + size) : null);
        offset += size + 1;
      }
    },
    list(dir) {
      if (!lists.has(dir)) {
        const out = git(root, ['ls-tree', '-r', '--name-only', rev, '--', dir]);
        lists.set(dir, out.split('\n').filter(Boolean));
      }
      return lists.get(dir);
    },
  };
}

/**
 * A tree held in memory: `{path: contents}`.
 *
 * @param {Record<string, string>} files
 * @param {string} [label]
 * @returns {Tree}
 */
export function memoryTree(files, label = 'memory') {
  return {
    label,
    read: file => (Object.hasOwn(files, file) ? files[file] : null),
    list: dir =>
      Object.keys(files)
        .filter(file => file.startsWith(`${dir.replace(/\/$/, '')}/`))
        .sort(),
  };
}

function readJson(tree, file) {
  const contents = tree.read(file);
  if (contents === null) return null;
  try {
    return JSON.parse(contents);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Rule 1: which changed paths ship, in which package.
// ---------------------------------------------------------------------------

function globToRegExp(glob) {
  const escaped = glob
    .split('*')
    .map(part => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('[^/]*');
  return new RegExp(`^${escaped}$`);
}

/**
 * Is `dir` a workspace package directory under these pnpm globs?
 *
 * @param {string} dir  repo-relative directory
 * @param {string[]} globs
 * @returns {boolean}
 */
export function isWorkspaceDir(dir, globs) {
  let matched = false;
  for (const glob of globs) {
    if (glob.startsWith('!')) {
      if (globToRegExp(glob.slice(1)).test(dir)) return false;
    } else if (!glob.includes('**') && globToRegExp(glob).test(dir)) {
      matched = true;
    }
  }
  return matched;
}

/**
 * The workspace package that owns `file` in `tree`: the nearest enclosing
 * workspace directory with a package.json.
 *
 * @param {Tree} tree
 * @param {string} file
 * @returns {{dir: string, manifest: object}|null}
 */
function owningPackage(tree, file) {
  const source = tree.read('pnpm-workspace.yaml');
  if (source === null) return null;
  const globs = parseWorkspaceGlobs(source);
  let dir = path.posix.dirname(file);
  while (dir && dir !== '.') {
    if (isWorkspaceDir(dir, globs)) {
      const manifest = readJson(tree, `${dir}/package.json`);
      return manifest ? {dir, manifest} : null;
    }
    dir = path.posix.dirname(dir);
  }
  return null;
}

/**
 * Is this package released to consumers through the stable cut? Reuses the
 * release branch's own definition and adds the Changesets ignore list, the
 * same set `check:changesets` accepts in frontmatter.
 *
 * @param {object} manifest
 * @param {{ignore?: string[]}} config  .changeset/config.json
 * @returns {boolean}
 */
export function isCoveredPackage(manifest, config) {
  return (
    isStableReleasePackage(manifest) &&
    !(config?.ignore || []).includes(manifest.name)
  );
}

/**
 * Does `rel` (relative to its package directory) land in the npm tarball?
 * npm always packs the manifest and the root README; everything else must be
 * listed in `files`. A package without `files` ships its whole directory, and
 * a `files` glob this matcher cannot evaluate is treated as shipping
 * (fail closed).
 *
 * @param {object} manifest
 * @param {string} rel
 * @returns {boolean}
 */
export function isPackedFile(manifest, rel) {
  if (rel === 'package.json') return true;
  if (!rel.includes('/') && /^readme(?:\.|$)/i.test(rel)) return true;
  if (!Array.isArray(manifest.files)) return true;
  return manifest.files.some(raw => {
    const entry = String(raw).replace(/^\.\//, '').replace(/\/+$/, '');
    if (/[*?[\]{}!]/.test(entry)) return true;
    return rel === entry || rel.startsWith(`${entry}/`);
  });
}

function surfaceOf(packageName, rel) {
  if (rel === 'package.json') return 'manifest';
  if (
    /(?:^|\/)readme(?:\.[^/]*)?$/i.test(rel) ||
    /\.mdx?$/.test(rel) ||
    /\.doc(?:\.[\w-]+)*\.mjs$/.test(rel) ||
    (packageName === CLI_PACKAGE && rel.startsWith('assets/docs/'))
  ) {
    return 'docs';
  }
  return packageName === CLI_PACKAGE ? 'cli' : 'source';
}

/**
 * Classify one changed path.
 *
 * @param {string} file  repo-relative path
 * @param {{tree: Tree, config: object}} at  the tree that holds the path's package
 * @returns {{ships: true, package: string, surface: string} | {ships: false, reason: string}}
 */
export function classifyPath(file, {tree, config}) {
  const owner = owningPackage(tree, file);
  if (!owner) return {ships: false, reason: 'outside every workspace package'};
  const {dir, manifest} = owner;
  if (!isCoveredPackage(manifest, config)) {
    return {
      ships: false,
      reason: `${manifest.name || dir} is private, canary-only, or not released`,
    };
  }
  const rel = file.slice(dir.length + 1);
  if (!isPackageReleasePath(file)) {
    return {ships: false, reason: 'test, fixture, snapshot, or spec record'};
  }
  if (/\.spec\.[cm]?[jt]sx?$/.test(rel)) {
    return {ships: false, reason: 'test, fixture, snapshot, or spec record'};
  }
  if (/(?:^|\/)[^/]+\.stories\.[^/]+$/.test(rel) || /(?:^|\/)stories\//.test(rel)) {
    return {ships: false, reason: 'story'};
  }
  if (/^changelog\.md$/i.test(rel)) {
    return {ships: false, reason: 'CHANGELOG generated by the release'};
  }
  if (!isPackedFile(manifest, rel)) {
    return {ships: false, reason: `not in the ${manifest.name} tarball`};
  }
  return {ships: true, package: manifest.name, surface: surfaceOf(manifest.name, rel)};
}

/**
 * The consumer-facing package.json fields that differ between two manifests.
 *
 * @param {object|null} before
 * @param {object|null} after
 * @returns {string[]}
 */
export function consumerManifestDelta(before, after) {
  return CONSUMER_MANIFEST_FIELDS.filter(
    field =>
      JSON.stringify(lockstepNeutral(before, field)) !==
      JSON.stringify(lockstepNeutral(after, field)),
  );
}

const DEPENDENCY_FIELDS = new Set([
  'dependencies',
  'peerDependencies',
  'optionalDependencies',
]);

/**
 * A field's value with fixed-group co-bumps neutralized. The release moves a
 * fixed group together, rewriting each member's pin on its siblings to the
 * package's own new version; that version-only co-bump needs no Changeset
 * (spec:AST-017 FR7). Any other range edit still counts.
 */
function lockstepNeutral(manifest, field) {
  const value = manifest?.[field] ?? null;
  if (!DEPENDENCY_FIELDS.has(field) || !value || typeof value !== 'object') {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value).map(([name, range]) => [
      name,
      range === manifest.version ? '<own version>' : range,
    ]),
  );
}

/**
 * Packages a set of Changesets names with a real bump.
 *
 * @param {Array<{file: string, text: string}>} changesets
 * @returns {Set<string>}
 */
function namedPackages(changesets) {
  const names = new Set();
  for (const {text} of changesets) {
    const fm = parseFrontmatter(text);
    if (!fm) continue;
    for (const [name, bump] of Object.entries(fm.releases)) {
      if (bump !== 'none') names.add(name);
    }
  }
  return names;
}

/**
 * Normalize changed-file records and read the Changesets the change adds or
 * edits, from the head tree.
 */
function changedChangesets(changes, head) {
  return changes
    .filter(change => change.status?.[0] !== 'D' && CHANGESET_FILE.test(change.filename))
    .map(change => ({file: change.filename, text: head.read(change.filename) ?? ''}));
}

/**
 * Rule 1 for one change (a pull request, or one commit of a release range).
 *
 * @param {object} input
 * @param {Array<{filename: string, previous_filename?: string|null, status?: string|null}>} input.changes
 * @param {Tree} input.base
 * @param {Tree} input.head
 * @returns {{required: Map<string, Map<string, string[]>>, covered: Set<string>, exempt: Array<{file: string, reason: string}>, problems: string[]}}
 */
export function checkCoverage({changes, base, head}) {
  const baseConfig = readJson(base, '.changeset/config.json') || {};
  const headConfig = readJson(head, '.changeset/config.json') || {};
  /** @type {Map<string, Map<string, string[]>>} package -> surface -> files */
  const required = new Map();
  const exempt = [];

  const need = (pkg, surface, file) => {
    if (!required.has(pkg)) required.set(pkg, new Map());
    const bySurface = required.get(pkg);
    if (!bySurface.has(surface)) bySurface.set(surface, []);
    bySurface.get(surface).push(file);
  };

  const paths = new Set();
  for (const change of changes) {
    paths.add(change.filename);
    if (change.previous_filename) paths.add(change.previous_filename);
  }

  // One batched read per tree for everything classification touches: the
  // workspace layout, every candidate package manifest, and the paths.
  const wanted = new Set(['pnpm-workspace.yaml', '.changeset/config.json']);
  for (const file of paths) {
    wanted.add(file);
    for (let dir = path.posix.dirname(file); dir && dir !== '.'; dir = path.posix.dirname(dir)) {
      wanted.add(`${dir}/package.json`);
    }
  }
  base.prefetch?.([...wanted]);
  head.prefetch?.([...wanted]);

  for (const file of [...paths].sort()) {
    // A path that still exists is judged by its package at head; a deleted
    // path by its package at base, so removing shipped files still counts.
    const at =
      head.read(file) !== null
        ? {tree: head, config: headConfig}
        : {tree: base, config: baseConfig};
    const result = classifyPath(file, at);
    if (!result.ships) {
      exempt.push({file, reason: result.reason});
      continue;
    }
    if (result.surface === 'manifest') {
      const fields = consumerManifestDelta(
        readJson(base, file),
        readJson(head, file),
      );
      if (fields.length === 0) {
        exempt.push({file, reason: 'no consumer-facing package.json field changed'});
        continue;
      }
      need(result.package, 'manifest', `${file} (${fields.join(', ')})`);
      continue;
    }
    need(result.package, result.surface, file);
  }

  const covered = namedPackages(changedChangesets(changes, head));
  const problems = [];
  for (const [pkg, bySurface] of [...required.entries()].sort()) {
    if (!covered.has(pkg)) problems.push(coverageProblem(pkg, bySurface));
  }
  return {required, covered, exempt, problems};
}

function coverageProblem(pkg, bySurface) {
  const lines = [];
  const categories = new Set();
  for (const [surface, files] of bySurface) {
    const shown = files.slice(0, 5).join(', ');
    const more = files.length > 5 ? `, and ${files.length - 5} more` : '';
    lines.push(`      ${SURFACES[surface].label}: ${shown}${more}`);
    for (const category of SURFACES[surface].categories) categories.add(category);
  }
  const docsOnly = bySurface.size === 1 && bySurface.has('docs');
  const category = docsOnly ? 'docs' : '<fix|feat>';
  return (
    `${pkg}: this change ships to consumers without a Changeset naming ${pkg}.\n` +
    `${lines.join('\n')}\n` +
    `      Add (or edit) a Changeset naming '${pkg}':\n` +
    `        pnpm changeset:new --packages ${pkg} --category ${category}\n` +
    (docsOnly
      ? `      [docs] fits a change to shipped documentation alone.`
      : `      Use [fix] for a correction or [feat] for a new capability ` +
        `(or [docs], [perf], [component], [experimental] when that is what changed).`)
  );
}

// ---------------------------------------------------------------------------
// Rule 2: released CLI JSON ids.
// ---------------------------------------------------------------------------

const RESPONSE_TYPES_DOC = 'packages/cli/foundation/response/response-types.doc.mjs';
const CLI_DIR = 'packages/cli';
const GOLDEN_DIR = 'packages/cli/test/__golden__';
const DOCTOR_DIR = 'packages/cli/api/doctor';

/**
 * Split a JSDoc `{type}` expression off the front of `text`.
 *
 * @returns {{type: string, rest: string}}  type without its outer braces
 */
function splitTypeExpression(text) {
  let i = 0;
  while (i < text.length && /\s/.test(text[i])) i++;
  if (text[i] !== '{') return {type: '', rest: text.slice(i)};
  const start = i;
  let depth = 0;
  for (; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) {
      i++;
      break;
    }
  }
  return {type: text.slice(start + 1, i - 1).trim(), rest: text.slice(i).trimStart()};
}

/** Split `text` on `separator` where no bracket is open. */
function splitTopLevel(text, separator) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const char of text) {
    if ('{[(<'.includes(char)) depth++;
    else if ('}])>'.includes(char)) depth--;
    if (char === separator && depth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/**
 * What a typedef's own type expression contributes: the typedefs it extends
 * (`Base & {extra: T}`, or a plain alias) and the keys of inline object parts.
 */
function typedefComposition(type) {
  const bases = [];
  const keys = [];
  for (const part of splitTopLevel(type, '&')) {
    if (/^[A-Za-z_$][\w$]*$/.test(part) && part !== 'object' && part !== 'Object') {
      bases.push(part);
    } else if (part.startsWith('{') && part.endsWith('}')) {
      for (const member of splitTopLevel(part.slice(1, -1), ',')) {
        const key = /^['"]?([A-Za-z_$][\w$]*)['"]?\??\s*:/.exec(member)?.[1];
        if (key) keys.push(key);
      }
    }
  }
  return {bases, keys};
}

/**
 * Every typedef in a `.type.mjs` source: its own `@property` names and what
 * its type expression composes.
 *
 * @param {string} source
 * @returns {Array<{name: string, fields: string[], bases: string[]}>}
 */
export function parseTypedefs(source) {
  const typedefs = [];
  for (const [, comment] of source.matchAll(/\/\*\*([\s\S]*?)\*\//g)) {
    const body = comment.replace(/^[ \t]*\*[ \t]?/gm, '');
    let current = null;
    for (const tag of body.split(/\n(?=\s*@)/)) {
      const m = /^\s*@(typedef|property|prop)\b([\s\S]*)$/.exec(tag);
      if (!m) continue;
      const {type, rest} = splitTypeExpression(m[2]);
      const name = /^\[?\s*([A-Za-z_$][\w$]*(?:(?:\[\])?\.[A-Za-z_$][\w$]*)*)/.exec(rest)?.[1];
      if (!name) continue;
      if (m[1] === 'typedef') {
        const {bases, keys} = typedefComposition(type);
        current = {name, fields: [...keys], bases};
        typedefs.push(current);
      } else if (current) {
        current.fields.push(name);
      }
    }
  }
  return typedefs;
}

/**
 * Every field of every typedef, as `Typedef.field`, with fields a typedef
 * gains by composing another typedef (`A & {extra: T}`) resolved, so moving a
 * field into a shared base is not a removal.
 *
 * @param {string[]} sources  every `.type.mjs` source
 * @returns {string[]}
 */
export function typedefFields(...sources) {
  const byName = new Map();
  for (const source of sources) {
    for (const typedef of parseTypedefs(source)) byName.set(typedef.name, typedef);
  }
  const resolved = new Map();
  const resolve = (name, seen = new Set()) => {
    if (resolved.has(name)) return resolved.get(name);
    const typedef = byName.get(name);
    if (!typedef || seen.has(name)) return [];
    seen.add(name);
    const fields = new Set(typedef.fields);
    for (const base of typedef.bases) {
      for (const field of resolve(base, seen)) fields.add(field);
    }
    const list = [...fields];
    resolved.set(name, list);
    return list;
  };
  const out = [];
  for (const name of byName.keys()) {
    for (const field of resolve(name)) out.push(`${name}.${field}`);
  }
  return out;
}

/**
 * Every object key path in a golden JSON response: `data[].topic`.
 *
 * @param {unknown} value
 * @returns {string[]}
 */
export function jsonKeyPaths(value) {
  const paths = new Set();
  (function walk(node, at) {
    if (Array.isArray(node)) {
      for (const item of node) walk(item, `${at}[]`);
    } else if (node && typeof node === 'object') {
      for (const [key, child] of Object.entries(node)) {
        const next = at ? `${at}.${key}` : key;
        paths.add(next);
        walk(child, next);
      }
    }
  })(value, '');
  return [...paths];
}

const lastSegment = dotted => dotted.split('.').pop().replace(/\[\]$/, '');

/**
 * The machine-readable ids of the CLI's JSON contract in `tree`.
 * Keyed by a stable string; each carries the token a Changeset names it by,
 * and whether that token is distinctive (an id) or an ordinary word (a field).
 *
 * @param {Tree} tree
 * @returns {Map<string, {label: string, token: string, distinctive: boolean}>}
 */
export function cliJsonIds(tree) {
  /** @type {Map<string, {label: string, token: string, distinctive: boolean}>} */
  const ids = new Map();

  const typeFiles = tree.list(CLI_DIR).filter(file => file.endsWith('.type.mjs'));
  const goldenFiles = tree.list(GOLDEN_DIR).filter(file => file.endsWith('.json'));
  const doctorFiles = tree.list(DOCTOR_DIR).filter(file => file.endsWith('.mjs'));
  tree.prefetch?.([RESPONSE_TYPES_DOC, ...typeFiles, ...goldenFiles, ...doctorFiles]);

  const responseTypes = tree.read(RESPONSE_TYPES_DOC);
  if (responseTypes !== null) {
    for (const [, value] of responseTypes.matchAll(/\bvalue:\s*'([^']+)'/g)) {
      ids.set(`response-type:${value}`, {
        label: `response type \`${value}\``,
        token: value,
        distinctive: true,
      });
    }
  }

  const sourceFile = file =>
    !file.includes('/node_modules/') &&
    !/\.(?:test|spec)\.[^/]+$/.test(file) &&
    isPackageReleasePath(file);

  const typeSources = typeFiles.filter(sourceFile).map(file => tree.read(file) ?? '');
  for (const field of typedefFields(...typeSources)) {
    ids.set(`field:${field}`, {
      label: `response field \`${field}\``,
      token: lastSegment(field),
      distinctive: false,
    });
  }

  for (const file of goldenFiles) {
    let golden;
    try {
      golden = JSON.parse(tree.read(file) ?? '');
    } catch {
      continue;
    }
    const name = path.posix.basename(file);
    for (const keyPath of jsonKeyPaths(golden)) {
      ids.set(`golden:${name}:${keyPath}`, {
        label: `field \`${keyPath}\` of the ${name} golden response`,
        token: lastSegment(keyPath),
        distinctive: false,
      });
    }
  }

  for (const file of doctorFiles) {
    if (/\.(?:doc|type)\.mjs$/.test(file) || !sourceFile(file)) {
      continue;
    }
    for (const [, , id] of (tree.read(file) ?? '').matchAll(
      /\bid:\s*(['"])([a-z0-9][a-z0-9-]*)\1/g,
    )) {
      ids.set(`doctor-check:${id}`, {
        label: `doctor check id \`${id}\``,
        token: id,
        distinctive: true,
      });
    }
  }

  return ids;
}

const names = (text, token) => text.includes(`\`${token}\``);

/**
 * Does this Changeset text carry a compatibility note naming `token`? A note
 * is a paragraph that begins `Compatibility:`.
 */
function compatibilityNoteNames(text, token) {
  return text
    .split(/\n\s*\n/)
    .some(paragraph => /^\s*Compatibility:/i.test(paragraph) && names(paragraph, token));
}

/**
 * Pending Changesets in `tree`, parsed.
 *
 * @param {Tree} tree
 * @returns {Array<{file: string, text: string, category: string|null, releases: Record<string, string>}>}
 */
export function pendingChangesets(tree) {
  const files = tree.list('.changeset').filter(file => CHANGESET_FILE.test(file));
  tree.prefetch?.(files);
  return files
    .map(file => {
      const text = tree.read(file) ?? '';
      const fm = parseFrontmatter(text);
      return {
        file,
        text,
        category: fm ? parseEntry(fm.summary).category : null,
        releases: fm ? fm.releases : {},
      };
    });
}

/**
 * Rule 2. `released` is the latest stable release's ids, `head` the change's
 * ids. With `base` (a pull request), only ids this change removes, or that a
 * Changeset it adds or edits describes, are its to classify; without `base`
 * (a release), every released id missing at head must be classified.
 *
 * @param {object} input
 * @param {Map<string, {label: string, token: string, distinctive: boolean}>} input.released
 * @param {string} input.releasedLabel
 * @param {Map<string, {label: string, token: string, distinctive: boolean}>|null} input.base
 * @param {Map<string, {label: string, token: string, distinctive: boolean}>} input.head
 * @param {Array<{file: string, text: string}>} input.describedBy  Changesets this change adds or edits
 * @param {ReturnType<typeof pendingChangesets>} input.pending  every Changeset at head
 * @returns {{missing: string[], attributed: string[], problems: string[]}}
 */
export function checkReleasedIds({released, releasedLabel, base, head, describedBy, pending}) {
  const missing = [...released.keys()].filter(key => !head.has(key)).sort();
  const attributed = missing.filter(key => {
    if (!base) return true;
    // A response type or doctor check id is distinctive enough that a
    // Changeset naming it is describing it; a field name such as `content`
    // is an ordinary word, so a field is this change's only when it removes it.
    const {token, distinctive} = released.get(key);
    return (
      base.has(key) ||
      (distinctive && describedBy.some(({text}) => names(text, token)))
    );
  });

  const cliChangesets = pending.filter(
    entry => entry.releases[CLI_PACKAGE] && entry.releases[CLI_PACKAGE] !== 'none',
  );
  const problems = [];
  for (const key of attributed) {
    const {label, token} = released.get(key);
    const classified = cliChangesets.some(
      entry =>
        (entry.category === 'breaking' && names(entry.text, token)) ||
        compatibilityNoteNames(entry.text, token),
    );
    if (classified) continue;
    problems.push(
      `${CLI_PACKAGE}: ${label} is in the released ${releasedLabel} JSON contract and is missing at this head.\n` +
        `      Scripts read released JSON ids, so removing or renaming one is incompatible\n` +
        `      (spec:AST-017 FR3, FR13). Restore \`${token}\`, or classify the removal in a\n` +
        `      Changeset naming '${CLI_PACKAGE}':\n` +
        `        - a [breaking] Changeset whose text names \`${token}\` (admitted only once a minor\n` +
        `          is scheduled; see check:changesets), or\n` +
        `        - a paragraph beginning "Compatibility:" that names \`${token}\` and says why a\n` +
        `          consumer of ${releasedLabel} keeps working.`,
    );
  }
  return {missing, attributed, problems};
}

// ---------------------------------------------------------------------------
// One change, both rules — shared by pull-request and release modes.
// ---------------------------------------------------------------------------

/**
 * @param {object} input
 * @param {ReturnType<typeof parseNameStatus>} input.changes
 * @param {Tree} input.base
 * @param {Tree} input.head
 * @param {Tree|null} input.released  latest stable release, or null to skip rule 2
 * @param {boolean} [input.attributeToChange]  false at release time: every missing id counts
 */
export function evaluateChange({changes, base, head, released, attributeToChange = true}) {
  const coverage = checkCoverage({changes, base, head});
  let ids = {missing: [], attributed: [], problems: []};
  if (released) {
    ids = checkReleasedIds({
      released: cliJsonIds(released),
      releasedLabel: released.label,
      base: attributeToChange ? cliJsonIds(base) : null,
      head: cliJsonIds(head),
      describedBy: changedChangesets(changes, head),
      pending: pendingChangesets(head),
    });
  }
  return {coverage, ids, problems: [...coverage.problems, ...ids.problems]};
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

/**
 * The newest stable `vX.Y.Z` tag — the release the audit compares against.
 *
 * @param {string} root
 * @returns {string|null}
 */
export function newestStableTag(root) {
  const tags = git(root, ['tag', '--list', 'v*']).split('\n').filter(Boolean);
  const stable = tags
    .map(tag => ({tag, m: /^v(\d+)\.(\d+)\.(\d+)$/.exec(tag)}))
    .filter(({m}) => m)
    .sort((a, b) => {
      for (let i = 1; i <= 3; i++) {
        const d = Number(b.m[i]) - Number(a.m[i]);
        if (d) return d;
      }
      return 0;
    });
  return stable[0]?.tag ?? null;
}

function diffChanges(root, from, to) {
  return parseNameStatus(git(root, ['diff', '--name-status', '-M', from, to]));
}

function parseArgs(argv) {
  const [mode, ...rest] = argv;
  const flags = {};
  for (let i = 0; i < rest.length; i++) {
    const m = /^--([\w-]+)(?:=(.*))?$/.exec(rest[i]);
    if (!m) throw new Error(`unexpected argument: ${rest[i]}`);
    flags[m[1]] = m[2] ?? (rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[++i] : true);
  }
  return {mode, flags};
}

function report(title, results, {explain}) {
  const problems = results.flatMap(r => r.problems);
  if (explain) {
    for (const {label, result} of results.map(r => ({label: r.label, result: r.result}))) {
      console.log(`\n${label}`);
      for (const [pkg, bySurface] of result.coverage.required) {
        for (const [surface, files] of bySurface) {
          for (const file of files) console.log(`  ships  ${pkg} (${surface}): ${file}`);
        }
      }
      for (const {file, reason} of result.coverage.exempt) {
        console.log(`  exempt ${file} — ${reason}`);
      }
    }
  }
  if (problems.length) {
    console.error(`\n✗ ${title} found ${problems.length} problem(s):\n`);
    for (const r of results) {
      for (const p of r.problems) console.error(`  - ${r.prefix}${p}`);
    }
    console.error(
      '\nSee "Adding a Changeset" in CONTRIBUTING.md and the Release Process wiki.\n',
    );
    return 1;
  }
  return 0;
}

function main(argv) {
  const {mode, flags} = parseArgs(argv);
  const root = typeof flags.root === 'string' ? path.resolve(flags.root) : ROOT;
  const releasedRef =
    typeof flags.released === 'string' ? flags.released : newestStableTag(root);
  if (!releasedRef) {
    console.error(
      'No vX.Y.Z release tag is available to compare CLI JSON ids against. ' +
        "Fetch release tags (git fetch origin 'refs/tags/v*:refs/tags/v*') or pass --released <ref>.",
    );
    return 2;
  }
  const released = gitTree(root, releasedRef);
  if (released.read('package.json') === null) {
    console.error(`Release ref ${releasedRef} is not available locally; fetch it first.`);
    return 2;
  }
  const explain = flags.explain === true;

  if (mode === 'pr') {
    if (typeof flags.base !== 'string') throw new Error('pr mode needs --base <ref>');
    const headRef = typeof flags.head === 'string' ? flags.head : 'HEAD';
    const mergeBase = git(root, ['merge-base', flags.base, headRef]).trim();
    const result = evaluateChange({
      changes: diffChanges(root, mergeBase, headRef),
      base: gitTree(root, mergeBase),
      head: gitTree(root, headRef),
      released,
    });
    const code = report(
      'changeset coverage',
      [{label: `${mergeBase.slice(0, 12)}...${headRef}`, prefix: '', result, problems: result.problems}],
      {explain},
    );
    if (code === 0) {
      const pkgs = [...result.coverage.required.keys()];
      console.log(
        `✓ changeset coverage — ${pkgs.length ? `ships to ${pkgs.join(', ')}, each named by a Changeset` : 'nothing here ships to consumers'}; ` +
          `released CLI JSON ids checked against ${releasedRef}`,
      );
    }
    return code;
  }

  if (mode === 'release') {
    const since = typeof flags.since === 'string' ? flags.since : releasedRef;
    const until = typeof flags.until === 'string' ? flags.until : 'origin/main';
    const commits = git(root, ['rev-list', '--reverse', '--no-merges', `${since}..${until}`])
      .split('\n')
      .filter(Boolean);
    const results = [];
    for (const sha of commits) {
      const subject = git(root, ['log', '-1', '--format=%s', sha]).trim();
      const parent = `${sha}^`;
      const result = evaluateChange({
        changes: diffChanges(root, parent, sha),
        base: gitTree(root, parent),
        head: gitTree(root, sha),
        released: null,
      });
      results.push({
        label: `${sha.slice(0, 10)} ${subject}`,
        prefix: `${sha.slice(0, 10)} ${subject}\n    `,
        result,
        problems: result.problems,
      });
    }
    // Released ids are judged once, at the end of the range, against every
    // pending Changeset: the release ships whatever the range left missing.
    const ids = evaluateChange({
      changes: [],
      base: gitTree(root, until),
      head: gitTree(root, until),
      released,
      attributeToChange: false,
    });
    results.push({label: `${until} JSON ids`, prefix: '', result: ids, problems: ids.problems});
    console.log(`range:   ${since}..${until} (${commits.length} commits)`);
    console.log(`release: CLI JSON ids compared against ${releasedRef}`);
    const code = report('release changeset coverage', results, {explain});
    if (code === 0) console.log('✓ every shipped change in the range names its package');
    return code;
  }

  console.error(
    'usage:\n' +
      '  changeset-coverage.mjs pr --base <ref> [--head <ref>] [--released <ref>] [--explain]\n' +
      '  changeset-coverage.mjs release [--since <tag>] [--until <ref>] [--released <ref>] [--explain]',
  );
  return 2;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
