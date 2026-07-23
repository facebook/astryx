// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */

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
          text: 'An integration is an npm package that contributes components, templates, and/or upgrade codemods to a consumer\u2019s design-system workflow. Consumers install the package and add it to their `astryx.config`; from then on the integration\u2019s contributions show up alongside core\u2019s in the same CLI commands.',
        },
        {
          type: 'prose',
          text: 'The system runs on two files. The consumer writes `astryx.config.{ts,mjs,js}` at their project root to list which packages to load. The author writes `astryx.integration.{ts,mjs,js}` at the package root to declare what the package contributes. This page is the author\u2019s guide. For the consumer side, run `npx astryx docs getting-started`.',
        },
        {
          type: 'prose',
          text: 'On the consumer side, adding your package is one line:',
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "import {createConfig} from '@astryxdesign/core/config';\n\nexport default createConfig({\n  integrations: ['@acme/astryx-widgets'],\n});",
        },
        {
          type: 'prose',
          text: 'Your components and templates then appear next to core\u2019s:',
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
          text: 'To register your package as an integration, add an `astryx.integration.{ts,mjs,js}` file as a sibling of your `package.json`. It tells the CLI where to find your components, templates, and codemods. Identity (name, version) comes from your `package.json`, not this file.',
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// astryx.integration.ts\nimport {createIntegration} from '@astryxdesign/core/authoring';\n\nexport default createIntegration({\n  components: './components',\n  templates: './templates',\n  codemods: './codemods',\n  issuesUrl: 'https://github.com/acme/widgets/issues',\n});",
        },
        {
          type: 'prose',
          text: 'Every field is optional. Declare only the contribution roots your package ships. `createIntegration` is a type-preserving helper for editor autocomplete and type-checking. It lives in `@astryxdesign/core/authoring` and is also re-exported from `@astryxdesign/cli/integration` for back-compat.',
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
          code: "// AcmeCarousel.doc.ts\nimport {createComponentDoc} from '@astryxdesign/core/authoring';\n\nexport default createComponentDoc({\n  name: 'AcmeCarousel',\n  description: 'A carousel that cycles through slides.',\n  // props, usage, examples, ...\n});",
        },
      ],
    },
    {
      title: 'Templates',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Templates are usually not exported from the package directly. Instead, consumers browse them through the CLI and materialize them into their app. Define a template with `createPageTemplate` (full pages) or `createBlockTemplate` (smaller chunks) in a `.template.{ts,mjs,js}` file next to the source, for example `AcmeLandingPage.tsx` and `AcmeLandingPage.template.ts`.',
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// AcmeLandingPage.template.ts\nimport {createPageTemplate} from '@astryxdesign/core/authoring';\n\nexport default createPageTemplate({\n  // name, description, preview, ...\n});",
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
      title: 'Codemods',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Ship codemods so `astryx upgrade` can migrate consumers across breaking changes in your package. Point the integration file\u2019s `codemods` field at your codemods root, and author each one with `createCodemod` (transforms source files) or `createConfigCodemod` (rewrites the consumer\u2019s `astryx.config`).',
        },
        {
          type: 'code',
          lang: 'typescript',
          code: "// codemods/v2-rename-prop.ts\nimport {createCodemod} from '@astryxdesign/cli/codemod';\n\nexport default createCodemod({\n  // version, description, transform, ...\n});",
        },
        {
          type: 'prose',
          text: 'The codemod helpers live in `@astryxdesign/cli/codemod`, not `@astryxdesign/core/authoring` like the doc, integration, and template helpers. Consumers can also run their own post-codemod hooks, such as a reinstall or rebuild, via `hooks.postCodemod` in their `astryx.config`.',
        },
      ],
    },
    {
      title: 'How It Works',
      category: 'guide',
      content: [
        {
          type: 'prose',
          text: 'Every CLI command loads the consumer\u2019s `astryx.config`, resolves each listed integration\u2019s manifest from `node_modules`, and discovers its contributions. Everything is validated against one strict schema at the load boundary. The `create*` helpers do not validate. They are identity functions whose value is their TypeScript surface, so validation happens when the CLI loads the file, not when you author it.',
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
