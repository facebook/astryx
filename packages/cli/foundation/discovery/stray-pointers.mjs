// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Stray doc pointers (architecture:cli-surface DEC-8): a code span in
 * prose that is exactly `astryx docs <name>` for a doc that exists. The doc's
 * `{@link generic:<name>}` prints the same command and is checked by doctor's
 * link check, so a written command is a pointer nothing checks.
 *
 * @input the docs a package ships, as discoverIntegrationDocs returns them
 * @output each stray pointer, with the link that replaces it
 * @position foundation/discovery, called through api/integration/_adapter.mjs
 */

import fs from 'node:fs';

import {builtinGuideFiles} from './docs-discovery.mjs';
import {loadQuietly} from './copied-passages.mjs';

/**
 * A code span that is exactly the command opening one doc. A command with
 * more words, a flag, or a route is a walkthrough, not a pointer.
 */
const POINTER = /`astryx docs ([a-z0-9][a-z0-9-]*)`/g;

/** @type {Promise<Map<string, string>> | undefined} */
let coreKinds;

/**
 * The CLI's own docs by name, each with the kind a link names it by: a
 * namespace doc as `namespace`, a topic or guide as `generic`.
 * @returns {Promise<Map<string, string>>}
 */
function loadCoreKinds() {
  coreKinds ??= (async () => {
    const kinds = new Map();
    for (const file of builtinGuideFiles()) {
      const doc = await loadQuietly(file);
      if (typeof doc?.name === 'string') {
        kinds.set(doc.name, doc.type === 'namespace' ? 'namespace' : 'generic');
      }
    }
    return kinds;
  })();
  return coreKinds;
}

/**
 * The strings of a doc the compiler resolves links in: the text of prose and
 * heading blocks, list items, and table cells, in each section's content, with
 * the section's title. A summary or other field prints a link as written, so
 * it is not read.
 *
 * @param {unknown} doc an authored doc object
 * @returns {{text: string, section: string | null}[]}
 */
export function linkableStrings(doc) {
  /** @type {{text: string, section: string | null}[]} */
  const strings = [];
  /**
   * @param {unknown} value
   * @param {string | null} section
   */
  const walk = (value, section) => {
    if (Array.isArray(value)) {
      for (const item of value) walk(item, section);
      return;
    }
    if (value == null || typeof value !== 'object') return;
    const record = /** @type {Record<string, any>} */ (value);
    const title = typeof record.title === 'string' ? record.title : section;
    if (Array.isArray(record.sections)) walk(record.sections, section);
    if (!Array.isArray(record.content)) return;
    for (const block of record.content) {
      const add = (/** @type {unknown} */ text) => {
        if (typeof text === 'string') strings.push({text, section: title});
      };
      switch (block?.type) {
        case 'prose':
        case 'heading':
          add(block.text);
          break;
        case 'list':
          (block.items ?? []).forEach(add);
          break;
        case 'table':
          (block.headers ?? []).forEach(add);
          for (const row of block.rows ?? []) row.forEach(add);
          break;
        default:
          walk(block, title);
      }
    }
  };
  walk(doc, null);
  return strings;
}

/**
 * Every pointer span in one prose string, in order.
 * @param {string} text
 * @returns {string[]} the doc name each one points at
 */
export function pointersIn(text) {
  return [...text.matchAll(POINTER)].map(match => match[1]);
}

/**
 * Each stray pointer in a package's topics.
 *
 * @param {{records: {name: string, path: string}[], guides?: {name: string, ref?: {topicFile?: string}}[], namespaces?: {doc?: {name?: string}}[]}} discovered
 * @returns {Promise<import('../../api/integration/authoring-checks.type.mjs').StrayPointer[]>}
 */
export async function findStrayPointers(discovered) {
  const topics = [
    ...discovered.records.map(record => ({
      name: record.name,
      file: record.path,
    })),
    ...(discovered.guides ?? []).map(guide => ({
      name: guide.name,
      file: guide.ref?.topicFile,
    })),
  ];
  /** @type {Map<string, string>} */
  const own = new Map(topics.map(topic => [topic.name, 'generic']));
  for (const namespace of discovered.namespaces ?? []) {
    const name = namespace?.doc?.name;
    if (typeof name === 'string' && !own.has(name)) own.set(name, 'namespace');
  }
  const core = await loadCoreKinds();
  /** @type {import('../../api/integration/authoring-checks.type.mjs').StrayPointer[]} */
  const found = [];
  for (const topic of topics) {
    if (!topic.file) continue;
    const doc = await loadQuietly(topic.file);
    if (!doc) continue;
    let lines = /** @type {string[]} */ ([]);
    try {
      lines = fs.readFileSync(topic.file, 'utf8').split('\n');
    } catch {
      // No line numbers; the finding still names the section.
    }
    for (const {text, section} of linkableStrings(doc)) {
      // The string's longest plain run is written in the file as it reads,
      // so it finds the line where the string starts; each pointer is on
      // that line or a later one of the same string.
      const plain = (text.match(/[A-Za-z0-9 ,.;:()-]{12,}/g) ?? []).sort(
        (a, b) => b.length - a.length,
      )[0];
      const start = plain ? lines.findIndex(line => line.includes(plain)) : -1;
      const end = start < 0 ? -1 : start + text.split('\n').length + 2;
      let within = start;
      for (const target of pointersIn(text)) {
        const link = own.has(target)
          ? `{@link ${own.get(target)}:${target}}`
          : core.has(target)
            ? `{@link @astryxdesign/cli:${core.get(target)}:${target}}`
            : null;
        if (!link) continue;
        const command = `astryx docs ${target}`;
        let line = null;
        for (
          let at = Math.max(within, 0);
          start >= 0 && at < Math.min(lines.length, end);
          at++
        ) {
          if (
            lines[at].includes(`\`${command}\``) ||
            lines[at].includes(`\\\`${command}\\\``)
          ) {
            line = at + 1;
            within = at;
            break;
          }
        }
        const where = [
          section ? `section "${section}"` : null,
          line == null ? null : `line ${line}`,
        ]
          .filter(Boolean)
          .join(', ');
        found.push({
          topic: topic.name,
          section,
          file: topic.file,
          line,
          pointer: command,
          link,
          message:
            `"${topic.name}"${where ? ` (${where})` : ''} points at a doc with the written command \`${command}\`. ` +
            `Replace \`${command}\`, code ticks included, with ${link}: the CLI prints the same command, and doctor checks the link.`,
        });
      }
    }
  }
  return found;
}
