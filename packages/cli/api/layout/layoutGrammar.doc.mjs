// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `layoutGrammar()` / `astryx layout grammar`. Colocated
 * with the API function it documents; the response-shape source of truth stays
 * in `layout.type.mjs`.
 * @position packages/cli/api/layout — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'layoutGrammar',
  displayName: 'layoutGrammar()',
  summary: 'Return the XLE/XLO grammar cheatsheet for this install.',
  description:
    'The reference behind `astryx layout grammar`: the agent cheatsheet for writing XLE/XLO ' +
    "layout expressions, with the alias table generated from this branch's registry rather than " +
    'hand-maintained, so short names always reflect the components actually installed.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'layoutGrammar(options?: LayoutGrammarOptions): Promise<LayoutGrammarResponse>',
  keywords: [
    'layout',
    'grammar',
    'cheatsheet',
    'xle',
    'xlo',
    'aliases',
    'reference',
  ],
  params: [
    {
      name: 'options.cwd',
      type: 'string',
      description:
        'Directory the component registry (and its alias table) resolves against.',
    },
  ],
  returns: [
    {
      type: 'layout.grammar',
      description:
        "The cheatsheet: a text field with the full grammar reference, plus an aliases map (short name → canonical component) generated from this install's registry.",
    },
  ],
  examples: [
    {
      label: 'Get the cheatsheet',
      code: 'const {data} = await layoutGrammar();',
    },
  ],
  command: 'layout grammar',
  related: ['layoutExpand', 'layoutCheck'],
};
