// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docs.detail.section leaf — load a single section of a topic.
 *
 * @input A topic name, a section query, and optional {lang, zh, dense}. Resolves
 *   the topic via the shared adapter, finds the section in its lowered compiled
 *   node by its stable key, then by exact title, then by a title that contains
 *   the query, and links only that section.
 * @output { type: 'docs.detail.section', data: ReferenceSection } with any
 *   token-ref blocks inlined — matching `astryx --json docs <topic> <section>`.
 *   Throws ERR_UNKNOWN_SECTION when nothing matches, or when the query matches
 *   more than one section (the candidates come back as suggestions).
 * @position Leaf nested under api/docs/detail. Shares topic resolution with the
 *   detail leaf via _adapter.mjs and reads through the compiler's lenses.
 */

import {AstryxError} from '../../../error.mjs';
import {ERROR_CODES} from '../../../../foundation/response/error-codes.mjs';
import {
  findDocSection,
  sectionKey,
} from '../../../../foundation/discovery/docs-section-key.mjs';
import {linkReferenceSection} from '../../../../foundation/doc-compiler/compile.mjs';
import {
  readerSections,
  sectionView,
} from '../../../../foundation/doc-compiler/lenses.mjs';
import {referenceTargets, resolveTopicDocs} from '../../_adapter.mjs';

/**
 * @param {string} topic
 * @param {string} sectionName a section key, or a title (or part of one)
 * @param {object} [options]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @param {boolean} [options.dense]
 * @param {string} [options.cwd]
 * @returns {Promise<import('../../docs.type.mjs').DocsDetailSectionResponse>}
 */
export async function section(topic, sectionName, options = {}) {
  // An empty section name must error, not resolve to the first section. The
  // docs() dispatcher routes a falsy section to the topic, but the leaf must be
  // safe on its own; a non-string would otherwise throw a raw TypeError.
  if (typeof sectionName !== 'string' || !sectionName.trim()) {
    throw new AstryxError(
      'A section name is required',
      undefined,
      ERROR_CODES.ERR_UNKNOWN_SECTION,
    );
  }

  const {catalog, node, lang} = await resolveTopicDocs(topic, options);
  const sections = readerSections(node);
  const {section: match, candidates} = findDocSection(sections, sectionName);
  if (!match) {
    const ambiguous = candidates.length > 1;
    throw new AstryxError(
      ambiguous
        ? `Section "${sectionName}" matches ${candidates.length} sections in "${topic}". Read one by its key.`
        : `Section "${sectionName}" not found in "${topic}"`,
      (ambiguous ? candidates : sections).map(s => ({
        name: sectionKey(s),
        reason: s.title,
      })),
      ERROR_CODES.ERR_UNKNOWN_SECTION,
    );
  }

  // A section read on its own inlines its token refs, as the whole topic does;
  // otherwise a section that is only a token-ref prints blank. Only this
  // section is linked, so a broken reference elsewhere cannot fail the read.
  const linked = await linkReferenceSection(
    match,
    referenceTargets(catalog, lang),
  );
  return {type: 'docs.detail.section', data: sectionView(node, linked)};
}
