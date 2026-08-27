// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'cli-integrations',
  title: 'CLI Integrations',
  category: 'guide',
  description:
    'Author an npm package that contributes components, templates, and upgrade codemods to Astryx.',

  sections: [
    {
      title: 'Overview',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'An integration is an npm package that contributes components, templates, doc topics, and/or upgrade codemods to a consumer\'s design-system workflow. Consumers install the package and add it to their `astryx.config`; from then on the integration\'s contributions show up alongside core\'s in the same CLI commands.',
        },
        {
          type: 'prose',
          text: 'The system runs on two files. The consumer writes `astryx.config.{ts,mjs,js}` at their project root to list which packages to load. The author writes `astryx.integration.{ts,mjs,js}` at the package root to declare what the package contributes. This page is the author\'s guide. For the consumer side, run `npx astryx docs getting-started`.',
        },
        {
          type: 'prose',
          text: 'On the consumer side, adding your package is one line:',
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// astryx.config.ts\nexport default {\n  integrations: ['@acme/astryx-widgets'],\n};",
        },
        {
          type: 'prose',
          text: 'Your components and templates then appear next to core\'s:',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'astryx component --list --package @acme/astryx-widgets\nastryx component AcmeCarousel --props',
        },
      ],
    },
    {
      title: 'The Integration File',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'To register your package as an integration, add an `astryx.integration.{ts,mjs,js}` file as a sibling of your `package.json`. It tells the CLI where to find your components, templates, doc topics, and codemods. Identity (name, version) comes from your `package.json`, not this file.',
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// astryx.integration.ts\nexport default {\n  components: './components',\n  templates: './templates',\n  codemods: './codemods',\n  docs: './docs',\n  issuesUrl: 'https://github.com/acme/widgets/issues',\n};",
        },
        {
          type: 'prose',
          text: 'Every field is optional. Declare only the contribution roots your package ships. There is no factory to call. Write a plain object, and for editor autocomplete and type-checking annotate it with the `AstryxIntegration` type exported from `@astryxdesign/cli/authoring`.',
        },
      ],
    },
    {
      title: 'Components',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Export your components from your library however you like, and consumers still import them from your package. For each component the CLI should document, ship a `.doc.{ts,mjs,js}` file with the same stem, for example `AcmeCarousel.tsx` alongside `AcmeCarousel.doc.ts`.',
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// AcmeCarousel.doc.ts\nexport default {\n  type: 'component',\n  name: 'AcmeCarousel',\n  description: 'A carousel that cycles through slides.',\n  // props, usage, examples, ...\n};",
        },
      ],
    },
    {
      title: 'Templates',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Templates are usually not exported from the package directly. Instead, consumers browse them through the CLI and materialize them into their app. Define a template as a plain object stamped with `type: \'page\'` (full pages) or `type: \'block\'` (smaller chunks) in a `.template.{ts,mjs,js}` file next to the source, for example `AcmeLandingPage.tsx` and `AcmeLandingPage.template.ts`.',
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// AcmeLandingPage.template.ts\nexport default {\n  type: 'page',\n  // name, description, preview, ...\n};",
        },
        {
          type: 'prose',
          text: 'The CLI needs the template source at consume time, so make sure it is included in your published package. This is typically done via the `exports` key in `package.json`. It also lets the docsite render template previews in the future.',
        },
        {
          type: 'code',
          lang: 'jsonc',
          code: '{\n  "exports": {\n    // ...\n    "./templates/*.tsx": "./templates/*.tsx"\n  }\n}',
        },
        {
          type: 'prose',
          text: 'To verify it resolves, try importing the template component with its `.tsx` extension. An extensionless specifier will not resolve under `moduleResolution: bundler`, and the extensionful export above is what lets this type-check without consumers enabling `allowImportingTsExtensions`.',
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "import('@acme/astryx-widgets/templates/AcmeLandingPage.tsx');",
        },
      ],
    },
    {
      title: 'Docs',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: "Point the integration file's `docs` field at a directory of reference docs and every `{topic}.doc.{ts,mjs,js}` under it becomes a topic the CLI serves: `astryx docs` lists it, `astryx docs <topic>` prints it, `astryx search` indexes it, and `astryx init` names it in the agent block. A topic is a plain object stamped `type: 'generic'`, the same shape core's own topics use.",
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// docs/deploying.doc.ts\nexport default {\n  type: 'generic',\n  name: 'deploying',\n  title: 'Deploying',\n  description: 'Ship an app built with Acme widgets.',\n  category: 'guide',\n  sections: [\n    {title: 'Overview', content: [{type: 'prose', text: '...'}]},\n  ],\n};",
        },
        {
          type: 'prose',
          text: "A topic can also speak about one that already exists. `replaces: 'x'` takes over topic x (core's, or another integration's) so a package whose consumers install it differently can serve its own Getting Started instead of the built-in one. Give the replacement a different `name` and the old name keeps resolving to it, so a link or an agent that learned the old topic still lands in the right place.",
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "export default {\n  type: 'generic',\n  name: 'getting-started',\n  replaces: 'getting-started',\n  title: 'Getting started',\n  description: 'Install Acme widgets and use your first component.',\n  sections: [/* ... */],\n};",
        },
        {
          type: 'prose',
          text: "`extends: 'x'` merges onto a topic instead of owning it: a section whose title matches one in the base replaces that section, and a section the base does not have is appended. Reach for it to correct or add to a topic you do not want to fork: a fork of someone else's guide stops receiving their fixes the day you write it.",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'A topic name is a CLI argument and a docsite path, so it may hold only letters, digits, `_` and `-`.',
            "A name that collides with an existing topic and declares neither `replaces` nor `extends` is an error, not a silent override; the CLI will not guess which one you meant.",
            '`replaces` and `extends` are exclusive: a topic either takes another\'s place or merges onto it.',
            'Two integrations replacing one topic is a warning, and the one configured later in `astryx.config` wins.',
          ],
        },
      ],
    },
    {
      title: 'Codemods',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Ship codemods so `astryx upgrade` can migrate consumers across breaking changes in your package. Point the integration file\'s `codemods` field at your codemods root, and author each one as a plain object stamped with `type: \'code\'` (transforms source files) or `type: \'config\'` (rewrites the consumer\'s `astryx.config`).',
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// codemods/v2-rename-prop.ts\nexport default {\n  type: 'code',\n  // title, description, transform, ...\n};",
        },
        {
          type: 'prose',
          text: 'All authoring types are exported from `@astryxdesign/cli/authoring`: `ComponentDoc`, `HookDoc`, and `ReferenceDoc` for docs, `TemplateDoc` for templates, and `AstryxConfig`, `AstryxIntegration`, and `AstryxCodemod` for the project files. Consumers can also run their own post-codemod hooks, such as a reinstall or rebuild, via `hooks.postCodemod` in their `astryx.config`.',
        },
      ],
    },
    {
      title: 'How It Works',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Every CLI command loads the consumer\'s `astryx.config`, resolves each listed integration\'s manifest from `node_modules`, and discovers its contributions. Everything is validated against one strict schema at the load boundary: the CLI parses each file through `@astryxdesign/cli/authoring` when it loads it, not when you author it. There are no factories; you write a plain object and stamp its `type`.',
        },
        {
          type: 'prose',
          text: 'Discovery is resilient. A broken or misconfigured integration is skipped with a single non-blocking warning on stderr instead of crashing the CLI, and it never corrupts a `--json` stdout envelope. Everyday commands keep working with the remaining valid contributions.',
        },
        {
          type: 'prose',
          text: 'To inspect problems, run `astryx validate-integration <package>` for a detailed report on one package, or `astryx doctor` for an overall health check of the setup.',
        },
      ],
    },
  ],
};
