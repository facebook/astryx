// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/global-integrations`: make an
 * integration work when people install it next to their global Astryx
 * install; a checklist and the commands to try it (spec AST-081 FR12).
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'global-integrations',
  placement: {
    parent: 'namespace:integrations',
    slot: 'guides',
    order: 25,
  },
  title: 'Make your integration work globally',
  category: 'guide',
  keywords: [
    'global integration',
    'global mode',
    'npm i -g',
    'installed for this computer',
    'outside a project',
    'peer range',
    'peerDependencies',
    'cliCommand conflict',
    'try it globally',
  ],
  description:
    "People can install your integration next to their global Astryx install, where it works in every folder outside a project; inside a project, only the project's own integrations work. A checklist, with the exact commands to try it.",
  sections: [
    {
      id: 'peer-range',
      title: "First: your peer ranges must include the global CLI's version",
      content: [
        {
          type: 'prose',
          text: 'Your `@astryxdesign/core` (and, if you use it, `@astryxdesign/cli`) `peerDependencies` ranges must include the version of the CLI installed globally. If they do not, Astryx skips your package outside projects, and `astryx doctor` warns and names the range.',
        },
        {
          type: 'prose',
          text: "Inside a project that does not install your package, `astryx discover` offers it, with the command that adds it to that project, once your peer range admits the project's release.",
        },
      ],
    },
    {
      id: 'where-it-works',
      title: 'Where your integration works',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            "Installed in an app: it works in that app, as always, whichever `astryx` the person runs, because the app's version of Astryx answers there.",
            'Installed next to the global install (`npm i -g @astryxdesign/cli your-package`), or in the same folder as the CLI by a tool that installs them together: it works in every folder outside a project. People and agents there see its components, templates, docs, themes, codemods, and discover source.',
            "Installed only globally, inside an app that does not install it: it adds nothing there. When it supports the app's version and loads, `astryx discover` lists it as one the app could add, with the app's install command.",
            "Installed both ways: the app's copy is the one used in that app. In your own package folder, your working copy is used.",
          ],
        },
        {
          type: 'prose',
          text: "Astryx loads a global integration with the same loader and checks as an app's, so nothing extra goes in your manifest.",
        },
      ],
    },
    {
      id: 'checklist',
      title: 'Checklist',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Declare the `@astryxdesign/core` (and, if you use it, `@astryxdesign/cli`) `peerDependencies` range your package really supports. Outside a project, Astryx skips your package when that range leaves out the global version, and `astryx doctor` says why: too narrow, and global users lose it after an upgrade; too wide, and it loads against a Core it may not build with.',
            'Keep imports in your docs and templates to packages an app installs with yours, since outside a project there is no app to check them against.',
            "If you set `cliCommand`, know that outside a project it starts every command Astryx prints, and that two global integrations naming different commands cancel out, falling back to `astryx` ({@link generic:cli-command}). Inside an app, only the app's integrations count.",
            'Try it globally before you publish, with the steps below.',
          ],
        },
      ],
    },
    {
      id: 'try-it',
      title: 'Try it globally',
      content: [
        {
          type: 'prose',
          text: 'Pack your package, install it next to a global CLI, and look at it from an empty folder:',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npm pack\nnpm i -g @astryxdesign/cli ./your-package-1.0.0.tgz\nmkdir -p /tmp/try-global && cd /tmp/try-global\nastryx discover\nastryx docs\nastryx doctor',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`astryx discover` lists your package as installed, with what it adds.',
            '`astryx docs` lists your topics, and `astryx search <one of your component names>` finds them.',
            "`astryx doctor`'s `computer-integrations` check lists your package as used, with no warning.",
            "In an app that does not install it, `astryx discover` lists it as one the app could add, with the app's install command, and none of its components or docs show up.",
          ],
        },
        {
          type: 'prose',
          text: 'Remove it again with `npm uninstall -g your-package`.',
        },
      ],
    },
    {
      id: 'more',
      title: 'More on global mode',
      content: [
        {
          type: 'prose',
          text: 'How global mode works for the people who install your package: {@link namespace:global}. Their side of global integrations: {@link generic:computer-integrations}.',
        },
      ],
    },
  ],
};
