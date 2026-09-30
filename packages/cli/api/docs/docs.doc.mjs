// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `docs()` / `astryx docs`. Colocated with the API
 * function it documents; the shape source of truth stays in `docs.type.mjs`.
 * @position packages/cli/api/docs — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'docs',
  namespace: 'cli/api',
  displayName: 'docs()',
  summary:
    'Read the reference docs: list every topic, one topic\'s sections, one section, or a whole topic.',
  description:
    'No topic lists every reference-doc topic; a topic returns its whole ' +
    'ReferenceDoc, and `index: true` returns its section index (each ' +
    'section\'s key, title, and summary); a topic plus a section returns ' +
    'that one section. Token-ref blocks are ' +
    'inlined in every read, and so is a section\'s reference block: the doc it ' +
    'includes, then the command that opens that doc. The topic set is the CLI\'s own docs plus the ' +
    'ones the project\'s configured integrations contribute, including any ' +
    'topic an integration replaces or extends, so it depends on the cwd. ' +
    'A route opens a node of the docs tree instead: a namespace such as ' +
    "`cli/api` returns its children one level down, a typed doc such as " +
    "`cli/api/functions/search` returns its content, and a guide the tree " +
    'places (`cli/integrations/make-a-package`) reads like any topic. ' +
    'Every read but the list carries `links`, the commands that move from it: ' +
    '`up` to the level it sits in, `previous` and `next` to its neighbors, and, ' +
    'for a typed doc, `related` to the docs it names (its command or function, ' +
    'and its related docs); `previous` and `next` ' +
    'to the section or node before and after it. ' +
    'Overlay options select localized or dense variants.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'docs(topic?: string, section?: string, options?: DocsOptions): Promise<DocsListResponse | DocsIndexResponse | DocsDetailResponse | DocsDetailSectionResponse | DocsNodeResponse>',
  keywords: [
    'docs',
    'documentation',
    'reference',
    'guide',
    'topic',
    'section',
    'principles',
    'tokens',
  ],
  params: [
    {
      name: 'topic',
      type: 'string',
      description:
        "Doc topic to load (e.g. 'principles'), or a docs-tree route (e.g. 'cli/api/functions/search'). Omit to list all topics.",
    },
    {
      name: 'section',
      type: 'string',
      description:
        "Section to return: its key (from the topic's index), its title, or a unique part of its title (case-insensitive).",
    },
    {
      name: 'options.lang',
      type: 'string',
      description: 'Language code for localized doc content.',
    },
    {
      name: 'options.zh',
      type: 'boolean',
      description: 'Shorthand for Chinese (zh) doc content.',
    },
    {
      name: 'options.dense',
      type: 'boolean',
      description:
        'Return the token-efficient dense doc variant. It is written to be read whole, so it returns the whole doc.',
    },
    {
      name: 'options.index',
      type: 'boolean',
      description:
        "Return the topic's section index (each section's key, title, and summary), even for a topic with one section.",
    },
    {
      name: 'options.cwd',
      type: 'string',
      description:
        "Project directory whose configured integrations contribute topics. Defaults to process.cwd(); an unreadable config falls back to the CLI's own topics.",
    },
  ],
  returns: [
    {
      type: 'docs.list',
      description:
        "Every reference-doc topic in read order, as DocsListEntry[] ({topic, description, package, replaces?}), each readable with docs(topic). meta.namespaces lists the docs tree's top-level namespaces ({topic, description, package}), and meta.notLoaded each package whose docs did not load ({package, message}).",
    },
    {
      type: 'docs.detail',
      description:
        "One topic's full ReferenceDoc, with token-ref and reference blocks inlined, plus links.",
    },
    {
      type: 'docs.index',
      description:
        "One topic's section index (index: true): {name, title, description, sections: [{id, title, summary}], links}.",
    },
    {
      type: 'docs.detail.section',
      description:
        'One ReferenceSection of the topic, found by key or title, with token-ref and reference blocks inlined.',
    },
    {
      type: 'docs.node',
      description:
        "A namespace or typed doc in the docs tree, read by its route: {id, route, kind, package, title, summary, breadcrumb, slots, content}. A namespace lists each slot's children one level down; a typed doc carries its content.",
    },
  ],
  throws: [
    {
      code: 'ERR_UNKNOWN_TOPIC',
      when: 'the topic is not a string, or matches no topic and no docs-tree route',
    },
    {
      code: 'ERR_UNKNOWN_SECTION',
      when: 'a section is requested but is empty, matches no section, matches more than one, or is asked of a docs-tree namespace or typed doc, which have no sections',
    },
  ],
  examples: [
    {label: 'List topics', code: 'const r = await docs();'},
    {label: 'A whole topic', code: "await docs('principles');"},
    {
      label: "A topic's sections",
      code: "await docs('principles', undefined, {index: true});",
    },
    {label: 'A docs-tree namespace', code: "await docs('cli/api');"},
    {label: 'One API function', code: "await docs('cli/api/functions/search');"},
    {
      label: 'A whole guide from the docs tree',
      code: "await docs('cli/integrations/make-a-package');",
    },
    {label: 'One section by key', code: "await docs('tokens', 'spacing');"},
  ],
  command: 'docs',
  related: ['search', 'component', 'hook', 'template'],
};
