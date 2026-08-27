// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Reference-doc (topic) discovery — the CLI's own topics plus the ones
 * configured integrations contribute, resolved into one catalog.
 *
 * @input packages/cli/assets/docs/{topic}.doc.mjs (built in), and each loaded
 *   integration's resolved `docs` root ({topic}.doc.{ts,mjs,js}).
 * @output A {@link DocsCatalog}: every topic the project can read, keyed by
 *   name, carrying its owner package, its file, and any extension overlays —
 *   plus the alias a renamed replacement leaves behind.
 * @position foundation/discovery — the single seam every docs surface reads
 *   (api/docs, api/search, and the agent-docs block), so a topic contributed
 *   once shows up in all of them.
 *
 * An integration contributes a topic the way it contributes a component: a
 * root in its manifest, a file per artifact. What a doc says about its
 * relationship to an existing topic is authored on the doc itself, not in a
 * second registry that has to be kept in step with it:
 *
 *   (neither)         add a topic under its own name
 *   replaces: 'x'     take over topic x — core's, or another integration's
 *   extends:  'x'     merge onto topic x, section by section
 *
 * A topic whose name collides with an existing one and declares neither is an
 * `invalid_doc` issue rather than silent shadowing. Shadowing by name would
 * make a core rename swallow an integration's guide (or the reverse) with no
 * diagnostic anywhere, which is the failure mode integration discovery already
 * refuses for components provided by two packages.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT} from '../fs/paths.mjs';
import {importUserModule} from '../fs/module-loader.mjs';
import {parseDoc} from '../../authoring/doctypes/parse.mjs';

/** Where the CLI's own topics live. */
const BUILTIN_DOCS_DIR = path.join(CLI_ROOT, 'assets', 'docs');

/**
 * Owner package recorded for the built-in topics. They ship inside the CLI
 * (assets/docs), not in @astryxdesign/core, so this is the CLI's own name —
 * unlike component discovery, whose built-ins belong to core.
 */
export const BUILTIN_DOCS_PACKAGE = '@astryxdesign/cli';

/**
 * A built-in topic file: `{topic}.doc.mjs`. Anchored at both ends so a
 * localization overlay (`{topic}.doc.zh.mjs`) is not read as a topic of its
 * own — it is loaded by the topic it overlays.
 */
const BUILTIN_TOPIC_FILE_RE = /^([\w-]+)\.doc\.mjs$/;

/** Conventional doc-file suffixes for an integration's topics. */
const INTEGRATION_DOC_SUFFIXES = ['.doc.ts', '.doc.mjs', '.doc.js'];

/** A topic name is a CLI argument and a URL segment; keep it to both. */
const TOPIC_NAME_RE = /^[\w-]+$/;

/**
 * @typedef {object} DocsTopicRecord A doc file discovered under a docs root.
 * @property {string} name
 * @property {string} package owner package
 * @property {string} path absolute path to the doc file
 * @property {string} [title]
 * @property {string} [description]
 * @property {string|null} [category]
 * @property {string} [replaces] topic this doc takes the place of
 * @property {string} [extendsTopic] topic this doc merges onto (`extends`)
 */

/**
 * @typedef {object} DocsTopicEntry A resolved topic in the catalog.
 * @property {string} name
 * @property {string} package owner package
 * @property {string} path absolute path to the doc file
 * @property {string} [title]
 * @property {string} [description]
 * @property {string|null} [category]
 * @property {string} [replaces] the topic this one took the place of
 * @property {Array<{package: string, path: string}>} extensions overlays to
 *   merge onto the base doc, in the order their integrations were configured
 */

/**
 * Discover the CLI's own topics.
 * @returns {Record<string, string>} topic name → absolute doc path
 */
export function discoverBuiltinTopics() {
  /** @type {Record<string, string>} */
  const topics = Object.create(null);
  if (!fs.existsSync(BUILTIN_DOCS_DIR)) return topics;
  for (const file of fs.readdirSync(BUILTIN_DOCS_DIR)) {
    const match = file.match(BUILTIN_TOPIC_FILE_RE);
    if (match) topics[match[1]] = path.join(BUILTIN_DOCS_DIR, file);
  }
  return topics;
}

/**
 * Load a topic doc from disk. A `.ts` doc is loaded through jiti, the rest
 * natively; both the historical `export const docs` and the stamped
 * `export default` forms are accepted, because core authors the first and the
 * integration guide documents the second.
 *
 * @param {string} file absolute path to a doc file
 * @returns {Promise<unknown>} the authored doc value
 */
export async function loadTopicModule(file) {
  const mod = await importUserModule(file);
  const doc = mod?.docs ?? mod?.default;
  if (doc == null) {
    throw new Error(
      `${path.basename(file)} exports no doc. A topic exports \`docs\` (or a default export).`,
    );
  }
  return doc;
}

/** Every block kind a section may hold, with the fields each one requires. */
const BLOCK_FIELDS = {
  prose: ['text'],
  heading: ['level', 'text'],
  code: ['lang', 'code'],
  table: ['headers', 'rows'],
  list: ['style', 'items'],
  'token-ref': ['topic', 'section'],
};

/**
 * Fields a block kind may carry but does not need. Kept per kind rather than
 * globally: only a code block renders a `label`, so allowing it everywhere
 * would wave through the misspellings this check exists to catch.
 */
const OPTIONAL_BLOCK_FIELDS = {code: ['label']};

/**
 * Fields whose value has to be one of a set, because the renderer indexes on
 * it. An unlisted heading level renders at the wrong depth and an unlisted
 * list style resolves to undefined, so the value is checked, not just its
 * presence.
 */
const BLOCK_FIELD_VALUES = {
  heading: {level: [3, 4, 5, 6]},
  list: {style: ['ordered', 'unordered', 'do', 'dont']},
};

/** Keys a section may carry. */
const SECTION_FIELDS = ['title', 'category', 'content', 'previewType'];

/**
 * Check the fields the docs surfaces actually read. `parseDoc` is the outer
 * gate, but the reference-doc schema is a passthrough over `{name, type}` —
 * a doc with no `sections`, or a prose block whose `text` is misspelled,
 * passes it and reaches a reader as a missing section or a blank gap. Those
 * are hard to trace back from the rendered output, so they are caught here,
 * where the file that needs fixing can be named.
 *
 * @param {any} doc a parsed doc
 * @returns {string[]} problems, each already pointed at a place in the doc
 */
export function problemsInTopic(doc) {
  /** @type {string[]} */
  const problems = [];
  for (const field of ['name', 'title', 'description']) {
    if (typeof doc?.[field] !== 'string' || doc[field] === '') {
      problems.push(`${field}: expected a non-empty string`);
    }
  }
  if (typeof doc?.name === 'string' && !TOPIC_NAME_RE.test(doc.name)) {
    problems.push(
      `name: "${doc.name}" is not URL-safe. A topic name is its CLI argument and its docsite path, so it may hold only letters, digits, "_" and "-".`,
    );
  }
  if (!Array.isArray(doc?.sections) || doc.sections.length === 0) {
    problems.push('sections: expected at least one section');
    return problems;
  }

  doc.sections.forEach((/** @type {any} */ section, /** @type {number} */ s) => {
    const at = `sections[${s}]`;
    if (typeof section?.title !== 'string' || section.title === '') {
      problems.push(`${at}.title: expected a non-empty string`);
    }
    for (const key of Object.keys(section ?? {})) {
      if (!SECTION_FIELDS.includes(key)) {
        problems.push(`${at}.${key}: not a field of a section`);
      }
    }
    if (!Array.isArray(section?.content)) {
      problems.push(`${at}.content: expected an array of blocks`);
      return;
    }
    section.content.forEach((/** @type {any} */ block, /** @type {number} */ b) => {
      const blockAt = `${at}.content[${b}]`;
      const fields = /** @type {Record<string, string[]>} */ (BLOCK_FIELDS)[block?.type];
      if (fields == null) {
        problems.push(
          `${blockAt}.type: ${JSON.stringify(block?.type)} is not one of ${Object.keys(BLOCK_FIELDS).join(', ')}`,
        );
        return;
      }
      for (const field of fields) {
        const value = block[field];
        // Empty counts as missing, the way it does for the doc's own title: a
        // block whose text is '' passes every other check and renders as a gap.
        if (value == null) {
          problems.push(`${blockAt}.${field}: required for a ${block.type} block`);
        } else if (typeof value === 'string' && value.trim() === '') {
          problems.push(`${blockAt}.${field}: expected a non-empty string`);
        } else if (Array.isArray(value) && value.length === 0) {
          problems.push(`${blockAt}.${field}: expected a non-empty array`);
        }
      }
      const allowedValues =
        /** @type {Record<string, Record<string, unknown[]>>} */ (BLOCK_FIELD_VALUES)[block.type] ?? {};
      for (const [field, values] of Object.entries(allowedValues)) {
        const value = block[field];
        if (value != null && !values.includes(value)) {
          problems.push(
            `${blockAt}.${field}: ${JSON.stringify(value)} is not one of ${values.join(', ')}`,
          );
        }
      }
      // A table's cells are read by column index, so a short row renders blank
      // cells and a long one drops its tail — both silently.
      if (block.type === 'table' && Array.isArray(block.headers) && Array.isArray(block.rows)) {
        block.rows.forEach((/** @type {any} */ row, /** @type {number} */ r) => {
          if (!Array.isArray(row)) {
            problems.push(`${blockAt}.rows[${r}]: expected an array of cells`);
          } else if (row.length !== block.headers.length) {
            problems.push(
              `${blockAt}.rows[${r}]: has ${row.length} cells but the table has ${block.headers.length} headers`,
            );
          }
        });
      }
      // An unknown key is almost always a misspelled required one, and it
      // would otherwise reach a reader as a block that renders nothing.
      const allowed = [
        'type',
        ...fields,
        ...(/** @type {Record<string, string[]>} */ (OPTIONAL_BLOCK_FIELDS)[block.type] ?? []),
      ];
      for (const key of Object.keys(block)) {
        if (!allowed.includes(key)) {
          problems.push(`${blockAt}.${key}: not a field of a ${block.type} block`);
        }
      }
    });
  });
  return problems;
}

/**
 * Discover the topics contributed by a single loaded integration. Mirrors
 * `discoverIntegrationComponents`: walk the resolved root, take every
 * conventional doc file, and record what it declares. Unlike component
 * discovery this loads each doc, because a topic's name and its relationship
 * to an existing topic are fields inside the file.
 *
 * Errors are returned, not thrown: one unusable doc is reported as an issue
 * against its package while the rest of the CLI keeps working.
 *
 * @param {{name: string, docs?: string}} integration a loaded integration
 * @returns {Promise<{records: DocsTopicRecord[], errors: Error[]}>}
 */
export async function discoverIntegrationDocs(integration) {
  const docsDir = integration?.docs;
  /** @type {DocsTopicRecord[]} */
  const records = [];
  /** @type {Error[]} */
  const errors = [];
  if (!docsDir || !fs.existsSync(docsDir)) return {records, errors};

  /** @type {string[]} */
  const files = [];
  /** @param {string} dirPath */
  function scanDir(dirPath) {
    for (const entry of fs.readdirSync(dirPath, {withFileTypes: true})) {
      if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
      const full = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        scanDir(full);
      } else if (INTEGRATION_DOC_SUFFIXES.some(suffix => entry.name.endsWith(suffix))) {
        files.push(full);
      }
    }
  }
  scanDir(docsDir);
  files.sort();

  /** @type {Map<string, string>} */
  const seen = new Map();
  for (const file of files) {
    let doc;
    try {
      doc = parseDoc(await loadTopicModule(file), path.basename(file));
    } catch (err) {
      errors.push(new Error(`${path.relative(docsDir, file)}: ${/** @type {any} */ (err).message}`));
      continue;
    }
    const problems = problemsInTopic(doc);
    if (problems.length > 0) {
      errors.push(
        new Error(
          `${path.relative(docsDir, file)} is not a usable topic:\n${problems
            .map(problem => `  ${problem}`)
            .join('\n')}`,
        ),
      );
      continue;
    }
    const parsed = /** @type {any} */ (doc);
    // Two files claiming one name would collapse into a single entry, and the
    // one that lost would never be reachable. Named here, where both files are.
    const previous = seen.get(parsed.name);
    if (previous) {
      errors.push(
        new Error(
          `${path.relative(docsDir, file)} and ${previous} both define the topic "${parsed.name}". Each topic name is a URL and a CLI argument, so they have to be unique.`,
        ),
      );
      continue;
    }
    seen.set(parsed.name, path.relative(docsDir, file));
    if (parsed.replaces != null && parsed.extends != null) {
      errors.push(
        new Error(
          `${path.relative(docsDir, file)} declares both \`replaces\` and \`extends\`. A topic either takes another's place or merges onto it.`,
        ),
      );
      continue;
    }
    records.push({
      name: parsed.name,
      package: integration.name,
      path: file,
      title: parsed.title,
      description: parsed.description,
      category: parsed.category ?? null,
      replaces: parsed.replaces,
      extendsTopic: parsed.extends,
    });
  }

  return {records, errors};
}

/**
 * Merge an extension onto a base topic: a section whose title matches one in
 * the base replaces it, a section the base does not have is appended, and the
 * title/description are taken from the extension when it states them.
 *
 * Keyed by section TITLE rather than by position, the way the localization
 * overlays are — position keying grafts an overlay onto whichever section
 * happens to share its index, so a partial or reordered overlay corrupts
 * everything after it (#2182).
 *
 * @param {any} base
 * @param {any} overlay
 * @returns {any} a new doc; neither input is mutated
 */
export function mergeTopic(base, overlay) {
  const sections = [...(base.sections ?? [])];
  for (const section of overlay.sections ?? []) {
    const at = sections.findIndex((/** @type {any} */ s) => s.title === section.title);
    if (at === -1) sections.push(section);
    else sections[at] = section;
  }
  return {
    ...base,
    title: overlay.title || base.title,
    description: overlay.description || base.description,
    sections,
  };
}

/**
 * Every topic a project can read, and the relationships between them.
 *
 * Insertion order is the read order: the built-in topics in discovery order,
 * then whatever the configured integrations add, in the order they are
 * configured. A replacement keeps the position of the topic it replaced, so
 * "the first topic" stays stable for a reader that opens it by default.
 */
export class DocsCatalog {
  /** @type {Map<string, DocsTopicEntry>} */
  #topics = new Map();
  /** @type {Map<string, string>} old topic name → the name that replaced it */
  #aliases = new Map();

  /**
   * Seed a catalog with the CLI's own topics.
   * @param {Record<string, string>} [builtins] topic name → absolute path
   * @returns {DocsCatalog}
   */
  static fromBuiltins(builtins = discoverBuiltinTopics()) {
    const catalog = new DocsCatalog();
    for (const [name, file] of Object.entries(builtins)) {
      catalog.#topics.set(name, {
        name,
        package: BUILTIN_DOCS_PACKAGE,
        path: file,
        extensions: [],
      });
    }
    return catalog;
  }

  /**
   * Add one integration-contributed doc, honoring what it declares. Returns
   * the issue it caused, or null when it applied cleanly — the caller owns
   * routing (an `error` skips the contribution, a `warning` keeps it).
   *
   * @param {DocsTopicRecord} record
   * @returns {import('../integrations/issue').AstryxIntegrationIssue | null}
   */
  add(record) {
    if (record.extendsTopic != null) {
      const target = this.resolve(record.extendsTopic);
      if (!target) {
        return {
          code: 'invalid_doc',
          severity: 'error',
          message: `"${record.name}" extends "${record.extendsTopic}", which is not a topic in this project.`,
        };
      }
      target.extensions.push({package: record.package, path: record.path});
      return null;
    }

    if (record.replaces != null) {
      const target = this.resolve(record.replaces);
      if (!target) {
        return {
          code: 'invalid_doc',
          severity: 'error',
          message: `"${record.name}" replaces "${record.replaces}", which is not a topic in this project.`,
        };
      }
      /** @type {import('../integrations/issue').AstryxIntegrationIssue | null} */
      let warning = null;
      if (target.package !== BUILTIN_DOCS_PACKAGE) {
        // Two integrations replacing one topic is a real configuration, not a
        // broken one: the later-configured package wins, the way the last
        // writer does everywhere else. Both are named so the loser is visible.
        warning = {
          code: 'duplicate_doc',
          severity: 'warning',
          message: `Topic "${record.replaces}" is replaced by both ${target.package} and ${record.package}. ${record.package} is configured later, so it wins.`,
        };
      }
      // The replacement takes the base topic's slot, so a reader that opens
      // the first topic (or the nth) sees the same one it did before.
      const replaced = target.name;
      this.#replaceAt(replaced, {
        name: record.name,
        package: record.package,
        path: record.path,
        title: record.title,
        description: record.description,
        category: record.category,
        replaces: replaced,
        // Extensions were authored against the content that just went away.
        extensions: [],
      });
      if (record.name !== replaced) {
        this.#aliases.set(replaced, record.name);
        // A topic renamed twice keeps every name it has ever answered to.
        for (const [from, to] of this.#aliases) {
          if (to === replaced) this.#aliases.set(from, record.name);
        }
      }
      return warning;
    }

    const existing = this.#topics.get(record.name);
    if (existing) {
      return {
        code: 'invalid_doc',
        severity: 'error',
        message: `Topic "${record.name}" is already provided by ${existing.package}. Give it another name, or declare \`replaces: '${record.name}'\` to take its place.`,
      };
    }
    this.#topics.set(record.name, {
      name: record.name,
      package: record.package,
      path: record.path,
      title: record.title,
      description: record.description,
      category: record.category,
      extensions: [],
    });
    return null;
  }

  /**
   * Look a topic up by name, case-insensitively, following the alias a renamed
   * replacement left behind.
   * @param {unknown} name
   * @returns {DocsTopicEntry | undefined}
   */
  resolve(name) {
    if (typeof name !== 'string') return undefined;
    let key = name.toLowerCase();
    // An alias chain is at most as long as the number of replacements, and a
    // cycle can only come from a bug here; bound the walk either way.
    for (let hops = 0; hops <= this.#aliases.size; hops++) {
      const entry = this.#topics.get(key);
      if (entry) return entry;
      const next = this.#aliases.get(key);
      if (next == null) return undefined;
      key = next;
    }
    return undefined;
  }

  /** @returns {string[]} every topic name, in read order */
  names() {
    return [...this.#topics.keys()];
  }

  /** @returns {DocsTopicEntry[]} every topic, in read order */
  entries() {
    return [...this.#topics.values()];
  }

  /**
   * Swap an entry in place, preserving its position in the read order.
   * @param {string} name
   * @param {DocsTopicEntry} entry
   */
  #replaceAt(name, entry) {
    /** @type {Map<string, DocsTopicEntry>} */
    const next = new Map();
    for (const [key, value] of this.#topics) {
      if (key === name) next.set(entry.name, entry);
      else next.set(key, value);
    }
    this.#topics = next;
  }
}
