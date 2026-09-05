// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'theme palette generate',
  displayName: 'astryx theme palette generate',
  namespace: 'cli',
  summary: 'Generate an OKLCH palette candidate for human review',
  description:
    'Reads an explicit JSON request and runs the versioned astryx-oklch-v1 recipe. ' +
    'The command defaults to 21 stops (0 through 100) but accepts any non-empty ordered ' +
    'numeric stop list, including decimals. Stops apply to every family in the request. ' +
    'Authors may omit the repeated endpoints with a custom list; standalone exact black ' +
    'and white values remain available in every candidate. ' +
    'For anchors, exact preserves the chosen color at its mode and stop; bounded allows ' +
    'movement within maxDeltaE; flexible uses the color as guidance. ' +
    'Without --out it prints a preview. With --out it writes a candidate file and detached ' +
    'receipt. --preview writes a standardized, self-contained HTML review artifact. ' +
    'TypeScript output is directly importable and contains no generator dependency. ' +
    'JSON is also supported. Existing author-owned files are left untouched unless --overwrite is explicit.',
  fn: 'themePaletteGenerate',
  args: [{name: 'config', param: 'configPath', required: true}],
  options: [
    {
      flag: '-o, --out <path>',
      param: 'options.out',
      description:
        'Write a candidate TypeScript or JSON file and a sibling receipt',
    },
    {
      flag: '--preview <path>',
      param: 'options.preview',
      description: 'Write a standardized self-contained HTML preview',
    },
    {
      flag: '-f, --overwrite',
      param: 'options.overwrite',
      description: 'Replace existing candidate and receipt files',
    },
  ],
  examples: [
    {
      label: 'Preview candidate JSON',
      cli: 'astryx theme palette generate palette.config.json',
    },
    {
      label: 'Write candidate and receipt',
      cli: 'astryx theme palette generate palette.config.json --out ocean.palette.ts',
    },
    {
      label: 'Write candidate, receipt, and review preview',
      cli: 'astryx theme palette generate palette.config.json --out ocean.palette.ts --preview ocean.palette.html',
    },
  ],
  exitCodes: [
    {
      code: 0,
      when: 'a candidate is produced or existing output is left untouched',
    },
    {
      code: 1,
      when: 'the request is invalid or output cannot be written safely',
    },
  ],
  related: ['theme build', 'theme template'],
};
