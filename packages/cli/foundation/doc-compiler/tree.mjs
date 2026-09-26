// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The docs tree: one home for every doc that a namespace places or
 *   adopts (spec:AST-044).
 *
 * @input Namespace docs, guides that name a parent with `placement`, and typed
 *   docs that belong to a discovery group (a CLI typed doc's `namespace`).
 * @output {@link buildDocsTree}: every node by route, each with one parent and
 *   ordered children per slot, plus one diagnostic for each placement that
 *   failed. {@link loadDocsTree} builds the CLI's own tree once per process.
 * @position Between discovery and the readers: `astryx docs <route>`,
 *   `astryx doctor`, and the docsite build all read this tree. In phase 1 only
 *   the CLI's own docs have a home here; every other doc keeps its flat route.
 *   A namespace never scans files and never lists its children: a child names
 *   its parent, or a namespace adopts a discovery group.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT} from '../fs/paths.mjs';
import {loadCliSelfDocs} from '../discovery/cli-self-docs.mjs';
import {routeSegment} from '../discovery/docs-section-key.mjs';
import {diagnostic, sortDiagnostics} from './diagnostics.mjs';
import {readDocView} from './read.mjs';
import {packageSource} from './source.mjs';

export {routeSegment};

/** Where the CLI keeps the docs that only the tree reads. */
export const TREE_DOCS_DIR = path.join(CLI_ROOT, 'assets', 'docs', 'tree');

/** The package that owns the CLI's own docs. */
const CLI_PROVIDER = '@astryxdesign/cli';

/** One route segment: lowercase letters and digits joined by single hyphens. */
export const ROUTE_SEGMENT_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * The generated level that `groupBy: 'kind'` makes for each kind: its route
 * segment, title, and summary.
 * @type {Readonly<Record<string, {segment: string, title: string, summary: string}>>}
 */
export const KIND_GROUPS = Object.freeze({
  command: {
    segment: 'commands',
    title: 'Commands',
    summary: 'Every command and subcommand.',
  },
  function: {
    segment: 'functions',
    title: 'Functions',
    summary: 'Every function: its signature, parameters, returns, and errors.',
  },
  schema: {
    segment: 'schemas',
    title: 'Schemas',
    summary: 'Every shape the CLI reads or returns, field by field.',
  },
  enum: {
    segment: 'enums',
    title: 'Enums',
    summary:
      'Every fixed list of values, such as error codes and response types.',
  },
  generic: {segment: 'guides', title: 'Guides', summary: 'Every guide.'},
});

/**
 * @typedef {import('../../authoring/doctypes/namespace/type').NamespaceDoc} NamespaceDoc
 * @typedef {import('../../authoring/doctypes/base/type').DocPlacement} DocPlacement
 * @typedef {import('./diagnostics.mjs').CompilerDiagnostic} CompilerDiagnostic
 */

/**
 * @typedef {object} TreeNamespaceInput
 * @property {string} provider the package that owns the namespace
 * @property {string} source `<package>/<path>` of its file
 * @property {NamespaceDoc} doc
 */

/**
 * @typedef {object} TreeDocInput
 * @property {string} provider
 * @property {string} source
 * @property {string} kind the authored kind: `generic`, `command`, `function`,
 *   `schema`, or `enum`
 * @property {string} name the doc's stable name
 * @property {string} title
 * @property {string} summary
 * @property {string | null} group the discovery group adoption reads, or null
 * @property {DocPlacement | undefined} placement
 * @property {any} [ref] what a reader needs to open the doc, carried as given
 */

/**
 * @typedef {object} TreeSlot
 * @property {string} name
 * @property {string} title
 * @property {string[]} children child routes, in reading order
 */

/**
 * @typedef {object} TreeNode
 * @property {string} id `<provider>/<kind>/<name>`: stable when the route moves
 * @property {string} route
 * @property {string} kind `namespace` or the doc's authored kind
 * @property {string} provider
 * @property {string} name
 * @property {string} title
 * @property {string} summary
 * @property {string | null} parent the parent's route; null at the top
 * @property {string | null} slot the parent slot this node sits in
 * @property {number | null} order
 * @property {boolean} generated made by `groupBy: 'kind'`, not authored
 * @property {TreeSlot[]} slots a namespace's slots; empty for a leaf
 * @property {string} source
 * @property {any} [ref]
 */

/**
 * @typedef {object} DocsTree
 * @property {Map<string, TreeNode>} nodes by route, in route order
 * @property {CompilerDiagnostic[]} diagnostics sorted
 * @property {(route: string) => TreeNode | undefined} get
 * @property {() => TreeNode[]} roots the namespaces with no parent
 * @property {(node: TreeNode) => TreeNode[]} ancestors top first, not the node
 */

/** @param {string} a @param {string} b */
const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * The namespace a `placement.parent` names: `namespace:<name>` in the doc's own
 * package, or `<package>/namespace/<name>` spelled out. In phase 1 a parent
 * must belong to the doc's own package.
 * @param {string} parent
 * @param {string} provider
 * @param {Map<string, TreeNamespaceInput>} declared by `provider\0name`
 * @returns {{key: string} | {error: string}}
 */
function resolveParent(parent, provider, declared) {
  let owner = provider;
  let name;
  const short = /^namespace:(.+)$/u.exec(parent);
  const qualified = /^(.+)\/namespace\/([^/]+)$/u.exec(parent);
  if (short) {
    name = short[1];
  } else if (qualified) {
    [, owner, name] = qualified;
  } else {
    return {
      error: `placement.parent "${parent}" is not a namespace reference. Write "namespace:<name>".`,
    };
  }
  if (owner !== provider) {
    return {
      error: `placement.parent "${parent}" belongs to ${owner}. A doc can only be placed in a namespace of its own package (${provider}).`,
    };
  }
  const key = `${owner}\u0000${name}`;
  if (!declared.has(key)) {
    return {
      error: `placement.parent "${parent}" names no namespace; ${provider} declares ${
        [...declared.values()]
          .filter(ns => ns.provider === provider)
          .map(ns => `"${ns.doc.name}"`)
          .sort(byText)
          .join(', ') || 'none'
      }.`,
    };
  }
  return {key};
}

/**
 * Build the tree. Pure: the same inputs give the same tree, whatever order
 * they arrive in.
 *
 * A doc's home is decided once, in this order: its explicit `placement`, then
 * the one adoption rule in its package that matches its group and kind. A
 * placement that fails withdraws the doc; it never falls back to adoption. A
 * doc with neither has no home in phase 1 and keeps its flat route.
 *
 * @param {{namespaces: TreeNamespaceInput[], docs: TreeDocInput[]}} inputs
 * @returns {DocsTree}
 */
export function buildDocsTree({namespaces, docs}) {
  /** @type {CompilerDiagnostic[]} */
  const diagnostics = [];
  /** @param {string} code @param {{provider: string, source: string}} at @param {string} message @param {string} [field] */
  const report = (code, at, message, field) =>
    diagnostics.push(
      diagnostic(code, {
        provider: at.provider,
        source: at.source,
        message,
        ...(field ? {field} : {}),
      }),
    );

  // Namespaces by package and name.
  /** @type {Map<string, TreeNamespaceInput>} */
  const declared = new Map();
  const sortedNamespaces = [...namespaces].sort(
    (a, b) =>
      byText(a.provider, b.provider) ||
      byText(a.doc.name, b.doc.name) ||
      byText(a.source, b.source),
  );
  for (const input of sortedNamespaces) {
    const {name} = input.doc;
    if (!ROUTE_SEGMENT_RE.test(name)) {
      report(
        'invalid_namespace',
        input,
        `Namespace "${name}" is not a route segment. Use lowercase letters and digits joined by single hyphens.`,
        'name',
      );
      continue;
    }
    const key = `${input.provider}\u0000${name}`;
    const first = declared.get(key);
    if (first) {
      report(
        'invalid_namespace',
        input,
        `Namespace "${name}" is declared twice in ${input.provider}: ${first.source} and ${input.source}.`,
        'name',
      );
      continue;
    }
    declared.set(key, input);
  }

  // Each namespace's parent, checked against the parent's slots.
  /** @type {Map<string, {parentKey: string, slot: string, order: number | null} | null>} */
  const parentOf = new Map();
  for (const [key, input] of declared) {
    const {placement} = input.doc;
    if (placement == null) {
      parentOf.set(key, null);
      continue;
    }
    const home = checkPlacement(placement, 'namespace', input, declared);
    if ('error' in home) {
      report('invalid_placement', input, home.error, 'placement');
      continue;
    }
    parentOf.set(key, {
      parentKey: home.key,
      slot: home.slot,
      order: placement.order ?? null,
    });
  }

  // Routes, top-down. A cycle, or an ancestor that was withdrawn, leaves a
  // namespace (and everything under it) out of the tree.
  /** @type {Map<string, string | null>} */
  const routeOf = new Map();
  /** @param {string} key @param {Set<string>} seen @returns {string | null} */
  const routeFor = (key, seen) => {
    if (routeOf.has(key))
      return /** @type {string | null} */ (routeOf.get(key));
    if (!parentOf.has(key) || seen.has(key)) return null;
    seen.add(key);
    const home = parentOf.get(key);
    const name = /** @type {TreeNamespaceInput} */ (declared.get(key)).doc.name;
    const parentRoute = home == null ? '' : routeFor(home.parentKey, seen);
    const route =
      parentRoute == null
        ? null
        : parentRoute === ''
          ? name
          : `${parentRoute}/${name}`;
    routeOf.set(key, route);
    return route;
  };
  for (const [key, input] of declared) {
    if (routeFor(key, new Set()) == null && parentOf.has(key)) {
      report(
        'invalid_placement',
        input,
        `Namespace "${input.doc.name}" has no route: its placement forms a cycle, or a namespace above it was withdrawn.`,
        'placement',
      );
    }
  }

  /** @type {Map<string, TreeNode>} */
  const nodes = new Map();
  /** @param {TreeNode} node @param {{provider: string, source: string}} at */
  const addNode = (node, at) => {
    const taken = nodes.get(node.route);
    if (taken) {
      report(
        'duplicate_route',
        at,
        `${node.id} and ${taken.id} both have the route "${node.route}". Rename or move one of them.`,
      );
      return false;
    }
    nodes.set(node.route, node);
    return true;
  };

  for (const [key, input] of declared) {
    const route = routeOf.get(key);
    if (route == null) continue;
    const home = parentOf.get(key);
    const parentRoute =
      home == null ? null : /** @type {string} */ (routeOf.get(home.parentKey));
    addNode(
      {
        id: `${input.provider}/namespace/${input.doc.name}`,
        route,
        kind: 'namespace',
        provider: input.provider,
        name: input.doc.name,
        title: input.doc.title,
        summary: input.doc.summary,
        parent: parentRoute,
        slot: home?.slot ?? null,
        order: home?.order ?? null,
        generated: false,
        slots: Object.entries(input.doc.slots).map(([name, slot]) => ({
          name,
          title: slot.title,
          children: [],
        })),
        source: input.source,
      },
      input,
    );
  }

  // Docs: explicit placement, else one adoption rule, else no home.
  const sortedDocs = [...docs].sort(
    (a, b) =>
      byText(a.provider, b.provider) ||
      byText(a.kind, b.kind) ||
      byText(a.name, b.name) ||
      byText(a.source, b.source),
  );
  for (const doc of sortedDocs) {
    /** @type {{parentRoute: string, slot: string, order: number | null} | null} */
    let home = null;
    if (doc.placement != null) {
      const placed = checkPlacement(doc.placement, doc.kind, doc, declared);
      if ('error' in placed) {
        report('invalid_placement', doc, placed.error, 'placement');
        continue;
      }
      const parentRoute = routeOf.get(placed.key);
      if (parentRoute == null) {
        report(
          'invalid_placement',
          doc,
          `placement.parent "${doc.placement.parent}" names a namespace that has no route.`,
          'placement',
        );
        continue;
      }
      home = {
        parentRoute,
        slot: placed.slot,
        order: doc.placement.order ?? null,
      };
    } else if (doc.group != null) {
      const matches = adoptionsFor(doc, declared, routeOf);
      if (matches.length > 1) {
        report(
          'overlapping_adoption',
          doc,
          `${doc.provider}/${doc.kind}/${doc.name} is adopted by ${matches
            .map(m => `"${m.namespace.doc.name}"`)
            .join(' and ')}; exactly one namespace may adopt a doc.`,
        );
        continue;
      }
      if (matches.length === 1) {
        const [{key, rule, namespace}] = matches;
        const nsRoute = /** @type {string} */ (routeOf.get(key));
        if (rule.groupBy === 'kind') {
          const group = KIND_GROUPS[doc.kind] ?? {
            segment: `${routeSegment(doc.kind)}s`,
            title: doc.kind,
            summary: `Every ${doc.kind} doc.`,
          };
          const groupRoute = `${nsRoute}/${group.segment}`;
          if (!nodes.has(groupRoute)) {
            const kinds = rule.source.kinds ?? [];
            addNode(
              {
                id: `${namespace.provider}/namespace/${namespace.doc.name}/${group.segment}`,
                route: groupRoute,
                kind: 'namespace',
                provider: namespace.provider,
                name: group.segment,
                title: group.title,
                summary: group.summary,
                parent: nsRoute,
                slot: rule.into,
                order: kinds.includes(/** @type {any} */ (doc.kind))
                  ? kinds.indexOf(/** @type {any} */ (doc.kind))
                  : null,
                generated: true,
                slots: [{name: 'items', title: group.title, children: []}],
                source: namespace.source,
              },
              namespace,
            );
          }
          const groupNode = nodes.get(groupRoute);
          if (!groupNode?.generated) continue;
          home = {parentRoute: groupRoute, slot: 'items', order: null};
        } else {
          home = {parentRoute: nsRoute, slot: rule.into, order: null};
        }
      }
    }
    if (home == null) continue;
    const segment = routeSegment(doc.name);
    if (segment === '') {
      report(
        'invalid_placement',
        doc,
        `${doc.provider}/${doc.kind}/${doc.name} has no route segment: its name holds no letters or digits.`,
        'name',
      );
      continue;
    }
    addNode(
      {
        id: `${doc.provider}/${doc.kind}/${doc.name}`,
        route: `${home.parentRoute}/${segment}`,
        kind: doc.kind,
        provider: doc.provider,
        name: doc.name,
        title: doc.title,
        summary: doc.summary,
        parent: home.parentRoute,
        slot: home.slot,
        order: home.order,
        generated: false,
        slots: [],
        source: doc.source,
        ...(doc.ref === undefined ? {} : {ref: doc.ref}),
      },
      doc,
    );
  }

  // Children, per slot, in reading order: order, then title, then id.
  for (const node of nodes.values()) {
    if (node.parent == null) continue;
    const parent = nodes.get(node.parent);
    parent?.slots
      .find(slot => slot.name === node.slot)
      ?.children.push(node.route);
  }
  for (const node of nodes.values()) {
    for (const slot of node.slots) {
      slot.children.sort((a, b) => {
        const x = /** @type {TreeNode} */ (nodes.get(a));
        const y = /** @type {TreeNode} */ (nodes.get(b));
        return (
          (x.order ?? Infinity) - (y.order ?? Infinity) ||
          byText(x.title.toLowerCase(), y.title.toLowerCase()) ||
          byText(x.id, y.id)
        );
      });
    }
  }

  const sorted = new Map([...nodes.entries()].sort(([a], [b]) => byText(a, b)));
  return {
    nodes: sorted,
    diagnostics: sortDiagnostics(diagnostics),
    get: route => sorted.get(route),
    roots: () => [...sorted.values()].filter(node => node.parent == null),
    ancestors: node => {
      /** @type {TreeNode[]} */
      const chain = [];
      let parent = node.parent == null ? undefined : sorted.get(node.parent);
      while (parent) {
        chain.unshift(parent);
        parent = parent.parent == null ? undefined : sorted.get(parent.parent);
      }
      return chain;
    },
  };
}

/**
 * Check a placement against the namespace it names: the namespace exists in
 * the doc's own package, the slot is one it declares, and the slot accepts the
 * doc's kind.
 * @param {DocPlacement} placement
 * @param {string} kind
 * @param {{provider: string}} at
 * @param {Map<string, TreeNamespaceInput>} declared
 * @returns {{key: string, slot: string} | {error: string}}
 */
function checkPlacement(placement, kind, at, declared) {
  const target = resolveParent(placement.parent, at.provider, declared);
  if ('error' in target) return target;
  const parent = /** @type {TreeNamespaceInput} */ (declared.get(target.key));
  const slotNames = Object.keys(parent.doc.slots);
  const slot = placement.slot ?? (slotNames.length === 1 ? slotNames[0] : null);
  if (slot == null) {
    return {
      error: `placement names no slot, and namespace "${parent.doc.name}" has ${slotNames.length} (${slotNames.join(', ')}). Name one with placement.slot.`,
    };
  }
  const declaredSlot = parent.doc.slots[slot];
  if (declaredSlot == null) {
    return {
      error: `placement.slot "${slot}" is not a slot of namespace "${parent.doc.name}"; it declares ${slotNames.join(', ')}.`,
    };
  }
  if (!declaredSlot.accepts.kinds.includes(/** @type {any} */ (kind))) {
    return {
      error: `slot "${slot}" of namespace "${parent.doc.name}" does not accept ${kind} docs; it accepts ${declaredSlot.accepts.kinds.join(', ')}.`,
    };
  }
  return {key: target.key, slot};
}

/**
 * Every adoption rule in the doc's own package that matches its group and
 * kind, from namespaces that have a route.
 * @param {TreeDocInput} doc
 * @param {Map<string, TreeNamespaceInput>} declared
 * @param {Map<string, string | null>} routeOf
 */
function adoptionsFor(doc, declared, routeOf) {
  /** @type {Array<{key: string, namespace: TreeNamespaceInput, rule: NonNullable<NamespaceDoc['adopts']>[number]}>} */
  const matches = [];
  for (const [key, namespace] of declared) {
    if (namespace.provider !== doc.provider || routeOf.get(key) == null)
      continue;
    for (const rule of namespace.doc.adopts ?? []) {
      if (rule.source.group !== doc.group) continue;
      if (
        rule.source.kinds &&
        !rule.source.kinds.includes(/** @type {any} */ (doc.kind))
      ) {
        continue;
      }
      matches.push({key, namespace, rule});
    }
  }
  return matches;
}

/**
 * The files under {@link TREE_DOCS_DIR}, sorted.
 * @param {string} [dir]
 * @returns {string[]}
 */
export function treeDocFiles(dir = TREE_DOCS_DIR) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(file => /^[\w-]+\.doc\.mjs$/u.test(file))
    .sort(byText)
    .map(file => path.join(dir, file));
}

/**
 * The CLI's own tree inputs: the namespace docs and guides under
 * assets/docs/tree, and, unless left out, every typed self-doc with its
 * `namespace` group. A file that fails to load or parse is a diagnostic, never
 * a thrown error.
 * @param {{selfDocs?: boolean, dir?: string}} [options]
 * @returns {Promise<{namespaces: TreeNamespaceInput[], docs: TreeDocInput[], diagnostics: CompilerDiagnostic[]}>}
 */
export async function loadTreeInputs({
  selfDocs = true,
  dir = TREE_DOCS_DIR,
} = {}) {
  /** @type {TreeNamespaceInput[]} */
  const namespaces = [];
  /** @type {TreeDocInput[]} */
  const docs = [];
  /** @type {CompilerDiagnostic[]} */
  const diagnostics = [];
  for (const file of treeDocFiles(dir)) {
    const source = packageSource(file);
    const at = {provider: CLI_PROVIDER, source};
    let doc;
    try {
      doc = await readDocView(file, {
        root: 'tree',
        provider: CLI_PROVIDER,
        loader: 'native',
        strict: true,
      });
    } catch (error) {
      diagnostics.push(
        diagnostic('invalid_doc', {
          ...at,
          message: error instanceof Error ? error.message : String(error),
        }),
      );
      continue;
    }
    const stem = path.basename(file, '.doc.mjs');
    if (doc?.name !== stem) {
      diagnostics.push(
        diagnostic('invalid_doc', {
          ...at,
          field: 'name',
          message: `${path.basename(file)} declares name "${doc?.name}"; a docs tree file is named after its doc (${doc?.name}.doc.mjs).`,
        }),
      );
      continue;
    }
    if (doc.type === 'namespace') {
      namespaces.push({provider: CLI_PROVIDER, source, doc});
    } else if (doc.type === 'generic') {
      if (doc.placement == null) {
        diagnostics.push(
          diagnostic('invalid_placement', {
            ...at,
            field: 'placement',
            message: `${path.basename(file)} has no placement. A guide in the docs tree names its parent namespace with placement.parent.`,
          }),
        );
        continue;
      }
      docs.push({
        provider: CLI_PROVIDER,
        source,
        kind: 'generic',
        name: doc.name,
        title: doc.title,
        summary: doc.description,
        group: null,
        placement: doc.placement,
        ref: {topicFile: file},
      });
    } else {
      diagnostics.push(
        diagnostic('wrong_kind', {
          ...at,
          message: `${path.basename(file)} is stamped type ${JSON.stringify(doc?.type)}; the docs tree reads namespace and generic docs.`,
        }),
      );
    }
  }
  if (selfDocs) {
    const {loaded} = await loadCliSelfDocs();
    for (const {source, doc} of loaded) {
      docs.push({
        provider: CLI_PROVIDER,
        source: `${CLI_PROVIDER}/${source}`,
        kind: doc.type,
        name: doc.name,
        title: doc.displayName ?? doc.name,
        summary: doc.summary ?? doc.description ?? '',
        group: typeof doc.namespace === 'string' ? doc.namespace : null,
        placement: doc.placement,
        ref: {selfDoc: doc},
      });
    }
  }
  return {namespaces, docs, diagnostics};
}

/** @type {Map<string, Promise<DocsTree>>} */
const built = new Map();

/**
 * The CLI's own docs tree, built once per process. With `selfDocs: false` it
 * holds only the namespaces and guides, which is all a topic list needs.
 * @param {{selfDocs?: boolean, fresh?: boolean}} [options]
 * @returns {Promise<DocsTree>}
 */
export function loadDocsTree({selfDocs = true, fresh = false} = {}) {
  const key = selfDocs ? 'full' : 'namespaces';
  let tree = fresh ? undefined : built.get(key);
  if (!tree) {
    tree = loadTreeInputs({selfDocs}).then(inputs => {
      const result = buildDocsTree(inputs);
      return {
        ...result,
        diagnostics: sortDiagnostics([
          ...inputs.diagnostics,
          ...result.diagnostics,
        ]),
      };
    });
    built.set(key, tree);
  }
  return tree;
}
