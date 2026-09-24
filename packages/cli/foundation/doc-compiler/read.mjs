// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Doc reader — authored files in, compiled nodes out, for every doc kind.
 *
 * @input A descriptor file, the root that reads it (components, hooks,
 *   templates, themes, self-docs, or doc topics), and the reading language.
 * @output The compiled node for that file, memoized per file version and
 *   frozen, and a fresh copy of its doc for a reader. For doc topics: the
 *   compiler input for a topic, with its extensions and overlays loaded.
 * @position The one module that loads authored doc files for reading.
 *   Discovery finds the files; this loads each one and hands it to
 *   ./compile.mjs; api/ and clients/ read what comes back. Internal to the
 *   CLI: nothing here is public API.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {parseDoc} from '../../authoring/doctypes/parse.mjs';
import {importDocModule, importTopicModule} from './import.mjs';
import {lowerDoc, parserFor} from './compile.mjs';
import {translationFor} from './overlays.mjs';
import {packageOf, packageSource} from './source.mjs';

/**
 * How each root's module names its doc, in precedence order. These are the
 * orders the readers have always used, so a file that exports two docs keeps
 * serving the one it served before.
 */
export const DOC_EXPORTS = Object.freeze({
  components: ['default', 'docs'],
  hooks: ['default', 'docs'],
  templates: ['default', 'doc'],
  'self-docs': ['doc', 'docs', 'default'],
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
 * @property {(file: string) => Promise<any>} [load] how to import the module,
 *   for a root with its own loader
 * @property {readonly string[]} [exports] which exports name the doc, in
 *   precedence order, for a reader that has always read a narrower set than its
 *   root's default ({@link DOC_EXPORTS})
 * @property {() => unknown} [readStatic] for themes: the descriptor value, read
 *   without executing the file
 * @property {'authored' | 'parsed'} [value] which value the node carries: the
 *   authored export (default) or its parser's result, for a reader that has
 *   always read the checked value
 */

/** @type {Map<string, Promise<import('./compile.mjs').LoweredDoc>>} */
const lowered = new Map();

/**
 * Compile one descriptor file. Memoized by file version (path, size, and
 * modification time) and options, and frozen, because every read in the
 * process shares it.
 * @param {string} file absolute path
 * @param {ReadOptions} options
 * @returns {Promise<import('./compile.mjs').LoweredDoc>}
 */
export function compileDocFile(file, options) {
  const lang = options.lang ?? null;
  const key = [
    options.root,
    lang ?? '',
    options.label ?? '',
    options.provider ?? '',
    options.id ?? '',
    options.load ? 'custom' : '',
    (options.exports ?? []).join(','),
    options.value ?? 'authored',
    fileVersion(file),
  ].join('\u0000');
  let result = lowered.get(key);
  if (!result) {
    result = loadAuthored(file, options, lang).then(authored => {
      const provider = options.provider ?? packageOf(file) ?? '';
      const out = lowerDoc({
        id: options.id ?? `${provider}:${options.root}:${path.basename(file)}`,
        root: options.root,
        provider,
        source: packageSource(file),
        lang,
        file: authored,
        ...(options.label ? {label: options.label} : {}),
        ...(options.value === 'parsed' ? {useParsed: true} : {}),
      });
      if (out.node) deepFreeze(out.node);
      deepFreeze(out.diagnostics);
      return out;
    });
    lowered.set(key, result);
  }
  return result;
}

/**
 * A reader's copy of one descriptor's compiled doc.
 *
 * `strict` readers get today's checked-load errors: what the file threw on
 * import, or its kind's parse error. Other readers, which have never checked
 * docs, keep reading a doc that fails its parser, and read a file that exports
 * no doc as `undefined`.
 * @param {string} file absolute path
 * @param {ReadOptions & {strict?: boolean}} options
 * @returns {Promise<any>} a fresh copy; the caller may change it freely
 */
export async function readDocView(file, options) {
  const {node, diagnostics, failure} = await compileDocFile(file, options);
  const strict = options.strict === true;
  if (node == null) {
    if (diagnostics.some(d => d.code === 'missing_export')) {
      // A checked load has always reported an empty file as its parser does.
      if (strict) parserFor(options.root)(undefined, options.label ?? file);
      return undefined;
    }
    throw failure;
  }
  if (strict && failure !== undefined) throw failure;
  return structuredClone(node.doc);
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
    mod = await (options.load ?? importDocModule)(file);
  } catch (error) {
    return {file: name, error};
  }
  let doc;
  for (const key of options.exports ?? DOC_EXPORTS[options.root]) {
    if (mod?.[key] != null) {
      doc = mod[key];
      break;
    }
  }
  const overlay =
    lang && (options.root === 'components' || options.root === 'hooks')
      ? translationFor(mod, lang)
      : null;
  return overlay ? {file: name, doc, overlay} : {file: name, doc};
}

/**
 * Size and modification time name a file's version, so an edited file
 * compiles again. A file that cannot be read keys on its path alone and fails
 * at load.
 * @param {string} file
 * @returns {string}
 */
function fileVersion(file) {
  try {
    const stat = fs.statSync(file);
    return `${fs.realpathSync(file)}\u0000${stat.size}\u0000${stat.mtimeMs}`;
  } catch {
    return path.resolve(file);
  }
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
    const mod = await importTopicModule(docPath);
    doc = parseDoc(mod.docs ?? mod.default, file);
  } catch (error) {
    return {file, error};
  }
  if (!lang) return {file, doc};
  const translationPath = overlayPath(docPath, lang);
  if (!fs.existsSync(translationPath)) return {file, doc};
  try {
    const translationMod = await importTopicModule(translationPath);
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
