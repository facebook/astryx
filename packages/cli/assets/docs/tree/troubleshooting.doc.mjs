// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/troubleshooting`: the messages the CLI
 * prints while you build, verify, and install an integration, and the fix
 * for each.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'troubleshooting',
  placement: {parent: 'namespace:help', slot: 'guides', order: 10},
  title: 'Troubleshooting',
  category: 'guide',
  keywords: ['integration error', 'integration not loading'],
  description:
    'Find the message the CLI printed while you build, verify, or install an integration, and apply its fix.',
  sections: [
    {
      id: 'fix-setup-errors',
      title: 'Fix setup errors',
      content: [
        {
          type: 'prose',
          text: 'These appear while you start the package or run the CLI in it. Each row quotes what the CLI prints.',
        },
        {
          type: 'table',
          headers: ['Message', 'Fix'],
          rows: [
            [
              '`No package.json found. Run this command inside an integration package.`',
              'Run `npm init -y` and `npm pkg set name=@acme/astryx-widgets` first, in the package folder.',
            ],
            [
              '`Error: Could not find @astryxdesign/core package`',
              'Component commands read Core. Run `npm install -D @astryxdesign/core` in the package.',
            ],
            [
              '`core_not_found`: `Could not resolve @astryxdesign/core, so component names could not be checked.`',
              'Same fix. The check exits 1.',
            ],
            [
              "`Error: unknown subcommand 'integration verify'`, or `Error: Pass --check to verify the integration tarball.`",
              'Your CLI is older than `integration verify`. Run `npm install -D @astryxdesign/cli@latest`. On the older CLI, the same check is `integration pack --check`.',
            ],
            [
              'Note: `integration pack --check` is deprecated.',
              'The old name still runs the same check. Switch to `npx astryx integration verify`; the old name will be removed in a later release.',
            ],
          ],
        },
      ],
    },
    {
      id: 'fix-verify-failures',
      title: 'Fix integration verify failures',
      content: [
        {
          type: 'prose',
          text: '`npx astryx integration verify` prints each failure as a `[fail]` line. Add `--json` to see its issue code, such as `component_export_missing`.',
        },
        {
          type: 'table',
          headers: ['Message', 'Fix'],
          rows: [
            [
              '`component_export_missing`: `Component "AcmeCarousel" advertises import "@acme/astryx-widgets/components/AcmeCarousel", but that packed module does not export "AcmeCarousel".`',
              "package.json has no `exports` map, or the module does not export the name. Keep `export function AcmeCarousel`, and add the entry: `npm pkg set 'exports[./components/AcmeCarousel]=./components/AcmeCarousel.tsx'`.",
            ],
            [
              '`template_export_missing`: `Template "acme-dashboard" public import "@acme/astryx-widgets/templates/acme-dashboard" does not have a default export.`',
              'Run `npm pkg set \'exports[./templates/acme-dashboard]=./templates/acme-dashboard.tsx\'`, and keep `export default` in the source. Start new packages with `"exports": {}` so each add writes these.',
            ],
            [
              '`component_import_unresolvable` or `template_import_unresolvable`: `…Package subpath \'./components/AcmeCarousel\' is not defined by "exports"…`',
              "The `exports` map has no entry for it. Run `npm pkg set 'exports[./components/AcmeCarousel]=./components/AcmeCarousel.tsx'`, or `'exports[./templates/acme-dashboard]=./templates/acme-dashboard.tsx'` for a template.",
            ],
            [
              '`component_import_unresolvable`: `…but a consumer cannot resolve it: Cannot find package \'@acme/old-name\'`',
              "You renamed the package after the add wrote each doc's `import`. Change `import` in every component doc to the new name.",
            ],
            [
              '`Declared templates root "templates" has 0 of 2 expected files in the pack list. Add "templates" to "files" in package.json.`',
              "Run `npm pkg set 'files[]=templates'`.",
            ],
            [
              '`docs_tree_needs_cli`: `The package ships a namespace doc or a placed guide but declares no @astryxdesign/cli peer.`',
              "Run `npm pkg set 'peerDependencies.@astryxdesign/cli=>=0.6.4'` and `npm pkg set 'peerDependenciesMeta.@astryxdesign/cli.optional=true' --json`.",
            ],
            [
              '`replaces_needs_cli`: The package has a template that sets `replaces` but declares no @astryxdesign/cli peer.',
              "Run `npm pkg set 'peerDependencies.@astryxdesign/cli=>=0.7.0'` and `npm pkg set 'peerDependenciesMeta.@astryxdesign/cli.optional=true' --json`. A stable CLI before 0.7.0 rejects `replaces`, drops that template, and hides your doc topics.",
            ],
            [
              '`keywords_needs_cli`: The package has a template that sets `keywords` but declares no @astryxdesign/cli peer.',
              'The same fix as `replaces_needs_cli`: a stable CLI before 0.7.0 rejects `keywords`, drops that template, and hides your doc topics.',
            ],
            [
              '`themes_need_cli`: The package ships a theme but declares no @astryxdesign/cli peer.',
              "Run `npm pkg set 'peerDependencies.@astryxdesign/cli=>=0.6.4'` and `npm pkg set 'peerDependenciesMeta.@astryxdesign/cli.optional=true' --json`. A stable CLI before 0.6.4 cannot read typed theme descriptors, so it drops your themes and can hide your doc topics.",
            ],
            [
              '`section_ids_need_cli`: The package has a doc section that sets `id` but declares no @astryxdesign/cli peer.',
              'The same fix as `themes_need_cli`, or drop the section `id`s: a stable CLI before 0.6.4 rejects them and hides your doc topics.',
            ],
          ],
        },
      ],
    },
    {
      id: 'fix-problems-in-an-app',
      title: 'Fix problems in an app',
      content: [
        {
          type: 'prose',
          text: 'These appear in an app that installs your package, or in the doctor checks that predict them.',
        },
        {
          type: 'table',
          headers: ['Symptom', 'Fix'],
          rows: [
            [
              '`Error: Template "dashboard" is ambiguous — narrow it with --type and/or --package.`',
              "Your template id matches a Core id. Rename it, such as `acme-dashboard`, or set `replaces: 'dashboard'` to take its place. `npx astryx doctor integration templates` warns about this before you publish.",
            ],
            [
              '`invalid_doc_graph`: `placement.parent "namespace:nope" names no namespace; @acme/astryx-widgets declares "acme".`',
              'The guide stays hidden until its `placement` names a namespace and slot your package declares. For `"…" names no doc`, fix the link target.',
            ],
            [
              'Error: Unknown topic "acme". The docs of @acme/astryx-widgets did not load; run `astryx doctor integration docs` in that package to see why.',
              'One invalid doc hides all of your docs. Run `npx astryx doctor integration docs` in the package and fix the `invalid_doc` it names.',
            ],
            [
              '`npx astryx upgrade` runs none of your codemods',
              'The app must list your package in `integrations` in `astryx.config`, or pass `--integration @acme/astryx-widgets`. It runs a codemod folder only when its version is after `--from` and at most the installed `@astryxdesign/core`.',
            ],
            [
              'Your docs section, templates, or themes are missing only in some apps',
              'Those apps run a CLI too old to read them: a stable CLI before 0.7.0 for a template that sets `replaces` or `keywords`, or before 0.6.4 for a docs section or a theme. Update `@astryxdesign/cli` there, and keep your optional `@astryxdesign/cli` peer so npm warns about an old CLI.',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'What each check catches is in {@link generic:checks}.',
        },
      ],
    },
  ],
};
