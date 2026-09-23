// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Stable section keys, section lookup, and the topic index.
 *
 * @input Reference-doc sections, each with an optional authored `id`.
 * @output The key a section is addressed by (its `id`, else a kebab-case key
 *   derived from its authored title), lookup by key or title, and the compact
 *   index a topic-only docs read returns.
 * @position Shared by docs discovery (which rejects colliding keys before a
 *   reader sees them), the docs leaves (index, section, detail), and Doctor
 *   (output budgets). Imports nothing from discovery, so both can use it.
 */

/** A stable key: lowercase letters and digits, joined by single hyphens. */
export const SECTION_KEY_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** The longest summary an index entry carries, in characters. */
export const SECTION_SUMMARY_MAX = 240;

/**
 * A section's authored title. A `--zh`/`--dense` overlay replaces the visible
 * title, but extensions are written against the authored one and keys derive
 * from it, so both stay the same in every language.
 */
const SOURCE_TITLE = Symbol('astryx.docs.sourceTitle');

/**
 * Record the authored title of a section whose visible title a translation
 * overlay replaces.
 * @template {object} T
 * @param {T} section
 * @param {string} title
 * @returns {T}
 */
export function withSourceTitle(section, title) {
  Object.defineProperty(section, SOURCE_TITLE, {value: title, configurable: true});
  return section;
}

/**
 * @param {any} section
 * @returns {string}
 */
export function sourceTitle(section) {
  return section?.[SOURCE_TITLE] ?? section?.title;
}

/**
 * The key a title derives: accents folded, `&` spelled out, and every other
 * run of non-alphanumerics collapsed to one hyphen. Empty when the title has
 * no Latin letters or digits to derive from.
 * @param {unknown} title
 * @returns {string}
 */
export function sectionTitleKey(title) {
  if (typeof title !== 'string') return '';
  return title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * The key a section is addressed by: its authored `id`, else the key its
 * authored title derives.
 * @param {any} section
 * @returns {string}
 */
export function sectionKey(section) {
  return typeof section?.id === 'string'
    ? section.id
    : sectionTitleKey(sourceTitle(section));
}

/**
 * Problems with the keys of a topic's sections: an authored id that is not a
 * stable key, a title no key derives from, and two sections sharing a key.
 * Keys are never suffixed to make them unique, because readers link to them.
 * @param {any[]} sections
 * @returns {string[]}
 */
export function sectionKeyProblems(sections) {
  /** @type {string[]} */
  const problems = [];
  /** @type {Map<string, number>} */
  const seen = new Map();
  sections.forEach((section, s) => {
    const at = `sections[${s}]`;
    // A missing title is reported where titles are checked; no key to judge.
    if (
      section?.id == null &&
      (typeof section?.title !== 'string' || section.title === '')
    ) {
      return;
    }
    if (
      section?.id != null &&
      (typeof section.id !== 'string' || !SECTION_KEY_RE.test(section.id))
    ) {
      problems.push(
        `${at}.id: ${JSON.stringify(section.id)} is not a stable key. Use lowercase letters and digits joined by single hyphens.`,
      );
      return;
    }
    const key = sectionKey(section);
    if (key === '') {
      problems.push(
        `${at}: no key derives from the title ${JSON.stringify(section?.title)}. Give the section an id.`,
      );
      return;
    }
    const first = seen.get(key);
    if (first != null) {
      problems.push(
        `${at}: the key "${key}" is already used by sections[${first}]. Give one of them a distinct id or title.`,
      );
      return;
    }
    seen.set(key, s);
  });
  return problems;
}

/**
 * Stamp every section with the key it is addressed by. Runs only after
 * extensions merge: a derived key must never take part in merge matching.
 * @template {{sections: any[]}} T
 * @param {T} doc
 * @returns {T}
 */
export function withSectionKeys(doc) {
  return {
    ...doc,
    sections: doc.sections.map(section =>
      section.id != null
        ? section
        : withSourceTitle(
            {...section, id: sectionKey(section)},
            sourceTitle(section),
          ),
    ),
  };
}

/**
 * Find the section a reader asked for: by key, then by exact title (or the
 * key the query derives), then by a title that contains the query. More than
 * one match is refused rather than guessed.
 * @param {any[]} sections
 * @param {string} query
 * @returns {{section: any | null, candidates: any[]}} `candidates` lists the
 *   matches when the query is ambiguous, and is empty when nothing matches
 */
export function findDocSection(sections, query) {
  const wanted = query.trim();
  const byKey = sections.find(section => sectionKey(section) === wanted);
  if (byKey) return {section: byKey, candidates: []};

  const lower = wanted.toLowerCase();
  const derived = sectionTitleKey(wanted);
  const exact = sections.filter(
    section =>
      section.title.toLowerCase() === lower ||
      (derived !== '' && sectionTitleKey(sourceTitle(section)) === derived),
  );
  if (exact.length === 1) return {section: exact[0], candidates: []};
  if (exact.length > 1) return {section: null, candidates: exact};

  const partial = sections.filter(section =>
    section.title.toLowerCase().includes(lower),
  );
  if (partial.length === 1) return {section: partial[0], candidates: []};
  return {section: null, candidates: partial};
}

/**
 * One line that says what a section holds: its first prose or list text,
 * whitespace collapsed, cut at a word boundary.
 * @param {any} section
 * @param {number} [max]
 * @returns {string}
 */
export function sectionSummary(section, max = SECTION_SUMMARY_MAX) {
  const first = (section?.content ?? []).find(
    (/** @type {any} */ block) =>
      (block?.type === 'prose' && typeof block.text === 'string') ||
      (block?.type === 'list' && Array.isArray(block.items)),
  );
  const raw =
    first == null ? '' : first.type === 'prose' ? first.text : first.items[0];
  const text = String(raw ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${(space > max / 2 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

/**
 * The index a topic-only read returns: what the topic is, and one entry per
 * section with the key to read it by.
 * @param {{name: string, title: string, description: string, sections: any[]}} doc
 * @returns {import('../../api/docs/docs.type.mjs').DocsIndex}
 */
export function buildDocsIndexData(doc) {
  return {
    topic: doc.name,
    title: doc.title,
    description: doc.description,
    sections: doc.sections.map(section => ({
      id: sectionKey(section),
      title: section.title,
      summary: sectionSummary(section),
    })),
  };
}
