// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The CLI's own docs, read by their `namespace`: every command, API
 * function, schema, and enum doc the CLI ships says which `astryx docs` topic
 * reads it, and the `cli` topic is built from the ones that name it.
 *
 * @input The command, function, schema, and enum docs under
 *   clients/cli/commands, api, authoring, and foundation.
 * @output {@link buildCliTopic} for `astryx docs cli`, and
 *   {@link auditCliSelfDocs}, which `astryx doctor` runs.
 * @position foundation/discovery — the reader for docs whose namespace starts
 *   with `cli/`. The authoring topic reads the `authoring` namespace from its
 *   own list (authoring-self-docs.mjs).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT} from '../fs/paths.mjs';
import {readDocView} from '../doc-compiler/read.mjs';
import {AUTHORING_SELF_DOCS, selfDocSection} from './authoring-self-docs.mjs';
import {
  DOC_OUTPUT_BUDGET_BYTES,
  oversizedDocSections,
} from './docs-output-budget.mjs';
import {sectionKeyProblems} from './docs-section-key.mjs';

/** The directories, relative to the CLI root, that hold the CLI's own docs. */
export const CLI_SELF_DOC_DIRS = [
  'clients/cli/commands',
  'api',
  'authoring',
  'foundation',
];

/** The doc kinds that declare a namespace. */
const NAMESPACED_KINDS = new Set(['command', 'function', 'schema', 'enum']);

/**
 * Every namespace a CLI doc may declare, and the topic that reads it. A doc in
 * a `cli/` namespace is the section `<key prefix>-<name>` of `astryx docs cli`;
 * a doc in `authoring` is a section of `astryx docs authoring`.
 * @type {Record<string, {topic: string, keyPrefix?: string}>}
 */
export const CLI_DOC_NAMESPACES = {
  'cli/commands': {topic: 'cli', keyPrefix: 'commands'},
  'cli/api': {topic: 'cli', keyPrefix: 'api'},
  authoring: {topic: 'authoring'},
};

/** Blocks a doc's notes may carry that a topic section can render. */
const TOPIC_BLOCKS = new Set(['prose', 'list', 'code', 'heading', 'table']);

/** Section order within the `cli` topic: commands, then the API by kind. */
const KIND_ORDER = ['command', 'function', 'schema', 'enum'];

/**
 * Every `*.doc.mjs` under the CLI's doc directories, relative to `root` and
 * sorted. Fixture, test, and dependency directories are skipped.
 * @param {string} [root]
 * @returns {string[]}
 */
export function discoverCliSelfDocSources(root = CLI_ROOT) {
  /** @type {string[]} */
  const found = [];
  /** @param {string} dir */
  const walk = dir => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      if (
        entry.name === 'node_modules' ||
        entry.name.startsWith('__') ||
        entry.name.startsWith('.')
      ) {
        continue;
      }
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.doc.mjs')) {
        found.push(path.relative(root, full).split(path.sep).join('/'));
      }
    }
  };
  for (const dir of CLI_SELF_DOC_DIRS) walk(path.join(root, dir));
  return found.sort();
}

/**
 * Read each doc through the compiler and keep the kinds that declare a
 * namespace. One that fails is reported, never thrown, so one bad file cannot
 * take the rest of the topic down with it.
 * @param {string[]} [sources]
 * @param {string} [root]
 * @returns {Promise<{loaded: {source: string, doc: any}[], failed: {source: string, error: string}[]}>}
 */
export async function loadCliSelfDocs(
  sources = discoverCliSelfDocSources(),
  root = CLI_ROOT,
) {
  const loaded = [];
  const failed = [];
  for (const source of sources) {
    try {
      const doc = await readDocView(path.join(root, source), {
        root: 'self-docs',
        loader: 'native',
      });
      if (!NAMESPACED_KINDS.has(doc?.type)) continue;
      if (typeof doc.name !== 'string' || doc.name === '') {
        throw new Error('exports no doc with a name');
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
 * A name as a section-key segment: lowercase words joined by hyphens.
 * `integrationPackCheck` and `integration pack` both read naturally.
 * @param {string} name
 * @returns {string}
 */
export function keySegment(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * The section key a doc is read by in `astryx docs cli`, or null when its
 * namespace is not one of the topic's.
 * @param {any} doc
 * @returns {string | null}
 */
export function cliSectionKey(doc) {
  const prefix = CLI_DOC_NAMESPACES[doc?.namespace]?.keyPrefix;
  if (prefix == null) return null;
  return `${prefix}-${keySegment(String(doc.name))}`;
}

/** @param {unknown} value */
function defaultText(value) {
  if (value === undefined || value === false || value === '') return null;
  if (Array.isArray(value)) return value.length > 0 ? value.join(' ') : null;
  return String(value);
}

/**
 * @param {any} cmd
 * @returns {string}
 */
function usage(cmd) {
  const args = (cmd.args ?? []).map((/** @type {any} */ arg) => {
    const name = arg.variadic ? `${arg.name}...` : arg.name;
    return arg.required ? `<${name}>` : `[${name}]`;
  });
  return ['astryx', cmd.name, ...args].join(' ');
}

/**
 * The text for a command option or argument: its own, or else the text of the
 * API parameter it maps to, as `--help` shows.
 * @param {{description?: string, param?: string}} entry
 * @param {any} fn the FunctionDoc the command calls, if any
 * @returns {string}
 */
function entryText(entry, fn) {
  if (typeof entry.description === 'string' && entry.description !== '') {
    return entry.description;
  }
  const param = (fn?.params ?? []).find(
    (/** @type {any} */ p) => p.name === entry.param,
  );
  return typeof param?.description === 'string' ? param.description : '';
}

/**
 * `text`, ending in a full stop when more text follows it in the same cell.
 * @param {string} text
 * @param {boolean} more
 */
function sentence(text, more) {
  return more && text !== '' && !/[.!?:]$/.test(text) ? `${text}.` : text;
}

/** @param {any[]} notes */
function noteBlocks(notes) {
  return (notes ?? []).filter(note => TOPIC_BLOCKS.has(note?.type));
}

/**
 * One command doc as a section of `astryx docs cli`.
 * @param {any} cmd
 * @param {{functions: Map<string, any>, commands: Set<string>}} index
 */
function commandSection(cmd, index) {
  const fn = cmd.fn == null ? undefined : index.functions.get(cmd.fn);
  /** @type {any[]} */
  const content = [{type: 'prose', text: cmd.summary}];
  if (cmd.description) content.push({type: 'prose', text: cmd.description});
  content.push({type: 'code', lang: 'bash', code: usage(cmd)});
  const args = cmd.args ?? [];
  if (args.length > 0) {
    content.push({
      type: 'table',
      headers: ['Argument', 'Description'],
      rows: args.map((/** @type {any} */ arg) => [
        `\`${arg.name}\``,
        entryText(arg, fn),
      ]),
    });
  }
  const options = cmd.options ?? [];
  if (options.length > 0) {
    content.push({
      type: 'table',
      headers: ['Option', 'Description'],
      rows: options.map((/** @type {any} */ option) => {
        const extra = [
          option.choices?.length
            ? `One of: ${option.choices.map((/** @type {string} */ c) => `\`${c}\``).join(', ')}.`
            : null,
          defaultText(option.default) == null
            ? null
            : `Default: \`${defaultText(option.default)}\`.`,
        ].filter(Boolean);
        return [
          `\`${option.flag}\``,
          [sentence(entryText(option, fn), extra.length > 0), ...extra]
            .filter(Boolean)
            .join(' '),
        ];
      }),
    });
  }
  const examples = (cmd.examples ?? []).flatMap((/** @type {any} */ e) =>
    e.label ? [`# ${e.label}`, e.cli] : [e.cli],
  );
  if (examples.length > 0) {
    content.push({type: 'code', lang: 'bash', code: examples.join('\n')});
  }
  const exitCodes = cmd.exitCodes ?? [];
  if (exitCodes.length > 0) {
    content.push({
      type: 'table',
      headers: ['Exit code', 'When'],
      rows: exitCodes.map((/** @type {any} */ e) => [String(e.code), e.when]),
    });
  }
  const subcommands = (cmd.subcommands ?? []).filter(
    (/** @type {string} */ sub) => index.commands.has(`${cmd.name} ${sub}`),
  );
  if (subcommands.length > 0) {
    content.push({
      type: 'list',
      style: 'unordered',
      items: subcommands.map(
        (/** @type {string} */ sub) =>
          `\`astryx ${cmd.name} ${sub}\`: \`astryx docs cli commands-${keySegment(`${cmd.name} ${sub}`)}\``,
      ),
    });
  }
  if (fn != null) {
    content.push({
      type: 'prose',
      text: `It runs \`${fn.name}()\` from \`${fn.importPath}\`. Read it with \`astryx docs cli ${cliSectionKey(fn)}\`.`,
    });
  }
  content.push(...noteBlocks(cmd.notes));
  return {
    id: cliSectionKey(cmd),
    title: cmd.displayName ?? `astryx ${cmd.name}`,
    content,
  };
}

/**
 * One API function doc as a section of `astryx docs cli`.
 * @param {any} fn
 * @param {{functions: Map<string, any>, commands: Set<string>}} index
 */
function functionSection(fn, index) {
  /** @type {any[]} */
  const content = [{type: 'prose', text: fn.summary ?? fn.description ?? ''}];
  if (fn.summary && fn.description) {
    content.push({type: 'prose', text: fn.description});
  }
  if (fn.signature) {
    content.push({type: 'code', lang: 'ts', code: fn.signature});
  }
  if (fn.importPath) {
    content.push({type: 'prose', text: `Import it from \`${fn.importPath}\`.`});
  }
  const params = fn.params ?? [];
  if (params.length > 0) {
    content.push({
      type: 'table',
      headers: ['Parameter', 'Type', 'Description'],
      rows: params.map((/** @type {any} */ p) => [
        `\`${p.name}\``,
        `\`${p.type ?? ''}\``,
        p.description ?? '',
      ]),
    });
  }
  const returns = fn.returns ?? [];
  if (returns.length > 0) {
    content.push({
      type: 'table',
      headers: ['Returns', 'Description'],
      rows: returns.map((/** @type {any} */ r) => [
        `\`${r.name ? `${r.name}: ` : ''}${r.type}\``,
        r.description ?? '',
      ]),
    });
  }
  const throws = fn.throws ?? [];
  if (throws.length > 0) {
    content.push({
      type: 'table',
      headers: ['Throws', 'When'],
      rows: throws.map((/** @type {any} */ t) => [`\`${t.code}\``, t.when]),
    });
  }
  for (const example of fn.examples ?? []) {
    if (typeof example?.code !== 'string' || example.code.trim() === '') {
      continue;
    }
    content.push({
      type: 'code',
      lang: 'ts',
      ...(example.label ? {label: example.label} : {}),
      code: example.code,
    });
  }
  if (fn.command != null && index.commands.has(fn.command)) {
    content.push({
      type: 'prose',
      text: `\`astryx ${fn.command}\` runs it. Read it with \`astryx docs cli commands-${keySegment(fn.command)}\`.`,
    });
  }
  return {
    id: cliSectionKey(fn),
    title: fn.displayName ?? `${fn.name}()`,
    content,
  };
}

/**
 * One enum doc as a section of `astryx docs cli`.
 * @param {any} doc
 */
function enumSection(doc) {
  return {
    id: cliSectionKey(doc),
    title: doc.displayName ?? doc.name,
    content: [
      {type: 'prose', text: doc.description},
      {
        type: 'table',
        headers: ['Value', 'Meaning'],
        rows: (doc.members ?? []).map((/** @type {any} */ m) => [
          `\`${m.value}\``,
          m.deprecated
            ? `${m.description} Deprecated: ${m.deprecated}`
            : m.description,
        ]),
      },
    ],
  };
}

/**
 * The docs a `cli/` namespace names, in reading order: commands by name (a
 * group before its subcommands), then API functions, schemas, and enums.
 * @param {any[]} docs
 * @returns {any[]}
 */
function cliDocsInOrder(docs) {
  return docs
    .filter(doc => CLI_DOC_NAMESPACES[doc.namespace]?.topic === 'cli')
    .sort(
      (a, b) =>
        KIND_ORDER.indexOf(a.type) - KIND_ORDER.indexOf(b.type) ||
        (a.name < b.name ? -1 : a.name > b.name ? 1 : 0),
    );
}

/**
 * The `cli` topic: one section per doc whose namespace is `cli/…`.
 * @param {any[]} docs every loaded CLI doc; the ones in other namespaces are
 *   left out
 * @returns {import('../../authoring/doctypes/reference/type').ReferenceDoc}
 */
export function buildCliReferenceDoc(docs) {
  const ordered = cliDocsInOrder(docs);
  const index = {
    functions: new Map(
      ordered.filter(d => d.type === 'function').map(d => [d.name, d]),
    ),
    commands: new Set(
      ordered.filter(d => d.type === 'command').map(d => d.name),
    ),
  };
  return /** @type {any} */ ({
    name: 'cli',
    title: 'CLI Reference',
    category: 'guide',
    description:
      'Every command and API function of the CLI, with the JSON output envelope, error codes, and response types, read from the docs the CLI ships.',
    sections: ordered.map(doc =>
      doc.type === 'command'
        ? commandSection(doc, index)
        : doc.type === 'function'
          ? functionSection(doc, index)
          : doc.type === 'enum'
            ? enumSection(doc)
            : {...selfDocSection(doc), id: cliSectionKey(doc)},
    ),
  });
}

/**
 * The `cli` topic from every CLI doc that loads. One that fails is left out
 * here and reported by {@link auditCliSelfDocs}.
 * @returns {Promise<import('../../authoring/doctypes/reference/type').ReferenceDoc>}
 */
export async function buildCliTopic() {
  const {loaded} = await loadCliSelfDocs();
  return buildCliReferenceDoc(loaded.map(entry => entry.doc));
}

/**
 * What stands between a CLI doc and a reader: a missing namespace, one no
 * topic reads, one that disagrees with the authoring topic's list, a doc that
 * fails to load, and a `cli` section that clashes or is too large.
 * @param {{root?: string, sources?: string[], budget?: number, authoringSources?: string[]}} [options]
 * @returns {Promise<{
 *   docs: number,
 *   sections: number,
 *   authoring: number,
 *   missing: string[],
 *   unknown: {source: string, namespace: string}[],
 *   misfiled: {source: string, message: string}[],
 *   failed: {source: string, error: string}[],
 *   keyProblems: string[],
 *   oversized: {key: string, title: string, bytes: number}[],
 * }>}
 */
export async function auditCliSelfDocs({
  root = CLI_ROOT,
  sources,
  budget = DOC_OUTPUT_BUDGET_BYTES,
  authoringSources = AUTHORING_SELF_DOCS,
} = {}) {
  const {loaded, failed} = await loadCliSelfDocs(
    sources ?? discoverCliSelfDocSources(root),
    root,
  );
  const listed = new Set(authoringSources.map(source => `authoring/${source}`));
  /** @type {string[]} */
  const missing = [];
  /** @type {{source: string, namespace: string}[]} */
  const unknown = [];
  /** @type {{source: string, message: string}[]} */
  const misfiled = [];
  let authoring = 0;
  for (const {source, doc} of loaded) {
    const namespace = doc.namespace;
    if (typeof namespace !== 'string' || namespace === '') {
      missing.push(source);
      continue;
    }
    if (!Object.hasOwn(CLI_DOC_NAMESPACES, namespace)) {
      unknown.push({source, namespace});
      continue;
    }
    const inAuthoring = listed.has(source);
    if (namespace === 'authoring') {
      if (inAuthoring) authoring++;
      else {
        misfiled.push({
          source,
          message: `${source} has namespace "authoring", but \`astryx docs authoring\` does not list it`,
        });
      }
    } else if (inAuthoring) {
      misfiled.push({
        source,
        message: `${source} is read in \`astryx docs authoring\`, but its namespace is "${namespace}"`,
      });
    }
  }
  const topic = buildCliReferenceDoc(loaded.map(entry => entry.doc));
  return {
    docs: loaded.length,
    sections: topic.sections.length,
    authoring,
    missing,
    unknown,
    misfiled,
    failed,
    keyProblems: sectionKeyProblems(topic.sections),
    oversized: oversizedDocSections(topic.sections, budget),
  };
}
