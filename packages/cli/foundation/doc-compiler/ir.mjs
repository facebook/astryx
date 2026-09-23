// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The compiled-node contract and its sealed parser.
 *
 * @input Any value that claims to be a compiled reference node — typically one
 *   read back from JSON.
 * @output The same value once it validates; a thrown Error naming every
 *   problem otherwise. An unsupported schema version fails with its own
 *   message before anything else is checked.
 * @position The load boundary for compiled nodes that did not come straight
 *   from ./compile.mjs in this process. The value is returned as given, not
 *   rebuilt, so key order (which response JSON follows) survives.
 */

import {SECTION_KEY_RE} from '../discovery/docs-section-key.mjs';
import {COMPILED_DOC_SCHEMA_VERSION} from './compile.mjs';

const NODE_FIELDS = new Set([
  'schemaVersion',
  'kind',
  'id',
  'lang',
  'provenance',
  'sourceTitles',
  'doc',
]);
const RESOLVED_FIELDS = new Set([
  'status',
  'topic',
  'section',
  'previewType',
  'content',
]);

/** @param {unknown} value @returns {value is Record<string, any>} */
const isRecord = value =>
  value != null && typeof value === 'object' && !Array.isArray(value);

/** @param {unknown} value @returns {value is string} */
const isText = value => typeof value === 'string' && value !== '';

/**
 * Validate a compiled reference node.
 * @param {unknown} value
 * @returns {import('./compile.mjs').CompiledReferenceNode}
 */
export function parseCompiledReferenceNode(value) {
  const node = /** @type {any} */ (value);
  if (node?.schemaVersion !== COMPILED_DOC_SCHEMA_VERSION) {
    throw new Error(
      `Compiled doc schema version ${JSON.stringify(node?.schemaVersion)} is not supported; this CLI reads version ${COMPILED_DOC_SCHEMA_VERSION}. Compile the docs again with this CLI.`,
    );
  }
  /** @type {string[]} */
  const problems = [];
  const unknown = Object.keys(node).filter(key => !NODE_FIELDS.has(key));
  if (unknown.length > 0)
    problems.push(`unknown fields: ${unknown.join(', ')}`);
  if (node.kind !== 'reference') problems.push('kind: expected "reference"');
  if (!isText(node.id)) problems.push('id: expected a topic name');
  if (node.lang !== null && !isText(node.lang)) {
    problems.push('lang: expected a language or null');
  }
  const provenance = node.provenance;
  if (
    !isRecord(provenance) ||
    !isText(provenance.provider) ||
    (provenance.replaces !== null && !isText(provenance.replaces)) ||
    !Array.isArray(provenance.extensions) ||
    !provenance.extensions.every(isText)
  ) {
    problems.push('provenance: expected {provider, replaces, extensions}');
  }
  const titles = isRecord(node.sourceTitles) ? node.sourceTitles : null;
  if (!titles || !Object.values(titles).every(isText)) {
    problems.push('sourceTitles: expected section key -> authored title');
  }
  const doc = node.doc;
  if (
    !isRecord(doc) ||
    !isText(doc.name) ||
    !isText(doc.title) ||
    typeof doc.description !== 'string' ||
    !Array.isArray(doc.sections) ||
    doc.sections.length === 0
  ) {
    problems.push('doc: expected {name, title, description, sections}');
  } else {
    problems.push(...sectionProblems(doc.sections, titles));
  }
  if (problems.length > 0) {
    throw new Error(`Invalid compiled doc node: ${problems.join('; ')}`);
  }
  return node;
}

/**
 * @param {any[]} sections
 * @param {Record<string, any> | null} titles
 * @returns {string[]}
 */
function sectionProblems(sections, titles) {
  /** @type {string[]} */
  const problems = [];
  const seen = new Set();
  sections.forEach((section, index) => {
    const at = `doc.sections[${index}]`;
    if (
      !isRecord(section) ||
      typeof section.id !== 'string' ||
      !SECTION_KEY_RE.test(section.id)
    ) {
      problems.push(`${at}.id: expected a section key`);
      return;
    }
    if (seen.has(section.id)) {
      problems.push(`${at}.id: two sections have the key "${section.id}"`);
    }
    seen.add(section.id);
    if (!isText(section.title)) problems.push(`${at}.title: expected a title`);
    if (titles && !Object.hasOwn(titles, section.id)) {
      problems.push(
        `sourceTitles: no authored title for section "${section.id}"`,
      );
    }
    if (!Array.isArray(section.content)) {
      problems.push(`${at}.content: expected an array of blocks`);
      return;
    }
    section.content.forEach((/** @type {any} */ block, blockIndex) => {
      if (block?.type !== 'token-ref' || !('resolved' in block)) return;
      const problem = resolutionProblem(block.resolved);
      if (problem) {
        problems.push(
          `${at}.content[${blockIndex}]: token reference to "${block.topic}": ${problem}`,
        );
      }
    });
  });
  return problems;
}

/**
 * @param {unknown} resolved
 * @returns {string | null}
 */
function resolutionProblem(resolved) {
  if (!isRecord(resolved)) return 'expected a resolution';
  switch (resolved.status) {
    case 'unknown-topic':
    case 'unknown-section':
      return Object.keys(resolved).length === 1 ? null : 'unexpected fields';
    case 'resolved': {
      if (!isText(resolved.topic)) return 'topic: expected a topic name';
      if (
        typeof resolved.section !== 'string' ||
        !SECTION_KEY_RE.test(resolved.section)
      ) {
        return 'section: expected a section key';
      }
      if ('previewType' in resolved && !isText(resolved.previewType)) {
        return 'previewType: expected a preview type';
      }
      if (!Array.isArray(resolved.content))
        return 'content: expected an array of blocks';
      const extra = Object.keys(resolved).filter(
        key => !RESOLVED_FIELDS.has(key),
      );
      return extra.length > 0 ? `unexpected fields: ${extra.join(', ')}` : null;
    }
    default:
      return `status: expected resolved, unknown-topic or unknown-section, got ${JSON.stringify(resolved.status)}`;
  }
}
