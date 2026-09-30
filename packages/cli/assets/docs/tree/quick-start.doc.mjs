// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/quick-start`: from an empty folder to a
 * component that shows in an app, passing every check on the first try.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'quick-start',
  placement: {parent: 'namespace:integrations', slot: 'start', order: 20},
  title: 'Quick start',
  category: 'guide',
  keywords: ['make an integration', 'first integration', 'integration tutorial'],
  description:
    'Go from an empty folder to a component that shows in an app, with every check passing on the first try.',
  sections: [
    {
      id: 'make-the-package',
      title: 'Make the package',
      content: [
        {
          type: 'prose',
          text: 'Create a package.json with your package name and an empty `exports` map, then install the CLI and Core as devDependencies.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: "mkdir acme-widgets && cd acme-widgets\nnpm init -y\nnpm pkg set name=@acme/astryx-widgets\nnpm pkg set 'exports={}' --json\nnpm install -D @astryxdesign/cli @astryxdesign/core",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Start with `"exports": {}`: each component and template you add then writes the public import that `integration verify` resolves.',
            'Run the CLI as `npx astryx`, which runs the version you installed.',
            'Component commands read Core, so they need `@astryxdesign/core` installed.',
          ],
        },
      ],
    },
    {
      id: 'add-a-component',
      title: 'Add a component',
      content: [
        {
          type: 'prose',
          text: 'Add the component with `integration add`, then read it back the way an app will.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx integration add component AcmeCarousel\nnpx astryx component AcmeCarousel',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'component contribution added\n\n[ok] AcmeCarousel\n\nDeclare component root ./components in astryx.integration.mjs.\n\n- components/AcmeCarousel.doc.mjs\n- components/AcmeCarousel.tsx\n- package.json\n- astryx.integration.mjs',
        },
        {
          type: 'prose',
          text: "The add writes the source, its doc, an `exports` entry in package.json, and `astryx.integration.mjs`. `npx astryx component AcmeCarousel` then prints the import line apps copy: `import {AcmeCarousel} from '@acme/astryx-widgets/components/AcmeCarousel';`. The first add also suggests `npx astryx init`; that step is for apps, so skip it here.",
        },
      ],
    },
    {
      id: 'verify-and-pack',
      title: 'Verify and pack the package',
      content: [
        {
          type: 'prose',
          text: 'Run `integration verify` to check that an app would see the component, then make the tarball you install next. `--pack-destination ..` writes it beside the package folder, so the next pack does not ship it.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx integration verify\nnpm pack --pack-destination ..',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'Integration package ready\n\n[ok] @acme/astryx-widgets@1.0.0\n\n4 packed files; 3/3 required files present.',
        },
        {
          type: 'prose',
          text: '`integration verify` packs the package, unpacks it into a temporary app, and checks that the component resolves through its public import there. It publishes nothing and leaves no tarball, so `npm pack` writes `../acme-astryx-widgets-1.0.0.tgz` for the next step.',
        },
      ],
    },
    {
      id: 'use-it-in-an-app',
      title: 'Use it in an app',
      content: [
        {
          type: 'prose',
          text: 'Install Core, the CLI, and your tarball in a new app. The app loads your package because it is a dependency, with no config.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'cd ..\nmkdir my-app && cd my-app\nnpm init -y\nnpm install @astryxdesign/core @astryxdesign/cli ../acme-astryx-widgets-1.0.0.tgz\nnpx astryx component AcmeCarousel',
        },
        {
          type: 'code',
          lang: 'text',
          code: "**Import:** `import {AcmeCarousel} from '@acme/astryx-widgets/components/AcmeCarousel';`",
        },
        {
          type: 'prose',
          text: 'Next, learn what each package.json field does in {@link generic:package-setup}, and build the real component with {@link generic:components}.',
        },
      ],
    },
  ],
};
