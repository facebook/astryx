// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared doc-loading and topic-resolution helpers for the docs leaves.
 *
 * @input The project's doc catalog — the CLI's own
 *   packages/cli/assets/docs/{topic}.doc.mjs plus every topic the configured
 *   integrations contribute — and, when a --dense/--zh overlay is requested,
 *   the sibling {topic}.doc.dense.mjs / {topic}.doc.zh.mjs.
 * @output Catalog access, the compiler input for a topic, and the compiled
 *   node for it: lowered (overlaid, extensions merged, keys stamped) or linked
 *   (token references resolved too), memoized per catalog.
 * @position Sits beside docs.mjs (api/docs/). Hands topics to
 *   foundation/doc-compiler (which loads their files) and memoizes the nodes
 *   per catalog, so no leaf, doctor check or search loads, merges, or resolves
 *   docs on its own. Discovery itself lives in
 *   foundation/discovery/docs-discovery, which the catalog comes from.
 */

import {Project} from '../../foundation/config/project.mjs';
import {DocsCatalog} from '../../foundation/discovery/docs-discovery.mjs';
import {
  linkReferenceTopic,
  lowerReferenceTopic,
} from '../../foundation/doc-compiler/compile.mjs';
import {
  deepFreeze,
  loadTopicFile,
  loadTopicInput,
  OVERLAY_LANGUAGES,
  overlayLanguages,
} from '../../foundation/doc-compiler/read.mjs';
import {
  buildDocsTree,
  loadTreeInputs,
} from '../../foundation/doc-compiler/tree.mjs';
import {sortDiagnostics} from '../../foundation/doc-compiler/diagnostics.mjs';
import {
  linkBlocks,
  parseLinkTarget,
} from '../../foundation/doc-compiler/links.mjs';
import {
  createDocId,
  normalizeProviderId,
} from '../../foundation/identity/provider-identity.mjs';
import {
  cliDocIndex,
  cliDocSection,
} from '../../foundation/discovery/cli-self-docs.mjs';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';

export {OVERLAY_LANGUAGES, overlayLanguages};

/**
 * The project's topics: the built-in ones plus whatever the configured
 * integrations contribute.
 *
 * A docs read must not depend on a healthy project config. `astryx docs
 * tokens` answered without loading anything before integrations could
 * contribute topics, and it still answers when the config is unreadable — the
 * built-in topics are the floor, and the integration issues surface on the
 * commands that own them.
 *
 * @param {string} [cwd]
 * @returns {Promise<DocsCatalog>}
 */
export async function loadDocsCatalog(cwd = process.cwd()) {
  try {
    const project = await Project.load(cwd);
    return await project.docs();
  } catch {
    return DocsCatalog.fromBuiltins();
  }
}

/**
 * The overlay a read applies: none for the authored language.
 * @param {string | null | undefined} lang
 * @returns {string | null}
 */
function overlayLanguage(lang) {
  return lang && lang !== 'en' ? lang : null;
}

/** @type {WeakMap<DocsCatalog, Map<string, Promise<import('../../foundation/doc-compiler/compile.mjs').CompiledReferenceNode>>>} */
const loweredByCatalog = new WeakMap();

/**
 * One topic, lowered for `lang` with its links as written: overlaid,
 * extensions merged, keys stamped. Memoized per catalog, so a read that
 * references a topic twice loads it once. Every read of the catalog shares the
 * memoized node, so it is frozen; the lenses hand readers copies.
 * @param {DocsCatalog} catalog
 * @param {import('../../foundation/discovery/docs-discovery.mjs').DocsTopicEntry} entry
 * @param {string | null} [lang]
 * @returns {Promise<import('../../foundation/doc-compiler/compile.mjs').CompiledReferenceNode>}
 */
function lowerRawTopic(catalog, entry, lang = null) {
  const overlay = overlayLanguage(lang);
  let cache = loweredByCatalog.get(catalog);
  if (!cache) {
    cache = new Map();
    loweredByCatalog.set(catalog, cache);
  }
  const key = `${entry.name.toLowerCase()}\u0000${overlay ?? ''}`;
  let lowered = cache.get(key);
  if (!lowered) {
    lowered = loadTopicInput(entry, overlay).then(input =>
      deepFreeze(lowerReferenceTopic(input)),
    );
    cache.set(key, lowered);
  }
  return lowered;
}

/**
 * @typedef {import('../../foundation/doc-compiler/tree.mjs').DocsTree} DocsTree
 * @typedef {import('../../foundation/doc-compiler/tree.mjs').TreeNode} TreeNode
 * @typedef {import('../../foundation/doc-compiler/links.mjs').LinkProblem} LinkProblem
 * @typedef {import('../../foundation/doc-compiler/links.mjs').LinkResolver} LinkResolver
 * @typedef {import('../../foundation/discovery/docs-discovery.mjs').DocsTopicEntry} DocsTopicEntry
 */

/** @type {WeakMap<DocsCatalog, Map<string, Promise<{node: import('../../foundation/doc-compiler/compile.mjs').CompiledReferenceNode, problems: LinkProblem[]}>>>} */
const linkedByCatalog = new WeakMap();

/**
 * The CLI's own topics alone, for a check that runs without a project.
 * @returns {DocsCatalog}
 */
export function builtinCatalog() {
  return DocsCatalog.fromBuiltins();
}

/**
 * The provider id a topic's (or an extension's) links resolve against: its
 * owner's.
 * @param {{providerId?: string, package: string}} entry
 * @returns {string}
 */
function providerOf(entry) {
  return normalizeProviderId(entry.providerId ?? entry.package);
}

/**
 * One topic, lowered for `lang` with every link between docs resolved
 * (spec:AST-047 FR9): an inline `{@link <target>}` reads as the command that
 * opens its doc, and a `reference` or `workflow` block carries the doc it
 * names. Memoized per catalog and frozen, like the lowered node.
 * @param {DocsCatalog} catalog
 * @param {DocsTopicEntry} entry
 * @param {string | null} [lang]
 * @returns {Promise<import('../../foundation/doc-compiler/compile.mjs').CompiledReferenceNode>}
 */
export async function lowerTopic(catalog, entry, lang = null) {
  return (await linkTopic(catalog, entry, lang)).node;
}

/**
 * Each link in a topic that names no doc.
 * @param {DocsCatalog} catalog
 * @param {DocsTopicEntry} entry
 * @returns {Promise<LinkProblem[]>}
 */
export async function topicLinkProblems(catalog, entry) {
  return (await linkTopic(catalog, entry, null)).problems;
}

/**
 * @param {DocsCatalog} catalog
 * @param {DocsTopicEntry} entry
 * @param {string | null} lang
 */
function linkTopic(catalog, entry, lang) {
  let cache = linkedByCatalog.get(catalog);
  if (!cache) {
    cache = new Map();
    linkedByCatalog.set(catalog, cache);
  }
  const key = `${entry.name.toLowerCase()}\u0000${overlayLanguage(lang) ?? ''}`;
  let linked = cache.get(key);
  if (!linked) {
    linked = (async () => {
      const raw = await lowerRawTopic(catalog, entry, lang);
      /** @type {Map<string, LinkResolver>} */
      const resolvers = new Map();
      /** @param {string} provider */
      const resolverFor = async provider => {
        let resolve = resolvers.get(provider);
        if (!resolve) {
          resolve = await linkResolver(catalog, provider);
          resolvers.set(provider, resolve);
        }
        return resolve;
      };
      /** @type {LinkProblem[]} */
      const problems = [];
      const sections = [];
      // Each section resolves its links against the provider that wrote it:
      // an extension's sections against the extension's provider, never the
      // base topic's.
      for (const section of raw.doc.sections) {
        const provider = raw.sectionProviders?.[section.id];
        const linked = await linkBlocks(
          section.content,
          await resolverFor(
            provider == null ? providerOf(entry) : normalizeProviderId(provider),
          ),
          {section: section.id ?? section.title},
        );
        problems.push(...linked.problems);
        sections.push({...section, content: linked.content});
      }
      return {
        node: deepFreeze({...raw, doc: {...raw.doc, sections}}),
        problems,
      };
    })();
    cache.set(key, linked);
  }
  return linked;
}

/** @type {WeakMap<DocsCatalog, Promise<DocsTree>>} */
const treesByCatalog = new WeakMap();

/**
 * The project's docs tree: the CLI's own docs plus the namespace docs and
 * placed guides the configured integrations ship (spec:AST-046), built once
 * per catalog. Without integration docs it is the CLI's tree, built once per
 * process.
 * @param {DocsCatalog} catalog
 * @param {{fresh?: boolean}} [options] `fresh`: reread the CLI's tree files
 * @returns {Promise<DocsTree>}
 */
export function projectTree(catalog, {fresh = false} = {}) {
  let tree = treesByCatalog.get(catalog);
  if (!tree || fresh) {
    tree = buildProjectTree(catalog, fresh);
    treesByCatalog.set(catalog, tree);
  }
  return tree;
}

/** @type {ReturnType<typeof loadTreeInputs> | undefined} */
let cliTreeInputs;

/**
 * Every flat topic in the catalog, as the tree's Unorganized level reads it.
 * @param {DocsCatalog} catalog
 * @returns {Promise<import('../../foundation/doc-compiler/tree.mjs').TreeTopicInput[]>}
 */
async function flatTopicInputs(catalog) {
  /** @type {import('../../foundation/doc-compiler/tree.mjs').TreeTopicInput[]} */
  const topics = [];
  for (const entry of catalog.entries()) {
    let {title, description} = entry;
    if (title == null || description == null) {
      try {
        const file = await loadTopicFile(entry.path, null);
        title ??= file.doc?.title;
        description ??= file.doc?.description;
      } catch {
        // A topic that does not load is reported where it is read.
      }
    }
    topics.push({
      provider: entry.package,
      providerId: entry.providerId ?? entry.package,
      name: entry.name,
      title: title ?? entry.name,
      summary: description ?? '',
      source: `${entry.package}:${entry.name}`,
      ...(entry.replaces != null ? {replaces: entry.replaces} : {}),
    });
  }
  return topics;
}

/**
 * The CLI's tree, each configured integration's namespaces and guides, and
 * every flat topic in the generated Unorganized level.
 * @param {DocsCatalog} catalog
 * @param {boolean} fresh
 * @returns {Promise<DocsTree>}
 */
async function buildProjectTree(catalog, fresh) {
  const added = catalog.treeInputs;
  if (fresh || !cliTreeInputs) cliTreeInputs = loadTreeInputs();
  const cli = await cliTreeInputs;
  const result = buildDocsTree({
    namespaces: [...cli.namespaces, ...added.flatMap(each => each.namespaces)],
    docs: [...cli.docs, ...added.flatMap(each => each.guides)],
    topics: await flatTopicInputs(catalog),
  });
  return {
    ...result,
    diagnostics: sortDiagnostics([...cli.diagnostics, ...result.diagnostics]),
  };
}

/** @type {WeakMap<DocsTree, Map<string, TreeNode>>} */
const identitiesByTree = new WeakMap();

/** @param {string} provider @param {string} kind @param {string} name */
function identityKey(provider, kind, name) {
  return `${provider}\u0000${kind}\u0000${kind === 'generic' ? name.toLowerCase() : name}`;
}

/**
 * Every tree node with an identity, by provider id, kind, and name.
 * @param {DocsTree} tree
 */
function identitiesOf(tree) {
  let index = identitiesByTree.get(tree);
  if (!index) {
    index = new Map();
    for (const node of tree.nodes.values()) {
      if (node.id == null) continue;
      let provider = node.providerId;
      try {
        provider = normalizeProviderId(node.providerId);
      } catch {
        // Kept as given; a link names it the same way.
      }
      index.set(identityKey(provider, node.kind, node.name), node);
    }
    identitiesByTree.set(tree, index);
  }
  return index;
}

/**
 * How a doc's links find their targets (spec:AST-047 FR9): a doc in the
 * project's docs tree by its identity, or a flat topic by its provider and
 * name. A target that matches neither is a problem, never a guess.
 * @param {DocsCatalog} catalog
 * @param {string} fromProvider the provider id of the doc the links sit in
 * @returns {Promise<LinkResolver>}
 */
export async function linkResolver(catalog, fromProvider) {
  const identities = identitiesOf(await projectTree(catalog));
  return async target => {
    const parsed = parseLinkTarget(target);
    if ('error' in parsed) return {problem: parsed.error};
    let provider;
    try {
      provider = normalizeProviderId(parsed.provider ?? fromProvider);
    } catch {
      return {
        problem: `"${target}" names "${parsed.provider}", which is not a provider id: an npm package name, or the \`providerId\` its manifest declares`,
      };
    }
    const node = identities.get(identityKey(provider, parsed.kind, parsed.name));
    if (node) {
      return {
        target,
        id: /** @type {string} */ (node.id),
        route: node.route,
        title: node.title,
        summary: node.summary,
        command: `astryx docs ${node.route}`,
      };
    }
    if (parsed.kind === 'generic') {
      const entry = catalog.resolve(parsed.name);
      if (
        entry &&
        !entry.tree &&
        (providerOf(entry) === provider ||
          entry.replaces?.toLowerCase() === parsed.name.toLowerCase())
      ) {
        let title = entry.title ?? entry.name;
        let summary = entry.description ?? '';
        try {
          const raw = await lowerRawTopic(catalog, entry);
          title = raw.doc.title ?? title;
          summary = raw.doc.description ?? summary;
        } catch {
          // The topic budget check reports a topic that does not load; the
          // link still opens it.
        }
        return {
          target,
          id: createDocId(provider, 'generic', parsed.name),
          route: entry.name,
          title,
          summary,
          command: `astryx docs ${entry.name}`,
        };
      }
    }
    return {
      problem: `"${target}" names no doc. Find it with \`astryx search ${parsed.name} --type doc\`, then name it as \`[<provider>:]<kind>:<name>\`.`,
    };
  };
}

/**
 * Every link in the project's docs that names no doc: in each topic, each
 * guide the tree places, and each typed doc.
 * @param {DocsCatalog} catalog
 * @param {DocsTree} tree
 * @param {{owner?: string}} [options] `owner`: only the docs this package owns
 * @returns {Promise<string[]>}
 */
export async function docsLinkProblems(catalog, tree, {owner} = {}) {
  /** @type {string[]} */
  const problems = [];
  /** @param {string} where @param {LinkProblem[]} found */
  const note = (where, found) => {
    for (const problem of found) {
      problems.push(
        `${where}${problem.section ? ` \u00a7 ${problem.section}` : ''}: ${problem.message}`,
      );
    }
  };
  for (const entry of catalog.entries()) {
    // A package owns a topic it wrote, and the sections it adds to another
    // package's topic.
    if (
      owner != null &&
      entry.package !== owner &&
      !entry.extensions.some(extension => extension.package === owner)
    ) {
      continue;
    }
    try {
      note(entry.name, await topicLinkProblems(catalog, entry));
    } catch {
      // The topic budget check reports a topic that does not load.
    }
  }
  for (const node of tree.nodes.values()) {
    if (owner != null && node.provider !== owner) continue;
    if (node.kind === 'generic' && node.ref?.topicFile) {
      try {
        note(node.route, await topicLinkProblems(catalog, guideEntry(node)));
      } catch {
        // As above.
      }
    } else if (node.ref?.selfDoc) {
      note(node.route, (await nodeContent(catalog, tree, node)).problems);
    }
  }
  return problems;
}

/**
 * What \`astryx doctor integration docs\` checks in one integration's docs: the
 * docs tree they build beside the CLI's (namespaces, placements, routes) and
 * every link in them (spec:AST-046, spec:AST-047).
 * @param {{name: string}} integration
 * @param {{records: import('../../foundation/discovery/docs-discovery.mjs').DocsTopicRecord[], namespaces: import('../../foundation/doc-compiler/tree.mjs').TreeNamespaceInput[], guides: import('../../foundation/doc-compiler/tree.mjs').TreeDocInput[]}} discovered
 * @returns {Promise<string[]>}
 */
export async function packageDocsProblems(integration, discovered) {
  const catalog = DocsCatalog.fromBuiltins();
  for (const record of discovered.records) catalog.add(record);
  catalog.addTreeInputs({
    namespaces: discovered.namespaces.map(input => ({...input, rank: 1})),
    guides: discovered.guides.map(input => ({...input, rank: 1})),
  });
  const tree = await projectTree(catalog);
  const problems = tree.diagnostics
    .filter(d => d.severity === 'error' && d.provider === integration.name)
    .map(d => `${d.source ?? integration.name}: ${d.message}`);
  problems.push(
    ...(await docsLinkProblems(catalog, tree, {owner: integration.name})),
  );
  return problems;
}

/**
 * How a token reference finds its target: the topic it names in `catalog`,
 * lowered for the same language.
 * @param {DocsCatalog} catalog
 * @param {string | null} lang
 * @returns {(topic: string) => Promise<import('../../foundation/doc-compiler/compile.mjs').CompiledReferenceNode | null>}
 */
export function referenceTargets(catalog, lang) {
  return async topic => {
    const target = catalog.resolve(topic);
    return target ? lowerTopic(catalog, target, lang) : null;
  };
}

/**
 * One topic, compiled for `lang`: lowered, then every token reference linked.
 * @param {DocsCatalog} catalog
 * @param {import('../../foundation/discovery/docs-discovery.mjs').DocsTopicEntry} entry
 * @param {string | null} [lang]
 * @returns {Promise<import('../../foundation/doc-compiler/compile.mjs').CompiledReferenceNode>}
 */
export async function compileTopic(catalog, entry, lang = null) {
  return linkReferenceTopic(
    await lowerTopic(catalog, entry, lang),
    referenceTargets(catalog, lang),
  );
}

/**
 * A guide the docs tree places, as a topic entry the topic readers open by its
 * route. It is never a flat topic: `astryx docs <route>` is its only name.
 * @param {import('../../foundation/doc-compiler/tree.mjs').TreeNode} node
 * @returns {import('../../foundation/discovery/docs-discovery.mjs').DocsTopicEntry}
 */
export function guideEntry(node) {
  return {
    name: node.route,
    route: node.route,
    package: node.provider,
    providerId: node.providerId,
    path: node.ref.topicFile,
    extensions: [],
    tree: true,
    parent: node.parent ?? undefined,
  };
}

/** @type {WeakMap<DocsTree, ReturnType<typeof cliDocIndex>>} */
const typedDocIndexes = new WeakMap();

/**
 * What a typed doc in the docs tree prints: its content, with every link to
 * another doc resolved (spec:AST-047 FR9). A namespace has no content. The
 * CLI's doc modules are discovery, so this lives in the adapter
 * (architecture:cli-surface INV21).
 * @param {DocsCatalog} catalog
 * @param {DocsTree} tree
 * @param {TreeNode} node
 * @returns {Promise<{content: any[], problems: LinkProblem[]}>}
 */
export async function nodeContent(catalog, tree, node) {
  if (!node.ref?.selfDoc) return {content: [], problems: []};
  let index = typedDocIndexes.get(tree);
  if (!index) {
    index = cliDocIndex(
      [...tree.nodes.values()].flatMap(each =>
        each.ref?.selfDoc ? [each.ref.selfDoc] : [],
      ),
    );
    typedDocIndexes.set(tree, index);
  }
  const resolve = await linkResolver(catalog, node.providerId);
  return linkBlocks(cliDocSection(node.ref.selfDoc, index).content, resolve);
}

/**
 * The command that opens the level a topic sits in when the tree cannot say:
 * a guide's parent namespace, or the topic list.
 * @param {import('../../foundation/discovery/docs-discovery.mjs').DocsTopicEntry} entry
 * @returns {import('./docs.type.mjs').DocsCommand}
 */
export function topicUp(entry) {
  return entry.tree && entry.parent
    ? `astryx docs ${entry.parent}`
    : 'astryx docs';
}

/**
 * The moves from a node's place in the tree (spec:AST-047 FR2, FR4): up to its
 * parent (the topic list, at the top), and across to the nodes before and
 * after it in its parent's slot.
 * @param {DocsTree} tree
 * @param {TreeNode} node
 * @returns {import('./docs.type.mjs').DocsLinks}
 */
export function placeLinks(tree, node) {
  /** @type {import('./docs.type.mjs').DocsLinks} */
  const links = {
    up: node.parent == null ? 'astryx docs' : `astryx docs ${node.parent}`,
  };
  const parent = node.parent == null ? undefined : tree.get(node.parent);
  const siblings =
    parent?.slots.find(slot => slot.children.includes(node.route))?.children ??
    [];
  const at = siblings.indexOf(node.route);
  if (at > 0) links.previous = `astryx docs ${siblings[at - 1]}`;
  if (at !== -1 && at < siblings.length - 1) {
    links.next = `astryx docs ${siblings[at + 1]}`;
  }
  return links;
}

/**
 * The moves a topic read offers: from its place in the tree, where a guide
 * sits in its namespace and a flat topic in the Unorganized level.
 * @param {DocsCatalog} catalog
 * @param {import('../../foundation/discovery/docs-discovery.mjs').DocsTopicEntry} entry
 * @returns {Promise<import('./docs.type.mjs').DocsLinks>}
 */
export async function topicLinks(catalog, entry) {
  const tree = await projectTree(catalog);
  const node = tree.get(entry.tree ? (entry.route ?? entry.name) : entry.name);
  const placed =
    node && (entry.tree ? node.kind === 'generic' : node.ref?.flatTopic === entry.name);
  return placed ? placeLinks(tree, node) : {up: topicUp(entry)};
}

/**
 * What a docs argument names: a topic (a flat one, or a guide the docs tree
 * places), a namespace or typed doc in the tree, or nothing. The flat catalog
 * answers first, unless the tree gave that topic's route to another doc.
 * @param {unknown} topic
 * @param {{cwd?: string}} [options]
 * @returns {Promise<
 *   | {kind: 'topic', catalog: DocsCatalog, entry: import('../../foundation/discovery/docs-discovery.mjs').DocsTopicEntry}
 *   | {kind: 'node', catalog: DocsCatalog, tree: import('../../foundation/doc-compiler/tree.mjs').DocsTree, node: import('../../foundation/doc-compiler/tree.mjs').TreeNode}
 *   | {kind: 'unknown', catalog: DocsCatalog}
 * >}
 */
export async function resolveDocsArgument(topic, {cwd} = {}) {
  const catalog = await loadDocsCatalog(cwd);
  const entry = catalog.resolve(topic);
  if (entry) {
    // A topic whose route the tree gave to another doc opens that doc: the
    // CLI keeps its routes, and a namespace keeps its route over a topic.
    const tree = await projectTree(catalog);
    const owner = routeOwner(tree, entry);
    if (owner == null) return {kind: 'topic', catalog, entry};
    return treeArgument(catalog, tree, owner);
  }
  if (typeof topic !== 'string' || topic === '')
    return {kind: 'unknown', catalog};
  const tree = await projectTree(catalog);
  const node = tree.get(topic) ?? tree.getFolded?.(topic);
  if (!node || node.ref?.flatTopic) return {kind: 'unknown', catalog};
  return treeArgument(catalog, tree, node);
}

/**
 * What a tree node opens as: a guide the tree places reads like a topic; a
 * namespace or a typed doc is a node.
 * @param {DocsCatalog} catalog
 * @param {DocsTree} tree
 * @param {TreeNode} node
 * @returns {{kind: 'topic', catalog: DocsCatalog, entry: import('../../foundation/discovery/docs-discovery.mjs').DocsTopicEntry} | {kind: 'node', catalog: DocsCatalog, tree: DocsTree, node: TreeNode}}
 */
function treeArgument(catalog, tree, node) {
  if (node.kind === 'generic') {
    return {kind: 'topic', catalog, entry: guideEntry(node)};
  }
  return {kind: 'node', catalog, tree, node};
}

/**
 * The doc that took a flat topic's route in the docs tree, when it is not
 * that topic (spec:AST-046 FR11): the CLI keeps its routes, such as `cli`
 * and `unorganized`, and a namespace keeps its route over a topic of the same
 * name. Null when the topic owns its route, or the tree has no node there.
 * @param {DocsTree} tree
 * @param {import('../../foundation/discovery/docs-discovery.mjs').DocsTopicEntry} entry
 * @returns {TreeNode | null}
 */
export function routeOwner(tree, entry) {
  const node = tree.get(entry.name) ?? tree.getFolded?.(entry.name);
  if (node == null) return null;
  return node.ref?.flatTopic === entry.name && node.provider === entry.package
    ? null
    : node;
}

/**
 * The error for a docs argument that names nothing. For a route, it suggests
 * the children of the deepest namespace the route reaches; otherwise, every
 * topic and every top-level namespace.
 * @param {unknown} topic
 * @param {DocsCatalog} catalog
 * @returns {Promise<AstryxError>}
 */
export async function unknownTopicError(topic, catalog) {
  const tree = await projectTree(catalog);
  /** @type {Array<{name: string, reason: string}>} */
  let suggestions = [];
  if (typeof topic === 'string' && topic.includes('/')) {
    const parts = topic.split('/');
    for (
      let depth = parts.length - 1;
      depth > 0 && suggestions.length === 0;
      depth--
    ) {
      const near = tree.get(parts.slice(0, depth).join('/'));
      if (near) {
        suggestions = near.slots.flatMap(slot =>
          slot.children.map(route => ({
            name: route,
            reason: tree.get(route)?.summary ?? '',
          })),
        );
      }
    }
  }
  if (suggestions.length === 0 && typeof topic === 'string') {
    // The docs whose own name it is (`doctor` is cli/commands/doctor), or whose
    // route it spells with hyphens (`cli-integrations`, the guide's name before
    // it moved to cli/integrations).
    const wanted = topic.toLowerCase();
    suggestions = [...tree.nodes.values()]
      .filter(
        node =>
          !node.ref?.flatTopic &&
          (node.name.toLowerCase() === wanted ||
            node.route.replaceAll('/', '-').toLowerCase() === wanted),
      )
      .map(node => ({name: node.route, reason: node.summary}));
  }
  if (suggestions.length === 0) {
    suggestions = [
      ...tree
        .roots()
        .map(root => ({name: root.route, reason: 'docs namespace'})),
      ...catalog.names().map(name => ({name, reason: 'available topic'})),
    ];
  }
  return new AstryxError(
    `Unknown topic "${String(topic)}"${notLoaded(catalog)}`,
    suggestions,
    ERROR_CODES.ERR_UNKNOWN_TOPIC,
  );
}

/**
 * A sentence naming the packages whose docs did not load, or nothing: a doc
 * that fails to load withdraws its package's docs, so a reader who cannot
 * find one learns where to look.
 * @param {DocsCatalog} catalog
 * @returns {string}
 */
export function notLoaded(catalog) {
  const packages = [...new Set(catalog.issues.map(issue => issue.package))];
  if (packages.length === 0) return '';
  return `. The docs of ${packages.join(', ')} did not load; run \`astryx doctor integration docs\` in that package to see why.`;
}

/**
 * Resolve a topic (a flat one, or a guide the docs tree places by its route)
 * and lower it for the topic readers.
 * @param {unknown} topic
 * @param {{lang?: string | null, zh?: boolean, dense?: boolean, cwd?: string}} [options]
 */
export async function resolveTopicDocs(topic, options = {}) {
  const {lang = null, zh = false, dense = false, cwd} = options;
  const effectiveLang = lang || (dense ? 'dense' : zh ? 'zh' : null);
  // A public API caller could pass a non-string topic; it lands on the same
  // stable code as an unknown name rather than a raw TypeError.
  const found = await resolveDocsArgument(topic, {cwd});
  if (found.kind !== 'topic') {
    throw found.kind === 'node'
      ? new AstryxError(
          `"${found.node.route}" is a ${found.node.kind === 'namespace' ? 'namespace' : `${found.node.kind} doc`} in the docs tree, not a topic. Read it with \`astryx docs ${found.node.route}\`.`,
          undefined,
          ERROR_CODES.ERR_UNKNOWN_TOPIC,
        )
      : await unknownTopicError(topic, found.catalog);
  }
  const {catalog, entry} = found;
  const node = await lowerTopic(catalog, entry, effectiveLang);
  return {catalog, node, lang: effectiveLang, entry};
}
