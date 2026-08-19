// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SchemaDoc for the `TemplateDoc` doc-type — how to author metadata for a
 * page or block template. A union of PageTemplateDoc and BlockTemplateDoc that
 * share BaseTemplateDoc. Colocated with the type it describes (`type.ts`).
 * @position packages/cli/authoring/doctypes/template — doc-type documentation
 */

/** @type {import('@astryxdesign/cli/authoring').SchemaDoc} */
export const doc = {
  type: 'schema',
  name: 'template-doc',
  displayName: 'TemplateDoc',
  namespace: 'authoring',
  description:
    'The doc-type for template metadata. A discriminated union of PageTemplateDoc ' +
    "(type: 'page') for full page templates and BlockTemplateDoc (type: 'block') for " +
    'component example blocks. Both share BaseTemplateDoc; block templates add ' +
    'example/preview fields.',
  appliesTo: '<Name>.template.mjs',
  fields: [
    {
      name: 'type',
      type: "'page' | 'block'",
      description:
        "Discriminant selecting the variant: 'page' for a full page template, 'block' for a component example block.",
      required: true,
    },
    {
      name: 'name',
      type: 'string',
      description:
        'Identifier. For block templates it matches the React component import name; for page templates it is a human-readable label.',
      required: true,
    },
    {
      name: 'displayName',
      type: 'string',
      description:
        "Human-readable label for the gallery/CLI. Spaces out block names that mirror a PascalCase component ('ChatMessageMetadata' → 'Chat Message Metadata').",
      required: true,
    },
    {
      name: 'description',
      type: 'string',
      description: 'One-sentence description of what the template provides.',
    },
    {
      name: 'isReady',
      type: 'boolean',
      description:
        "Whether the template is ready for use. false shows as '(WIP)' in the gallery and CLI.",
    },
    {
      name: 'scaffold',
      type: 'boolean',
      description:
        'Scaffolding-only template (e.g. blank page): available via the CLI but hidden from browsable galleries.',
    },
    {
      name: 'category',
      type: 'TemplateCategory',
      description:
        "Functional gallery category following a 'Group - Variant' convention (e.g. 'Dashboard - Analytics', 'Table - Basic', 'Form - Wizard'). The overview groups by the text before ' - '.",
    },
    {
      name: 'isHiddenFromOverview',
      type: 'boolean',
      description:
        'Opt out of the Templates overview gallery while staying available via the CLI. Use for duplicate/experimental variants. Scaffold templates are hidden automatically.',
    },
    {
      name: 'exampleFor',
      type: 'string',
      description:
        "Block templates only (required): the component this block is an example of, matching the component's doc name (e.g. 'Button'). Powers examples on component detail pages.",
    },
    {
      name: 'alsoExampleFor',
      type: 'string[]',
      description:
        'Block templates only: additional component/hook doc pages whose Examples section should include this block.',
    },
    {
      name: 'alsoShowcaseFor',
      type: 'string[]',
      description:
        'Block templates only: additional doc pages whose hero showcase should reuse this block (secondary placements; does not change the primary showcase).',
    },
    {
      name: 'aspectRatio',
      type: 'number',
      description:
        'Block templates only (required): width-to-height ratio for preview containers (e.g. 16/9, 1, 3/4).',
    },
    {
      name: 'scale',
      type: 'number',
      description: 'Block templates only: scale factor for the block preview.',
      default: '1',
    },
    {
      name: 'componentsUsed',
      type: 'string[]',
      description:
        "Block templates only: component names this block uses, for 'See also'/'Used in' cross-references (not primary attribution).",
    },
    {
      name: 'isShowcase',
      type: 'boolean',
      description:
        "Block templates only: when true this block is the canonical 'hero' showcase for its `exampleFor` component.",
    },
  ],
  examples: [
    {
      label: 'Page template',
      code: `/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'page',
  name: 'Dashboard',
  displayName: 'Dashboard',
  description: 'An analytics dashboard with KPI cards and charts.',
  category: 'Dashboard - Analytics',
  isReady: true,
};`,
    },
    {
      label: 'Block template (component example)',
      code: `/** @type {import('@astryxdesign/cli/authoring').TemplateDoc} */
export const doc = {
  type: 'block',
  name: 'ButtonGroupExample',
  displayName: 'Button Group Example',
  description: 'A row of related buttons showing primary and secondary actions.',
  exampleFor: 'Button',
  aspectRatio: 16 / 9,
  componentsUsed: ['Button', 'HStack'],
  isShowcase: true,
};`,
    },
  ],
  notes: [
    {
      type: 'prose',
      text: "TemplateDoc is a discriminated union keyed by `type`. Set `type: 'page'` for a standalone page template (only the BaseTemplateDoc fields apply) or `type: 'block'` for a component example (the exampleFor/aspectRatio/showcase fields apply).",
    },
    {
      type: 'list',
      style: 'unordered',
      items: [
        "PageTemplateDoc (type: 'page'): a full page template; `name` doubles as its display value.",
        "BlockTemplateDoc (type: 'block'): an example of a component; requires `exampleFor` and `aspectRatio`.",
      ],
    },
    {
      type: 'prose',
      text: "`category` uses the shared TemplateCategory taxonomy: 'Group - Variant' strings (e.g. 'Table - Bulk Actions'). Not every value maps to an existing template; unused values are reserved so authors get autocomplete for the full taxonomy.",
    },
  ],
};
