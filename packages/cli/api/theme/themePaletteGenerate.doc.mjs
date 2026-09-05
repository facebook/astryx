// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'themePaletteGenerate',
  displayName: 'themePaletteGenerate()',
  summary: 'Generate an author-reviewable palette candidate from JSON input.',
  description:
    'Runs the versioned astryx-oklch-v1 recipe against an explicit generation request. ' +
    'It always emits standalone black and white values for direct theme authoring. It also ' +
    'defaults family ramps to 21 stops from 0 through 100, repeating exact black and white ' +
    'as endpoints, but accepts any non-empty ordered numeric stop list. Authors may omit ' +
    'those repeated endpoints while retaining the standalone values. The result is ' +
    'a candidate, not an adopted theme palette or an accessibility claim. With an output path ' +
    'it writes the candidate and a detached reproducibility receipt, and leaves existing ' +
    'author-owned files untouched unless overwrite is true. Shared stop numbers keep the same ' +
    'value across layouts, and decimal stops become explicit keys in generated output.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'themePaletteGenerate(configPath: string, options?: {out?: string, preview?: string, overwrite?: boolean}, ctx?: {cwd?: string}): ThemePaletteGenerateResponse',
  keywords: ['theme', 'palette', 'generate', 'OKLCH', 'candidate', 'color'],
  params: [
    {
      name: 'configPath',
      type: 'string',
      description: 'JSON generation request, resolved within cwd.',
      required: true,
    },
    {
      name: 'options.out',
      type: 'string',
      description:
        'Optional candidate JSON destination. A sibling .receipt.json path is derived from it.',
    },
    {
      name: 'options.preview',
      type: 'string',
      description: 'Optional path for a self-contained HTML review artifact.',
    },
    {
      name: 'options.overwrite',
      type: 'boolean',
      description: 'Replace existing candidate and receipt files.',
      default: 'false',
    },
    {
      name: 'ctx.cwd',
      type: 'string',
      description: 'Directory used to resolve the input and output paths.',
    },
  ],
  returns: [
    {
      type: 'theme.palette.generate',
      description:
        'The candidate, generation receipt, summary counts, and optional file-write receipt.',
    },
  ],
  throws: [
    {code: 'ERR_FILE_NOT_FOUND', when: 'the config file does not exist'},
    {
      code: 'ERR_PALETTE_GENERATION',
      when: 'the request, seed, stop layout, mode, or anchor constraint is invalid',
    },
    {
      code: 'ERR_PATH_TRAVERSAL',
      when: 'an input or output path escapes cwd, or output would replace input',
    },
    {code: 'ERR_WRITE_FAILED', when: 'the candidate pair cannot be written'},
  ],
  examples: [
    {
      label: 'Preview a candidate',
      code: "themePaletteGenerate('palette.config.json');",
    },
    {
      label: 'Write candidate files',
      code: "themePaletteGenerate('palette.config.json', {out: 'ocean.palette.ts', preview: 'ocean.palette.html'});",
    },
  ],
  command: 'theme palette generate',
  related: ['themeBuild', 'themeTemplate'],
};
