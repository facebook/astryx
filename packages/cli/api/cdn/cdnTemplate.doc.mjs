// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `cdnTemplate()` / `astryx cdn template`. Colocated with
 * the API function it documents; the response-shape source of truth stays in
 * `cdn.type.mjs`.
 * @position packages/cli/api/cdn — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'cdnTemplate',
  displayName: 'cdnTemplate()',
  summary: 'Write the annotated no-build-step CDN starter page into a project.',
  description:
    'Writes cdn.template.html: a working page that loads Astryx from a public CDN with no ' +
    'bundler, no install and no build step, annotated with the parts that are load-bearing — ' +
    'the theme attribute, the import map (including react/jsx-runtime), the ?external pin that ' +
    'keeps one React copy, and createElement in place of JSX. React 19 ships no UMD build, so ' +
    'an import map is the only way in. Every CDN URL is pinned to the installed Astryx version. ' +
    'Refuses to overwrite without `overwrite`, so it is safe to re-run.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'cdnTemplate(options?: {targetPath?: string, overwrite?: boolean, cwd?: string}): CdnTemplateResponse',
  keywords: ['cdn', 'esm', 'importmap', 'no-build', 'prototype', 'jsdelivr', 'esm.sh', 'starter'],
  params: [
    {
      name: 'options.targetPath',
      type: 'string',
      description: 'Destination file. Must resolve within cwd.',
      default: "'cdn.template.html'",
    },
    {
      name: 'options.overwrite',
      type: 'boolean',
      description: 'Replace an existing file instead of reporting it untouched.',
      default: 'false',
    },
    {
      name: 'options.cwd',
      type: 'string',
      description: 'Directory the target path resolves against.',
    },
  ],
  returns: [
    {
      type: 'cdn.template',
      description:
        'Receipt: the path (relative to cwd), the version every CDN URL was pinned to, whether it was written, and the reason it was not — `exists` when a file was already there, which is a success, not a failure.',
    },
  ],
  throws: [{code: 'ERR_PATH_TRAVERSAL', when: 'the target path escapes cwd'}],
  examples: [
    {label: 'Write it at the project root', code: 'cdnTemplate();'},
    {
      label: 'Somewhere else, replacing what is there',
      code: "cdnTemplate({targetPath: 'public/demo.html', overwrite: true});",
    },
  ],
  command: 'cdn template',
  related: ['themeTemplate', 'template', 'init'],
};
