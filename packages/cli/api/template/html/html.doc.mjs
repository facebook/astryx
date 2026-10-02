// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'templateHtml',
  namespace: 'cli/api',
  displayName: 'templateHtml()',
  summary: 'List or render vanilla standalone HTML templates.',
  description:
    'Reads packages/vanilla/templates. Named mode replaces __ASTRYX_VANILLA_CDN__ with a commit-pinned jsDelivr base URL.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'templateHtml(name?: string, options?: TemplateHtmlOptions): TemplateHtmlListResponse | TemplateHtmlResponse',
  keywords: ['template', 'html', 'vanilla', 'jsdelivr', 'cdn'],
  params: [
    {name: 'name', type: 'string', description: 'Exact vanilla template id.'},
    {
      name: 'options.cwd',
      type: 'string',
      description: 'Directory to locate packages/vanilla from.',
      default: 'process.cwd()',
    },
    {
      name: 'options.list',
      type: 'boolean',
      description: 'List available HTML template files instead of reading one.',
      default: 'false',
    },
    {
      name: 'options.cdnRef',
      type: 'string',
      description: 'Git ref inserted into the jsDelivr base URL.',
      default: 'ASTRYX_VANILLA_CDN_REF',
    },
  ],
  returns: [
    {
      type: 'template.html.list',
      description: 'Sorted vanilla HTML templates as {id, file}.',
    },
    {
      type: 'template.html',
      description:
        'One substituted page as {template, file, cdnRef, cdnBase, source}.',
    },
  ],
  throws: [
    {
      code: 'ERR_FILE_NOT_FOUND',
      when: 'packages/vanilla cannot be located from cwd',
    },
    {
      code: 'ERR_INVALID_ARGUMENT',
      when: 'the template id or CDN ref is unsafe',
    },
    {
      code: 'ERR_UNKNOWN_TEMPLATE',
      when: 'no matching HTML template file exists',
    },
  ],
  examples: [
    {label: 'Render dashboard', code: "templateHtml('dashboard', {cwd})"},
    {
      label: 'Use another commit',
      code: "templateHtml('dashboard', {cwd, cdnRef: sha})",
    },
  ],
  related: ['template', 'componentHtml'],
};
