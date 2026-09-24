// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Every current doc route has one reviewed row in doc-routes.json.
 *
 * @input doc-routes.json and doc-routes.ids.json beside this file, and the
 *   routes the CLI answers today: its built-in doc topics and their section
 *   keys, the docsite pages built from those topic files, and every typed
 *   descriptor the doc compiler reads, with the read that reaches each one.
 * @output Failures naming each route the table misses, each row naming a
 *   route that no longer exists, and each row without a rationale or with a
 *   placement the proposal does not define.
 * @position Guard for the docs-graph migration. The table is a proposal a
 *   person reviews; this test keeps it complete and well formed, so a new
 *   route cannot land unmapped. It reads the CLI and changes nothing.
 */

import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {component} from '../api/component/component.mjs';
import {docs} from '../api/docs/docs.mjs';
import {hook} from '../api/hook/hook.mjs';
import {template} from '../api/template/template.mjs';
import {themeListAvailable} from '../api/theme/list/list.mjs';
import {program} from '../clients/cli/index.mjs';
import {Project} from '../foundation/config/project.mjs';
import {loadDocs} from '../foundation/discovery/component-loader.mjs';
import {collectDocInputs} from '../foundation/doc-compiler/inputs.mjs';
import {CLI_ROOT} from '../foundation/fs/paths.mjs';

const REPO_ROOT = path.resolve(CLI_ROOT, '..', '..');
const TABLE_FILE = path.join(CLI_ROOT, 'test', 'doc-routes.json');
const SLOW = 120_000;

/**
 * How the CLI reaches one typed descriptor today, by kind. A kind missing
 * here is new: decide its route before mapping it.
 * @type {Record<string, string | null>}
 */
const DESCRIPTOR_ROUTES = {
  component: 'astryx component <id>',
  'component-member': 'astryx component <id>',
  hook: 'astryx hook <id>',
  page: 'astryx template <id> --type page',
  block: 'astryx template <id> --type block',
  theme: 'astryx theme add <id>',
  command: 'astryx <id> --help',
  function: null,
  schema: null,
  enum: null,
};

const SEGMENT = '[a-z0-9]+(?:-[a-z0-9]+)*';
const PACKAGE = '(?:@[a-z0-9][a-z0-9._-]*/)?[a-z0-9][a-z0-9._-]*';
const PLACEMENT = new RegExp(
  `^(?:keep-flat|namespace:(${SEGMENT})(?:/${SEGMENT})*|generated:(${PACKAGE})/(${SEGMENT}))$`,
);

/**
 * @typedef {object} RouteRow
 * @property {string} kind
 * @property {string} id
 * @property {string} [provider]
 * @property {number} [count]
 * @property {string | null} oldCliRoute
 * @property {string | null} oldDocsiteUrl
 * @property {Record<string, string>} [docsiteExceptions]
 * @property {string} placement
 * @property {unknown} aliasNeeded
 * @property {string} [evidence]
 * @property {string} rationale
 * @property {string} status
 */

/**
 * A topic or section route as the CLI and the docsite answer it today.
 * @typedef {object} Route
 * @property {'topic' | 'section'} kind
 * @property {string} id `topic` or `topic#key`
 * @property {string} oldCliRoute
 * @property {string | null} oldDocsiteUrl
 */

/**
 * Typed descriptors of one provider and kind.
 * @typedef {object} Group
 * @property {string} id `<provider>/<kind>`
 * @property {string} provider
 * @property {string} kind
 * @property {Set<string>} ids
 * @property {Set<string>} unreachable ids the kind's route does not reach
 * @property {Set<string>} placed ids whose descriptor authors a placement
 */

/** @type {string} */
let tmpDir;
/** @type {Map<string, Route>} */
let routes;
/** @type {Map<string, Group>} */
let groups;
/** @type {{idsFile: string, namespaces: any[], rows: RouteRow[]}} */
let table;
/** @type {Record<string, string[]>} */
let idsFile;

beforeAll(async () => {
  // Inside the repo, so the project finds this checkout's Core, and bare, so
  // no integration adds a route.
  tmpDir = fs.mkdtempSync(path.join(REPO_ROOT, '.astryx-doc-routes-'));
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify({name: 'consumer', version: '1.0.0'}),
  );
  table = JSON.parse(fs.readFileSync(TABLE_FILE, 'utf-8'));
  idsFile = JSON.parse(
    fs.readFileSync(
      path.join(path.dirname(TABLE_FILE), table.idsFile),
      'utf-8',
    ),
  );
  routes = await currentTopicRoutes(tmpDir);
  groups = await currentDescriptorGroups(tmpDir);
}, SLOW);

afterAll(() => {
  if (tmpDir) fs.rmSync(tmpDir, {recursive: true, force: true});
});

/**
 * Topics the docsite does not publish: /docs/cli is the @astryxdesign/cli
 * package page, so apps/docsite/scripts/generate-data.mjs skips the cli topic
 * until the namespace page takes that URL.
 */
const DOCSITE_SKIPPED_TOPICS = new Set(['cli']);

/**
 * Every built-in topic and section key, with the docsite URL for each.
 * @param {string} cwd
 * @returns {Promise<Map<string, Route>>}
 */
async function currentTopicRoutes(cwd) {
  /** @type {Map<string, Route>} */
  const found = new Map();
  const list = /** @type {any} */ (await docs(undefined, undefined, {cwd}));
  for (const {topic} of list.data) {
    // The docsite builds one page per topic file the CLI ships, except the
    // topics apps/docsite/scripts/generate-data.mjs skips.
    const file = path.join(CLI_ROOT, 'assets', 'docs', `${topic}.doc.mjs`);
    const page =
      fs.existsSync(file) && !DOCSITE_SKIPPED_TOPICS.has(topic)
        ? `/docs/${topic}`
        : null;
    found.set(topic, {
      kind: 'topic',
      id: topic,
      oldCliRoute: `astryx docs ${topic}`,
      oldDocsiteUrl: page,
    });
    const index = /** @type {any} */ (
      await docs(topic, undefined, {index: true, cwd})
    );
    const authored = page ? (await authoredDoc(file)).sections : [];
    const anchors = docsiteAnchors(authored);
    index.data.sections.forEach(
      (
        /** @type {{id: string, title: string}} */ section,
        /** @type {number} */ i,
      ) => {
        const anchored = page != null && authored[i]?.title === section.title;
        found.set(`${topic}#${section.id}`, {
          kind: 'section',
          id: `${topic}#${section.id}`,
          oldCliRoute: `astryx docs ${topic} ${section.id}`,
          oldDocsiteUrl: anchored ? `${page}#${anchors[i]}` : null,
        });
      },
    );
  }
  return found;
}

/**
 * The docsite's outline ids for a topic's sections, in order. Mirrors
 * apps/docsite ReferenceDocView: slugged titles, deduped across sections and
 * their heading blocks in reading order.
 * @param {Array<{title: string, content?: Array<{type: string, text?: string}>}>} sections
 * @returns {string[]}
 */
function docsiteAnchors(sections) {
  /** @type {Map<string, number>} */
  const seen = new Map();
  /** @param {string} value @param {string} fallback */
  const unique = (value, fallback) => {
    const slug =
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || fallback;
    const count = seen.get(slug) ?? 0;
    seen.set(slug, count + 1);
    return count === 0 ? slug : `${slug}-${count + 1}`;
  };
  return sections.map(section => {
    const id = unique(section.title, 'section');
    for (const block of section.content ?? []) {
      if (block.type === 'heading' && block.text) {
        unique(`${section.title} ${block.text}`, `${id}-heading`);
      }
    }
    return id;
  });
}

/**
 * The authored object a descriptor file exports. Fails closed: a file with
 * none would otherwise pass every check on the fields it lacks.
 * @param {string} file
 * @returns {Promise<Record<string, any>>}
 */
async function authoredDoc(file) {
  const mod = await import(pathToFileURL(file).href);
  const doc = mod.docs ?? mod.doc ?? mod.default;
  if (doc == null || typeof doc !== 'object') {
    throw new Error(`${path.relative(REPO_ROOT, file)} exports no doc object`);
  }
  return doc;
}

/**
 * @param {Map<string, Group>} found
 * @param {string} provider
 * @param {string} kind
 * @returns {Group}
 */
function groupOf(found, provider, kind) {
  const id = `${provider}/${kind}`;
  let group = found.get(id);
  if (!group) {
    group = {
      id,
      provider,
      kind,
      ids: new Set(),
      unreachable: new Set(),
      placed: new Set(),
    };
    found.set(id, group);
  }
  return group;
}

/**
 * Every typed descriptor the compiler reads, grouped by provider and kind,
 * plus the component names that read into another component's doc.
 * @param {string} cwd
 * @returns {Promise<Map<string, Group>>}
 */
async function currentDescriptorGroups(cwd) {
  const {inputs, problems} = await collectDocInputs(await Project.load(cwd));
  if (problems.length > 0) throw new Error(JSON.stringify(problems));

  /** @type {Map<string, Group>} */
  const found = new Map();
  for (const input of inputs) {
    // A topic's own file is a topic route; everything else is a descriptor.
    if (input.root === 'docs' && input.role === 'base') continue;
    const doc = await authoredDoc(input.file);
    let kind = input.root.replace(/s$/u, '');
    let id = input.name;
    if (input.root === 'templates') [kind, id] = input.name.split('/');
    if (input.root === 'self-docs') [kind, id] = [doc.type, doc.name];
    const group = groupOf(found, input.owner, kind);
    if (group.ids.has(id)) throw new Error(`${group.id} reads "${id}" twice`);
    group.ids.add(id);
    if ('placement' in doc) group.placed.add(id);
  }

  await addComponentMembers(found, inputs, cwd);
  await markUnreachable(found, cwd);
  return found;
}

/**
 * Names `component <Name>` resolves into another component's doc: a member
 * of its `components` list, or the name the doc declares for itself. Only a
 * name the read answers under that name is a route.
 * @param {Map<string, Group>} found
 * @param {import('../foundation/doc-compiler/inputs.mjs').DocInput[]} inputs
 * @param {string} cwd
 */
async function addComponentMembers(found, inputs, cwd) {
  const own = new Set(
    inputs
      .filter(input => input.root === 'components' || input.root === 'hooks')
      .map(input => input.name),
  );
  for (const input of inputs) {
    if (input.root !== 'components') continue;
    const doc = /** @type {any} */ (await loadDocs(input.file));
    const names = (doc.components ?? [])
      .filter((/** @type {object} */ entry) => Object.keys(entry).length > 1)
      .map((/** @type {{name?: string}} */ entry) => String(entry.name ?? ''));
    if (typeof doc.name === 'string') names.push(doc.name);
    for (const raw of names) {
      const name = raw.replace(/^XDS/u, '');
      if (!name || name === input.name || own.has(name)) continue;
      const read = await component(name, {cwd}).catch(() => null);
      if (read?.type === 'component.detail' && read.data?.name === name) {
        groupOf(found, input.owner, 'component-member').ids.add(name);
      }
    }
  }
}

/**
 * Record every id its kind's route does not reach.
 * @param {Map<string, Group>} found
 * @param {string} cwd
 */
async function markUnreachable(found, cwd) {
  const list = /** @type {any} */ (
    await template(undefined, {list: true, cwd})
  );
  const templates = new Set(
    list.data.map(
      (/** @type {{type: string, id: string}} */ t) => `${t.type}/${t.id}`,
    ),
  );
  const themes = new Set(
    (await themeListAvailable({cwd})).data.map(theme => theme.slug),
  );
  const commands = commandPaths();
  for (const group of found.values()) {
    for (const id of group.ids) {
      let reached = true;
      if (group.kind === 'component') {
        const read = await component(id, {cwd}).catch(() => null);
        reached = read?.type === 'component.detail';
      } else if (group.kind === 'hook') {
        const read = await hook(id, {cwd}).catch(() => null);
        reached = read?.type === 'hook.detail';
      } else if (group.kind === 'page' || group.kind === 'block') {
        // `template <id> --type <kind>` resolves against this same list.
        reached = templates.has(`${group.kind}/${id}`);
      } else if (group.kind === 'theme') {
        reached = themes.has(id);
      } else if (group.kind === 'command') {
        reached = commands.has(id);
      }
      if (!reached) group.unreachable.add(id);
    }
  }
}

/** Every command path the CLI registers, as typed after `astryx`. */
function commandPaths() {
  /** @type {Set<string>} */
  const paths = new Set();
  /** @param {import('commander').Command} parent @param {string} prefix */
  const walk = (parent, prefix) => {
    for (const cmd of parent.commands) {
      const name = prefix ? `${prefix} ${cmd.name()}` : cmd.name();
      paths.add(name);
      walk(cmd, name);
    }
  };
  walk(program, '');
  return paths;
}

/** @param {RouteRow} row @returns {boolean} */
const isDescriptorRow = row => row.kind !== 'topic' && row.kind !== 'section';

/**
 * A row to paste and complete: the rationale and placement stay empty, so
 * the table fails until a person decides them.
 * @param {Route | Group} route
 */
function skeleton(route) {
  const fields =
    'provider' in route
      ? {provider: route.provider, count: route.ids.size}
      : {oldCliRoute: route.oldCliRoute, oldDocsiteUrl: route.oldDocsiteUrl};
  return JSON.stringify({
    kind: route.kind,
    id: route.id,
    ...fields,
    placement: '',
    aliasNeeded: false,
    rationale: '',
    status: 'proposed',
  });
}

describe('doc route inventory', () => {
  it('(a) maps every current route', () => {
    const rows = new Map(table.rows.map(row => [row.id, row]));
    /** @type {string[]} */
    const missing = [];
    for (const route of routes.values()) {
      if (rows.get(route.id)?.kind !== route.kind) {
        missing.push(`no row for ${route.oldCliRoute}: ${skeleton(route)}`);
      }
    }
    for (const group of groups.values()) {
      if (rows.get(group.id)?.kind !== group.kind) {
        missing.push(`no row for ${group.id}: ${skeleton(group)}`);
        continue;
      }
      const listed = new Set(idsFile[group.id] ?? []);
      for (const id of group.ids) {
        if (!listed.has(id)) {
          missing.push(`${group.id} "${id}" is missing from ${table.idsFile}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('(b) names only routes that exist', () => {
    /** @type {string[]} */
    const stale = [];
    for (const row of table.rows) {
      if (!isDescriptorRow(row)) {
        const route = routes.get(row.id);
        if (route?.kind !== row.kind) {
          stale.push(`${row.id}: no such ${row.kind}`);
          continue;
        }
        if (row.oldCliRoute !== route.oldCliRoute) {
          stale.push(`${row.id}: the CLI route is ${route.oldCliRoute}`);
        }
        if (row.oldDocsiteUrl !== route.oldDocsiteUrl) {
          stale.push(`${row.id}: the docsite URL is ${route.oldDocsiteUrl}`);
        }
        continue;
      }
      const group = groups.get(row.id);
      if (group?.kind !== row.kind) {
        stale.push(`${row.id}: no ${row.kind} descriptors under this id`);
        continue;
      }
      if (!(row.kind in DESCRIPTOR_ROUTES)) {
        stale.push(`${row.id}: no known route for kind ${row.kind}`);
      } else if (row.oldCliRoute !== DESCRIPTOR_ROUTES[row.kind]) {
        stale.push(
          `${row.id}: the CLI route is ${DESCRIPTOR_ROUTES[row.kind]}`,
        );
      }
      if (row.provider !== group.provider) {
        stale.push(`${row.id}: the provider is ${group.provider}`);
      }
      const listed = idsFile[row.id] ?? [];
      if (row.count !== listed.length) {
        stale.push(
          `${row.id}: count ${row.count}, ${table.idsFile} lists ${listed.length}`,
        );
      }
      const seen = new Set();
      for (const id of listed) {
        if (seen.has(id)) stale.push(`${row.id} "${id}" is listed twice`);
        seen.add(id);
        if (!group.ids.has(id)) {
          stale.push(`${row.id} "${id}" no longer exists`);
        } else if (group.unreachable.has(id)) {
          stale.push(`${row.id} "${id}": ${row.oldCliRoute} does not reach it`);
        }
      }
      for (const id of Object.keys(row.docsiteExceptions ?? {})) {
        if (!group.ids.has(id)) {
          stale.push(
            `${row.id}: docsite exception for "${id}", which no longer exists`,
          );
        }
      }
    }
    const rowIds = new Set(table.rows.map(row => row.id));
    for (const key of Object.keys(idsFile)) {
      if (!rowIds.has(key)) stale.push(`${table.idsFile}: "${key}" has no row`);
    }
    expect(stale).toEqual([]);
  });

  it('(c) gives every row a rationale and a known placement', () => {
    const created = new Set(
      table.namespaces
        .filter(ns => ns.decision === 'create')
        .map(ns => ns.name),
    );
    const topics = new Map(
      table.rows.filter(row => row.kind === 'topic').map(row => [row.id, row]),
    );
    /** @type {string[]} */
    const bad = [];
    const seen = new Set();
    for (const row of table.rows) {
      const at = row.id;
      if (seen.has(at)) bad.push(`${at}: two rows`);
      seen.add(at);
      if (typeof row.rationale !== 'string' || row.rationale.trim() === '') {
        bad.push(`${at}: no rationale`);
      }
      if (row.status !== 'proposed') {
        bad.push(`${at}: status is not "proposed"`);
      }
      if (typeof row.aliasNeeded !== 'boolean') {
        bad.push(`${at}: aliasNeeded is not a boolean`);
      }
      const form = PLACEMENT.exec(row.placement ?? '');
      if (!form) {
        bad.push(`${at}: unknown placement "${row.placement}"`);
        continue;
      }
      const [, namespace, provider, kind] = form;
      if (row.placement === 'keep-flat') {
        if (row.aliasNeeded === true) {
          bad.push(`${at}: keep-flat needs no alias`);
        }
      } else if (
        typeof row.evidence !== 'string' ||
        row.evidence.trim() === ''
      ) {
        bad.push(`${at}: ${row.placement} needs an evidence note`);
      }
      if (namespace != null && !created.has(namespace)) {
        bad.push(`${at}: namespace "${namespace}" is not decided "create"`);
      }
      if (provider != null) {
        // A member has no doc of its own; it goes where its parent doc goes.
        const placedAs =
          row.kind === 'component-member' ? 'component' : row.kind;
        const placed = [...(groups.get(at)?.placed ?? [])];
        if (!isDescriptorRow(row)) {
          bad.push(`${at}: generated placement is for typed descriptors`);
        } else if (provider !== row.provider || kind !== placedAs) {
          bad.push(
            `${at}: generated placement must be ${row.provider}/${placedAs}`,
          );
        } else if (placed.length > 0) {
          bad.push(`${at}: ${placed.join(', ')} author a placement`);
        }
      }
      if (row.kind === 'section') {
        const hash = at.indexOf('#');
        const topic = hash > 0 ? topics.get(at.slice(0, hash)) : undefined;
        if (topic && row.placement !== topic.placement && !row.evidence) {
          bad.push(`${at}: leaves its topic without an evidence note`);
        }
        if (topic?.aliasNeeded === true && row.aliasNeeded !== true) {
          bad.push(`${at}: its topic moves, so its old route needs an alias`);
        }
      }
    }
    for (const ns of table.namespaces) {
      const at = `namespace "${ns.name}"`;
      if (!new RegExp(`^${SEGMENT}$`).test(ns.name)) {
        bad.push(`${at}: not a path segment`);
      }
      if (ns.decision !== 'create' && ns.decision !== 'reject') {
        bad.push(`${at}: decision must be create or reject`);
      }
      if (typeof ns.evidence !== 'string' || ns.evidence.trim() === '') {
        bad.push(`${at}: no evidence`);
      }
      const used = table.rows.some(
        row =>
          row.placement === `namespace:${ns.name}` ||
          row.placement?.startsWith(`namespace:${ns.name}/`),
      );
      if (ns.decision === 'create' && !used) {
        bad.push(`${at}: created, but no row is placed in it`);
      }
    }
    expect(bad).toEqual([]);
  });
});
