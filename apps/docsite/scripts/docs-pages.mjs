// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docs-pages.mjs
 *
 * How the CLI's docs become docsite pages. The CLI splits a long topic into a
 * docs-tree namespace of short guides, so an agent can read one guide at a
 * time. A human reader keeps one full page per topic, at the same URL and in
 * the same sidebar spot, whatever the split.
 *
 * @input A docs reader with the CLI docs API's shape
 *   (`docs(topic, section, options)` from `@astryxdesign/cli/api`) and the
 *   flat topics the site already built.
 * @output Doc pages ({topic, title, description, category, sections}) and
 *   redirects from each guide's own slug to its section on the full page.
 * @position Used by generate-data.mjs; tested on its own with a fake reader.
 */

/**
 * Root namespaces that have no page of their own at their slug: /docs/cli is
 * the @astryxdesign/cli package page. Their pages are listed in
 * GUIDE_NAMESPACE_PAGES; a guide below them that no such page holds keeps a
 * page of its own.
 */
export const GUIDE_PAGE_NAMESPACES = new Set(['cli']);

const BUILDING_BLOCKS = 'cli/integrations/building-blocks';

/**
 * The pages a root namespace in GUIDE_PAGE_NAMESPACES shows. Each is one full
 * page of the namespace or guide at `route`, at `slug` (the route with "/" as
 * "-" unless given), so every guide slug below it redirects to its section
 * there. A page leaves out what the other pages in its list hold. `aliases`
 * are older slugs that redirect to the page. A page that names a `parent`
 * shows under that page in the sidebar, in list order.
 *
 * CLI Integrations is the integration guide's overview and quick start. Each
 * building block, shipping, and troubleshooting is a page under it, so the
 * sidebar keeps one entry for the guide and no page holds all of it.
 * @type {Map<string, Array<{route: string, slug?: string, title?: string, aliases?: string[], parent?: string}>>}
 */
export const GUIDE_NAMESPACE_PAGES = new Map([
  [
    'cli',
    [
      {
        route: 'cli/integrations',
        slug: 'cli-integrations',
        title: 'CLI Integrations',
        aliases: ['cli-integrations-overview'],
      },
      {route: `${BUILDING_BLOCKS}/components`, parent: 'cli-integrations'},
      {route: `${BUILDING_BLOCKS}/templates`, parent: 'cli-integrations'},
      {route: `${BUILDING_BLOCKS}/themes`, parent: 'cli-integrations'},
      {
        route: `${BUILDING_BLOCKS}/docs`,
        slug: 'cli-writing-docs',
        title: 'Writing docs',
        aliases: ['cli-integrations-docs-add-a-topic'],
        parent: 'cli-integrations',
      },
      {route: `${BUILDING_BLOCKS}/codemods`, parent: 'cli-integrations'},
      {route: `${BUILDING_BLOCKS}/configuration`, parent: 'cli-integrations'},
      {route: 'cli/integrations/ship', parent: 'cli-integrations'},
      {
        route: 'cli/integrations/help',
        title: 'Troubleshooting',
        parent: 'cli-integrations',
      },
    ],
  ],
]);

/**
 * Flat topics that show under another page in the sidebar, after that page's
 * own pages: the Authoring Reference is the field-by-field reference for the
 * files the integration guide has you write.
 */
export const TOPIC_PARENTS = new Map([['authoring', 'cli-integrations']]);

/**
 * The page specs of a GUIDE_PAGE_NAMESPACES root, ready for namespacePage:
 * each with the routes the other pages hold in `except`, and its place in the
 * list as `order`.
 * @param {string} root
 * @returns {Array<{route: string, slug?: string, title?: string, aliases?: string[], parent?: string, except: string[], order: number}>}
 */
export function guideNamespacePages(root) {
  const specs = GUIDE_NAMESPACE_PAGES.get(root) ?? [];
  return specs.map((spec, order) => ({
    ...spec,
    except: specs
      .filter(other => other.route.startsWith(`${spec.route}/`))
      .map(other => other.route),
    order,
  }));
}

/**
 * Nest pages under the pages they name as parent: a page from
 * GUIDE_NAMESPACE_PAGES keeps its `parent` and `order`, and a flat topic in
 * TOPIC_PARENTS goes after them. The docsite build fails when a parent is not
 * a page, or is itself under another page.
 * @param {Array<{topic: string, parent?: string, order?: number}>} topics
 */
export function nestPages(topics) {
  const bySlug = new Map(topics.map(topic => [topic.topic, topic]));
  let next = 1000;
  for (const [slug, parent] of TOPIC_PARENTS) {
    const topic = bySlug.get(slug);
    if (!topic) continue;
    topic.parent = parent;
    topic.order = next++;
  }
  for (const topic of topics) {
    if (topic.parent == null) continue;
    const parent = bySlug.get(topic.parent);
    if (!parent || parent.parent != null) {
      throw new Error(
        `docs: "${topic.topic}" shows under "${topic.parent}", which is not a top-level page.`,
      );
    }
  }
  return topics;
}

/**
 * Flat topics whose full text the site shows on another topic's page. The
 * theme split (before namespaces) left `theme` as a short overview and moved
 * its text to two flat topics, so the theme page shows those two in order in
 * place of the overview's pointers to them.
 */
export const MERGED_TOPICS = new Map([
  ['theme', ['use-a-theme', 'author-a-theme']],
]);

/**
 * Flat topics that are data for other docs, not pages: `token-tables` is what
 * token references read, and the tokens page already shows every table.
 */
export const DATA_ONLY_TOPICS = new Map([['token-tables', 'tokens']]);

/**
 * Anchor ids of a page's sections, the way ReferenceDocView's outline builds
 * them: the slug of each title, numbered on repeats, with heading blocks
 * taking their own ids in between.
 * @param {Array<{title: string, content?: Array<{type?: string, text?: string}>}>} sections
 * @returns {string[]}
 */
export function sectionAnchors(sections) {
  const seen = new Map();
  const unique = (value, fallback) => {
    const base =
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || fallback;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };
  return sections.map(section => {
    const id = unique(section.title, 'section');
    for (const block of section.content ?? []) {
      if (block?.type === 'heading' && block.text) {
        unique(`${section.title} ${block.text}`, `${id}-heading`);
      }
    }
    return id;
  });
}

/** A docs-tree route as a site slug: `layout/scaffold` is `layout-scaffold`. */
export const routeSlug = route => route.replaceAll('/', '-');

/**
 * The docsite renders token tables itself, so a resolved token reference is
 * not copied into the registry.
 * @param {any[]} sections
 */
export function withoutResolvedTokens(sections) {
  return sections.map(section => ({
    ...section,
    content: (section.content ?? []).map(block => {
      if (block?.type !== 'token-ref') return block;
      const {resolved: _resolved, ...authored} = block;
      return authored;
    }),
  }));
}

/**
 * The sidebar group of a namespace page: the namespace's own category when it
 * declares one, otherwise `foundations` when every guide under it is a
 * foundations doc, otherwise `guide`.
 * @param {string | null | undefined} own
 * @param {Array<string | null | undefined>} guideCategories
 */
export function namespaceCategory(own, guideCategories) {
  if (own) return own;
  return guideCategories.length > 0 &&
    guideCategories.every(category => category === 'foundations')
    ? 'foundations'
    : 'guide';
}

/**
 * One full page for a namespace: every guide under it, compiled in tree
 * order, as `astryx docs <route> --depth all --detail full` reads it. Each
 * guide and nested namespace keeps its slug as a redirect to where its text
 * starts on the page. Typed docs (commands, API docs) open only in
 * `astryx docs` and add nothing to the page. A route that is one guide is a
 * page of that guide.
 *
 * A namespace with no guide placed under it (the tree's Unorganized level,
 * whose children are flat topics with pages of their own) has no page.
 * @param {(topic?: string, section?: string, options?: object) => Promise<any>} readDocs
 * @param {string} route
 * @param {{slug?: string, title?: string, except?: string[], aliases?: string[], parent?: string, order?: number}} [options]
 *   the page's slug and title when they are not the route's, routes below it
 *   that another page holds, older slugs that redirect to it, and the page it
 *   shows under in the sidebar, at its place there
 * @returns {Promise<{page: object, redirects: Record<string, string>} | null>}
 */
export async function namespacePage(readDocs, route, options = {}) {
  const {
    slug = routeSlug(route),
    title,
    except = [],
    aliases = [],
    parent,
    order,
  } = options;
  const nesting = parent == null ? {} : {parent, order: order ?? 0};
  const excluded = child =>
    except.some(skip => child === skip || child.startsWith(`${skip}/`));
  const read = await readDocs(route, undefined, {depth: 'all', detail: 'full'});
  const olderSlugs = () => {
    const redirects = {};
    for (const alias of [routeSlug(route), ...aliases]) {
      if (alias !== slug) redirects[alias] = `/docs/${slug}`;
    }
    return redirects;
  };
  if (read?.type === 'docs.detail' && read.data?.sections?.length > 0) {
    const guide = read.data;
    return {
      page: {
        topic: slug,
        title: title || guide.title || route,
        description: guide.description || '',
        category: guide.category || 'guide',
        sections: withoutResolvedTokens(guide.sections),
        ...nesting,
      },
      redirects: olderSlugs(),
    };
  }
  if (read?.type !== 'docs.node' || read.data.kind !== 'namespace') return null;
  const node = read.data;
  const sections = [];
  /** @type {Array<[string, number]>} slug and index of its first section */
  const starts = [];
  const guideCategories = [];
  if (node.content?.length > 0) {
    sections.push({title: 'Overview', content: node.content});
  }
  const walk = async slots => {
    for (const slot of slots ?? []) {
      for (const child of slot.children) {
        if (!child.route.startsWith(`${route}/`)) continue;
        if (excluded(child.route)) continue;
        if (child.kind === 'generic') {
          const detail = await readDocs(child.route);
          guideCategories.push(detail?.data?.category ?? null);
          starts.push([routeSlug(child.route), sections.length]);
          sections.push(...withoutResolvedTokens(child.sections ?? []));
        } else if (child.kind === 'namespace') {
          starts.push([routeSlug(child.route), sections.length]);
          if (child.content?.length > 0) {
            sections.push({title: child.title, content: child.content});
          }
          await walk(child.slots);
        }
      }
    }
  };
  await walk(node.slots);
  if (guideCategories.length === 0) return null;

  const anchors = sectionAnchors(sections);
  const href = `/docs/${slug}`;
  const redirects = {};
  for (const [guideSlug, index] of starts) {
    redirects[guideSlug] =
      index < sections.length ? `${href}#${anchors[index]}` : href;
  }
  Object.assign(redirects, olderSlugs());
  return {
    page: {
      topic: slug,
      title: title || node.title || route,
      description: node.summary || '',
      category: namespaceCategory(node.category, guideCategories),
      sections,
      ...nesting,
    },
    redirects,
  };
}

/**
 * Apply MERGED_TOPICS and DATA_ONLY_TOPICS to the flat topics: a merged
 * topic's sections move onto its host page and its slug redirects there; a
 * data-only topic has no page. A host or part that is missing is skipped, so
 * the rule holds before and after the split that created it.
 * @param {Array<{topic: string, sections: any[]}>} topics
 * @returns {{topics: any[], redirects: Record<string, string>}}
 */
export function mergeFlatTopics(topics) {
  const bySlug = new Map(topics.map(topic => [topic.topic, topic]));
  const redirects = {};
  const dropped = new Set();
  for (const [host, parts] of MERGED_TOPICS) {
    const page = bySlug.get(host);
    const present = parts.filter(part => bySlug.has(part));
    if (!page || present.length === 0) continue;
    const sections = [];
    const starts = [];
    for (const part of present) {
      starts.push([part, sections.length]);
      sections.push(...bySlug.get(part).sections);
      dropped.add(part);
    }
    page.sections = sections;
    const anchors = sectionAnchors(sections);
    for (const [part, index] of starts) {
      redirects[part] = `/docs/${host}#${anchors[index]}`;
    }
  }
  for (const [topic, host] of DATA_ONLY_TOPICS) {
    if (!bySlug.has(topic)) continue;
    dropped.add(topic);
    redirects[topic] = `/docs/${host}`;
  }
  return {topics: topics.filter(topic => !dropped.has(topic.topic)), redirects};
}
