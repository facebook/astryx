// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `component()` / `astryx component`. Colocated with the
 * API function it documents; the shape source of truth stays in
 * `component.type.mjs`.
 * @position packages/cli/api/component — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'component',
  displayName: 'component()',
  summary:
    'Resolve a component by name, or list the catalog, with optional focused slices (props, source, showcase, blocks).',
  description:
    'Routes on its arguments: a name resolves that component across core and ' +
    'integration packages and returns its authored ComponentDoc plus ownership ' +
    'metadata; no name (or `list`/`category`) returns the catalog grouped by ' +
    'category. Boolean flags narrow a single component to just its props, ' +
    'source, showcase, or example blocks.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'component(name?: string, options?: ComponentOptions): Promise<ComponentListResponse | ComponentDetailResponse | ComponentDetailPropsResponse | ComponentDetailSourceResponse | ComponentDetailShowcaseResponse | ComponentDetailBlocksResponse>',
  keywords: [
    'component',
    'components',
    'props',
    'source',
    'showcase',
    'blocks',
    'catalog',
  ],
  params: [
    {
      name: 'name',
      type: 'string',
      description:
        "Component name to resolve (e.g. 'Button'). Omit to list the catalog.",
    },
    {
      name: 'options.cwd',
      type: 'string',
      description: 'Directory to resolve @astryxdesign/core from.',
    },
    {
      name: 'options.list',
      type: 'boolean',
      description: 'Return the grouped catalog instead of a single component.',
    },
    {
      name: 'options.category',
      type: 'string',
      description: 'List only components in this category.',
    },
    {
      name: 'options.package',
      type: 'string',
      description:
        "Scope lookup to a specific external package (e.g. '@acme/xds-widgets').",
    },
    {
      name: 'options.props',
      type: 'boolean',
      description: "Return only the component's props table.",
    },
    {
      name: 'options.source',
      type: 'boolean',
      description: "Return the component's source file.",
    },
    {
      name: 'options.showcase',
      type: 'boolean',
      description: "Return the component's showcase example.",
    },
    {
      name: 'options.blocks',
      type: 'boolean',
      description:
        "Return the component's example blocks (showcase, examples, related).",
    },
    {
      name: 'options.detail',
      type: "'full' | 'compact' | 'brief'",
      description: 'Detail level for list views.',
      default: "'full' for a named component, 'brief' for list views",
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
  ],
  returns: [
    {
      type: 'component.list',
      description:
        "The catalog grouped by category. data.detail is the level ('names' | 'compact' | 'full') and data.components is the grouped map: names+package, brief entries, or full ComponentDoc per entry.",
    },
    {
      type: 'component.detail',
      description:
        "One component's authored ComponentDoc plus ownership metadata (owner package, import specifier, whether source is available).",
    },
    {
      type: 'component.detail.props',
      description: "Just the component's props table (ComponentPropDoc[]).",
    },
    {
      type: 'component.detail.source',
      description: "The component's source file, as {component, source}.",
    },
    {
      type: 'component.detail.showcase',
      description:
        "The component's showcase example, as {component, aspectRatio, source}.",
    },
    {
      type: 'component.detail.blocks',
      description:
        "The component's example blocks, as {component, showcase, examples, related} of BlockEntry.",
    },
  ],
  throws: [
    {
      code: 'ERR_CORE_NOT_FOUND',
      when: '@astryxdesign/core cannot be resolved from cwd',
    },
    {
      code: 'ERR_UNKNOWN_CATEGORY',
      when: 'options.category is not a string or matches no known category',
    },
    {
      code: 'ERR_UNKNOWN_COMPONENT',
      when: 'name is not a string, resolves to no known component, is provided by multiple packages (pass options.package), or is absent from the requested options.package',
    },
    {
      code: 'ERR_UNKNOWN_PACKAGE',
      when: 'options.package names a legacy external package that cannot be found',
    },
    {
      code: 'ERR_NO_DOC',
      when: 'the resolved component has no .doc.mjs typed doc file',
    },
    {
      code: 'ERR_NO_SOURCE',
      when: 'options.source is set but the component has no source file',
    },
    {
      code: 'ERR_NO_SHOWCASE',
      when: 'options.showcase is set but the component has no showcase',
    },
  ],
  examples: [
    {
      label: 'Look up a component',
      code: "const r = await component('Button');",
    },
    {label: 'Props only', code: "await component('Button', {props: true});"},
    {
      label: 'Browse a category',
      code: "await component(undefined, {category: 'Form', detail: 'compact'});",
    },
  ],
  command: 'component',
  related: ['search', 'hook', 'docs', 'template', 'swizzle'],
};
