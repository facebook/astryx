// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Doc compiler — authored docs in, compiled nodes out.
 *
 * @input A {@link ReferenceTopicInput}: one topic's own file and the files of
 *   the extensions merged onto it, each already through the authored-doc parser
 *   and each carrying the overlay for the language being read. Discovery
 *   assembles it, and records a file that failed to load instead of throwing,
 *   so problems surface here in the order a reader meets them.
 * @output A compiled reference node: plain JSON carrying a schema version, the
 *   topic after overlay, extension merge and key stamping, and the authored
 *   title of every section. Linking then resolves each token reference against
 *   its target. Nothing in a node is a function, a symbol, or a file path: an
 *   authored value JSON cannot hold (a function, a Date, `undefined`) takes its
 *   JSON form, the one `--json` output has always shown.
 * @position The one step between authored docs and every docs reader. The docs
 *   API, doctor and search read compiled nodes, and ./lenses.mjs turns them into
 *   response shapes. Every other doc kind (components, hooks, templates, themes,
 *   and the CLI's self-docs) lowers through {@link lowerDoc}, which ./read.mjs
 *   feeds. Internal to the CLI: the public way in is the docs API.
 */

import {parseDoc} from '../../authoring/doctypes/parse.mjs';
import {parseTemplate} from '../../authoring/doctypes/template/parse.mjs';
import {parseTheme} from '../../authoring/doctypes/theme/parse.mjs';
import {mergeTopic, problemsInTopic} from '../discovery/docs-discovery.mjs';
import {
  sectionKey,
  sectionKeyProblems,
  sourceTitle,
  withSectionKeys,
  withSourceTitle,
} from '../discovery/docs-section-key.mjs';
import {diagnostic} from './diagnostics.mjs';
import {overlayAuthoredDoc} from './overlays.mjs';

/** Bumped whenever the shape of a compiled node changes. */
export const COMPILED_DOC_SCHEMA_VERSION = 1;

/** Every kind a compiled node has: one per authored doc kind a root reads. */
export const COMPILED_DOC_KINDS = /** @type {const} */ ([
  'component',
  'function',
  'reference',
  'page',
  'block',
  'schema',
  'command',
  'enum',
  'theme',
]);

/**
 * The roots that read docs, and the kinds each may hold. A doc without a
 * stamped `type` (the legacy form) takes its root's first kind.
 * @type {Readonly<Record<string, readonly string[]>>}
 */
export const ROOT_KINDS = Object.freeze({
  components: ['component'],
  hooks: ['function'],
  templates: ['page', 'block'],
  themes: ['theme'],
  'self-docs': ['command', 'function', 'schema', 'enum'],
});

/**
 * One authored file, as discovery loaded it.
 * @typedef {object} AuthoredFile
 * @property {string} file the file's name, for messages only
 * @property {any} [doc] the parsed doc, when it loaded
 * @property {unknown} [error] why it did not load or parse
 * @property {any} [overlay] the language overlay's export, when one applies
 * @property {unknown} [overlayError] why the overlay did not load
 */

/**
 * @typedef {object} ReferenceTopicInput
 * @property {string} id the topic's name in the catalog
 * @property {string} provider the package that owns the topic
 * @property {string | null} replaces the topic it took the place of
 * @property {string | null} lang the overlay language, or null for authored text
 * @property {AuthoredFile} base
 * @property {Array<AuthoredFile & {provider: string}>} extensions in merge order
 */

/**
 * A token reference after linking: the target section's content, or why it
 * has none.
 * @typedef {{status: 'resolved', topic: string, section: string, previewType?: string, content: any[]}
 *   | {status: 'unknown-topic'}
 *   | {status: 'unknown-section'}} TokenRefResolution
 */

/**
 * @typedef {object} CompiledReferenceNode
 * @property {number} schemaVersion
 * @property {'reference'} kind
 * @property {'lowered' | 'linked'} stage `linked` once every token reference
 *   carries its resolution; a lowered node carries none
 * @property {string} id the topic's name in the catalog
 * @property {string | null} lang
 * @property {{provider: string, replaces: string | null, extensions: string[]}} provenance
 * @property {Record<string, string>} sourceTitles section key -> authored title
 * @property {any} doc the topic: authored fields in authored order, every
 *   section keyed; a linked node's token references carry `resolved`
 */

/**
 * Lower one topic: overlay each file, merge the extensions in order, and stamp
 * every section with its key.
 * @param {ReferenceTopicInput} input
 * @returns {CompiledReferenceNode}
 */
export function lowerReferenceTopic(input) {
  let doc = readAuthoredFile(input.base);
  for (const extension of input.extensions) {
    doc = mergeTopic(doc, readAuthoredFile(extension));
    // Merging matches on keys, so this holds unless merge itself regresses.
    const problems = sectionKeyProblems(doc.sections);
    if (problems.length > 0) {
      throw new Error(
        `${extension.file}, extending ${input.id}, leaves two sections with one key: ${problems.join('; ')}`,
      );
    }
  }
  // Derived keys are stamped only now, so they never take part in merging.
  const keyed = withSectionKeys(doc);
  /** @type {Record<string, string>} */
  const sourceTitles = {};
  for (const section of keyed.sections) {
    sourceTitles[section.id] = sourceTitle(section);
  }
  return {
    schemaVersion: COMPILED_DOC_SCHEMA_VERSION,
    kind: 'reference',
    stage: 'lowered',
    id: input.id,
    lang: input.lang,
    provenance: {
      provider: input.provider,
      replaces: input.replaces,
      extensions: input.extensions.map(extension => extension.provider),
    },
    sourceTitles,
    // The authored title travels in sourceTitles; JSON drops the symbol.
    doc: asJson(keyed, input.id),
  };
}

/**
 * Link every section of a lowered node.
 * @param {CompiledReferenceNode} node
 * @param {(topic: string) => Promise<CompiledReferenceNode | null>} lowerTarget
 *   the lowered node a reference names, or null when no topic has that name
 * @returns {Promise<CompiledReferenceNode>}
 */
export async function linkReferenceTopic(node, lowerTarget) {
  const sections = [];
  for (const section of node.doc.sections) {
    sections.push(await linkReferenceSection(section, lowerTarget));
  }
  return {...node, stage: 'linked', doc: {...node.doc, sections}};
}

/**
 * Resolve the token references in one section. A section with none comes back
 * as it went in.
 * @template {{content: any[]}} S
 * @param {S} section
 * @param {(topic: string) => Promise<CompiledReferenceNode | null>} lowerTarget
 * @returns {Promise<S>}
 */
export async function linkReferenceSection(section, lowerTarget) {
  if (!section.content.some(block => block?.type === 'token-ref')) {
    return section;
  }
  const content = [];
  for (const block of section.content) {
    content.push(
      block?.type === 'token-ref'
        ? {...block, resolved: await resolveTokenRef(block, lowerTarget)}
        : block,
    );
  }
  return {...section, content};
}

/**
 * The section a token reference names — by key, or by authored title in any
 * letter case — in the target topic lowered for the same language.
 * @param {any} block
 * @param {(topic: string) => Promise<CompiledReferenceNode | null>} lowerTarget
 * @returns {Promise<TokenRefResolution>}
 */
async function resolveTokenRef(block, lowerTarget) {
  const target = await lowerTarget(block.topic);
  if (!target) return {status: 'unknown-topic'};
  const wanted = block.section.toLowerCase();
  const found = target.doc.sections.find(
    (/** @type {any} */ section) =>
      sectionKey(section) === block.section ||
      (target.sourceTitles[section.id] ?? section.title).toLowerCase() ===
        wanted,
  );
  if (!found) return {status: 'unknown-section'};
  return {
    status: 'resolved',
    topic: target.id,
    section: found.id,
    ...(found.previewType ? {previewType: found.previewType} : {}),
    content: found.content,
  };
}

/**
 * A value as JSON carries it: functions, symbols and `undefined` dropped,
 * Dates as ISO strings.
 * @param {any} value
 * @param {string} topic for the message when the value cannot be serialized
 * @returns {any}
 */
function asJson(value, topic) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (err) {
    throw new Error(
      `${topic} cannot be compiled: ${err instanceof Error ? err.message : String(err)}`,
      {cause: err},
    );
  }
}

/**
 * One file's doc, checked and in the reading language. Problems throw in the
 * order a reader meets them: the file itself, then its overlay.
 * @param {AuthoredFile} file
 * @returns {any}
 */
function readAuthoredFile(file) {
  if ('error' in file) throw file.error;
  const parsed = file.doc;
  if (!('sections' in parsed)) {
    throw new Error(`${file.file} is not a reference document.`);
  }
  const problems = problemsInTopic(parsed);
  if (problems.length > 0) {
    throw new Error(`${file.file} is invalid: ${problems.join('; ')}`);
  }
  if ('overlayError' in file) throw file.overlayError;
  return file.overlay ? applyOverlay(parsed, file.overlay) : parsed;
}

/**
 * Lay a translation over a doc. Overlays are keyed to a base section by title
 * (`section`), not by array position: position keying grafted each overlay
 * title onto whatever base section shared its index, so an overlay that omitted
 * or reordered a section corrupted every section after it (#2182). An overlay
 * may cover any subset of sections, in any order; the rest keep their base
 * content.
 * @param {any} docs
 * @param {any} translation
 * @returns {any}
 */
function applyOverlay(docs, translation) {
  /** @type {Map<string, any>} */
  const bySection = new Map();
  for (const ts of translation.sections ?? []) {
    if (ts?.section != null) bySection.set(ts.section, ts);
  }
  return {
    ...docs,
    description: translation.description || docs.description,
    sections: docs.sections.map((/** @type {any} */ section) => {
      const ts = bySection.get(section.title);
      if (!ts) return section;
      const localized = {
        ...section,
        title: ts.title || section.title,
        content: section.content.map(
          (/** @type {any} */ block, /** @type {number} */ bi) => {
            const tb = ts.content?.[bi];
            if (!tb) return block;
            if (tb.type === 'prose' && block.type === 'prose')
              return {...block, text: tb.text};
            if (tb.type === 'list' && block.type === 'list')
              return {...block, items: tb.items};
            return block;
          },
        ),
      };
      return withSourceTitle(localized, section.title);
    }),
  };
}

/**
 * @typedef {import('./diagnostics.mjs').CompilerDiagnostic} CompilerDiagnostic
 */

/**
 * One authored doc of any kind but a reference topic, as its root loaded it.
 * @typedef {object} DocFileInput
 * @property {string} id the input's id: provider, root, and name
 * @property {keyof typeof ROOT_KINDS} root
 * @property {string} provider the package that contributes it
 * @property {string} source `<package>/<path>` of the file
 * @property {string | null} lang the overlay language, or null
 * @property {AuthoredFile} file `doc` is the authored export, not a parse
 *   result; `overlay` is the translation the module exports for `lang`
 * @property {string} [label] how a parse error names the file (default: its
 *   file name)
 * @property {boolean} [useParsed] carry the parser's result instead of the
 *   authored export, for a reader that has always read the checked value
 */

/**
 * The parser that checks a root's docs. Templates and themes have their own;
 * every other root dispatches on the stamped type.
 * @param {string} root
 * @returns {(input: unknown, label?: string) => any}
 */
export function parserFor(root) {
  if (root === 'themes') return parseTheme;
  if (root === 'templates') return parseTemplate;
  return parseDoc;
}

/**
 * A compiled node for any kind but a reference topic.
 * @typedef {object} CompiledDocNode
 * @property {number} schemaVersion
 * @property {Exclude<typeof COMPILED_DOC_KINDS[number], 'reference'>} kind
 * @property {'lowered'} stage
 * @property {string} id
 * @property {string | null} lang
 * @property {{provider: string, source: string}} provenance
 * @property {any} doc the authored doc, overlaid for `lang`, as JSON carries
 *   it: key order kept, `undefined` and functions dropped
 */

/**
 * The result of lowering one doc. `failure` is what the first fatal problem
 * threw, for a reader that has always passed that error on as it was.
 * @typedef {object} LoweredDoc
 * @property {CompiledDocNode | null} node null when a problem is fatal
 * @property {CompilerDiagnostic[]} diagnostics
 * @property {unknown} [failure]
 */

/**
 * Lower one doc of any kind but a reference topic: check it against its kind's
 * parser, lay its translation over it, and carry it as JSON.
 *
 * A doc that fails its kind's parser still lowers, carrying an `invalid_doc`
 * diagnostic: readers that never checked docs keep reading them exactly as
 * before, and a reader that checks turns the diagnostic into its error. A doc
 * that cannot load, exports nothing, or has a type its root does not read
 * yields no node. A doc stamped with a kind its root does not read keeps its
 * root's kind and carries a `wrong_kind` diagnostic.
 *
 * @param {DocFileInput} input
 * @returns {LoweredDoc}
 */
export function lowerDoc(input) {
  const {file} = input;
  const at = {provider: input.provider, source: input.source};
  /** @type {CompilerDiagnostic[]} */
  const diagnostics = [];
  /**
   * @param {string} code
   * @param {string} message
   * @param {unknown} failure
   * @returns {LoweredDoc}
   */
  const fatal = (code, message, failure) => {
    diagnostics.push(diagnostic(code, {...at, message}));
    return {node: null, diagnostics, failure};
  };
  if ('error' in file) {
    return fatal(
      'load_failed',
      `${file.file} could not be loaded: ${messageOf(file.error)}`,
      file.error,
    );
  }
  if (file.doc == null) {
    const missing = new Error(`${file.file} exports no doc.`);
    return fatal('missing_export', missing.message, missing);
  }
  const allowed = ROOT_KINDS[input.root];
  if (!allowed) throw new Error(`No doc root is named "${input.root}".`);
  const stamped =
    typeof file.doc === 'object' && 'type' in file.doc
      ? file.doc.type
      : undefined;
  // A root that finds a doc of another kind still carries it: readers have
  // always read such a file, and the diagnostic names the mismatch.
  const kindFits = stamped === undefined || allowed.includes(stamped);
  if (!kindFits) {
    diagnostics.push(
      diagnostic('wrong_kind', {
        ...at,
        message: `${file.file} is stamped type ${JSON.stringify(stamped)}, which the ${input.root} root does not read (it reads ${allowed.join(', ')}).`,
      }),
    );
  }
  /** @type {unknown} */
  let failure;
  let doc = file.doc;
  try {
    const parsed = parserFor(input.root)(file.doc, input.label ?? file.file);
    // A theme descriptor is read statically; its parse result is the doc.
    if (input.useParsed || input.root === 'themes') doc = parsed;
  } catch (error) {
    failure = error;
    diagnostics.push(
      diagnostic('invalid_doc', {...at, message: messageOf(error)}),
    );
  }
  if ('overlayError' in file) {
    return fatal(
      'overlay_failed',
      `${file.file}'s translation could not be loaded: ${messageOf(file.overlayError)}`,
      file.overlayError,
    );
  }
  if (file.overlay) doc = overlayAuthoredDoc(doc, file.overlay);
  let json;
  try {
    json = JSON.parse(JSON.stringify(doc));
  } catch (error) {
    return fatal(
      'not_json',
      `${file.file} cannot be compiled: ${messageOf(error)}`,
      error,
    );
  }
  return {
    node: {
      schemaVersion: COMPILED_DOC_SCHEMA_VERSION,
      kind: /** @type {CompiledDocNode['kind']} */ (
        kindFits && stamped !== undefined ? stamped : allowed[0]
      ),
      stage: 'lowered',
      id: input.id,
      lang: input.lang,
      provenance: {provider: input.provider, source: input.source},
      doc: json,
    },
    diagnostics,
    ...(failure === undefined ? {} : {failure}),
  };
}

/** @param {unknown} error */
function messageOf(error) {
  return error instanceof Error ? error.message : String(error);
}
