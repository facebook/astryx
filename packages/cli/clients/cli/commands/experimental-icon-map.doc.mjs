// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file CommandDoc for `astryx experimental icon map`. */

/** @type {import('@astryxdesign/cli/authoring').CommandDoc} */
export const doc = {
  type: 'command',
  name: 'experimental icon map',
  displayName: 'astryx experimental icon map',
  namespace: 'cli/commands',
  stability: 'experimental',
  summary: 'Register which icon of your set draws an icon definition',
  description:
    "Run inside an icon-set package. Sets `map[<definition>] = <icon>` in the set's data file; `integration check` prints these commands for definitions your set already has a fitting icon for. Experimental: it may change or be removed in a patch release.",
  fn: 'iconMap',
  args: [
    {name: 'definition', param: 'definition', required: true},
    {name: 'icon', param: 'icon', required: false},
  ],
  options: [
    {
      flag: '--set <name>',
      param: 'options.set',
      description: 'The set to edit, when the package ships several',
    },
    {
      flag: '--remove',
      param: 'options.remove',
      description: "Remove the definition's entry; takes no icon",
    },
  ],
  examples: [
    {
      label: 'Map a definition',
      cli: 'astryx experimental icon map delete trash',
    },
    {
      label: 'Remove an entry',
      cli: 'astryx experimental icon map delete --remove',
    },
  ],
  outsideProject: 'refuse',
  exitCodes: [
    {code: 0, when: 'the entry is written, removed, or already as asked'},
    {
      code: 1,
      when: 'the definition is unknown, the set has no such icon, or no set is found',
    },
  ],
  related: ['experimental icon add', 'integration add', 'integration check'],
  notes: [
    {
      type: 'prose',
      text: "In global mode: outside a project, with no package.json in the folder or above it, experimental icon map writes nothing and stops with `ERR_PROJECT_REQUIRED`; run it in the icon-set package. In a project, the project's version of Astryx runs it, whichever astryx command you start. See {@link namespace:global} and {@link generic:problems}.",
    },
  ],
};
