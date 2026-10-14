// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/checks`: what each package check
 * proves, what fails and what only warns, and one command to run them all.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'checks',
  placement: {parent: 'namespace:ship', slot: 'guides', order: 20},
  title: 'Check an integration',
  category: 'guide',
  keywords: ['check before publishing', 'validate an integration', 'ci'],
  description:
    'Pick the check for each problem, learn what fails and what only warns, and run every check in CI.',
  sections: [
    {
      id: 'pick-a-check',
      title: 'Pick a check',
      content: [
        {
          type: 'prose',
          text: 'Run these in the package folder. The four `doctor integration` checks read your source; `integration verify` checks the package npm would publish.',
        },
        {
          type: 'table',
          headers: ['Command', 'Proves', 'Exits 1 when', 'Only warns when'],
          rows: [
            [
              '`npx astryx doctor integration validate`',
              'The manifest loads, and each root holds contributions the CLI can read',
              'A declared root is missing (`missing_root`), a contribution does not load (`invalid_doc`, `invalid_component`, `invalid_theme`), or two templates in the package replace one Core id (`ambiguous_template_replacement`)',
              'The manifest has a key this CLI does not know (`unknown_manifest_key`). With no `astryx.integration.mjs` it prints a hint and exits 0',
            ],
            [
              '`npx astryx doctor integration components`',
              'No component name clashes with a Core component, and each `replaces` names one Core component',
              'Core is not installed (`core_not_found`). In a package that declares the CLI range that turns replacement on, a `replaces` target is missing (`missing_component_replacement_target`) or invalid (`invalid_component_replacement`), or two components replace one Core component (`ambiguous_component_replacement`)',
              'A name clashes with Core, or a component sets `replaces` in a package without that range (`inactive_component_replacement`, plus any missing, invalid, or duplicate `replaces` reported as a warning)',
            ],
            [
              '`npx astryx doctor integration templates`',
              'Each `replaces` names a Core template of the same type',
              'A `replaces` target is missing (`missing_template_replacement_target`) or of the other type (`invalid_template_replacement`), or two templates replace one id (`ambiguous_template_replacement`)',
              'A template id matches a Core id without `replaces`',
            ],
            [
              '`npx astryx doctor integration docs`',
              'Your docs tree, every link, and topic names against Core',
              'A topic takes a Core topic name without `replaces` or `extends`, a doc is invalid (`invalid_doc`), or a namespace or placement fails, which hides the doc (`invalid_doc_graph`)',
              'A link names no doc (`invalid_doc_graph`)',
            ],
            [
              '`npx astryx integration verify`',
              'The packed package holds every file, shows the same contributions, resolves every public import, and declares the CLI it needs',
              'Anything `validate` fails on, no manifest, a file left out of the `.tgz` file, an import that does not resolve, or a missing CLI peer',
              'Anything `validate` warns about, or a component sets `replaces` and the package does not declare the CLI range that turns it on (`component_replaces_needs_cli`)',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'Pass a package name, such as `npx astryx doctor integration validate @acme/astryx-widgets`, to check an installed copy from an app instead.',
        },
      ],
    },
    {
      id: 'run-every-check-in-ci',
      title: 'Run every check in CI',
      content: [
        {
          type: 'prose',
          text: 'Chain the five checks so the first failure stops the run. Install devDependencies first, because the components check needs Core.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx doctor integration validate && npx astryx doctor integration components && npx astryx doctor integration templates && npx astryx doctor integration docs && npx astryx integration verify',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`integration verify` runs `validate` but none of the other three: a Core name clash, a `replaces` that names no Core template, a topic that takes a Core name, or a hidden guide still passes it.',
            'Warnings keep exit code 0, so read them before you publish.',
            'Bare `npx astryx doctor` in the package also warns about a doc section over 32 KB, which no check above measures.',
          ],
        },
      ],
    },
    {
      id: 'what-integration-verify-does',
      title: 'Verify the packed package',
      content: [
        {
          type: 'prose',
          text: '`integration verify` packs your package with npm, unpacks it into a temporary app, and checks that the app sees everything your source has. It publishes nothing and leaves no `.tgz` file or temporary folder behind.',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            'It runs `npm pack` the way `npm publish` would, including your `prepack` script.',
            'It checks that every contribution file is in the `.tgz` file. A root missing from `files` fails with `Add "templates" to "files" in package.json.`',
            'It lists the components, templates, themes, docs, and codemods the temporary app sees, and compares them with your source.',
            "It resolves each component's `import`, and each template's public import, the way Node does, and checks that the module exports the component, or a default export for a template.",
            'For each theme, it rebuilds the source, compares the built module and production CSS with the authored outputs, and proves the module, CSS, and optional font CSS exports resolve from the packed package.',
            'It fails a package that needs an `@astryxdesign/cli` peer and lacks it: `>=0.6.6` for a template that sets `keywords`, and `>=0.6.4` for a template that sets `replaces`, a docs section, a placed guide, a doc section with an `id`, or a theme.',
          ],
        },
        {
          type: 'prose',
          text: '`integration pack --check`, the name this check had in 0.6, still runs it and prints a note; it will be removed in a later release. The options and exit codes are in {@link command:integration verify}.',
        },
      ],
    },
  ],
};
