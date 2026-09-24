// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Doc reader — authored files in, lowered docs out, for every doc kind.
 *
 * @input A descriptor file, the root that reads it (components, hooks,
 *   templates, themes, self-docs, or doc topics), the reading language, and
 *   how strictly the reader checks.
 * @output The lowered doc for that file, memoized per file for the life of the
 *   process, as Node's module cache holds the file itself. Readers get the
 *   view they have always read; a whole-project compile also gets the sealed
 *   node. For doc topics: the compiler input for a topic, with its extensions
 *   and overlays loaded.
 * @position Loads authored doc files for the readers in api/ and clients/ and
 *   hands each to ./compile.mjs. Each reader keeps its own loader, export
 *   order, and strictness, so what it prints is what it printed before.
 *   Internal to the CLI: nothing here is public API.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  importDocModule,
  importNativeModule,
  importTemplateModule,
} from './import.mjs';
import {lowerDoc, parserFor} from './compile.mjs';
import {translationFor} from './overlays.mjs';
import {parseReadableDoc} from './parse-readable.mjs';
import {packageOf, packageSource} from './source.mjs';

/**
 * How each root's module names its doc, in precedence order: the `??` chain
 * each reader has always used, so a file that exports two docs keeps serving
 * the one it served before.
 */
export const DOC_EXPORTS = Object.freeze({
  components: ['default', 'docs'],
  hooks: ['default', 'docs'],
  templates: ['default', 'doc'],
  'self-docs': ['doc', 'docs', 'default'],
});

/** How a reader imports a doc module. */
const LOADERS = Object.freeze({
  // jiti for `.ts`, native otherwise: the checked loaders' import.
  user: importDocModule,
  // A plain `import()`: what the unchecked readers have always used.
  native: importNativeModule,
  // jiti with JSX for `.ts`: template discovery's import.
  template: importTemplateModule,
});

/**
 * @typedef {object} ReadOptions
 * @property {'components' | 'hooks' | 'templates' | 'themes' | 'self-docs'} root
 * @property {string | null} [lang] overlay language; null reads the authored
 *   text
 * @property {string} [label] how a parse error names the file (default: its
 *   file name)
 * @property {string} [provider] the owning package, when the caller knows it
 * @property {string} [id] the node's id (default: provider, root, and file
 *   name)
 * @property {keyof typeof LOADERS} [loader] how to import the module (default
 *   `user`)
 * @property {readonly string[]} [exports] which exports name the doc, in
 *   precedence order, for a reader that has always read a narrower set than its
 *   root's default ({@link DOC_EXPORTS})
 * @property {() => unknown} [readStatic] for themes: the descriptor value, read
 *   without executing the file
 * @property {'authored' | 'parsed'} [value] which value the view carries: the
 *   authored export (default) or its parser's result, for a reader that has
 *   always read the checked value
 * @property {boolean} [check] hold the doc to its kind's parser
 */

/** @type {Map<string, Promise<import('./compile.mjs').LoweredDoc>>} */
const lowered = new Map();

/**
 * Lower one descriptor file. Memoized per file and options for the life of the
 * process; a file that failed to load is tried again on the next read, as a
 * fresh import would be.
 * @param {string} file absolute path
 * @param {ReadOptions} options
 * @param {{node?: boolean}} [want] also build the sealed node
 * @returns {Promise<import('./compile.mjs').LoweredDoc>}
 */
export function compileDocFile(file, options, {node = false} = {}) {
  const lang = options.lang ?? null;
  const check = options.check === true;
  const key = JSON.stringify([
    path.resolve(file),
    options.root,
    lang,
    options.label ?? null,
    options.provider ?? null,
    options.id ?? null,
    options.loader ?? 'user',
    options.exports ?? null,
    options.value ?? 'authored',
    check,
    node,
  ]);
  let result = lowered.get(key);
  if (!result) {
    result = loadAuthored(file, options, lang).then(authored => {
      const provider = options.provider ?? packageOf(file);
      const out = lowerDoc(
        {
          id:
            options.id ?? `${provider}:${options.root}:${path.basename(file)}`,
          root: options.root,
          provider,
          source: packageSource(file),
          lang,
          file: authored,
          ...(options.label ? {label: options.label} : {}),
          ...(options.value === 'parsed' ? {useParsed: true} : {}),
        },
        {check, node},
      );
      if (out.node) deepFreeze(out.node);
      if (out.loadFailure !== undefined || 'overlayError' in authored) {
        lowered.delete(key);
      }
      return out;
    });
    lowered.set(key, result);
  }
  return result;
}

/**
 * What a reader gets for one descriptor: the view it has always read.
 *
 * `strict` readers check the doc and throw what they always threw: the import
 * error, the parser's error (for an empty export too), then a failed
 * translation. Other readers skip the check, throw only what importing or
 * translating threw, and read an empty export as the empty value itself.
 * With `copy`, the reader gets its own copy (containers copied, every other
 * value shared); without it, the shared view, as a module export always was.
 * @param {string} file absolute path
 * @param {ReadOptions & {strict?: boolean, copy?: boolean}} options
 * @returns {Promise<any>}
 */
export async function readDocView(file, options) {
  const strict = options.strict === true;
  const result = await compileDocFile(file, {
    ...options,
    check: strict || options.check === true,
  });
  if (result.loadFailure !== undefined) throw result.loadFailure;
  if (result.missing) {
    if (strict)
      parserFor(options.root)(result.missingValue, options.label ?? file);
    return result.missingValue;
  }
  if (strict && result.failure !== undefined) throw result.failure;
  if (result.overlayFailure !== undefined) throw result.overlayFailure;
  return options.copy === true ? copyDoc(result.view) : result.view;
}

/**
 * Load one file as its root reads it: the doc its module exports and, for a
 * component or hook, the translation it exports for `lang`.
 * @param {string} file
 * @param {ReadOptions} options
 * @param {string | null} lang
 * @returns {Promise<import('./compile.mjs').AuthoredFile>}
 */
async function loadAuthored(file, options, lang) {
  const name = path.basename(file);
  if (options.root === 'themes') {
    if (!options.readStatic) {
      throw new Error(
        'A theme descriptor is read statically; pass readStatic.',
      );
    }
    try {
      return {file: name, doc: options.readStatic()};
    } catch (error) {
      return {file: name, error};
    }
  }
  let mod;
  try {
    mod = await LOADERS[options.loader ?? 'user'](file);
  } catch (error) {
    return {file: name, error};
  }
  // `a ?? b ?? c`, exactly: the first value that is not null or undefined,
  // else the last one.
  const [first, ...rest] = options.exports ?? DOC_EXPORTS[options.root];
  let doc = mod?.[first];
  for (const key of rest) doc = doc ?? mod?.[key];
  const overlay =
    lang && (options.root === 'components' || options.root === 'hooks')
      ? translationFor(mod, lang)
      : null;
  return overlay ? {file: name, doc, overlay} : {file: name, doc};
}

/**
 * A reader's own copy of a doc: plain objects and arrays are copied with their
 * property descriptors (so a getter is never run and `undefined` keys stay),
 * cycles are kept, and every other value (functions, dates, class instances)
 * is shared, as the module's own export would be.
 * @param {unknown} value
 * @param {Map<object, object>} [seen]
 * @returns {any}
 */
export function copyDoc(value, seen = new Map()) {
  if (value === null || typeof value !== 'object') return value;
  const isArray = Array.isArray(value);
  const proto = Object.getPrototypeOf(value);
  if (!isArray && proto !== Object.prototype && proto !== null) return value;
  const known = seen.get(value);
  if (known) return known;
  const copy = isArray ? new Array(value.length) : Object.create(proto);
  seen.set(value, copy);
  for (const key of Reflect.ownKeys(value)) {
    if (isArray && key === 'length') continue;
    const descriptor = /** @type {PropertyDescriptor} */ (
      Object.getOwnPropertyDescriptor(value, key)
    );
    if ('value' in descriptor)
      descriptor.value = copyDoc(descriptor.value, seen);
    Object.defineProperty(copy, key, descriptor);
  }
  if (!Object.isExtensible(value)) Object.preventExtensions(copy);
  return copy;
}

/**
 * Freeze a value and everything in it.
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function deepFreeze(value) {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

// ── Doc topics ─────────────────────────────────────────────────────────────

/** The localized overlays a docs read can apply. */
export const OVERLAY_LANGUAGES = ['zh', 'dense'];

/**
 * Where the `lang` overlay of a doc file lives: `{topic}.doc.{lang}.mjs`.
 * @param {string} docPath
 * @param {string} lang
 * @returns {string}
 */
export function overlayPath(docPath, lang) {
  return path.join(
    path.dirname(docPath),
    `${path.basename(docPath, '.doc.mjs')}.doc.${lang}.mjs`,
  );
}

/**
 * The overlay languages a topic ships for its own file or any extension.
 * @param {import('../discovery/docs-discovery.mjs').DocsTopicEntry} entry
 * @returns {string[]}
 */
export function overlayLanguages(entry) {
  const files = [entry.path, ...entry.extensions.map(ext => ext.path)];
  return OVERLAY_LANGUAGES.filter(lang =>
    files.some(file => fs.existsSync(overlayPath(file, lang))),
  );
}

/**
 * Load one topic file and the overlay for `lang`. A failure is recorded on the
 * result, not thrown, so the compiler reports it in reading order.
 * @param {string} docPath
 * @param {string | null} lang
 * @returns {Promise<import('./compile.mjs').AuthoredFile>}
 */
export async function loadTopicFile(docPath, lang) {
  const file = path.basename(docPath);
  let doc;
  try {
    const mod = await importNativeModule(docPath);
    doc = parseReadableDoc(mod.docs ?? mod.default, file);
  } catch (error) {
    return {file, error};
  }
  if (!lang) return {file, doc};
  const translationPath = overlayPath(docPath, lang);
  if (!fs.existsSync(translationPath)) return {file, doc};
  try {
    const translationMod = await importNativeModule(translationPath);
    return {
      file,
      doc,
      overlay: translationMod.docsZh || translationMod.docsDense || null,
    };
  } catch (overlayError) {
    return {file, doc, overlayError};
  }
}

/**
 * Everything the compiler needs for one topic, read from disk.
 * @param {import('../discovery/docs-discovery.mjs').DocsTopicEntry} entry
 * @param {string | null} lang
 * @returns {Promise<import('./compile.mjs').ReferenceTopicInput>}
 */
export async function loadTopicInput(entry, lang) {
  const extensions = [];
  for (const extension of entry.extensions) {
    extensions.push({
      ...(await loadTopicFile(extension.path, lang)),
      provider: extension.package,
    });
  }
  return {
    id: entry.name,
    provider: entry.package,
    replaces: entry.replaces ?? null,
    lang,
    base: await loadTopicFile(entry.path, lang),
    extensions,
  };
}
