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
    'Read the reference docs: list every topic, one topic, or a single section of a topic.',
  description:
    'Routes on its arguments: no topic lists every reference-doc topic; a topic ' +
    'returns that full ReferenceDoc (with token-ref blocks inlined); a topic ' +
    'plus a section returns the first section whose title contains the ' +
    '(case-insensitive) query. The topic set is the CLI\'s own docs plus the ' +
    'ones the project\'s configured integrations contribute, including any ' +
    'topic an integration replaces or extends, so it depends on the cwd. ' +
    'Overlay options select localized or dense variants.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'docs(topic?: string, section?: string, options?: DocsOptions): Promise<DocsListResponse | DocsDetailResponse | DocsDetailSectionResponse>',
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
        'Section within the topic to return; matches the first section title that contains this (case-insensitive).',
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
      type: 'docs.detail.section',
      description:
        'A single ReferenceSection of the topic: the first whose title contains the section query.',
    },
  ],
  throws: [
    {
      code: 'ERR_UNKNOWN_TOPIC',
      when: 'the topic is not a string or matches no known doc topic',
    },
    {
      code: 'ERR_UNKNOWN_SECTION',
      when: 'a section is requested but is empty or matches no section title in the topic',
    },
  ],
  examples: [
    {label: 'List topics', code: 'const r = await docs();'},
    {label: 'Load a topic', code: "await docs('principles');"},
    {label: 'One section', code: "await docs('tokens', 'spacing');"},
  ],
  command: 'docs',
  related: ['search', 'component', 'hook', 'template'],
};
