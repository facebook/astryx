// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `layoutExpand()` / `astryx layout expand`. Colocated
 * with the API function it documents; the response-shape source of truth stays
 * in `layout.type.mjs`.
 * @position packages/cli/api/layout — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'layoutExpand',
  displayName: 'layoutExpand()',
  summary: 'Expand a validated layout expression into XDS TSX.',
  description:
    'The generator behind `astryx layout expand`. Parses and validates a compressed XLE/XLO ' +
    'expression, then expands it into ready-to-use XDS TSX, auto-routing structural children ' +
    'into the right slots, scaffolding typed useState for interactive controls, and splicing or ' +
    'importing any referenced template blocks. Returns the code (and metadata) in a layout.expand ' +
    'envelope, optionally writing it to a path within cwd.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'layoutExpand(expression: string, options?: LayoutExpandOptions): Promise<LayoutExpandResponse>',
  keywords: ['layout', 'expand', 'xle', 'xlo', 'tsx', 'scaffold', 'generate'],
  params: [
    {
      name: 'expression',
      type: 'string',
      description:
        'The layout expression to expand (XLE compact or XLO outline form).',
      required: true,
    },
    {
      name: 'options.targetPath',
      type: 'string',
      description:
        'Write the generated TSX here (validated to stay within cwd). A directory gets <name>.tsx; a file path is used as-is. Omit to return the code without writing.',
    },
    {
      name: 'options.form',
      type: "'compact' | 'outline' | 'auto'",
      description:
        'Force which input surface the expression is parsed as, or auto-detect it.',
      default: "'auto'",
    },
    {
      name: 'options.loose',
      type: 'boolean',
      description:
        'Downgrade unknown {hint} references to TODO warnings instead of hard errors.',
      default: 'false',
    },
    {
      name: 'options.name',
      type: 'string',
      description: 'PascalCase name for the generated component.',
      default: "'GeneratedLayout'",
    },
    {
      name: 'options.cwd',
      type: 'string',
      description:
        'Directory the block catalog, registry, and target path resolve against.',
    },
  ],
  returns: [
    {
      type: 'layout.expand',
      description:
        'The expansion: the parsed form, the generated TSX code, componentsUsed, states (count of useState hooks scaffolded), todos, blocksReferenced (each {name, mode}), warnings, and written (the relative output path, or null when nothing was written).',
    },
  ],
  throws: [
    {
      code: 'ERR_INVALID_ARGUMENT',
      when: 'the expression is empty, or name is not a PascalCase identifier',
    },
    {
      code: 'ERR_INVALID_OPTION',
      when: 'form is not one of "compact", "outline", or "auto"',
    },
    {
      code: 'ERR_LAYOUT_PARSE',
      when: 'the expression has a syntax error (reported with line/col)',
    },
    {
      code: 'ERR_LAYOUT_INVALID',
      when: 'the expression parses but fails validation (unknown component/prop/enum/block)',
    },
    {code: 'ERR_PATH_TRAVERSAL', when: 'the target path escapes cwd'},
  ],
  examples: [
    {
      label: 'Expand to TSX',
      code: 'const r = await layoutExpand(\'VStack[g4] > Heading"Title" + Text"Body"\');',
    },
    {
      label: 'Write to a file',
      code: "await layoutExpand('Card > Text\"Hi\"', {targetPath: 'src/Generated.tsx', name: 'Generated'});",
    },
  ],
  command: 'layout expand',
  related: ['layoutCheck', 'layoutGrammar'],
};
