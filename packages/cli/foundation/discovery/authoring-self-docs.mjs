// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The authoring self-docs, and the `authoring` topic built from them.
 *
 * @input The SchemaDoc each authoring module colocates as `*.doc.mjs` under
 *   packages/cli/authoring.
 * @output {@link AUTHORING_SELF_DOCS} (every self-doc, in reading order), the
 *   `authoring` reference topic with one section per self-doc, and an audit
 *   naming any self-doc the topic cannot reach, any that fails to load, and any
 *   section over the docs output budget.
 * @position Read by assets/docs/authoring.doc.mjs (the topic) and by Doctor
 *   (the audit). Lives in foundation because authoring/ holds only contracts.
 *   A new `*.doc.mjs` under authoring/ must be added to the list, or Doctor and
 *   the self-doc tests fail.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT} from '../fs/paths.mjs';
import {readDocView} from '../doc-compiler/read.mjs';
import {
  DOC_OUTPUT_BUDGET_BYTES,
  oversizedDocSections,
} from './docs-output-budget.mjs';

/** The directory the self-docs live under. */
export const AUTHORING_ROOT = path.join(CLI_ROOT, 'authoring');

/** Every authoring self-doc, relative to {@link AUTHORING_ROOT}, in reading order. */
export const AUTHORING_SELF_DOCS = [
  'integration/integration.doc.mjs',
  'config/config.doc.mjs',
  'debug/debug.doc.mjs',
  'gap-report/gap-report.doc.mjs',
  'codemod/codemod.doc.mjs',
  'identity/identity.doc.mjs',
  'doctypes/base/graph-fields.doc.mjs',
  'doctypes/component/component.doc.mjs',
  'doctypes/hook/hook.doc.mjs',
  'doctypes/function/function.doc.mjs',
  'doctypes/command/command.doc.mjs',
  'doctypes/enum/enum.doc.mjs',
  'doctypes/namespace/namespace.doc.mjs',
  'doctypes/reference/reference.doc.mjs',
  'doctypes/schema/schema.doc.mjs',
  'doctypes/template/template.doc.mjs',
  'doctypes/theme/theme.doc.mjs',
];

/** Blocks a self-doc note may carry that a topic section can render. */
const TOPIC_BLOCKS = new Set(['prose', 'list', 'code', 'heading', 'table']);

/**
 * Every `*.doc.mjs` under `root`, relative and sorted.
 * @param {string} [root]
 * @returns {string[]}
 */
export function discoverAuthoringSelfDocSources(root = AUTHORING_ROOT) {
  /** @type {string[]} */
  const found = [];
  /** @param {string} dir */
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      if (entry.name === 'node_modules' || entry.name.startsWith('__'))
        continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.doc.mjs')) {
        found.push(path.relative(root, full).split(path.sep).join('/'));
      }
    }
  };
  walk(root);
  return found.sort();
}

/**
 * Import each self-doc. One that fails is reported, never thrown, so one bad
 * file cannot take the rest of the topic down with it.
 * @param {string[]} [sources]
 * @param {string} [root]
 * @returns {Promise<{loaded: {source: string, doc: any}[], failed: {source: string, error: string}[]}>}
 */
export async function loadAuthoringSelfDocs(
  sources = AUTHORING_SELF_DOCS,
  root = AUTHORING_ROOT,
) {
  const loaded = [];
  const failed = [];
  for (const source of sources) {
    try {
      const doc = await readDocView(path.join(root, source), {
        root: 'self-docs',
        loader: 'native',
      });
      if (
        typeof doc?.name !== 'string' ||
        typeof doc?.description !== 'string'
      ) {
        throw new Error('exports no doc with a name and a description');
      }
      loaded.push({source, doc});
    } catch (error) {
      failed.push({
        source,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return {loaded, failed};
}

/**
 * @param {any[]} fields
 * @returns {string[][]}
 */
function fieldRows(fields) {
  return fields.flatMap(field => [
    [
      String(field.name),
      String(field.type ?? ''),
      field.required ? 'yes' : 'no',
      [
        field.description,
        field.default != null ? `Default: ${field.default}.` : null,
        field.example != null ? `Example: ${field.example}.` : null,
      ]
        .filter(Boolean)
        .join(' '),
    ],
    ...fieldRows(field.fields ?? []),
  ]);
}

/**
 * One self-doc as a topic section, keyed by the doc's own name.
 * @param {any} doc
 * @returns {import('../../authoring/doctypes/reference/type').ReferenceSection}
 */
export function selfDocSection(doc) {
  /** @type {any[]} */
  const content = [{type: 'prose', text: doc.description}];
  if (doc.appliesTo) {
    content.push({type: 'prose', text: `Applies to: ${doc.appliesTo}`});
  }
  const rows = fieldRows(doc.fields ?? []);
  if (rows.length > 0) {
    content.push({
      type: 'table',
      headers: ['Field', 'Type', 'Required', 'Description'],
      rows,
    });
  }
  for (const example of doc.examples ?? []) {
    if (typeof example?.code !== 'string' || example.code.trim() === '')
      continue;
    content.push({
      type: 'code',
      lang: example.lang ?? 'js',
      ...(example.label ? {label: example.label} : {}),
      code: example.code,
    });
  }
  for (const note of doc.notes ?? []) {
    if (TOPIC_BLOCKS.has(note?.type)) content.push(note);
  }
  return {id: doc.name, title: doc.displayName ?? doc.name, content};
}

/**
 * The `authoring` topic: one section per self-doc, in the order given.
 * @param {any[]} docs
 * @returns {import('../../authoring/doctypes/reference/type').ReferenceDoc}
 */
export function buildAuthoringReferenceDoc(docs) {
  return /** @type {any} */ ({
    name: 'authoring',
    title: 'Authoring Reference',
    category: 'guide',
    description:
      'Every file an integration author writes, field by field: the integration manifest, astryx.config, codemods, identity, and each doc type.',
    sections: docs.map(selfDocSection),
  });
}

/**
 * The `authoring` topic from every self-doc that loads. One that fails is left
 * out here and reported by {@link auditAuthoringSelfDocs}.
 * @returns {Promise<import('../../authoring/doctypes/reference/type').ReferenceDoc>}
 */
export async function buildAuthoringTopic() {
  const {loaded} = await loadAuthoringSelfDocs();
  return buildAuthoringReferenceDoc(loaded.map(entry => entry.doc));
}

/**
 * What stands between a self-doc and a reader of `astryx docs authoring`.
 * @param {{root?: string, sources?: string[], budget?: number}} [options]
 * @returns {Promise<{
 *   sections: number,
 *   unreachable: string[],
 *   failed: {source: string, error: string}[],
 *   oversized: {key: string, title: string, bytes: number}[],
 * }>}
 */
export async function auditAuthoringSelfDocs({
  root = AUTHORING_ROOT,
  sources = AUTHORING_SELF_DOCS,
  budget = DOC_OUTPUT_BUDGET_BYTES,
} = {}) {
  const listed = new Set(sources);
  const unreachable = discoverAuthoringSelfDocSources(root).filter(
    source => !listed.has(source),
  );
  const {loaded, failed} = await loadAuthoringSelfDocs(sources, root);
  const topic = buildAuthoringReferenceDoc(loaded.map(entry => entry.doc));
  return {
    sections: topic.sections.length,
    unreachable,
    failed,
    oversized: oversizedDocSections(topic.sections, budget),
  };
}
