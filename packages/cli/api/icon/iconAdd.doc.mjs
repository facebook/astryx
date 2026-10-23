// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file FunctionDoc for `iconAdd()` / `astryx experimental icon add` (AST-084 FR13). */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'iconAdd',
  namespace: 'cli/api',
  stability: 'experimental',
  displayName: 'iconAdd()',
  summary:
    'Register one icon you chose from a library in the set being authored.',
  description:
    "Run inside an icon-set package. The caller picks the export; the CLI never searches the library. It proves the export is a runtime component of `from` (a package, a package subpath, or a relative path this package exports), read without running it. With no definition it answers the icon definitions that fit the export, Astryx's and the set's own, and writes nothing. With `definition` it adds the icon (id from its name, `module` the source unless the set's own module already exports it, words from its name and the definition) and maps the definition to it. With `newDefinition` it first writes the set's own definition file. A `variant` adds the export as that declared variant of an existing icon. Running it again changes nothing. Experimental: it may change or be removed in a patch release.",
  importPath: '@astryxdesign/cli/api',
  signature:
    'iconAdd(exportName: string, options: IconAddOptions): Promise<IconAddResponse | IconDefinitionMatchesResponse>',
  keywords: [
    'icon',
    'icon set',
    'add icon',
    'register',
    'icon library',
    'icon definition',
  ],
  params: [
    {
      name: 'exportName',
      type: 'string',
      description:
        'The export the set exposes the icon as, such as `Bin`; the set exports it as `<Name>Icon`.',
      required: true,
    },
    {
      name: 'options.from',
      type: 'string',
      description: 'The module the icon is exported from.',
      required: true,
    },
    {
      name: 'options.set',
      type: 'string',
      description: 'The set, when the package ships several.',
    },
    {
      name: 'options.definition',
      type: 'string',
      description: 'The icon definition to map the icon to.',
    },
    {
      name: 'options.newDefinition',
      type: 'string',
      description:
        "Add the set's own definition with this name, then map the icon to it.",
    },
    {
      name: 'options.description',
      type: 'string',
      description: 'With `newDefinition`: what the icon is for.',
    },
    {
      name: 'options.words',
      type: 'string[]',
      description: 'With `newDefinition`: the words people search for.',
    },
    {
      name: 'options.useDefault',
      type: 'boolean',
      description:
        "The module's default export is the icon; the set's module must re-export it as `exportName`.",
    },
    {
      name: 'options.variant',
      type: 'string',
      description:
        "Add the export as this variant of an existing icon: one of the set's declared variants, such as `solid`.",
    },
    {
      name: 'options.id',
      type: 'string',
      description: "The icon's id, instead of the one its name gives.",
    },
    {
      name: 'options.cwd',
      type: 'string',
      description: 'A directory inside the icon-set package.',
    },
  ],
  returns: [
    {
      type: 'icon.add',
      description:
        'The icon registered, the definition mapped, and the files written.',
    },
    {
      type: 'icon.definitionMatches',
      description:
        'Without a definition: the definitions that fit the export, and the commands that add it.',
    },
  ],
  throws: [
    {
      code: 'ERR_NOT_FOUND',
      when: 'the module does not export the name, or the definition is unknown',
    },
    {
      code: 'ERR_INVALID_ARGUMENT',
      when: 'the export is data rather than a component, a new definition is named like an Astryx one, or the variant is not one the set declares',
    },
    {code: 'ERR_FILE_EXISTS', when: 'another icon already has the id'},
    {
      code: 'ERR_PROJECT_REQUIRED',
      when: 'the folder is outside any project and has no package.json at or above it',
    },
    {
      code: 'ERR_MISSING_ARGUMENT',
      when: '`from` is missing',
    },
    {
      code: 'ERR_FILE_NOT_FOUND',
      when: 'a relative `from` resolves to no module file in the package',
    },
    {
      code: 'ERR_PATH_TRAVERSAL',
      when: '`from`, or the declared `experimental.iconSets` root, escapes the package',
    },
    {
      code: 'ERR_WRITE_FAILED',
      when: 'a file cannot be written; every write before it is undone',
    },
  ],
  examples: [
    {
      label: 'Which definitions fit',
      code: "await iconAdd('Bin', {from: '@acme/glyph-library'});",
    },
    {
      label: 'Add and map',
      code: "await iconAdd('Bin', {from: '@acme/glyph-library', definition: 'delete'});",
    },
  ],
  command: 'experimental icon add',
  related: ['iconMap', 'iconNewDefinition', 'validateIntegration'],
};
