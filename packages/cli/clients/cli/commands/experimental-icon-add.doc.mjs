// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file CommandDoc for `astryx experimental icon add`. */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'experimental icon add',
  displayName: 'astryx experimental icon add',
  namespace: 'cli/commands',
  stability: 'experimental',
  summary: 'Register one icon you chose from a library in your icon set',
  description:
    "Run inside an icon-set package. You pick the export; the CLI proves it is a component of --from, read without running it, and never searches the library. Without a definition it lists the icon definitions that fit and the command for each. With --definition it adds the icon and maps the definition to it; --new-definition first adds your set's own definition. Experimental: it may change or be removed in a patch release.",
  fn: 'iconAdd',
  args: [{name: 'export', param: 'exportName', required: true}],
  options: [
    {
      flag: '--from <module>',
      param: 'options.from',
      description:
        'The module the icon is exported from: a package, a subpath, or a relative path this package exports',
    },
    {
      flag: '--definition <name>',
      param: 'options.definition',
      description: 'Map the icon to this icon definition',
    },
    {
      flag: '--new-definition <name>',
      param: 'options.newDefinition',
      description:
        "Add your set's own definition, then map the icon to it; needs --description and --words",
    },
    {
      flag: '--description <text>',
      param: 'options.description',
      description: 'With --new-definition: what the icon is for',
    },
    {
      flag: '--words <list>',
      param: 'options.words',
      description:
        'With --new-definition: comma-separated words people search for',
    },
    {
      flag: '--default',
      param: 'options.useDefault',
      description:
        "The module's default export is the icon; your set's module must re-export it under <export>",
    },
    {
      flag: '--appearance <name>',
      param: 'options.appearance',
      description:
        'Add the export as a variant of an existing icon with this appearance',
    },
    {
      flag: '--size <n>',
      param: 'options.size',
      description: "The variant's size in pixels",
    },
    {
      flag: '--weight <n>',
      param: 'options.weight',
      description: "The variant's weight",
    },
    {
      flag: '--id <id>',
      param: 'options.id',
      description: "The icon's id, instead of the one its name gives",
    },
    {
      flag: '--set <name>',
      param: 'options.set',
      description: 'The set to edit, when the package ships several',
    },
  ],
  examples: [
    {
      label: 'Which definitions fit',
      cli: 'astryx experimental icon add Bin --from @acme/glyph-library',
    },
    {
      label: 'Add and map',
      cli: 'astryx experimental icon add Bin --from @acme/glyph-library --definition delete',
    },
    {
      label: 'Add your own definition',
      cli: "astryx experimental icon add RotateCw --from @acme/glyph-library --new-definition rotate --description 'Rotate an image or shape.' --words turn,spin",
    },
    {
      label: 'Add a solid variant',
      cli: 'astryx experimental icon add Bin --from @acme/glyph-library/solid --id bin --appearance solid',
    },
  ],
  outsideProject: 'refuse',
  exitCodes: [
    {
      code: 0,
      when: 'the icon is added, already present, or the matching definitions are listed',
    },
    {
      code: 1,
      when: 'the export is missing or is data, the definition is unknown, the id is taken, or a variant value is outside axes',
    },
  ],
  related: ['experimental icon map', 'integration add', 'integration check'],
  notes: [
    {
      type: 'prose',
      text: "In global mode: outside a project, with no package.json in the folder or above it, experimental icon add writes nothing and stops with `ERR_PROJECT_REQUIRED`; run it in the icon-set package. In a project, the project's version of Astryx runs it, whichever astryx command you start. See {@link namespace:global} and {@link generic:problems}.",
    },
  ],
};
