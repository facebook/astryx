// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/building-blocks/docs/add-a-topic`: add a
 * doc topic to an integration package, write its sections, and pick the doc
 * kind for each thing the package ships.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'add-a-topic',
  placement: {parent: 'namespace:docs', slot: 'guides', order: 10},
  title: 'Add a topic',
  category: 'guide',
  keywords: ['add a doc', 'integration docs', 'write docs'],
  description: 'Add a doc topic to your package and write its sections.',
  sections: [
    {
      id: 'add-a-topic-with-the-cli',
      title: 'Add a topic with the CLI',
      content: [
        {
          type: 'prose',
          text: 'Run `integration add doc` in your package to add a topic. It writes the topic file and declares the `docs` root in `astryx.integration.mjs`.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx integration add doc deploying\n# Read it the way an app will\nnpx astryx docs deploying',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'doc contribution added\n\n[ok] deploying\n\nDeclare doc root ./docs in astryx.integration.mjs.\n\n- docs/deploying.doc.mjs\n- astryx.integration.mjs',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Name the topic in lowercase kebab-case, such as `deploying`. Readers type the name as a command argument, so it holds only letters, digits, `_`, and `-`.',
            'Keep the name stable: readers and links find the topic by it.',
            'Pick a name that `astryx docs` does not already list: no Core topic, and no section such as `tokens` or `layout`. To take over or add to a Core topic, see {@link generic:extend-or-replace}.',
          ],
        },
      ],
    },
    {
      id: 'write-the-sections',
      title: 'Write the sections',
      content: [
        {
          type: 'prose',
          text: "A topic is a plain object with `type: 'generic'`, a `name`, a `title`, a one-sentence `description`, and `sections`. Each section has a `title` and a list of `content` blocks.",
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'docs/deploying.doc.mjs',
          code: "/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */\nexport default {\n  type: 'generic',\n  name: 'deploying',\n  title: 'Deploying',\n  description: 'Ship an app built with Acme widgets.',\n  sections: [{\n    id: 'build-before-you-ship',\n    title: 'Build before you ship',\n    content: [\n      {type: 'prose', text: 'Build the app, then upload the `dist` folder.'},\n      {type: 'code', lang: 'bash', code: 'npm run build'},\n      {type: 'list', style: 'unordered', items: ['Keep `dist` out of git.']},\n      {type: 'table', headers: ['Variable', 'Value'], rows: [['`NODE_ENV`', '`production`']]},\n    ],\n  }],\n};",
        },
        {
          type: 'prose',
          text: 'The sample sets a section `id`, so `package.json` needs the CLI peer `"@astryxdesign/cli": ">=0.6.4"`. Published 0.6.3 and earlier reject `id` and hide every doc topic your package ships, and `integration verify` fails without that peer; see {@link generic:versioning}.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Replace the `Overview` placeholder that `integration add` writes.',
            'Every field is in {@link schema:reference-doc}.',
          ],
        },
      ],
    },
    {
      id: 'pick-the-doc-kind',
      title: 'Pick the doc kind',
      content: [
        {
          type: 'prose',
          text: 'Every doc is a `.doc.mjs` file whose `type` says what it describes. `integration add` writes the right `type` and file for each kind.',
        },
        {
          type: 'table',
          headers: [
            'You document',
            '`type`',
            'File that `integration add` writes',
          ],
          rows: [
            ['A guide or topic', "`'generic'`", '`docs/deploying.doc.mjs`'],
            [
              "Your package's docs section",
              "`'namespace'`",
              '`docs/acme.doc.mjs`',
            ],
            [
              'A component',
              "`'component'`",
              '`components/AcmeCarousel.doc.mjs`, beside `AcmeCarousel.tsx`',
            ],
            [
              'A template',
              "`'page'` or `'block'`",
              '`templates/acme-dashboard.doc.mjs`, beside `acme-dashboard.tsx`',
            ],
            [
              'A theme',
              "`'theme'`",
              '`themes/ocean/oceanTheme.doc.mjs`, beside `oceanTheme.ts`',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Only guides, topics, and your docs section go in the `docs` root. The others have their own guides: {@link namespace:components}, {@link namespace:templates}, and {@link namespace:themes}.',
        },
      ],
    },
    {
      id: 'keep-topics-in-the-docs-root',
      title: 'Keep topics in the docs root',
      content: [
        {
          type: 'prose',
          text: 'The `docs` field in `astryx.integration.mjs` names the folder that holds your topics. The CLI reads every `.doc.mjs` file under it, in subfolders too.',
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'astryx.integration.mjs',
          code: "export default {\n  docs: './docs'\n};",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Readers open a topic by its `name`, not its file name. Name the file after the doc, `<name>.doc.mjs`, so each one is easy to find.',
            'A topic with no `placement` is a flat topic: the docs list shows it under Topics, and readers open it by its name.',
            'To give your package its own section in the docs tree instead, see {@link generic:sections-and-placement}.',
          ],
        },
      ],
    },
  ],
};
