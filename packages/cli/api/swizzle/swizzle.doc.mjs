// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `swizzle()` / `astryx swizzle`. Colocated with the API
 * function it documents; the shape source of truth stays in `swizzle.type.mjs`.
 * @position packages/cli/api/swizzle — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'swizzle',
  displayName: 'swizzle()',
  summary: "Eject a component's source into your project for customization.",
  description:
    "Ejects a component's source into the consumer project for deep customization. " +
    'It copies from the locally resolved @astryxdesign/core (or the owning integration) ' +
    'package source, rewriting imports that escape the component directory to the owner ' +
    "package's subpaths and flagging whether any copied file uses StyleX. With no name " +
    '(or list) it returns the swizzlable component names instead.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'swizzle(component?: string, options?: SwizzleOptions): Promise<SwizzleListResponse | SwizzleCopyResponse>',
  keywords: ['swizzle', 'eject', 'copy', 'customize', 'source', 'override'],
  params: [
    {
      name: 'component',
      type: 'string',
      description:
        'Bare or XDS-prefixed component name to copy. Omit to list the swizzlable components.',
    },
    {
      name: 'options.cwd',
      type: 'string',
      description: 'Directory to resolve @astryxdesign/core from.',
    },
    {
      name: 'options.output',
      type: 'string',
      description: 'Output directory; must resolve inside cwd.',
      default: "'./components/astryx'",
    },
    {
      name: 'options.package',
      type: 'string',
      description:
        'Owning package to copy from when the name is provided by more than one.',
    },
    {
      name: 'options.list',
      type: 'boolean',
      description:
        'Force the list response even when a component argument is given.',
      default: 'false',
    },
    {
      name: 'options.overwrite',
      type: 'boolean',
      description: 'Overwrite existing files instead of erroring.',
      default: 'false',
    },
  ],
  returns: [
    {
      type: 'swizzle.list',
      description:
        "The names of swizzlable components discoverable from cwd's @astryxdesign/core.",
    },
    {
      type: 'swizzle.copy',
      description:
        'A receipt after copying the component into the project: the component name, owning package, output directory, files-copied count, the written file names, whether any file uses StyleX, and an optional maintainer-feedback note.',
    },
  ],
  throws: [
    {
      code: 'ERR_CORE_NOT_FOUND',
      when: '@astryxdesign/core cannot be located from cwd',
    },
    {
      code: 'ERR_PATH_TRAVERSAL',
      when: 'the component name contains a path separator or traversal, or output resolves outside cwd',
    },
    {
      code: 'ERR_UNKNOWN_COMPONENT',
      when: 'no package provides the component, or the named package does not provide it',
    },
    {
      code: 'ERR_AMBIGUOUS_COMPONENT',
      when: 'more than one package provides the component; choose one with package',
    },
    {
      code: 'ERR_NO_SOURCE',
      when: 'the owning package has no source directory for the component on disk',
    },
    {
      code: 'ERR_FILE_EXISTS',
      when: 'copying would overwrite existing files and overwrite is not set',
    },
  ],
  examples: [
    {
      label: 'List swizzlable components',
      code: 'const {data} = await swizzle();',
    },
    {label: 'Eject a component', code: "await swizzle('Button');"},
    {
      label: 'Disambiguate by package',
      code: "await swizzle('Button', {package: '@astryxdesign/core'});",
    },
    {
      label: 'Custom output directory',
      code: "await swizzle('Card', {output: './src/ui', overwrite: true});",
    },
  ],
  command: 'swizzle',
  related: ['component', 'discover', 'upgrade'],
};
