// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `themeBuild()` / `astryx theme build`. Colocated with
 * the API function it documents; the response-shape source of truth stays in
 * `theme.type.mjs`.
 * @position packages/cli/api/theme — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'themeBuild',
  displayName: 'themeBuild()',
  summary: 'Compile a defineTheme file to CSS + JS + type declarations.',
  description:
    'The compiler behind `astryx theme build`. Reads a file that calls defineTheme() and, ' +
    "via @astryxdesign/core's shared generator (the single source of truth, so the build " +
    'emits the exact CSS the <Theme> runtime does), writes a scoped CSS file, a JS module ' +
    'that re-exports the built theme, and a .d.ts (plus an optional .variants.d.ts when the ' +
    'theme adds custom prop values). When another build step emits the icon registry, ' +
    '{iconsSpecifier} declares the fully specified module path for the generated JS import. ' +
    'With {check: true} it writes nothing and instead compares ' +
    'each output against disk, returning the drift: the CI guard for committed, generated theme CSS.',
  importPath: '@astryxdesign/cli/api',
  signature:
    'themeBuild(file: string, options?: {out?: string, check?: boolean, iconsSpecifier?: string}, ctx?: {cwd?: string}): Promise<ThemeBuildResponse | ThemeBuildCheckResponse | null>',
  keywords: [
    'theme',
    'build',
    'compile',
    'css',
    'defineTheme',
    'check',
    'drift',
  ],
  params: [
    {
      name: 'file',
      type: 'string',
      description:
        'Path to a theme file that calls defineTheme(), resolved against cwd.',
      required: true,
    },
    {
      name: 'options.out',
      type: 'string',
      description:
        'Override the output CSS path; the sibling .js and .d.ts derive from it. A relative path must stay within cwd.',
    },
    {
      name: 'options.check',
      type: 'boolean',
      description:
        'Compile in memory and compare each output against what is on disk instead of writing: the CI drift guard.',
      default: 'false',
    },
    {
      name: 'options.iconsSpecifier',
      type: 'string',
      description:
        'Override the icon-registry import specifier in the generated JS module, for example ./icons.mjs. When omitted, the source specifier is preserved.',
    },
    {
      name: 'ctx.cwd',
      type: 'string',
      description:
        'Directory the theme file and @astryxdesign/core resolve against.',
    },
  ],
  returns: [
    {
      type: 'theme.build',
      description:
        'Build receipt: theme name, token- and component-override counts, output size in KB, the written outputs {css, js, dts, and variantsDts when custom prop values were augmented}, and any validation warnings. Resolves to null instead when the theme produced no CSS (nothing to build).',
    },
    {
      type: 'theme.build.check',
      description:
        'The {check: true} receipt: theme name, an upToDate flag, the stale outputs (each {path, reason: "missing" | "outdated"}), and the full list of checked paths. Writes nothing.',
    },
  ],
  throws: [
    {code: 'ERR_FILE_NOT_FOUND', when: 'the theme file does not exist'},
    {
      code: 'ERR_THEME_LOAD',
      when: 'the file cannot be loaded or parsed into a defineTheme() result',
    },
    {code: 'ERR_THEME_INVALID', when: 'the resolved theme has no name'},
    {
      code: 'ERR_PATH_TRAVERSAL',
      when: 'the theme name contains a path separator or traversal marker',
    },
    {
      code: 'ERR_CORE_NOT_FOUND',
      when: '@astryxdesign/core/theme cannot be imported; a built, resolvable @astryxdesign/core is required',
    },
    {
      code: 'ERR_WRITE_FAILED',
      when: 'writing the outputs fails (staged temp files are rolled back)',
    },
  ],
  examples: [
    {
      label: 'Build a theme',
      code: "const r = await themeBuild('src/themes/ocean.ts');",
    },
    {
      label: 'Check for drift (CI)',
      code: "const r = await themeBuild('src/themes/ocean.ts', {check: true});",
    },
    {
      label: 'Use a separately compiled icon registry',
      code: "const r = await themeBuild('src/themes/ocean.ts', {iconsSpecifier: './icons.mjs'});",
    },
  ],
  command: 'theme build',
  related: ['themeAdd', 'themeList', 'listThemes'],
};
