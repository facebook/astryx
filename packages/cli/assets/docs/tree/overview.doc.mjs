// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/overview`: what an integration package
 * is, what it can ship, how an app loads it, and which CLI it needs.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'overview',
  placement: {parent: 'namespace:integrations', slot: 'start', order: 10},
  title: 'What is an integration',
  category: 'guide',
  keywords: [
    'make an integration',
    'create an integration',
    'new integration',
    'integration package',
  ],
  description:
    'Learn what an integration package adds to Astryx apps, how apps load it, and the steps from first file to release.',
  sections: [
    {
      id: 'what-you-can-ship',
      title: 'Choose what to ship',
      content: [
        {
          type: 'prose',
          text: "An integration is an npm package with an `astryx.integration.mjs` file at its root. Every app that installs it sees what it ships beside Astryx Core's own components, templates, and docs.",
        },
        {
          type: 'table',
          headers: ['You ship', 'What an app gets', 'Guide'],
          rows: [
            [
              'Components',
              '`npx astryx component AcmeCarousel` prints its docs and its import line.',
              '{@link generic:components}',
            ],
            [
              'Templates',
              '`npx astryx template acme-dashboard` prints page or block source to start from.',
              '{@link generic:templates}',
            ],
            [
              'Themes',
              '`npx astryx theme add ocean` copies editable theme source into the app.',
              '{@link generic:themes}',
            ],
            [
              'Docs',
              'Your topics and your `acme` section appear in `npx astryx docs` and `npx astryx search`.',
              '{@link namespace:docs}',
            ],
            [
              'Codemods',
              '`npx astryx upgrade` rewrites app code for a new release.',
              '{@link generic:codemods}',
            ],
            [
              'Agent guidance',
              "`npx astryx init` adds your lines to the app's agent instructions, such as `AGENTS.md`.",
              '{@link generic:agent-guidance}',
            ],
            [
              'Debug and gap-report handlers',
              'Your code receives each command run and each `npx astryx gap-report` in apps that install your package.',
              '{@link generic:debug-and-gap-reports}',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Every file you write is described field by field in {@link generic:authoring}.',
        },
      ],
    },
    {
      id: 'life-of-a-package',
      title: 'Follow a package from first file to upgrade',
      content: [
        {
          type: 'prose',
          text: 'A package goes through six steps: author, check, verify, publish, install, and upgrade. You do the first four in your package; apps do the last two.',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            'Author: `npx astryx integration add <kind> <name>` writes each contribution and declares it in `astryx.integration.mjs`. Start with {@link generic:quick-start}, then {@link generic:package-setup}.',
            'Check: the `npx astryx doctor integration` checks catch mistakes while you work. See {@link generic:checks}.',
            'Verify: `npx astryx integration verify` packs the package and checks what an app would see. Then install the tarball in an app yourself: {@link generic:test-in-an-app}.',
            'Publish: `npm publish` releases it. See {@link generic:publishing}.',
            'Install: an app runs `npm install @acme/astryx-widgets` and needs no other setup.',
            'Upgrade: you ship new versions, and `npx astryx upgrade` in the app can run your codemods. See {@link generic:versioning} and {@link generic:upgrading}.',
          ],
        },
      ],
    },
    {
      id: 'how-apps-load-it',
      title: 'Load your package in an app',
      content: [
        {
          type: 'prose',
          text: 'An app autolinks your package when it is a direct dependency: the CLI finds `astryx.integration.mjs` at the package root and loads it, with no config.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            "Direct means listed in the app's `dependencies`, `devDependencies`, or `optionalDependencies`. A dependency of a dependency does not load, and neither does a package listed only in `peerDependencies`.",
            '`npx astryx doctor` in the app lists each package it linked this way in its `implicit-integrations` row.',
            'An app lists your package in `integrations` in `astryx.config` only to control load order, or to let `npx astryx upgrade` run your codemods: it skips them for a package that is only autolinked.',
          ],
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'astryx.config.mjs in the app',
          code: "export default {\n  integrations: ['@acme/astryx-widgets'],\n};",
        },
        {
          type: 'prose',
          text: 'For how an app sets up Astryx itself, see {@link generic:getting-started}.',
        },
      ],
    },
    {
      id: 'pick-a-cli-version',
      title: 'Pick a CLI version',
      content: [
        {
          type: 'prose',
          text: 'Author with the latest `@astryxdesign/cli`, installed as a devDependency so `npx astryx` runs that version. A CLI that lists `verify` under `npx astryx integration --help` has every command these guides use.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            "A stable CLI before 0.7.0 cannot read a docs section, a placed guide, a doc section `id`, a template's `replaces`, or a theme. It can hide all of your docs, and it drops each template that sets `replaces` and every theme.",
            '`npx astryx integration add doc --parent` and `integration add theme` declare an optional `@astryxdesign/cli` peer of `>=0.7.0`, so npm warns in an app with an older CLI.',
            '`npx astryx integration verify` fails a package that needs that peer and does not declare it.',
          ],
        },
        {
          type: 'prose',
          text: 'What each CLI release reads, and how to set your peer ranges, is in {@link generic:versioning}.',
        },
      ],
    },
  ],
};
