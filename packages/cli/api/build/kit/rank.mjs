// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The page ranker behind `build`'s START: which page template an idea
 * should start from, and whether the idea asks for a page at all.
 *
 * @input A free-text idea, the project's ready page templates (id, display
 *   name, description, keywords, `Family - Variant` category) and its
 *   components (name, keywords), all read from each item's own descriptor.
 * @output Every template, ranked, with the query terms it matched and whether
 *   the idea names its family; `ideaKind`, whether the idea asks for a page, a
 *   part of one, or a change to a page the builder has; `pickStart` turns both
 *   into a template or null.
 * @position Beside kit.mjs (api/build/kit/). Search ranks components, docs,
 *   blocks and pages against short lookups; this ranks only page templates,
 *   against the long descriptions builders actually write ("ops dashboard with
 *   a KPI row, a sortable table and a trend chart"). Search's scorer is left
 *   alone: its callers depend on its scores.
 *
 * Why a separate ranker. Real `build` queries run to fifteen words or more.
 * Search scores a page on its single strongest term plus a garnish, so one
 * incidental word decides: "status" picks the project-status dashboard,
 * "board" picks the kanban board for a game board. Here every matched term
 * counts, weighted by how rare it is among page templates (inverse document
 * frequency), so the page that answers more of the idea — and its rarer words —
 * wins. Structural signals sit on top:
 *
 * - The head noun. The words before the first "with", ":" or "," name what
 *   the page is ("audit dashboard: dense table with …"); a family word there
 *   outweighs the same word among the parts.
 * - The container. In "draft history in a modal", the modal is the page's
 *   frame, and a template is its frame; container words count double, and a
 *   container match is evidence enough to start from. Only an overlay frame
 *   counts: "inside a data card" names a component the part lives in, and "in
 *   an existing dashboard" names the page being changed.
 * - Phrase heads. In "side-by-side product response", "product" describes the
 *   response; it is not a product page. A word that only ever modifies the
 *   next one counts half, unless the template names the same pair
 *   ("executive summary").
 * - The family base. A template whose id is its family's name (`dashboard`,
 *   `settings`) is that family's default. A variant displaces it only with two
 *   matched terms of its own ("a small comparison note" does not make a
 *   dashboard the comparison dashboard), and a base too weak to start on its
 *   own displaces no variant ("a funnel for a dashboard" is the funnel).
 *
 * Parts (spec:AST-048/FR3). "A date range picker" asks for a part of a page,
 * not a page, and the system's own components say what a part is: an idea
 * whose head noun is a word of a component's name or keywords, Core's or an
 * integration's, asks for that part, unless the noun is a family word ("a data
 * table") or the idea lists a page's worth of pieces. Words search drops as
 * stopwords ("page", "screen", "app", "view") name no component, so "a calendar
 * page" asks for a page and "a calendar" for a part. A part starts from the
 * base template of the family the idea names ("an empty state for a settings
 * page"), else from the app shell. An idea that changes a page or part the
 * builder already has starts from the app shell too: that page is the
 * builder's to keep (FR9), and no template scaffolds it. "Existing" marks one
 * when its phrase names a page family or a component ("add a column to the
 * existing table"), unless the idea asks for a new page ("a new dashboard like
 * the existing dashboard", "clone the existing dashboard as a new page"). A
 * bare "existing" phrase that names a page ("existing reports dashboard with a
 * date filter") reads as the builder's own page.
 *
 * Family words come from the templates' own ids — a word in the ids of two or
 * more templates of one family, plus the family's name when a template carries
 * it — never from a list kept here or from synonyms, so an integration's
 * templates join the vocabulary by being named like their family, and "a
 * landing page" is not a hero because "landing" is a synonym of "hero".
 */

import {stem, STOPWORDS, SYNONYMS} from '../../search/search.mjs';

/**
 * How much a term counts by where the template names it. The id and category
 * are the author's own label for what the page is; its keywords name the ideas
 * it serves; its description describes the layout.
 */
const FIELD_WEIGHT = {
  id: 3,
  variant: 3,
  family: 2,
  display: 2,
  keywords: 2,
  description: 1,
};
/**
 * A synonym hit counts half a direct hit: a synonym says the idea is near the
 * page, not that it names it.
 */
const SYNONYM_SHARE = 0.5;
/**
 * A container word ("in a modal") counts double: it names the page's frame,
 * which is what a template is.
 */
const CONTAINER = 2;
/**
 * A word that only modifies another ("product" in "product response") counts
 * half: it describes its head, not the page.
 */
const MODIFIER = 0.5;
/**
 * Added when the idea's head names the template's family: more than any one
 * word scores (an id word only one template carries is worth about ten), so the
 * head's family outranks a rarer word among the parts.
 */
const HEAD_FAMILY = 12;
/**
 * Added when the family is named anywhere else in the idea: about a description
 * word, enough to settle a near tie.
 */
const BODY_FAMILY = 2;
/**
 * Added to a family's base template when the idea names that family: settles a
 * near tie toward the family's default page.
 */
const FAMILY_BASE = 2;
/**
 * The least a start must score, and the evidence it needs: two matched terms,
 * or the idea naming its family. One rare word alone is how a tic-tac-toe game
 * board became a kanban board, and it is also too little for a variant to
 * displace its family's base template.
 */
const START_SCORE = 10;
const START_TERMS = 2;
/**
 * How many listed pieces make an idea a page: a part is one thing with a detail
 * or two ("a status pill with a tooltip"), while three pieces, two commas
 * apart, describe a page.
 */
const PAGE_PIECES = 3;

/**
 * Words search drops that name layout: "side navigation", "side by side".
 */
const LAYOUT_WORDS = new Set(['side']);

/**
 * Where an idea's head ends: its first clause, before the parts it lists.
 */
const HEAD_END =
  /:|,|;|\(|\s[-\u2013\u2014]\s|\b(?:with|showing|listing|for|that|where|plus|including|containing|featuring|which|to|from|of)\b/i;

/**
 * Frames a page can live in, above whatever is underneath. A container phrase
 * counts only when it names one of these.
 */
const OVERLAY_FRAMES = new Set([
  'modal',
  'dialog',
  'drawer',
  'sheet',
  'popup',
  'overlay',
]);

/**
 * The word that marks a page or part the builder already has, when its phrase
 * names one (see `changesExistingPage`).
 */
const EXISTING = /\bexisting\b/i;

/**
 * The word that marks an idea asking for a new page ("a new dashboard", "as a
 * new page"), which is never a change to one the builder has.
 */
const NEW = /\bnew\b/;

/**
 * The family whose templates are app chrome rather than page content: the
 * explicit `Shell -` category (architecture:template-authoring/INV7).
 */
const SHELL_FAMILY = 'Shell';

/** A container phrase: "in a modal", "inside the side panel". */
const CONTAINER_PHRASE =
  /\b(?:in|inside|within)\s+(?:a|an|the)\s+([a-z-]+)(?:\s+([a-z-]+))?/gi;

/**
 * Where a phrase ends, for finding the word that heads it: punctuation and
 * the words that join phrases.
 */
const PHRASE_END =
  /[^a-z0-9\s-]+|\s(?:and|or|with|for|of|to|in|on|at|by|from|the|a|an|plus)\s/;

/** @param {string} t */
const isContentWord = t =>
  t.length >= 2 && (LAYOUT_WORDS.has(t) || !STOPWORDS.has(t));

/**
 * Content terms of a text: lowercase alphanumeric words, stopwords removed,
 * stemmed.
 * @param {string} text
 * @returns {string[]}
 */
function terms(text) {
  return (
    String(text)
      .toLowerCase()
      .match(/[a-z0-9]+/g) ?? []
  )
    .filter(isContentWord)
    .map(stem);
}

/**
 * The terms of an idea that only ever modify another word, each with the words
 * it modifies: in each phrase the last content word is its head, and the ones
 * before it describe the next.
 * @param {string} query
 * @returns {Map<string, Set<string>>}
 */
function modifiersOf(query) {
  const heads = new Set();
  /** @type {Map<string, Set<string>>} */
  const modifiers = new Map();
  for (const phrase of String(query).toLowerCase().split(PHRASE_END)) {
    const words = terms(phrase);
    words.forEach((w, i) => {
      if (i === words.length - 1) heads.add(w);
      else modifiers.set(w, (modifiers.get(w) ?? new Set()).add(words[i + 1]));
    });
  }
  for (const h of heads) modifiers.delete(h);
  return modifiers;
}

/**
 * Adjacent term pairs a text names, "a b", for telling a template that names
 * a whole compound ("executive summary") from one that names only its parts.
 * @param {string[]} texts
 * @returns {Set<string>}
 */
function pairsOf(texts) {
  const pairs = new Set();
  for (const text of texts) {
    for (const phrase of String(text).toLowerCase().split(PHRASE_END)) {
      const words = terms(phrase);
      for (let i = 1; i < words.length; i++)
        pairs.add(`${words[i - 1]} ${words[i]}`);
    }
  }
  return pairs;
}

/**
 * The terms of an idea that name its frame: "modal" in "in a modal". A card, a
 * table or an existing page after "in a" is where a part goes, not a frame.
 * @param {string} query
 * @returns {Set<string>}
 */
function containersOf(query) {
  const found = new Set();
  for (const m of String(query).matchAll(CONTAINER_PHRASE)) {
    for (const t of terms(`${m[1]} ${m[2] ?? ''}`)) {
      if (OVERLAY_FRAMES.has(t)) found.add(t);
    }
  }
  return found;
}

/** @param {string} text */
const normalized = text =>
  (
    String(text)
      .toLowerCase()
      .match(/[a-z0-9]+/g) ?? []
  ).join(' ');

/** Stemmed synonym lookup built from search's vocabulary, both directions. */
const SYNONYMS_OF = (() => {
  /** @type {Map<string, Set<string>>} */
  const index = new Map();
  /** @param {string} a @param {string} b */
  const add = (a, b) => {
    const set = index.get(a) ?? new Set();
    set.add(b);
    index.set(a, set);
  };
  for (const [key, values] of Object.entries(SYNONYMS)) {
    const k = stem(key);
    for (const value of values) {
      const v = stem(value);
      add(k, v);
      add(v, k);
      for (const other of values) if (other !== value) add(v, stem(other));
    }
  }
  return index;
})();

/**
 * @typedef {import('../_adapter.mjs').PageTemplate} PageTemplate
 * @typedef {import('../_adapter.mjs').ComponentWords} ComponentWords
 * @typedef {{name: string, score: number, hits: number, familyNamed: boolean, containerMatched: boolean, family: string, base: boolean, matched: Set<string>}} RankedPage
 * @typedef {'page' | 'part' | 'edit'} IdeaKind
 */

/** @param {PageTemplate} page */
const familyOf = page => (page.category.split(' - ')[0] ?? '').trim();

/**
 * Family words, from the templates' own ids: a word in the ids of two or more
 * templates of one family, plus the family's name when a template carries it.
 * Each word maps to its family.
 * @param {PageTemplate[]} pages
 * @returns {Map<string, string>}
 */
function familyWordsOf(pages) {
  /** @type {Map<string, Map<string, number>>} */
  const idWords = new Map();
  for (const page of pages) {
    const family = familyOf(page);
    const counts = idWords.get(family) ?? new Map();
    for (const w of new Set(page.name.split('-'))) {
      if (w.length >= 3) counts.set(stem(w), (counts.get(stem(w)) ?? 0) + 1);
    }
    idWords.set(family, counts);
  }
  /** @type {Map<string, string>} */
  const familyOfWord = new Map();
  for (const [family, counts] of idWords) {
    const heads = [...counts].filter(([, c]) => c >= 2).map(([w]) => w);
    const name = normalized(family).split(' ').pop() ?? '';
    if (name.length >= 3 && counts.has(stem(name))) heads.push(stem(name));
    for (const head of heads) {
      if (!familyOfWord.has(head)) familyOfWord.set(head, family);
    }
  }
  return familyOfWord;
}

/**
 * Rank page templates against an idea, best first. Ties go to the template
 * with the shorter id (the family's broader page), then by name.
 *
 * @param {string} query
 * @param {PageTemplate[]} pages
 * @returns {RankedPage[]}
 */
export function rankPages(query, pages) {
  const docs = pages.map(page => {
    const [family = '', ...variantParts] = page.category.split(' - ');
    /** @type {Record<keyof typeof FIELD_WEIGHT, string>} */
    const fields = {
      id: page.name.replace(/-/g, ' '),
      variant: variantParts.join(' - '),
      family,
      display: page.displayName,
      // Each keyword is its own phrase: a pair never spans two of them.
      keywords: (page.keywords ?? []).join(', '),
      description: page.description,
    };
    /** @type {Map<string, number>} */
    const bag = new Map();
    for (const [field, text] of Object.entries(fields)) {
      const weight =
        FIELD_WEIGHT[/** @type {keyof typeof FIELD_WEIGHT} */ (field)];
      for (const t of terms(text))
        bag.set(t, Math.max(bag.get(t) ?? 0, weight));
    }
    return {
      page,
      family: family.trim(),
      bag,
      pairs: pairsOf(Object.values(fields)),
    };
  });

  // Inverse document frequency over page templates: a word every dashboard
  // carries says less than one only the funnel carries.
  /** @type {Map<string, number>} */
  const df = new Map();
  for (const {bag} of docs)
    for (const t of bag.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const n = docs.length;
  /** @param {string} t */
  const idf = t => {
    const d = df.get(t);
    return d ? Math.log(1 + (n - d + 0.5) / (d + 0.5)) : 0;
  };

  const familyOfWord = familyWordsOf(pages);
  /** @param {string[]} ts */
  const familiesIn = ts =>
    new Set(ts.filter(t => familyOfWord.has(t)).map(t => familyOfWord.get(t)));

  const queryTerms = [...new Set(terms(query))];
  const headFamilies = familiesIn(
    terms(String(query).split(HEAD_END)[0] ?? ''),
  );
  const namedFamilies = familiesIn(queryTerms);
  const modifiers = modifiersOf(query);
  const containers = containersOf(query);

  const ranked = docs
    .map(({page, family, bag, pairs}) => {
      let score = 0;
      let hits = 0;
      let containerMatched = false;
      /** @type {Set<string>} */
      const matched = new Set();
      for (const t of queryTerms) {
        // A modifier is discounted where the template names it outright; a
        // synonym hit is already discounted by SYNONYM_SHARE.
        const modified = modifiers.get(t);
        const discounted =
          modified !== undefined &&
          ![...modified].some(n => pairs.has(`${t} ${n}`));
        const direct = idf(t) * (bag.get(t) ?? 0) * (discounted ? MODIFIER : 1);
        let viaSynonym = 0;
        for (const s of SYNONYMS_OF.get(t) ?? []) {
          if (queryTerms.includes(s)) continue;
          viaSynonym = Math.max(
            viaSynonym,
            SYNONYM_SHARE * idf(s) * (bag.get(s) ?? 0),
          );
        }
        const value =
          Math.max(direct, viaSynonym) * (containers.has(t) ? CONTAINER : 1);
        if (value > 0) {
          score += value;
          hits++;
          matched.add(t);
          if (containers.has(t)) containerMatched = true;
        }
      }
      const familyNamed = namedFamilies.has(family);
      if (headFamilies.has(family)) score += HEAD_FAMILY;
      else if (familyNamed) score += BODY_FAMILY;
      const base = normalized(page.name) === normalized(family);
      if (familyNamed && base) score += FAMILY_BASE;
      return {
        name: page.name,
        score,
        hits,
        familyNamed,
        containerMatched,
        family,
        base,
        matched,
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.name.split('-').length - b.name.split('-').length ||
        a.name.localeCompare(b.name),
    );
  return baseFirst(ranked);
}

/**
 * Put a named family's base template ahead of the variant that outranks it,
 * unless the variant matched START_TERMS terms the base did not, or the base
 * scores too little to start on its own.
 * @param {RankedPage[]} ranked
 * @returns {RankedPage[]}
 */
function baseFirst(ranked) {
  const top = ranked[0];
  if (!top || top.base || !top.familyNamed) return ranked;
  const base = ranked.find(r => r.base && r.family === top.family);
  if (!base || base.score < START_SCORE) return ranked;
  const own = [...top.matched].filter(t => !base.matched.has(t)).length;
  return own >= START_TERMS
    ? ranked
    : [base, ...ranked.filter(r => r !== base)];
}

/**
 * What an idea asks for (spec:AST-048/FR3): a whole `page`; a `part` of one,
 * when its head noun names one of the system's components and it lists fewer
 * than PAGE_PIECES pieces; or an `edit` of a page the builder already has.
 *
 * @param {string} query
 * @param {PageTemplate[]} pages
 * @param {ComponentWords[]} components
 * @returns {IdeaKind}
 */
export function ideaKind(query, pages, components) {
  const text = String(query);
  const familyWords = familyWordsOf(pages);
  if (changesExistingPage(text, familyWords, components)) return 'edit';
  // The head's last word, page words included: "calendar" is the noun of "a
  // calendar", "page" the noun of "a calendar page". An overlay frame names
  // where the thing lives, not the thing: "drafts" is the noun of "drafts in
  // a modal".
  const head = (text.split(HEAD_END)[0] ?? '').replace(CONTAINER_PHRASE, m =>
    containersOf(m).size > 0 ? ' ' : m,
  );
  const words = (head.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(
    w => w.length >= 2,
  );
  const noun = stem(words[words.length - 1] ?? '');
  if (familyWords.has(noun)) return 'page';
  const pieces = (text.match(/,/g) ?? []).length + 1;
  if (pieces >= PAGE_PIECES) return 'page';
  return components.some(c => componentTerms(c).includes(noun))
    ? 'part'
    : 'page';
}

/**
 * Whether an idea changes a page or part the builder already has: "existing"
 * in the same phrase as a word that names a family of page templates or one of
 * the system's components ("the existing incidents table", "the existing
 * banner"). A new page "inspired by the existing one", or "existing users" on a
 * new page, names neither, and an idea that asks for a new page is no change
 * whatever it names.
 * @param {string} text
 * @param {Map<string, string>} familyWords
 * @param {ComponentWords[]} components
 * @returns {boolean}
 */
function changesExistingPage(text, familyWords, components) {
  const componentWords = new Set(components.flatMap(nameTerms));
  const phrases = text.toLowerCase().split(PHRASE_END);
  if (asksNewPage(phrases, familyWords)) return false;
  return phrases.some(phrase => {
    const at = phrase.search(EXISTING);
    return (
      at >= 0 &&
      terms(phrase.slice(at)).some(
        t => familyWords.has(t) || componentWords.has(t),
      )
    );
  });
}

/**
 * Whether an idea asks for a new page: "new" before a word that names a family
 * of page templates ("a new dashboard"), or before only words search drops,
 * such as "page" ("as a new page"). "A new column" asks for a part.
 * @param {string[]} phrases
 * @param {Map<string, string>} familyWords
 * @returns {boolean}
 */
function asksNewPage(phrases, familyWords) {
  return phrases.some(phrase => {
    const at = phrase.search(NEW);
    if (at < 0) return false;
    const after = terms(phrase.slice(at + 'new'.length));
    return after.length === 0 || familyWords.has(after[0]);
  });
}

/**
 * Whether an idea asks for a new page (see `asksNewPage`), from the idea and
 * the project's page templates.
 * @param {string} query
 * @param {PageTemplate[]} pages
 * @returns {boolean}
 */
export function asksForNewPage(query, pages) {
  return asksNewPage(
    String(query).toLowerCase().split(PHRASE_END),
    familyWordsOf(pages),
  );
}

/**
 * The words of a component's name: "DateRangeInput" is date, range, input.
 * @param {ComponentWords} component
 * @returns {string[]}
 */
function nameTerms(component) {
  return terms(component.name.replace(/([a-z0-9])([A-Z])/g, '$1 $2'));
}

/**
 * The terms a component answers to: the words of its name and of its keywords.
 * @param {ComponentWords} component
 * @returns {string[]}
 */
function componentTerms(component) {
  return [
    ...nameTerms(component),
    ...component.keywords.flatMap(keyword => terms(keyword)),
  ];
}

/**
 * The next closest templates after the start, best first: the ones a reader
 * should check the idea against when the start's shape is wrong. Each matched
 * at least one term and scored at least half of what a start needs.
 *
 * @param {RankedPage[]} ranked
 * @param {string} startName
 * @param {number} [count]
 * @returns {RankedPage[]}
 */
export function pickAlternatives(ranked, startName, count = 2) {
  return ranked
    .filter(
      r => r.name !== startName && r.hits > 0 && r.score >= START_SCORE / 2,
    )
    .slice(0, count);
}

/**
 * The template to start from, or null for the kit's neutral app shell. A page
 * needs evidence to lead: two matched terms, the idea naming the template's
 * family, or its container. A part starts from the base template of the family
 * the idea places it in, else from the app shell (spec:AST-048/FR3); an edit of
 * a page the builder already has starts from the app shell (FR9). Either way,
 * the app shell is the shell template the idea describes when one leads.
 *
 * @param {RankedPage[]} ranked
 * @param {IdeaKind} [kind]
 * @returns {RankedPage | null}
 */
export function pickStart(ranked, kind = 'page') {
  if (kind !== 'page') {
    const host = kind === 'part' && ranked.find(r => r.base && r.familyNamed);
    if (host) return host;
    // Otherwise the app shell (FR2): the shell template the idea describes
    // when one leads ("a frame with sidebar navigation"), else none, for the
    // kit's neutral fallback.
    const lead = pickStart(ranked);
    return lead?.family === SHELL_FAMILY ? lead : null;
  }
  const top = ranked[0];
  if (!top || top.score < START_SCORE) return null;
  return top.hits >= START_TERMS || top.familyNamed || top.containerMatched
    ? top
    : null;
}
