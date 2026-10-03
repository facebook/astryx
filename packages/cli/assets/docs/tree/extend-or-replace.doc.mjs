// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/docs/extend-or-replace`: take over an
 * existing topic with `replaces`, merge sections into one with `extends`, and
 * check overlaps with Core topics.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'extend-or-replace',
  placement: {parent: 'namespace:docs', slot: 'guides', order: 40},
  title: 'Extend or replace a topic',
  category: 'guide',
  description: 'Take over a topic, or merge sections into it.',
  sections: [
    {
      id: 'replace-a-topic',
      title: 'Replace a topic',
      content: [
        {
          type: 'prose',
          text: "Set `replaces` to take over an existing topic, such as Core's `getting-started`. Readers who open the old name get your topic.",
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx integration add doc acme-getting-started --replaces getting-started\n# The old name now opens your topic\nnpx astryx docs getting-started',
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'docs/acme-getting-started.doc.mjs',
          code: "export default {\n  type: 'generic',\n  name: 'acme-getting-started',\n  replaces: 'getting-started',\n  title: 'Acme getting started',\n  description: 'Install Acme widgets and render your first carousel.',\n  sections: [/* ... */],\n};",
        },
        {
          type: 'prose',
          text: 'The docs list shows your topic in place of the old one. Because your topic has its own `name`, the old name keeps resolving to it, so links and agents that learned the old name still land on your topic.',
        },
      ],
    },
    {
      id: 'extend-a-topic',
      title: 'Extend a topic',
      content: [
        {
          type: 'prose',
          text: 'Set `extends` to merge sections into an existing topic instead of owning it. A section with the same key replaces the base section, and a new section is added at the end.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx integration add doc acme-theming --extends theme\nnpx astryx docs theme --index',
        },
        {
          type: 'code',
          lang: 'javascript',
          label: 'docs/acme-theming.doc.mjs',
          code: "export default {\n  type: 'generic',\n  name: 'acme-theming',\n  extends: 'theme',\n  title: 'Acme theming',\n  description: 'Theme an app that uses Acme widgets.',\n  sections: [\n    {id: 'quick-start', title: 'Quick Start', content: [/* replaces the base section */]},\n    {id: 'use-the-ocean-theme', title: 'Use the ocean theme', content: [/* added at the end */]},\n  ],\n};",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            "A section's key is its `id`, or a key made from its title. Read the base topic's keys with `--index`.",
            "The topic keeps the base's title and description, and readers open it by the base's name.",
            'Replace the `Overview` placeholder that `integration add` writes, or it is added to the base topic.',
            "Extend a topic to correct or add to it. A copy made with `replaces` stops getting the owner's fixes.",
          ],
        },
      ],
    },
    {
      id: 'check-overlaps-with-core-topics',
      title: 'Check overlaps with Core topics',
      content: [
        {
          type: 'prose',
          text: "A topic sets `replaces` or `extends`, never both, and a placed guide sets neither. A topic that uses a Core topic's name with neither is an accidental conflict: apps keep reading the Core topic.",
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx doctor integration docs',
        },
        {
          type: 'code',
          lang: 'text',
          code: 'severity:     [info]\ntopic:        acme-getting-started\nrelationship: replaces\ncoreTopic:    getting-started\nmessage:      Intentional override: "acme-getting-started" replaces the Core topic "getting-started".\n\nseverity:     [fail]\ntopic:        tokens\nrelationship: accidental\ncoreTopic:    tokens\nmessage:      Accidental conflict: "tokens" is already a Core topic. Rename it, declare replaces: \'tokens\' to take it over, or declare extends: \'tokens\' to merge sections.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'An intentional overlap prints as `[info]`. An accidental one fails with exit code 1.',
            'A topic that sets both fails as `invalid_doc`, and so does a placed guide that sets either one.',
          ],
        },
      ],
    },
  ],
};
