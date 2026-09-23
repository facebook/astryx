// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Doc compiler — authored reference topics in, compiled nodes out.
 *
 * @input A {@link ReferenceTopicInput}: one topic's own file and the files of
 *   the extensions merged onto it, each already through the authored-doc parser
 *   and each carrying the overlay for the language being read. Discovery
 *   assembles it, and records a file that failed to load instead of throwing,
 *   so problems surface here in the order a reader meets them.
 * @output A compiled reference node: plain JSON carrying a schema version, the
 *   topic after overlay, extension merge and key stamping, and the authored
 *   title of every section. Linking then resolves each token reference against
 *   its target. Nothing in a node is a function, a symbol, or a file path.
 * @position The one step between authored docs and every docs reader. The docs
 *   API, doctor and search read compiled nodes, and ./lenses.mjs turns them into
 *   response shapes. Internal to the CLI: the public way in is `docs()`.
 */

import {mergeTopic, problemsInTopic} from '../discovery/docs-discovery.mjs';
import {
  sectionKey,
  sectionKeyProblems,
  sourceTitle,
  withSectionKeys,
  withSourceTitle,
} from '../discovery/docs-section-key.mjs';

/** Bumped whenever the shape of a compiled node changes. */
export const COMPILED_DOC_SCHEMA_VERSION = 1;

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
  const sections = keyed.sections.map((/** @type {any} */ section) => {
    sourceTitles[section.id] = sourceTitle(section);
    // A plain copy: the authored title travels in sourceTitles, not a symbol.
    return {...section};
  });
  return {
    schemaVersion: COMPILED_DOC_SCHEMA_VERSION,
    kind: 'reference',
    id: input.id,
    lang: input.lang,
    provenance: {
      provider: input.provider,
      replaces: input.replaces,
      extensions: input.extensions.map(extension => extension.provider),
    },
    sourceTitles,
    doc: {...keyed, sections},
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
  return {...node, doc: {...node.doc, sections}};
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
