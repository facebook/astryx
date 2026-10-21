// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file CommandDoc for `astryx experimental icon new-set`. */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'experimental icon new-set',
  displayName: 'astryx experimental icon new-set',
  namespace: 'cli/commands',
  stability: 'experimental',
  summary: 'Start an icon set in your integration package',
  description:
    "Run inside an integration package. Writes the set's folder with its descriptor, its data file, and its generated module, and declares the manifest's `experimental.iconSets` root on first use. With --from it wraps every icon component of a library; run it again to refresh. Experimental: it may change or be removed in a patch release.",
  fn: 'iconNewSet',
  args: [
    {
      name: 'name',
      param: 'name',
      required: true,
      description: 'The set name, in lowercase kebab-case (outline)',
    },
  ],
  options: [
    {
      flag: '--dry-run',
      param: 'options.dryRun',
      description: 'Validate and show planned writes without changing files',
    },
    {
      flag: '--from <module>',
      param: 'options.from',
      description:
        'A module whose every icon component the set wraps (a package, a subpath, or a ./ path); run again to refresh',
    },
    {
      flag: '--exclude <names>',
      param: 'options.exclude',
      description:
        'With --from: comma-separated export names of the library that are not icons',
    },
  ],
  examples: [
    {
      label: 'Start an icon set',
      cli: 'astryx experimental icon new-set outline',
    },
    {
      label: 'Wrap a whole icon library',
      cli: 'astryx experimental icon new-set outline --from @acme/glyph-library',
    },
    {
      label: 'Preview the files',
      cli: 'astryx experimental icon new-set outline --dry-run --json',
    },
  ],
  outsideProject: 'refuse',
  exitCodes: [
    {code: 0, when: 'the set is written or the dry run succeeds'},
    {
      code: 1,
      when: 'the name, options, package, or target files are invalid or conflict',
    },
  ],
  related: [
    'experimental icon add',
    'experimental icon new-definition',
    'integration check',
  ],
  notes: [
    {
      type: 'prose',
      text: "In global mode: outside a project, with no package.json in the folder or above it, experimental icon new-set writes nothing and stops with `ERR_PROJECT_REQUIRED`; run it in the integration package. In a project, the project's version of Astryx runs it, whichever astryx command you start. See {@link namespace:global} and {@link generic:problems}.",
    },
  ],
};
