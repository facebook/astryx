// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docs-pages.mjs
 *
 * How the CLI's docs become docsite pages. Each guide is a short landing page
 * (its promise, its few must-know lines, and a card per child), and each doc
 * below it has a page of its own with its own outline, so no page pastes a
 * whole guide. Foundations keeps its layout: one page per topic, and the
 * tokens and typography namespaces each one full page.
 *
 * @input A docs reader with the CLI docs API's shape
 *   (`docs(topic, section, options)` from `@astryxdesign/cli/api`) and the
 *   flat topics the site already built.
 * @output Doc pages ({topic, title, description, category, sections}),
 *   landing pages with their children, the anchors a landing page sends on
 *   to a child page, and redirects.
 * @position Used by generate-data.mjs; tested on its own with a fake reader.
 */

/**
 * Roots that keep one full page, the way Foundations shows them: every guide
 * below each, compiled in tree order. Every other root is a landing page.
 */
export const FULL_PAGE_ROOTS = new Set(['tokens', 'typography']);

/**
 * The generated Foundations level. It has no page of its own: its topics are
 * flat pages, grouped with the FULL_PAGE_ROOTS under Foundations in the
 * sidebar, in the order Foundations always listed them.
 */
export const FOUNDATIONS_ROOT = 'foundations';

/**
 * The order of the Foundations group: All Tokens first, then by title.
 * @param {{topic: string, title: string}} a
 * @param {{topic: string, title: string}} b
 */
export function foundationsOrder(a, b) {
  if (a.topic === 'tokens') return -1;
  if (b.topic === 'tokens') return 1;
  return a.title.localeCompare(b.title);
}

/**
 * Older slugs of a root namespace's page that MOVED_PAGES cannot spell, which
 * redirect to it: global mode was `cli/global`, and before that the
 * `cli/install-once` guide; the integration guides were the CLI Integrations
 * page.
 * @type {Map<string, string[]>}
 */
export const ROOT_PAGE_ALIASES = new Map([
  ['make-an-integration', ['cli-integrations-overview']],
]);

/**
 * Older guide slugs that pointed into a root namespace from outside its old
 * prefix: the Writing docs page and one older alias. Each opens where its
 * guide's new slug does.
 * @type {Map<string, {prefix: string, pages: Record<string, string>}>}
 */
export const MOVED_GUIDE_SLUGS = new Map([
  [
    'make-an-integration',
    {
      prefix: 'cli-integrations',
      pages: {
        'cli-writing-docs': 'make-an-integration-building-blocks-docs',
        'cli-integrations-docs-add-a-topic':
          'make-an-integration-building-blocks-docs-add-a-topic',
      },
    },
  ],
]);

/**
 * Redirects for a root namespace's older guide slugs (MOVED_GUIDE_SLUGS),
 * read off the redirects its page made for the guides' new slugs.
 * @param {string} root
 * @param {Record<string, string>} redirects the page's redirects
 * @returns {Record<string, string>}
 */
export function movedGuideRedirects(root, redirects) {
  const moved = MOVED_GUIDE_SLUGS.get(root);
  if (!moved) return {};
  /** @type {Record<string, string>} */
  const out = {};
  for (const [old, now] of Object.entries(moved.pages)) {
    if (Object.hasOwn(redirects, now)) out[old] = redirects[now];
  }
  return out;
}

/**
 * The docs routes that moved when the docs were organized into twelve guides
 * by what a reader wants to do, plus Reference (the CLI's not-found error
 * names the same moves). Old route prefix first, its new route second; a
 * prefix carries what is below it. Every page the site had keeps working:
 * its old slug redirects to the guide page, at the section its text starts.
 * @type {Array<[string, string]>}
 */
export const MOVED_PAGES = [
  ['cli/integrations', 'make-an-integration'],
  ['cli/writing-docs', 'make-an-integration/building-blocks/docs'],
  ['authoring', 'make-an-integration'],
  ['getting-started', 'get-started/add-to-a-project'],
  ['working-with-ai', 'work-with-agents/agent-setup'],
  ['theme', 'theme-your-app'],
  ['use-a-theme', 'theme-your-app/use-a-theme'],
  ['author-a-theme', 'theme-your-app/author-a-theme'],
  ['styling-overview', 'style-components/css-setup'],
  ['principles', 'get-started/principles'],
  ['is-my-code-good', 'check-your-code/agent-review'],
  ['use-integrations', 'find-a-component/use-integrations'],
  ['browser-support', 'reference/browser-support'],
  ['layout', 'build-a-page'],
  ['styling-libraries', 'style-components'],
  ['styling', 'style-components'],
  ['internationalization', 'translate-your-app'],
  ['migration', 'upgrade-and-migrate/move-an-app'],
  ['global/computer-agent-guide', 'work-with-agents/computer-agent-guide'],
  ['global/problems', 'fix-a-problem/global-mode-messages'],
  ['global/reference', 'reference/global-mode'],
  ['global', 'get-started/on-your-computer'],
  ['cli/global', 'get-started/on-your-computer'],
  ['cli/install-once', 'get-started/on-your-computer'],
  ['cli/component-lookups', 'find-a-component/search-and-read'],
  ['cli/host-entry', 'reference/host-entry'],
];

/**
 * Redirects for every slug MOVED_PAGES moved: each old route, and each route
 * below it, as a slug, to where its new route opens (its own page, or its
 * section on a guide page). A slug that is still a page, or already a
 * redirect, keeps what it has; an old child with no new home opens where its
 * old parent's new home does.
 * @param {string[]} routes every route the tree has
 * @param {Record<string, string>} redirects the guide pages' own redirects
 * @param {Set<string>} pages every page slug
 * @returns {Record<string, string>}
 */
export function movedPageRedirects(routes, redirects, pages) {
  /** @param {string} route */
  const hrefOf = route => {
    const slug = routeSlug(route);
    if (pages.has(slug)) return `/docs/${slug}`;
    return redirects[slug] ?? null;
  };
  /** @type {Record<string, string>} */
  const out = {};
  for (const [from, to] of MOVED_PAGES) {
    const target = hrefOf(to);
    if (target == null) continue;
    for (const route of routes) {
      if (route !== to && !route.startsWith(`${to}/`)) continue;
      const old = routeSlug(`${from}${route.slice(to.length)}`);
      const href = hrefOf(route);
      if (href == null || pages.has(old)) continue;
      if (!Object.hasOwn(redirects, old) && !Object.hasOwn(out, old)) {
        out[old] = href;
      }
    }
    const old = routeSlug(from);
    if (!pages.has(old) && !Object.hasOwn(redirects, old)) {
      out[old] ??= target;
    }
  }
  return out;
}

/**
 * The one CLI line an agent runs for each guide, shown at the end of its page
 * ("Ask your agent") and on its card on the docs home: the visible join
 * between the site and the CLI.
 * @type {Record<string, string>}
 */
export const GUIDE_AGENT_COMMANDS = {
  'get-started': 'astryx init',
  'work-with-agents': 'astryx init --features agents',
  'build-a-page': 'astryx build "<your page idea>"',
  'find-a-component': 'astryx search "<what it should do>"',
  'theme-your-app': 'astryx theme add <theme>',
  'style-components': 'astryx docs style-components/css-setup',
  foundations: 'astryx docs tokens',
  'check-your-code': 'astryx doctor',
  'upgrade-and-migrate': 'astryx upgrade --from <old version> --apply',
  'translate-your-app': 'astryx docs translate-your-app/i18n-quick-start',
  'make-an-integration': 'astryx docs make-an-integration/quick-start',
  'fix-a-problem': 'astryx gap-report --list-categories',
  reference: 'astryx help',
};

/**
 * Flat topics whose full text the site shows on another topic's page, host
 * first. Core has no flat topics now; every Core doc is a guide page.
 * @type {Map<string, string[]>}
 */
export const MERGED_TOPICS = new Map();

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
 * Doc text with its CLI commands shown the way a reader runs them. Docs write
 * commands as bare `astryx ...`; the CLI prefixes them when it prints a doc,
 * and the docsite does the same with its own door name. `show(text, lang)`
 * prefixes the commands in one piece of text: prose and list items (`lang`
 * null), or one code block's body in its language. A table cell that is a
 * whole command is prefixed too, the way `astryx docs` prints it.
 * @param {any[]} sections
 * @param {(text: string, lang?: string | null) => string} show
 * @param {string} stem the invocation `show` prefixes with
 */
export function withCliCommands(sections, show, stem) {
  /** @param {string} cell */
  const cell = cell =>
    /^astryx(\s|$)/.test(cell ?? '')
      ? `${stem}${cell.slice('astryx'.length)}`
      : show(cell ?? '');
  return sections.map(section => ({
    ...section,
    content: (section.content ?? []).map(block => {
      switch (block?.type) {
        case 'prose':
        case 'heading':
          return {...block, text: show(block.text ?? '')};
        case 'code':
          return {...block, code: show(block.code ?? '', block.lang ?? '')};
        case 'list':
          return {...block, items: (block.items ?? []).map(item => show(item))};
        case 'table':
          return {...block, rows: (block.rows ?? []).map(row => row.map(cell))};
        default:
          return block;
      }
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
 * `astryx docs` and add nothing to the page.
 *
 * A namespace with no guide placed under it (a generated topic level, Guides
 * or Foundations, whose children are flat topics with pages of their own) has
 * no page.
 * @param {(topic?: string, section?: string, options?: object) => Promise<any>} readDocs
 * @param {string} route
 * @param {{slug?: string, title?: string, except?: string[], aliases?: string[], globalRoute?: string}} [options]
 *   the page's slug and title when they are not the route's, routes below it
 *   that another page holds, older slugs that redirect to it, and the route
 *   whose sections are marked `globalMode`
 * @returns {Promise<{page: {topic: string, title: string, description: string, category: string, sections: any[]}, redirects: Record<string, string>, starts: Array<[string, number]>} | null>}
 */
export async function namespacePage(readDocs, route, options = {}) {
  const {
    slug = route,
    title,
    except = [],
    aliases = [],
    globalRoute = 'get-started/on-your-computer',
  } = options;
  // Sections from the global mode guides carry `globalMode`, so the site
  // shows their commands as the installed `astryx`.
  const marked = (childRoute, list) =>
    childRoute === globalRoute || childRoute.startsWith(`${globalRoute}/`)
      ? list.map(section => ({...section, globalMode: true}))
      : list;
  const excluded = child =>
    except.some(skip => child === skip || child.startsWith(`${skip}/`));
  const read = await readDocs(route, undefined, {depth: 'all', detail: 'full'});
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
          sections.push(
            ...marked(child.route, withoutResolvedTokens(child.sections ?? [])),
          );
        } else if (child.kind === 'namespace') {
          starts.push([routeSlug(child.route), sections.length]);
          if (child.content?.length > 0) {
            sections.push(
              ...marked(child.route, [
                {title: child.title, content: child.content},
              ]),
            );
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
  for (const alias of [routeSlug(route), ...aliases]) {
    if (alias !== slug) redirects[alias] = href;
  }
  return {
    page: {
      topic: slug,
      title: title || node.title || route,
      description: node.summary || '',
      category: namespaceCategory(node.category, guideCategories),
      sections,
    },
    redirects,
    starts,
  };
}

/**
 * A guide's pages: a landing page for the guide and for each namespace below
 * it (its promise, its own must-know lines, and its children, each with one
 * line), and a page of its own for each doc below it. A namespace with
 * neither children that have pages nor lines of its own (one that adopts
 * typed docs, read only in `astryx docs`) has no page.
 * @param {(topic?: string, section?: string, options?: object) => Promise<any>} readDocs
 * @param {string} route
 * @param {{globalRoute?: string}} [options] the route whose sections are
 *   marked `globalMode`
 * @returns {Promise<Array<object> | null>} every page, the guide's landing last
 */
export async function guidePages(readDocs, route, options = {}) {
  const {globalRoute = 'get-started/on-your-computer'} = options;
  const read = await readDocs(route, undefined, {depth: 'all', detail: 'full'});
  if (read?.type !== 'docs.node' || read.data.kind !== 'namespace') return null;
  const pages = [];
  const marked = (/** @type {string} */ at, /** @type {any[]} */ list) =>
    at === globalRoute || at.startsWith(`${globalRoute}/`)
      ? list.map(section => ({...section, globalMode: true}))
      : list;
  /** @param {any} node @returns {Promise<boolean>} whether it has a page */
  const landing = async node => {
    const children = [];
    for (const slot of node.slots ?? []) {
      for (const child of slot.children) {
        if (!child.route.startsWith(`${node.route}/`)) continue;
        const href = `/docs/${routeSlug(child.route)}`;
        if (child.kind === 'generic') {
          const doc = (await readDocs(child.route))?.data ?? {};
          pages.push({
            topic: routeSlug(child.route),
            title: doc.title || child.title || child.route,
            description: doc.description || '',
            category: doc.category || 'guide',
            sections: marked(child.route, doc.sections || []),
          });
          children.push({
            title: doc.title || child.title || child.route,
            href,
            summary: doc.description || child.summary || '',
          });
        } else if (child.kind === 'namespace' && (await landing(child))) {
          children.push({
            title: child.title || child.route,
            href,
            summary: child.summary || '',
          });
        }
      }
    }
    const content = node.content ?? [];
    if (children.length === 0 && content.length === 0) return false;
    pages.push({
      topic: routeSlug(node.route),
      title: node.title || node.route,
      description: node.summary || '',
      category: node.category || 'guide',
      sections:
        content.length > 0
          ? marked(node.route, [{title: 'Overview', content}])
          : [],
      children,
    });
    return true;
  };
  await landing(read.data);
  return pages;
}

/**
 * Where each anchor of a guide's old single page now opens: the anchor a
 * child's text started at opens that child's page, and every anchor inside a
 * child's text opens the same section on the child's page. The guide's own
 * opening section stays on its landing page.
 * @param {{page: {sections: any[]}, starts: Array<[string, number]>}} full
 *   the guide as one page (namespacePage)
 * @param {Set<string>} pages every page slug
 * @returns {Record<string, string>}
 */
export function landingAnchors(full, pages) {
  const {sections} = full.page;
  const anchors = sectionAnchors(sections);
  /** @type {Record<string, string>} */
  const out = {};
  full.starts.forEach(([slug, start], i) => {
    if (!pages.has(slug)) return;
    const end = full.starts[i + 1]?.[1] ?? sections.length;
    const own = sectionAnchors(sections.slice(start, end));
    for (let at = start; at < end; at++) {
      out[anchors[at]] =
        at === start ? `/docs/${slug}` : `/docs/${slug}#${own[at - start]}`;
    }
  });
  return out;
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
