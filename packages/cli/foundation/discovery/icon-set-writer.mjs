// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Icon-set authoring (AST-084): find the icon set being authored, read
 * a source module's exports statically, and rewrite the set's data file.
 *
 * Shared by `astryx experimental icon map`, `astryx experimental icon add`, and the icon-set kinds of
 * `astryx integration add`. Nothing here executes package code: exports are
 * read with the static module reader. A rewritten data file is checked the
 * way discovery checks it (the data parser, then every `map` key against
 * Astryx's definitions and the set's own) before it replaces the old one, and
 * it is written in one fixed shape, so the same edits give the same bytes.
 *
 * Errors carry a `code` (an ERR_* code) and `suggestions`, which the api
 * leaves turn into typed CLI errors.
 *
 * @input The directory the command runs in, and a set name when the package
 *   ships more than one
 * @output The set, its source module's icons, and data-file writes
 * @position packages/cli/foundation/discovery — read by api/icon and
 *   api/integration
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {randomUUID} from 'node:crypto';
import {parse} from '@babel/parser';
import {parseIconSetData} from '../../authoring/doctypes/icon-set/parse.mjs';
import {ICON_NAMES} from '../../authoring/doctypes/icon-set/icon-names.mjs';
import {assertWithin} from '../fs/path-safety.mjs';
import {findLocalIntegrationManifestOrNull} from '../integrations/manifest-writer.mjs';
import {loadManifestObject} from '../integrations/integrations.mjs';
import {levenshteinDistance} from '../text/string-utils.mjs';
import {astryxDefinitionsByName} from './icon-definition-discovery.mjs';
import {
  discoverIconSetDirectory,
  resolveIconModule,
} from './icon-set-discovery.mjs';
import {
  exportScalarType,
  exportValueKind,
  followedExportNames,
  moduleExportOrigin,
} from './module-exports.mjs';

/** @typedef {import('./icon-set-discovery.mjs').DiscoveredIconSet} DiscoveredIconSet */
/** @typedef {import('../../authoring/doctypes/icon-set/type').IconSetData} IconSetData */

/**
 * An authoring error with an ERR_* code and suggestions.
 */
export class IconSetAuthoringError extends Error {
  /**
   * @param {string} message
   * @param {string} code
   * @param {Array<{name: string, reason: string}>} [suggestions]
   */
  constructor(message, code, suggestions = []) {
    super(message);
    this.code = code;
    this.suggestions = suggestions;
  }
}

/**
 * `XMarkIcon` → `x-mark`; `Trash2` → `trash-2`; `ArrowUpDown` →
 * `arrow-up-down`: an icon id from an export name.
 * @param {string} name
 */
export function iconIdOf(name) {
  return name
    .replace(/Icon$/u, '')
    .replace(/([a-z])([A-Z0-9])/gu, '$1-$2')
    .replace(/([0-9])([A-Z])/gu, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/gu, '$1-$2')
    .toLowerCase();
}

/**
 * The name an icon set exports an icon as: PascalCase ending in `Icon`
 * (`Trash2` → `Trash2Icon`; `TrashIcon` stays).
 * @param {string} name
 */
export function iconExportName(name) {
  const pascal = name[0].toUpperCase() + name.slice(1);
  return pascal.endsWith('Icon') ? pascal : `${pascal}Icon`;
}

/**
 * The name an icon set exports a variant as: the icon's name, then the
 * variant's name, then `Icon` (`TrashIcon` solid → `TrashSolidIcon`).
 * @param {string} iconName the icon's own export
 * @param {string} variant one of the set's declared variants
 */
export function variantExportName(iconName, variant) {
  const base = iconName.replace(/Icon$/u, '');
  const name = variant
    .split('-')
    .map(part => (part ? part[0].toUpperCase() + part.slice(1) : ''))
    .join('');
  return `${base}${name}Icon`;
}

/**
 * The nearest directory at or above `cwd` with a package.json.
 * @param {string} cwd
 */
function packageDirOf(cwd) {
  let dir = path.resolve(cwd);
  for (let depth = 0; depth < 50; depth++) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new IconSetAuthoringError(
    'No package.json found. Run this command inside the icon-set package.',
    'ERR_FILE_NOT_FOUND',
  );
}

/**
 * The icon-set package the command runs in, and the set it edits: the one
 * `selector` names, else the only set.
 * @param {string} cwd
 * @param {string} [selector] a set name
 * @returns {Promise<{packageDir: string, pkg: Record<string, any>, root: string, set: DiscoveredIconSet, sets: DiscoveredIconSet[]}>}
 */
export async function findLocalIconSet(cwd, selector) {
  const packageDir = packageDirOf(cwd);
  /** @type {Record<string, any>} */
  let pkg;
  try {
    pkg = JSON.parse(
      fs.readFileSync(path.join(packageDir, 'package.json'), 'utf-8'),
    );
  } catch (error) {
    throw new IconSetAuthoringError(
      `Cannot read package.json: ${error instanceof Error ? error.message : String(error)}`,
      'ERR_INVALID_ARGUMENT',
    );
  }
  const manifestFile = findLocalIntegrationManifestOrNull(packageDir);
  const manifest = manifestFile
    ? await loadManifestObject(manifestFile, 'Integration manifest', {
        fresh: true,
      })
    : {};
  const declared = manifest.experimental?.iconSets;
  if (!declared) {
    throw new IconSetAuthoringError(
      'This package ships no icon set. Add one first.',
      'ERR_NOT_FOUND',
      [
        {
          name: 'astryx experimental icon new-set <name>',
          reason: 'add an icon set',
        },
      ],
    );
  }
  const root = assertWithin(declared, packageDir, {
    label: 'experimental.iconSets root',
  });
  const owner = typeof pkg.name === 'string' ? pkg.name : '(local integration)';
  const found = discoverIconSetDirectory(root, owner);
  const named = selector
    ? found.sets.filter(set => set.name === selector)
    : found.sets;
  if (named.length === 1) {
    return {
      packageDir,
      pkg,
      root,
      set: {...named[0], packageDir},
      sets: found.sets,
    };
  }
  const broken = selector
    ? found.errors.find(error => error.name === selector)
    : null;
  if (broken) {
    throw new IconSetAuthoringError(broken.message, 'ERR_INVALID_ARGUMENT');
  }
  const names = found.sets.map(set => set.name);
  if (named.length === 0 && selector) {
    throw new IconSetAuthoringError(
      `This package has no icon set "${selector}".`,
      'ERR_NOT_FOUND',
      names.map(name => ({name, reason: 'an icon set in this package'})),
    );
  }
  throw new IconSetAuthoringError(
    names.length === 0
      ? `This package has no valid icon set${found.errors.length > 0 ? `: ${found.errors[0].message}` : '.'}`
      : `This package has ${names.length} icon sets; name one with --set.`,
    names.length === 0 ? 'ERR_NOT_FOUND' : 'ERR_INVALID_ARGUMENT',
    names.map(name => ({
      name: `--set ${name}`,
      reason: 'an icon set in this package',
    })),
  );
}

/** The data file's fields, in the order the file is written. */
const DATA_KEYS = [
  'schemaVersion',
  'module',
  'source',
  'generated',
  'adapter',
  'variants',
  'default',
  'themeMap',
  'map',
  'icons',
];

/**
 * A data file's text, in one fixed shape: fields in schema order, `map` keys
 * sorted, two-space JSON, a final newline.
 * @param {IconSetData} data
 */
export function iconSetDataText(data) {
  /** @type {Record<string, unknown>} */
  const ordered = {};
  for (const key of DATA_KEYS) {
    const value = /** @type {Record<string, unknown>} */ (
      /** @type {unknown} */ (data)
    )[key];
    if (value === undefined) continue;
    ordered[key] =
      key === 'map'
        ? Object.fromEntries(
            Object.entries(/** @type {Record<string, string>} */ (value)).sort(
              ([a], [b]) => (a < b ? -1 : a > b ? 1 : 0),
            ),
          )
        : value;
  }
  for (const [key, value] of Object.entries(data)) {
    if (!DATA_KEYS.includes(key)) ordered[key] = value;
  }
  return `${JSON.stringify(ordered, null, 2)}\n`;
}

/**
 * The icon definitions a set may map: Astryx's and its own, by name.
 * @param {DiscoveredIconSet} set
 * @param {string[]} [extra] definition names about to be added
 */
export function mappableDefinitions(set, extra = []) {
  return new Set([
    ...astryxDefinitionsByName().keys(),
    ...set.definitions.map(each => each.doc.name),
    ...extra,
  ]);
}

/**
 * Check a set's next data the way discovery will, then write it in place.
 * Returns a function that puts the old file back.
 * @param {DiscoveredIconSet} set
 * @param {IconSetData} next
 * @param {{extraDefinitions?: string[]}} [options] definitions written in
 *   the same command, which count as declared
 * @returns {() => void}
 */
export function writeIconSetData(set, next, {extraDefinitions = []} = {}) {
  const label = `Icon set "${set.name}"`;
  let parsed;
  try {
    parsed = parseIconSetData(next, `${label} data file`);
  } catch (error) {
    throw new IconSetAuthoringError(
      error instanceof Error ? error.message : String(error),
      'ERR_INVALID_ARGUMENT',
    );
  }
  const known = mappableDefinitions(set, extraDefinitions);
  for (const name of Object.keys(parsed.map ?? {})) {
    if (!known.has(name)) {
      throw new IconSetAuthoringError(
        `"${name}" is not an icon definition. Use an Astryx icon definition (astryx docs cli/experimental/icon-definitions), or add your own.`,
        'ERR_INVALID_ARGUMENT',
        [
          ...closestNames(name, [...known]).map(each => ({
            name: each,
            reason: 'a known icon definition',
          })),
          {
            name: `astryx experimental icon new-definition ${name} --set ${set.name}`,
            reason: 'add it as your own definition',
          },
        ],
      );
    }
  }
  const text = iconSetDataText(next);
  const before = fs.readFileSync(set.dataPath);
  replaceText(set.dataPath, text);
  return () => {
    if (fs.readFileSync(set.dataPath, 'utf-8') === text) {
      replaceText(set.dataPath, before.toString('utf-8'));
    }
  };
}

/**
 * Replace a file's text atomically.
 * @param {string} file
 * @param {string} text
 */
function replaceText(file, text) {
  const temporary = path.join(
    path.dirname(file),
    `.${path.basename(file)}.tmp-${randomUUID()}`,
  );
  try {
    fs.writeFileSync(temporary, text, 'utf-8');
    fs.renameSync(temporary, file);
  } catch (error) {
    fs.rmSync(temporary, {force: true});
    throw new IconSetAuthoringError(
      `Could not write ${path.basename(file)}: ${error instanceof Error ? error.message : String(error)}`,
      'ERR_WRITE_FAILED',
    );
  }
}

/**
 * The names closest to one that matched nothing.
 * @param {string} wanted
 * @param {string[]} candidates
 * @param {number} [max]
 */
export function closestNames(wanted, candidates, max = 5) {
  const lower = wanted.toLowerCase();
  return [...new Set(candidates)]
    .map(name => ({
      name,
      distance: levenshteinDistance(lower, name.toLowerCase()),
    }))
    .filter(each => each.distance <= Math.max(2, Math.ceil(lower.length / 3)))
    .sort((a, b) => a.distance - b.distance || (a.name < b.name ? -1 : 1))
    .slice(0, max)
    .map(each => each.name);
}

/**
 * A source module an icon is read from: the file it resolves to, and the
 * specifier to import it by. A package or a package subpath resolves from the
 * set's package (its `exports` map honored) and is imported by that
 * specifier. A relative path inside the set's package is imported by its
 * path (`module` is then the path from the package root).
 * @param {string} from
 * @param {{packageDir: string, pkg: Record<string, any>}} where
 * @returns {{file: string, module: string}}
 */
export function resolveIconSource(from, {packageDir, pkg}) {
  const name = typeof pkg.name === 'string' ? pkg.name : '';
  if (from.startsWith('.') || path.isAbsolute(from)) {
    const target = assertWithin(from, packageDir, {
      label: 'icon source',
      allowAbsolute: true,
    });
    const file = resolveFile(target);
    if (!file) {
      throw new IconSetAuthoringError(
        `"${from}" does not resolve to a module file in this package.`,
        'ERR_FILE_NOT_FOUND',
      );
    }
    return {
      file,
      module: `./${path.relative(packageDir, file).split(path.sep).join('/')}`,
    };
  }
  const file = resolveIconModule(from, packageDir, {name, dir: packageDir});
  if (!file) {
    throw new IconSetAuthoringError(
      `"${from}" does not resolve from ${name || 'this package'}. Install it as a dependency, or check the specifier.`,
      'ERR_NOT_FOUND',
    );
  }
  return {file, module: from};
}

/** @param {string} base */
function resolveFile(base) {
  const extensions = ['', '.mjs', '.js', '.cjs', '.ts', '.tsx', '.jsx', '.mts'];
  for (const candidate of [
    ...extensions.map(extension => `${base}${extension}`),
    ...extensions
      .slice(1)
      .map(extension => path.join(base, `index${extension}`)),
  ]) {
    try {
      if (fs.statSync(candidate).isFile()) return candidate;
    } catch {
      // Try the next candidate.
    }
  }
  return null;
}

/**
 * Prove a source module has one export, without running it. `default` reads
 * the module's default export.
 * @param {string} file
 * @param {string} module the specifier, for messages
 * @param {string} exportName
 */
export function assertIconExport(file, module, exportName) {
  if (!moduleExportOrigin(file, exportName)) {
    const names = followedExportNames(file);
    throw new IconSetAuthoringError(
      exportName === 'default'
        ? `"${module}" has no default export.`
        : `"${module}" does not export "${exportName}".`,
      'ERR_NOT_FOUND',
      closestNames(exportName, names).map(name => ({
        name,
        reason: `an export of ${module}`,
      })),
    );
  }
}

/** A SCREAMING_CASE name: two or more capitals, digits, or underscores. */
const SCREAMING_CASE_RE = /^[A-Z][A-Z0-9_]+$/u;

/**
 * The library exports that can be icons: PascalCase components and, when the
 * set declares an adapter, also data exports, camelCase included: objects,
 * and plain strings only in a library whose candidates are all strings.
 * Left out: `default`, `Icon`, SCREAMING_CASE constants, number and boolean
 * exports, and `exclude`.
 * @param {string} file
 * @param {{adapter?: boolean, exclude?: string[]}} [options] `exclude`: export
 *   names that are not icons
 * @returns {Array<{name: string, adapt: boolean, scalar: string | null}>}
 */
function iconCandidates(file, {adapter = false, exclude = []} = {}) {
  const skipped = new Set(exclude);
  /** @type {Array<{name: string, adapt: boolean, scalar: string | null}>} */
  const out = [];
  for (const name of followedExportNames(file)) {
    if (name === 'default' || name === 'Icon' || skipped.has(name)) continue;
    // SCREAMING_CASE names are constants (`README`, `VERSION`), not icons.
    if (SCREAMING_CASE_RE.test(name)) continue;
    const kind = exportValueKind(file, name);
    if (kind === 'component' && /^[A-Z][A-Za-z0-9]*$/u.test(name)) {
      out.push({name, adapt: false, scalar: null});
    } else if (
      adapter &&
      kind === 'data' &&
      /^[A-Za-z][A-Za-z0-9]*$/u.test(name)
    ) {
      const scalar = exportScalarType(file, name);
      // A number or a boolean draws nothing; a string may be SVG markup.
      if (scalar === 'number' || scalar === 'boolean') continue;
      out.push({name, adapt: true, scalar});
    }
  }
  // A plain string is an icon only in a library of strings (SVG markup); next
  // to components or icon objects it is a stray constant.
  return out.some(each => each.scalar == null)
    ? out.filter(each => each.scalar == null)
    : out;
}

/**
 * The names the library prefix is computed over: the icon-like candidates
 * (stray constants are already left out by {@link iconCandidates}).
 * @param {Array<{name: string, scalar: string | null}>} candidates
 * @returns {string[]}
 */
function prefixNames(candidates) {
  return candidates.map(each => each.name);
}

/**
 * The leading words every icon export of a library shares, such as
 * `feather` in `featherEye` and `featherSun`: a library prefix that ids and
 * the set's export names leave out. Empty when fewer than two exports share
 * one, or when it would leave an export with no name.
 * @param {string[]} names
 * @returns {string[]}
 */
export function libraryPrefix(names) {
  if (names.length < 2) return [];
  const split = names.map(name => iconIdOf(name).split('-'));
  /** @type {string[]} */
  const prefix = [];
  for (let index = 0; ; index++) {
    const word = split[0][index];
    if (
      word == null ||
      !split.every(words => words[index] === word && words.length > index + 1)
    ) {
      break;
    }
    prefix.push(word);
  }
  return prefix;
}

/**
 * An export's id and the name the set exports it as, with the library prefix
 * left out: `featherEye` with prefix `feather` is id `eye`, `EyeIcon`.
 * @param {string} name
 * @param {string[]} prefix
 * @returns {{id: string, name: string}}
 */
export function iconNaming(name, prefix) {
  const all = iconIdOf(name).split('-');
  // Only a name that starts with the prefix, and has more after it, loses it.
  const strip =
    all.length > prefix.length &&
    prefix.every((word, index) => all[index] === word);
  if (!strip) prefix = [];
  const words = all.slice(prefix.length);
  const id = words.join('-');
  const pascal = words
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join('');
  return {
    id,
    name: prefix.length > 0 ? iconExportName(pascal) : iconExportName(name),
  };
}

/**
 * The library prefix of the module an icon is read from
 * ({@link libraryPrefix} over its icon exports).
 * @param {string} file
 * @param {{adapter?: boolean, exclude?: string[]}} [options]
 */
export function modulePrefix(file, options) {
  return libraryPrefix(prefixNames(iconCandidates(file, options)));
}

/**
 * Every icon a whole library exports, for wrapping it at once: one entry per
 * component (and, with an adapter, per data export), read by its `…Icon`
 * export when it has one (an alias of the same value is recorded once), with
 * its id and the name the set exports it as from the name, the library
 * prefix left out ({@link libraryPrefix}).
 * @param {string} file
 * @param {{adapter?: boolean, exclude?: string[]}} [options] `adapter`:
 *   whether the set declares one; `exclude`: export names that are not icons
 * @returns {Array<{export: string, id: string, name: string, adapt: boolean}>}
 */
export function libraryIcons(file, options = {}) {
  const candidates = iconCandidates(file, options);
  /** @type {Map<string, {names: string[], adapt: boolean, scalar: string | null}>} */
  const byOrigin = new Map();
  for (const {name, adapt, scalar} of candidates) {
    const origin = moduleExportOrigin(file, name);
    if (!origin) continue;
    const key = `${origin.file}\0${origin.name}`;
    const entry = byOrigin.get(key) ?? {names: [], adapt, scalar};
    entry.names.push(name);
    byOrigin.set(key, entry);
  }
  /** @type {Array<[string, string, boolean, string | null]>} */
  const chosen = [];
  for (const [key, {names, adapt, scalar}] of byOrigin) {
    const local = key.split('\0')[1];
    const withIcon = names.filter(name => name.endsWith('Icon'));
    const preferred =
      withIcon.find(name => name === `${local}Icon`) ??
      names.find(name => name === local) ??
      [...(withIcon.length > 0 ? withIcon : names)].sort(
        (a, b) => a.length - b.length || (a < b ? -1 : 1),
      )[0];
    chosen.push([key, preferred, adapt, scalar]);
  }
  const prefix = libraryPrefix(
    prefixNames(chosen.map(([, name, , scalar]) => ({name, scalar}))),
  );
  /** @type {Map<string, {export: string, id: string, name: string, adapt: boolean}>} */
  const byId = new Map();
  for (const [, preferred, adapt] of chosen) {
    const naming = iconNaming(preferred, prefix);
    if (!naming.id || byId.has(naming.id)) continue;
    byId.set(naming.id, {export: preferred, ...naming, adapt});
  }
  return [...byId.values()].sort((a, b) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
  );
}

/** @param {string} value a single-quoted JavaScript string literal */
function quote(value) {
  return `'${value.replace(/\\/gu, '\\\\').replace(/'/gu, "\\'").replace(/\n/gu, '\\n')}'`;
}

/**
 * The source of one icon definition file, typed IconDefinitionDoc.
 * @param {{name: string, description: string, words: string[]}} doc
 */
export function iconDefinitionSource(doc) {
  return [
    "/** @type {import('@astryxdesign/cli/authoring').IconDefinitionDoc} */",
    'export default {',
    "  type: 'icon-definition',",
    `  name: ${quote(doc.name)},`,
    `  description: ${quote(doc.description)},`,
    `  words: [${doc.words.map(quote).join(', ')}],`,
    '};',
    '',
  ].join('\n');
}

/**
 * Check a new icon definition for a set: a camelCase name no Astryx
 * definition has, a description, and at least one lower-case word.
 * @param {DiscoveredIconSet} set
 * @param {{name: string, description?: string, words?: string[]}} doc
 * @returns {{name: string, description: string, words: string[]}}
 */
export function checkNewDefinition(set, doc) {
  if (!/^[a-z][a-zA-Z0-9]*$/u.test(doc.name)) {
    throw new IconSetAuthoringError(
      `Invalid icon definition name "${doc.name}": use camelCase starting with a lower-case letter.`,
      'ERR_INVALID_ARGUMENT',
    );
  }
  if (astryxDefinitionsByName().has(doc.name)) {
    throw new IconSetAuthoringError(
      `Astryx already has the icon definition "${doc.name}"; map to it instead of adding your own.`,
      'ERR_INVALID_ARGUMENT',
      [{name: `--definition ${doc.name}`, reason: "use Astryx's definition"}],
    );
  }
  const description = (doc.description ?? '').trim();
  const words = [
    ...new Set(
      (doc.words ?? []).map(word => word.trim().toLowerCase()).filter(Boolean),
    ),
  ];
  if (!description || words.length === 0) {
    throw new IconSetAuthoringError(
      `A new icon definition needs --description and --words: one sentence on what the icon is for, and the words people search for.`,
      'ERR_MISSING_ARGUMENT',
    );
  }
  return {name: doc.name, description, words};
}

/**
 * The set's definition file for `name`, and whether it exists.
 * @param {DiscoveredIconSet} set
 * @param {string} name
 */
export function definitionFile(set, name) {
  return assertWithin(`definitions/${name}.doc.mjs`, set.dir, {
    label: 'icon definition file',
  });
}

/**
 * Write one new definition file into the set, refusing to overwrite one.
 * Returns a function that removes it again.
 * @param {DiscoveredIconSet} set
 * @param {{name: string, description: string, words: string[]}} doc
 * @returns {() => void}
 */
export function writeDefinitionFile(set, doc) {
  const file = definitionFile(set, doc.name);
  if (fs.existsSync(file)) {
    throw new IconSetAuthoringError(
      `Refusing to overwrite existing file definitions/${doc.name}.doc.mjs.`,
      'ERR_FILE_EXISTS',
    );
  }
  const text = iconDefinitionSource(doc);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  try {
    fs.writeFileSync(file, text, {encoding: 'utf-8', flag: 'wx'});
  } catch (error) {
    throw new IconSetAuthoringError(
      `Could not write definitions/${doc.name}.doc.mjs: ${error instanceof Error ? error.message : String(error)}`,
      'ERR_WRITE_FAILED',
    );
  }
  return () => {
    if (fs.existsSync(file) && fs.readFileSync(file, 'utf-8') === text) {
      fs.rmSync(file);
    }
  };
}

/** The comment the generated icons module opens with. */
const GENERATED_HEADER = [
  '// Generated by `astryx experimental icon add`: one export per icon of this set.',
  '// Edit with `astryx experimental icon add`; a statement added by hand is kept.',
];

/**
 * The top-level statements of a generated module, one normalized line each,
 * however the file was formatted: whitespace collapsed, no padding inside
 * braces, no trailing comma. Comments are dropped.
 * @param {string} text
 * @param {string} label the module's path, for the error
 * @returns {string[]}
 */
function generatedStatements(text, label) {
  let ast;
  try {
    ast = parse(text, {sourceType: 'module', plugins: ['jsx', 'typescript']});
  } catch (error) {
    throw new IconSetAuthoringError(
      `The generated icons module ${label} does not parse (${error instanceof Error ? error.message : String(error)}). Fix or delete it, then run the command again.`,
      'ERR_INVALID_ARGUMENT',
    );
  }
  return ast.program.body.map(node =>
    text
      .slice(
        /** @type {number} */ (node.start),
        /** @type {number} */ (node.end),
      )
      .replace(/\s+/gu, ' ')
      .replace(/\{ /gu, '{')
      .replace(/,? \}/gu, '}')
      .replace(/,\}/gu, '}'),
  );
}

/** The local name the generated module gives the set's adapter. */
const ADAPTER_LOCAL = 'adaptIcon';

/** The theme map the generated module writes. */
export const THEME_MAP_NAME = 'themeIcons';

/** How the generated module imports React for its theme map. */
const REACT_IMPORT = "import {createElement} from 'react';";

/** The built-in icon definitions: the shared names a theme map covers. */
const BUILT_IN = new Set(ICON_NAMES);

/**
 * The generated icons module of a set, from the package root: `generated`
 * in its data file, else `<set directory>/<set>.generated.js`.
 * @param {DiscoveredIconSet} set
 * @param {string} packageDir
 */
export function generatedModulePath(set, packageDir) {
  return (
    set.data.generated ??
    `./${path
      .relative(packageDir, path.join(set.dir, `${set.name}.generated.js`))
      .split(path.sep)
      .join('/')}`
  );
}

/**
 * One icon export of the generated module.
 * @typedef {object} GeneratedIcon
 * @property {string} name the export the set exposes
 * @property {string} from the source module: a specifier, or a ./ path from
 *   the package root
 * @property {string} source the source export, or `default`
 * @property {boolean} adapt whether the set's adapter turns it into a
 *   component
 */

/** The props every theme-map element gets: sized to its box, hidden from assistive tech. */
const THEME_ELEMENT_PROPS =
  "{'aria-hidden': true, 'width': '1em', 'height': '1em'}";

/**
 * The declaration file beside a generated module (`x.generated.js` →
 * `x.generated.d.ts`, `.mjs` → `.d.mts`); null for a TypeScript module.
 * @param {string} generated
 * @returns {string | null}
 */
export function generatedTypesPath(generated) {
  if (/\.m?tsx?$/u.test(generated)) return null;
  if (generated.endsWith('.mjs')) return generated.replace(/\.mjs$/u, '.d.mts');
  if (generated.endsWith('.cjs')) return generated.replace(/\.cjs$/u, '.d.cts');
  return generated.replace(/\.jsx?$/u, '.d.ts');
}

/**
 * The declaration file's text for a generated module's statements: each
 * re-export as written, so a component keeps its library's types; each
 * adapted icon as a component that takes SVG props; and the theme map.
 * @param {string[]} statements the module's normalized statements
 * @returns {string}
 */
export function generatedTypesText(statements) {
  /** @type {string[]} */
  const lines = [];
  const react = new Set();
  for (const statement of statements) {
    if (statement.startsWith('import ')) continue;
    if (/^export (?:\*|\{[^}]*\}) from /u.test(statement)) {
      lines.push(statement);
      continue;
    }
    const adapted = new RegExp(
      `^export const (\\w+) = ${ADAPTER_LOCAL}\\(`,
      'u',
    ).exec(statement);
    if (adapted) {
      react.add('ComponentType').add('SVGProps');
      lines.push(
        `export declare const ${adapted[1]}: ComponentType<SVGProps<SVGSVGElement>>;`,
      );
      continue;
    }
    const theme = /^export const (\w+) = \{(.*)\};$/u.exec(statement);
    if (
      theme &&
      (theme[1] === THEME_MAP_NAME || statement.includes('createElement('))
    ) {
      react.add('ReactElement');
      const keys = [...theme[2].matchAll(/(\w+): createElement\(/gu)].map(
        match => match[1],
      );
      lines.push(
        `export declare const ${theme[1]}: {${keys.map(key => `readonly ${key}: ReactElement`).join('; ')}};`,
      );
    }
  }
  return [
    ...GENERATED_HEADER,
    ...(react.size > 0
      ? [`import type {${[...react].sort().join(', ')}} from 'react';`]
      : []),
    ...lines,
    '',
  ].join('\n');
}

/**
 * The generated module's statements, normalized, from its text.
 * @param {string} text
 * @param {string} label
 */
export function readGeneratedStatements(text, label) {
  return generatedStatements(text, label);
}

/**
 * The generated module and its declaration file after adding icons: every
 * statement it already has is kept; each new icon is a re-export of a
 * component or the adapter applied to anything else; the adapter is imported
 * once when an export needs it; and, when the data names `themeIcons` as its
 * theme map, `themeIcons` is rewritten from the built-in entries of `map`.
 * An export the module already has with another source is refused.
 * @param {string} packageDir
 * @param {string} generated the module's ./ path from the package root
 * @param {string | null} before the module's current text
 * @param {import('../../authoring/doctypes/icon-set/type').IconSetData} data
 *   the data file as it will be written
 * @param {GeneratedIcon[]} icons
 * @param {string[]} [remove] export names to drop, with the import an
 *   adapted one reads: the icons a refreshed library no longer has
 * @returns {{js: string, dts: string | null}}
 */
export function generatedModuleText(
  packageDir,
  generated,
  before,
  data,
  icons,
  remove = [],
) {
  const file = path.join(packageDir, generated);
  const fileDir = path.dirname(file);
  /** @param {string} from */
  const specifierOf = from => {
    if (!from.startsWith('./')) return from;
    const relative = path
      .relative(fileDir, path.join(packageDir, from))
      .split(path.sep)
      .join('/');
    return relative.startsWith('.') ? relative : `./${relative}`;
  };
  const themeName = data.themeMap === THEME_MAP_NAME ? THEME_MAP_NAME : null;
  const lines = before == null ? [] : generatedStatements(before, generated);
  // Written once, below: the adapter's import, React's createElement, and
  // the theme map.
  const adapterImport = new RegExp(`\\bas ${ADAPTER_LOCAL}\\b`, 'u');
  const dropped = [...new Set(remove)].map(
    name =>
      new RegExp(
        `(?:\\bas ${name}(?:Source)?\\}|^export const ${name} = |^export \\{${name}\\} |^import ${name}Source )`,
        'u',
      ),
  );
  // A re-export binds no local name, so the theme map reads each re-exported
  // icon through an import that mirrors its re-export. Those imports are
  // rewritten with the theme map.
  const themeImport = (/** @type {string} */ line) =>
    themeName != null &&
    line.startsWith('import {') &&
    lines.includes(`export${line.slice('import'.length)}`);
  const managed = (/** @type {string} */ line) =>
    dropped.some(pattern => pattern.test(line)) ||
    adapterImport.test(line) ||
    line === REACT_IMPORT ||
    themeImport(line) ||
    (themeName != null && line.startsWith(`export const ${themeName} = `));
  const imports = new Set(
    lines.filter(line => line.startsWith('import ') && !managed(line)),
  );
  const exports = new Set(
    lines.filter(line => !line.startsWith('import ') && !managed(line)),
  );
  /** @param {string} name */
  const existing = name =>
    [...exports].find(line =>
      new RegExp(
        `(?:\\b(?:as\\s+|export\\s+\\{\\s*|export const\\s+))${name}\\b`,
        'u',
      ).test(line),
    );
  for (const icon of icons) {
    const specifier = specifierOf(icon.from);
    /** @type {string[]} */
    const want = [];
    /** @type {string[]} */
    const wantImports = [];
    if (icon.adapt) {
      const local = `${icon.name}Source`;
      wantImports.push(
        icon.source === 'default'
          ? `import ${local} from '${specifier}';`
          : `import {${icon.source === local ? local : `${icon.source} as ${local}`}} from '${specifier}';`,
      );
      want.push(`export const ${icon.name} = ${ADAPTER_LOCAL}(${local});`);
    } else {
      want.push(
        icon.source === icon.name
          ? `export {${icon.name}} from '${specifier}';`
          : `export {${icon.source} as ${icon.name}} from '${specifier}';`,
      );
    }
    const prior = existing(icon.name);
    if (prior) {
      if (prior !== want[0]) {
        throw new IconSetAuthoringError(
          `The generated icons module already exports ${icon.name} as \`${prior}\`. Pass another name, or edit ${generated}.`,
          'ERR_FILE_EXISTS',
        );
      }
      continue;
    }
    for (const line of wantImports) imports.add(line);
    for (const line of want) exports.add(line);
  }
  const needsAdapter = [...exports].some(line =>
    line.includes(`= ${ADAPTER_LOCAL}(`),
  );
  if (needsAdapter && !data.adapter) {
    throw new IconSetAuthoringError(
      'An icon here is not a component, so the set needs an adapter. Declare "adapter": {"module": "./src/adapt.js", "export": "adapt"} in the data file: a function in your package that turns the library export into a component (astryx docs cli/experimental/icon-sets library-shapes).',
      'ERR_INVALID_ARGUMENT',
    );
  }
  /** @type {string[]} */
  const theme = [];
  /** @type {Set<string>} */
  const themeImports = new Set();
  if (themeName) {
    const byId = new Map(data.icons.map(icon => [icon.id, icon.export]));
    for (const name of Object.keys(data.map ?? {}).sort()) {
      const exportName = byId.get(/** @type {string} */ (data.map?.[name]));
      if (BUILT_IN.has(name) && exportName) {
        theme.push(
          `  ${name}: createElement(${exportName}, ${THEME_ELEMENT_PROPS}),`,
        );
        const reexport = [...exports].find(line =>
          new RegExp(
            `^export \\{(?:\\w+ as )?${exportName}\\} from `,
            'u',
          ).test(line),
        );
        if (reexport) {
          themeImports.add(`import${reexport.slice('export'.length)}`);
        }
      }
    }
  }
  const adapterLine =
    needsAdapter && data.adapter
      ? [
          `import {${data.adapter.export} as ${ADAPTER_LOCAL}} from '${specifierOf(data.adapter.module)}';`,
        ]
      : [];
  const js = [
    ...GENERATED_HEADER,
    ...(themeName ? [REACT_IMPORT] : []),
    ...adapterLine,
    ...[...imports, ...themeImports].sort(),
    ...[...exports].sort(),
    ...(themeName
      ? theme.length > 0
        ? [`export const ${themeName} = {`, ...theme, '};']
        : [`export const ${themeName} = {};`]
      : []),
    '',
  ].join('\n');
  const typesPath = generatedTypesPath(generated);
  return {
    js,
    dts: typesPath
      ? generatedTypesText(generatedStatements(js, generated))
      : null,
  };
}

/**
 * Every name the generated module already exports one library export as: `export {featherSun as SunIcon} from '…'` or the import an adapted
 * icon reads (`import {featherSun as SunIconSource} from '…'`). Adding the
 * same library export again then reuses that icon instead of naming a new
 * one.
 * @param {string} packageDir
 * @param {string} generated
 * @param {string} from the source module: a specifier, or a ./ path
 * @param {string} source the source export, or `default`
 * @returns {string[]}
 */
export function generatedNamesOf(packageDir, generated, from, source) {
  /** @type {string[]} */
  const names = [];
  const file = path.join(packageDir, generated);
  if (!fs.existsSync(file)) return names;
  let statements;
  try {
    statements = generatedStatements(fs.readFileSync(file, 'utf-8'), generated);
  } catch {
    return names;
  }
  let specifier = from;
  if (from.startsWith('./')) {
    specifier = path
      .relative(path.dirname(file), path.join(packageDir, from))
      .split(path.sep)
      .join('/');
    if (!specifier.startsWith('.')) specifier = `./${specifier}`;
  }
  const tail = ` from '${specifier}';`;
  for (const statement of statements) {
    if (!statement.endsWith(tail)) continue;
    const head = statement.slice(0, -tail.length);
    if (source === 'default') {
      const plain = /^import (\w+)Source$/u.exec(head);
      if (plain) names.push(plain[1]);
      const named = /^export \{default as (\w+)\}$/u.exec(head);
      if (named) names.push(named[1]);
      continue;
    }
    if (head === `export {${source}}`) names.push(source);
    const reexport = new RegExp(`^export \\{${source} as (\\w+)\\}$`, 'u').exec(
      head,
    );
    if (reexport) names.push(reexport[1]);
    const adapted = new RegExp(
      `^import \\{${source} as (\\w+)Source\\}$`,
      'u',
    ).exec(head);
    if (adapted) names.push(adapted[1]);
    if (head === `import {${source}}` && source.endsWith('Source')) {
      names.push(source.slice(0, -'Source'.length));
    }
  }
  return names;
}

/**
 * Write the set's generated module and its declaration file
 * ({@link generatedModuleText}). Returns whether either changed, and a
 * function that puts both back.
 * @param {string} packageDir
 * @param {string} generated
 * @param {import('../../authoring/doctypes/icon-set/type').IconSetData} data
 * @param {GeneratedIcon[]} icons
 * @param {string[]} [remove] export names to drop ({@link generatedModuleText})
 * @returns {{changed: boolean, files: string[], undo: () => void}}
 */
export function writeGeneratedIcons(
  packageDir,
  generated,
  data,
  icons,
  remove = [],
) {
  const file = assertWithin(generated, packageDir, {
    label: 'generated icons module',
  });
  const before = fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : null;
  const {js, dts} = generatedModuleText(
    packageDir,
    generated,
    before,
    data,
    icons,
    remove,
  );
  const typesRel = generatedTypesPath(generated);
  const typesFile = typesRel ? path.join(packageDir, typesRel) : null;
  const typesBefore =
    typesFile && fs.existsSync(typesFile)
      ? fs.readFileSync(typesFile, 'utf-8')
      : null;
  /** @type {string[]} */
  const files = [];
  /** @type {Array<() => void>} */
  const undos = [];
  /**
   * @param {string} target
   * @param {string} text
   * @param {string | null} prior
   * @param {string} rel
   */
  const put = (target, text, prior, rel) => {
    if (prior === text) return;
    fs.mkdirSync(path.dirname(target), {recursive: true});
    replaceText(target, text);
    files.push(rel.replace(/^\.\//u, ''));
    undos.push(() => {
      if (!fs.existsSync(target) || fs.readFileSync(target, 'utf-8') !== text) {
        return;
      }
      if (prior == null) fs.rmSync(target);
      else replaceText(target, prior);
    });
  };
  const undo = () => {
    for (const each of [...undos].reverse()) each();
  };
  try {
    put(file, js, before, generated);
    if (typesFile && dts != null && typesRel)
      put(typesFile, dts, typesBefore, typesRel);
  } catch (error) {
    // A failed types write leaves the module as it was too.
    undo();
    throw error;
  }
  return {
    changed: files.length > 0,
    files,
    undo,
  };
}

/**
 * Whether the set's own module exports `name`, read without running it, and
 * the line its entry needs when it does not.
 * @param {DiscoveredIconSet} set
 * @param {{packageDir: string, pkg: Record<string, any>}} where
 * @param {string} generated the generated module's ./ path from the package root
 * @param {string} name
 * @returns {string | null} a note for the author, or null when nothing is needed
 */
export function setModuleNote(set, where, generated, name) {
  const entry = resolveIconModule(set.data.module, where.packageDir, {
    name: where.pkg.name,
    dir: where.packageDir,
  });
  if (entry && moduleExportOrigin(entry, name)) return null;
  const target = path.join(where.packageDir, generated);
  if (!entry) {
    return `"${set.data.module}" does not resolve yet: point its package.json "exports" at a file that has \`export * from '${generated.replace(/\.[cm]?[jt]sx?$/u, '.js')}';\`.`;
  }
  let relative = path
    .relative(path.dirname(entry), target)
    .split(path.sep)
    .join('/');
  if (!relative.startsWith('.')) relative = `./${relative}`;
  return `Add \`export * from '${relative}';\` to ${path.relative(where.packageDir, entry).split(path.sep).join('/')}, so the icons import from ${set.data.module}.`;
}
