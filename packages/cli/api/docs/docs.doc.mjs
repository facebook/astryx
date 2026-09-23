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
  displayName: 'docs()',
  summary:
    'Read the reference docs: list every topic, one topic\'s sections, one section, or a whole topic.',
  description:
    'No topic lists every reference-doc topic; a topic returns that full ' +
    'ReferenceDoc; `index: true` returns the topic\'s section index instead ' +
    '(each section\'s key, title, and summary); a topic plus a section returns ' +
    'that one section, found by its key, then its exact title, then a unique ' +
    'part of its title (an ambiguous query is refused). Token-ref blocks are ' +
    'inlined in every read. The topic set is the CLI\'s own docs plus the ' +
    'ones the project\'s configured integrations contribute, including any ' +
    'topic an integration replaces or extends, so it depends on the cwd. ' +
    'Overlay options select localized or dense variants.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'docs(topic?: string, section?: string, options?: DocsOptions): Promise<DocsListResponse | DocsIndexResponse | DocsDetailResponse | DocsDetailSectionResponse>',
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
        "Doc topic to load (e.g. 'principles'). Omit to list all topics.",
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
      description: 'Return the token-efficient dense doc variant.',
    },
    {
      name: 'options.index',
      type: 'boolean',
      description:
        "Return the topic's section index (each section's key, title, and summary) instead of the whole doc.",
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
        'All available reference-doc topics as DocsListEntry[] ({topic, description, package, replaces?}), in read order.',
    },
    {
      type: 'docs.detail',
      description:
        "One topic's full ReferenceDoc, with token-ref blocks inlined.",
    },
    {
      type: 'docs.index',
      description:
        "One topic's section index (index: true): {name, title, description, sections: [{id, title, summary}]}.",
    },
    {
      type: 'docs.detail.section',
      description:
        'One ReferenceSection of the topic, found by key or title, with token-ref blocks inlined.',
    },
  ],
  throws: [
    {
      code: 'ERR_UNKNOWN_TOPIC',
      when: 'the topic is not a string or matches no known doc topic',
    },
    {
      code: 'ERR_UNKNOWN_SECTION',
      when: 'a section is requested but is empty, matches no section, or matches more than one',
    },
  ],
  examples: [
    {label: 'List topics', code: 'const r = await docs();'},
    {label: 'Load a topic', code: "await docs('principles');"},
    {
      label: "A topic's sections",
      code: "await docs('principles', undefined, {index: true});",
    },
    {label: 'One section by key', code: "await docs('tokens', 'spacing');"},
  ],
  command: 'docs',
  related: ['search', 'component', 'hook', 'template'],
};
