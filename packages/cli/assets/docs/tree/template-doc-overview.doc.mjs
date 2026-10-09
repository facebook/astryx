// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/building-blocks/templates/document-the-template/template-doc-overview`:
 * the source and doc file pair, the fields every template doc shares, and how
 * to check what Astryx lists.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'template-doc-overview',
  placement: {
    parent: 'namespace:document-the-template',
    slot: 'guides',
    order: 10,
  },
  title: 'Template doc overview',
  category: 'guide',
  description:
    'Understand what the template doc controls, keep it accurate as the UI changes, and check how Astryx lists the template.',
  sections: [
    {
      id: 'understand-the-two-files',
      title: 'Understand the two files',
      content: [
        {
          type: 'prose',
          text: 'Every template has a source file and a doc file. For `acme-dashboard`, the source is `templates/acme-dashboard.tsx` and the doc is `templates/acme-dashboard.doc.mjs`. Both begin with `acme-dashboard`, which is how Astryx knows they belong together.',
        },
        {
          type: 'table',
          headers: ['File', 'What it controls'],
          rows: [
            [
              '`templates/acme-dashboard.tsx`',
              'The UI source that an app copies and then owns.',
            ],
            [
              '`templates/acme-dashboard.doc.mjs`',
              'How Astryx names, describes, categorizes, previews, and resolves the template before it is copied.',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'The integration manifest points Astryx to the `templates` directory; it does not list each template. Change the source and doc together whenever the purpose, preview, readiness, or replacement behavior changes. No automated check can tell whether the doc still describes the rendered UI.',
        },
      ],
    },
    {
      id: 'document-the-shared-fields',
      title: 'Document the shared fields',
      content: [
        {
          type: 'prose',
          text: 'The fields below apply to every page and block. The page, block, and replacement guides add the fields unique to each.',
        },
        {
          type: 'prose',
          text: 'Every field is in {@link schema:template-doc}.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Set `type` to the kind you chose in {@link generic:start-a-template}. It decides which other fields the doc accepts.',
            'The file name sets the template id ({@link generic:start-a-template}). Labels live in the doc: the terminal list prints `name`, and JSON listings print `displayName`. Changing either never changes the id.',
            'Write the description for someone choosing between templates. The Doc metadata category in {@link generic:template-grading-rubric} defines what a complete description covers.',
            "Name the ideas the template serves in `keywords`: the domains, tasks, and other names a builder might use for it, in lowercase, such as `['monitoring', 'uptime', 'on-call']` for a service-health dashboard. `astryx search` matches them as it matches the description, and `astryx build` ranks page templates on them, so the description can stay about the layout.",
            'Add `isReady: false` as soon as you generate the doc, because a doc without `isReady` is listed as ready. Keep it until the template passes {@link generic:test-template-in-app} and the quality review.',
          ],
        },
        {
          type: 'prose',
          text: 'Note: published 0.6.5 and earlier reject `keywords` and drop that template, and published 0.6.3 and earlier also hide your doc topics. In 0.6.3 to 0.6.5, `template --list` and `search` print one warning, and `docs` and `build` say nothing. Declare the CLI floor that `integration verify` names as an optional peer ({@link generic:versioning}); verify fails with `keywords_needs_cli` until you do.',
        },
      ],
    },
    {
      id: 'check-how-astryx-lists-it',
      title: 'Check how Astryx lists it',
      content: [
        {
          type: 'prose',
          text: 'Read the package-scoped template list after every doc change. Confirm the id, visible name, description, type, readiness, and package.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx --json template --list --package @acme/astryx-templates',
        },
        {
          type: 'code',
          lang: 'json',
          label: 'Relevant list result',
          code: `{
  "id": "acme-dashboard",
  "name": "acme-dashboard",
  "displayName": "Acme Dashboard",
  "description": "An analytics dashboard for reviewing account health and recent trends.",
  "type": "page",
  "package": "@acme/astryx-templates",
  "isReady": false
}`,
        },
      ],
    },
  ],
};
