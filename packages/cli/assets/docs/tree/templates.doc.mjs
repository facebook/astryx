// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/templates`: add page and block templates
 * to an integration package, pick ids that stay clear of Core, and replace a
 * Core template.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'templates',
  placement: {parent: 'namespace:integrations', slot: 'contribute', order: 20},
  title: 'Templates',
  category: 'guide',
  description:
    'Ship page and block templates that apps copy into their code, and replace a Core template when yours should be the default.',
  sections: [
    {
      id: 'add-a-template',
      title: 'Add a page or block template',
      content: [
        {
          type: 'prose',
          text: 'A page template is a whole page, and a block is a smaller piece that goes inside one. `integration add template` writes the source and its metadata file.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: `npx astryx integration add template acme-dashboard
npx astryx integration add template acme-carousel-example --type block`,
        },
        {
          type: 'prose',
          text: 'Each add writes `templates/<id>.tsx`, which must keep a default export, and `templates/<id>.doc.mjs`. `--type page` is the default. When package.json has an `exports` map, add also writes `./templates/<id>` into it; `integration verify` fails without that entry.',
        },
        {
          type: 'code',
          lang: 'js',
          code: `// templates/acme-carousel-example.doc.mjs
/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'block',
  name: 'acme-carousel-example',
  displayName: 'Acme Carousel Example',
  description: 'An Acme Carousel with three image slides.',
  aspectRatio: 16 / 9,
  exampleFor: 'AcmeCarousel',
};`,
        },
        {
          type: 'prose',
          text: 'A block previews at `aspectRatio`. Set `exampleFor` when the block shows one of your components, and leave it out for a standalone block. Every field is in {@link generic:authoring}.',
        },
        {
          type: 'prose',
          text: 'An app copies a template into its code with `npx astryx template acme-dashboard src/app`, which prints `Copied template to src/app/page.tsx`. A block gets its own file name, and with no path the command prints the source.',
        },
      ],
    },
    {
      id: 'pick-a-template-id',
      title: "Pick a template id Core doesn't use",
      content: [
        {
          type: 'prose',
          text: 'Apps ask for a template by its id, so an id that Core also uses makes the request ambiguous. Prefix your ids, as in `acme-dashboard`.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: `# List the Core template ids
npx astryx --json template --list --package @astryxdesign/core`,
        },
        {
          type: 'prose',
          text: 'If you reuse one, such as `dashboard`, an app\'s `npx astryx template dashboard` fails with `Template "dashboard" is ambiguous` until it adds `--package`. `npx astryx doctor integration templates` warns about the clash:',
        },
        {
          type: 'code',
          lang: 'text',
          code: `severity:           [warn]
relationship:       accidental
id:                 dashboard
message:            Template id "dashboard" conflicts with Core (page "Analytics Dashboard"). Consider renaming it, or set replaces: "dashboard" in its metadata to replace the Core template.`,
        },
        {
          type: 'prose',
          text: 'To take over a Core id on purpose, replace that template with `replaces`.',
        },
      ],
    },
    {
      id: 'replace-a-core-template',
      title: 'Replace a Core template',
      content: [
        {
          type: 'prose',
          text: 'Set `replaces` to a Core template id, and apps that ask for that id get your template. The Core original stays one flag away.',
        },
        {
          type: 'code',
          lang: 'js',
          code: `// templates/acme-app-shell.doc.mjs
/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export default {
  type: 'page',
  name: 'acme-app-shell',
  displayName: 'Acme App Shell',
  description: 'An app shell with Acme navigation.',
  replaces: 'shell-side-nav',
};`,
        },
        {
          type: 'prose',
          text: 'A page replaces only a Core page, and a block only a Core block. A CLI older than 0.7.0 cannot read `replaces`: it drops that template and hides your doc topics. Declare the newer CLI as an optional peer in package.json; until you do, `integration verify` fails with `replaces_needs_cli`.',
        },
        {
          type: 'code',
          lang: 'json',
          code: `"peerDependencies": {
  "@astryxdesign/cli": ">=0.7.0"
},
"peerDependenciesMeta": {
  "@astryxdesign/cli": {"optional": true}
}`,
        },
        {
          type: 'prose',
          text: 'In an app, `npx astryx template shell-side-nav` now gives yours, and `npx astryx template shell-side-nav --package @astryxdesign/core` gives the original. Your template also keeps its own id, `acme-app-shell`.',
        },
      ],
    },
    {
      id: 'competing-replacements',
      title: 'When packages replace the same template',
      content: [
        {
          type: 'prose',
          text: 'When several packages in one app replace the same Core template, one wins and the CLI warns. The app picks the winner with `astryx.config`.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            "A package listed in the app's `astryx.config` `integrations` wins over one that is only installed.",
            'Among listed packages, the one listed later wins.',
            "When no package is listed, the one listed later in the app's package.json dependencies wins.",
          ],
        },
        {
          type: 'prose',
          text: '`npx astryx doctor` in the app names the winner:',
        },
        {
          type: 'code',
          lang: 'text',
          code: `message: 1 integration issue(s): @acme/astryx-widgets: Core template "shell-side-nav" is replaced by autolinked dependencies @acme/astryx-nav, @acme/astryx-widgets. @acme/astryx-widgets is listed later in package.json dependencies, so it wins. Add the intended package to astryx.config integrations to make precedence explicit.`,
        },
      ],
    },
    {
      id: 'replacements-that-fail-closed',
      title: 'Replacements that fail closed',
      content: [
        {
          type: 'prose',
          text: 'A replacement the CLI cannot apply fails closed: the Core template stays the default, and yours keeps its own id. `npx astryx doctor integration templates` names the problem and exits 1.',
        },
        {
          type: 'table',
          headers: ['Problem', 'Issue code'],
          rows: [
            [
              '`replaces` names no Core template.',
              '`missing_template_replacement_target`',
            ],
            [
              'A block replaces a page, or a page replaces a block.',
              '`invalid_template_replacement`',
            ],
            [
              'Two templates in one package replace the same Core template.',
              '`ambiguous_template_replacement`',
            ],
          ],
        },
        {
          type: 'prose',
          text: '`integration verify` catches only the last one, so run the doctor check before you publish ({@link generic:checks}).',
        },
      ],
    },
  ],
};
