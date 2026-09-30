// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/overview`: what an integration package
 * is, what it can do, and how an app finds it.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'overview',
  placement: {parent: 'namespace:integrations', slot: 'start', order: 10},
  title: 'Overview',
  category: 'guide',
  keywords: [
    'what is an integration',
    'make an integration',
    'create an integration',
    'new integration',
    'integration package',
  ],
  description:
    'An integration is an npm package that hooks into the Astryx CLI and makes it your own. It can ship components, templates, themes, docs, codemods, or any mix of them, and apps use them next to Astryx Core. Anyone can make one.',
  sections: [
    {
      id: 'what-you-can-do',
      title: 'What you can do',
      content: [
        {
          type: 'prose',
          text: 'Add one capability or combine them. Each one changes how the Astryx CLI helps people and AI agents work with your library alongside Astryx Core.',
        },
        {
          type: 'table',
          headers: ['What you add', 'What it lets you do', 'Guide'],
          rows: [
            [
              'Components',
              'Make one component or a whole library visible to the CLI, so people and AI agents can use it like any Astryx Core component.',
              '{@link namespace:components}',
            ],
            [
              'Templates',
              'Give apps ready-made page or block source instead of making every app rebuild the same screen.',
              '{@link namespace:templates}',
            ],
            [
              'Themes',
              'Give apps your editable visual language to copy, customize, and build.',
              '{@link generic:themes}',
            ],
            [
              'Docs',
              "Put your library's guidance in the same docs and search results as Astryx Core.",
              '{@link namespace:docs}',
            ],
            [
              'Codemods',
              'Automate changes to app source or config during an Astryx upgrade.',
              '{@link generic:codemods}',
            ],
            [
              'Agent guidance',
              "Put your library's rules in front of AI agents working in the app.",
              '{@link generic:agent-guidance}',
            ],
            [
              'Debug handler',
              'Inspect CLI runs while you build and troubleshoot your integration.',
              '{@link generic:debug-and-gap-reports}',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'For example, publish a carousel component as an integration. In any app that installs it, your carousel becomes visible to the CLI. `npx astryx search carousel` finds it, and the CLI knows how to use it like any Astryx Core component.',
        },
        {
          type: 'prose',
          text: 'An integration can also replace a Core template or doc topic. Docs namespaces, themes, and template replacements need a stable CLI 0.7.0 or later in the app. To build one, keep `@astryxdesign/cli` installed as a devDependency and start with {@link generic:make-a-package}.',
        },
      ],
    },
    {
      id: 'how-an-app-finds-it',
      title: 'Find and install an integration',
      content: [
        {
          type: 'heading',
          level: 3,
          text: 'Find one',
        },
        {
          type: 'prose',
          text: 'There is no public registry of Astryx integrations yet. For now, find an integration through its npm package or its own documentation, then install the package yourself.',
        },
        {
          type: 'heading',
          level: 3,
          text: 'Let the CLI find it',
        },
        {
          type: 'prose',
          text: 'The CLI finds an installed package when the app has it as a direct dependency. No config is needed.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Direct means in `dependencies`, `devDependencies`, or `optionalDependencies`, with any version spec, including `workspace:*` and `file:`, so you can test a local package.',
            'A dependency of a dependency is not found, and neither is a package listed only in `peerDependencies`.',
            'The CLI knows an integration by its `astryx.integration` file (`.ts`, `.mjs`, or `.js`) at the package root. `npx astryx doctor` in the app lists each one it found.',
            'An app can also list packages in `integrations` in `astryx.config`: to use one that is not a direct dependency, or to pick the winner when two packages replace the same Core template.',
          ],
        },
      ],
    },
  ],
};
