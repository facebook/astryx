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
  namespace: 'cli/api',
  displayName: 'themeBuild()',
  summary:
    'Compile a defineTheme() file to scoped CSS, a JS module, and type declarations, or check committed outputs for drift in CI.',
  description:
    'The compiler behind `astryx theme build`. Reads a file that calls defineTheme() and ' +
    'writes a scoped CSS file, a JS module that re-exports the built theme, and a .d.ts ' +
    '(plus an optional .variants.d.ts when the theme adds custom prop values). It uses ' +
    "@astryxdesign/core's own generator, so the CSS matches what the <Theme> runtime emits. " +
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
        'Override the output CSS path. The .js, .d.ts and any .variants.d.ts are written in the same directory, named after the theme (<name>.js), not after the CSS file. A relative path must stay within cwd.',
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
        'Override the import specifier of the icon registry in the generated JS module, for example ./icons.mjs. Takes effect only when the theme sets icons: to a named import; when omitted, the source specifier is kept.',
    },
    {
      name: 'ctx.cwd',
      type: 'string',
      description:
        'Directory the theme file, a relative out path, and the returned output paths resolve against.',
      default: 'process.cwd()',
    },
  ],
  returns: [
    {
      type: 'theme.build',
      description:
        'Build receipt {name, tokenCount, componentCount, sizeKB, outputs, warnings, notices}: the theme name; how many tokens (portable plus theme-local) and component targets it overrides; the CSS size in KB; the written outputs {css, js, dts, and variantsDts when custom prop values were augmented}; warnings, the defects the author should fix, including exact canonical replacements for deprecated component target keys and declarations the generator dropped; and notices, advisories about a correct theme, such as a font it names but does not load. Resolves to null instead when the theme produced no CSS (nothing to build).',
    },
    {
      type: 'theme.build.check',
      description:
        'The {check: true} receipt: theme name, an upToDate flag, the stale outputs (each {path, reason: "missing" | "outdated"}), and the full list of checked paths. Writes nothing. Resolves to null, like a normal build, when the theme produces no CSS.',
    },
  ],
  throws: [
    {code: 'ERR_FILE_NOT_FOUND', when: 'the theme file does not exist'},
    {
      code: 'ERR_THEME_LOAD',
      when: 'the file cannot be loaded or parsed into a defineTheme() result',
    },
    {
      code: 'ERR_THEME_INVALID',
      when: 'the resolved theme is invalid, for example it has no name, or a custom Heading type has no standalone rule with a declaration the compiler can emit',
    },
    {
      code: 'ERR_PATH_TRAVERSAL',
      when: 'the theme name contains a path separator or traversal marker, or a relative `out` path resolves outside cwd (including through a symlink)',
    },
    {
      code: 'ERR_CORE_NOT_FOUND',
      when: '@astryxdesign/core/theme cannot be imported; a built, resolvable @astryxdesign/core is required',
    },
    {
      code: 'ERR_CORE_INCOMPATIBLE',
      when: 'the installed @astryxdesign/core does not export generateAdaptationCSS and the theme either declares ordered adaptations or has lineage whose adaptation use could not be observed (upgrade core)',
    },
    {
      code: 'ERR_WRITE_FAILED',
      when: 'creating the output directory or writing the outputs fails (staged temp files are rolled back)',
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
  related: ['themeTemplate', 'themeAdd', 'themeListAvailable', 'listThemes'],
};
