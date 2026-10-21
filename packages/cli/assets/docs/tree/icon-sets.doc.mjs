// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/experimental/icon-sets`: make an
 * icon set: register icons against icon definitions with the CLI, check the
 * set, and know how apps find its icons and how templates follow it.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'icon-sets',
  placement: {parent: 'namespace:experimental', slot: 'guides', order: 10},
  stability: 'experimental',
  title: 'Icon sets',
  category: 'guide',
  keywords: [
    'icon set',
    'add icons',
    'ship icons',
    'icon library',
    'icon definition',
    'icons.json',
    'integration icons',
  ],
  description:
    'Experimental. Ship an icon set: register each icon against an icon definition, so apps find icons by meaning and templates use your icons.',
  sections: [
    {
      id: 'experimental',
      title: 'Experimental',
      content: [
        {
          type: 'prose',
          text: 'Icon sets are experimental: the `astryx experimental icon` commands, the `experimental.iconSet` key in astryx.config, the `experimental.iconSets` key in an integration manifest, the data file, icon definitions, and the output and JSON of all of them can change, or go away, in any patch release without a deprecation period. A project that does not set `experimental.iconSet` sees no change in any other command: templates, discover, and doctor answer as they always have. `astryx search` never returns icons or these docs; to find an icon by meaning, use `astryx experimental icon <words>`.',
        },
      ],
    },
    {
      id: 'how-it-works',
      title: 'How it works',
      content: [
        {
          type: 'prose',
          text: 'Astryx keeps a list of icon definitions: one file per meaning, like `close` or `delete` (`astryx docs cli/experimental/icon-definitions`). An icon set registers which of its icons draws each definition, in the `map` of its data file. Templates say which definition each of their icons draws, so a project that uses your set gets your icon for every definition you map. Every set maps the built-in definitions, the names Core renders itself.',
        },
        {
          type: 'prose',
          text: 'The CLI knows no icon library. You, or your agent, pick each icon from the library you wrap; the commands below verify it, write the files, and check the set.',
        },
      ],
    },
    {
      id: 'add-an-icon-set',
      title: 'Add an icon set',
      content: [
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx experimental icon new-set outline',
        },
        {
          type: 'prose',
          text: "`outline.doc.mjs` is the descriptor: name, display name, description, and `license`, the SPDX license of the artwork (it starts as your package's own). `outline.icons.json` starts with no icons and an empty `map`; its `module` is your package name. `outline.generated.js` is the set's generated module, with its declaration file `outline.generated.d.ts`: the CLI writes both, and every icon and the theme map are exports of it. Every field is in {@link schema:icon-set-doc} and {@link schema:icon-set-data}.",
        },
      ],
    },
    {
      id: 'add-icons',
      title: 'Add icons one at a time',
      content: [
        {
          type: 'prose',
          text: 'Pick an icon from the library and ask which definitions fit it. Nothing is written yet:',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx experimental icon add Bin --from @acme/glyph-library',
        },
        {
          type: 'prose',
          text: 'Each row is an Astryx definition (or one your set declares) with the exact command that adds the icon for it. Run one:',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx experimental icon add Bin --from @acme/glyph-library --definition delete',
        },
        {
          type: 'prose',
          text: "The CLI reads the library's exports without running them and refuses a name the module does not export, suggesting close names. It adds the icon as `BinIcon` (id `bin`, words from its name), writes `export {Bin as BinIcon} from '@acme/glyph-library';` to the set's generated module, and sets `map.delete = \"bin\"`. Running it again changes nothing. Do not copy the definition's words into the icon: `astryx experimental icon` matches an icon by its own words and by the name and words of every definition it is mapped to.",
        },
        {
          type: 'prose',
          text: 'When no Astryx definition fits, add your own in the same command. It needs no pull request:',
        },
        {
          type: 'code',
          lang: 'bash',
          code: "npx astryx experimental icon add RotateCw --from @acme/glyph-library --new-definition rotate --description 'Rotate an image or shape.' --words turn,spin",
        },
        {
          type: 'prose',
          text: '`experimental icon map <definition> <icon>` points a definition at an icon the set already has, and `--remove` drops an entry. `experimental icon new-definition <name> --description ... --words ... --icon <id>` adds your own definition for an icon you already have.',
        },
      ],
    },
    {
      id: 'wrap-a-library',
      title: 'Or wrap a whole library',
      content: [
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx experimental icon new-set outline --from @acme/glyph-library',
        },
        {
          type: 'prose',
          text: "Every component the library exports becomes an icon (an alias of one component is recorded once), named `<Name>Icon`, and `map` is filled only where a definition's name or one of its words is an icon's id. Run it again after a library release to refresh the icons; `map` entries whose icon still exists are kept, and the receipt names any that lost theirs.",
        },
        {
          type: 'prose',
          text: 'A library whose icons are data (objects or SVG strings) has no components to find: create the set, declare an `adapter` in its data file (see library shapes), and run the command again; every data export then becomes an icon through the adapter. When every icon export shares a leading word, such as `feather` in `featherEye` and `featherSun`, ids and export names leave it out: `featherEye` becomes id `eye`, exported as `EyeIcon`. The prefix is read over icon-like exports only: SCREAMING_CASE constants (`README`, `VERSION`), number and boolean exports, and, next to components or icon objects, plain strings are never icons. Leave out any other export that is not an icon with `--exclude meta,version`. `experimental icon add` reads the prefix the same way, and reuses the icon an export already has, so its commands need no `--id`.',
        },
      ],
    },
    {
      id: 'export-the-icons',
      title: 'How icons are exported',
      content: [
        {
          type: 'prose',
          text: "Every icon is a named export of your package's public entry, so apps, templates, and theme maps all import components from one place:",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            "The data file's `module` is your package name or one of its package.json `exports` subpaths, never a file path. `integration check` fails otherwise.",
            'Each export is named `<Name>Icon`, and a variant `<Name><Variant>Icon`, such as `TrashSolidIcon`. `experimental icon add` names them that way; `integration check` warns on another name.',
            'Each export is a React component: a function, a class, `forwardRef` or `memo`, or what your adapter returns. `integration check` fails on a plain object or string.',
            'It accepts SVG props (`className`, `style`, `aria-*`, `width`, `height`), draws with `currentColor`, and fills its box (`1em` or `100%`), so `<Icon icon={TrashIcon} size="sm" />` sizes and colors it like a built-in icon. The CLI cannot check this statically; the test below can.',
          ],
        },
        {
          type: 'prose',
          text: "`experimental icon add` writes the set's generated module (`generated` in the data file) and its declaration file, which re-exports each component's own types and types each adapted icon as `ComponentType<SVGProps<SVGSVGElement>>`. Add one line to the file your package's entry points at, and to its types; the receipt names it:",
        },
        {
          type: 'code',
          lang: 'js',
          code: "export * from './icon-sets/outline/outline.generated.js';",
        },
        {
          type: 'prose',
          text: 'An optional render test you can copy:',
        },
        {
          type: 'code',
          lang: 'js',
          code: `import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
import * as icons from '@acme/icons';

for (const [name, Icon] of Object.entries(icons)) {
  if (!name.endsWith('Icon')) continue;
  const html = renderToStaticMarkup(createElement(Icon, {className: 'x'}));
  if (!html.includes('class="x"')) throw new Error(\`\${name} drops className\`);
  if (!html.includes('currentColor')) throw new Error(\`\${name} has a fixed color\`);
}`,
        },
      ],
    },
    {
      id: 'library-shapes',
      title: 'Library shapes',
      content: [
        {
          type: 'prose',
          text: '`--from` is any import specifier: a package, a package subpath, or a `./` path inside your package. Use the row that matches the library:',
        },
        {
          type: 'table',
          headers: ['Library ships', 'Command'],
          rows: [
            [
              'Components in one module',
              '`experimental icon add Bin --from @acme/glyph-library --definition delete`',
            ],
            [
              'A subpath per style',
              '`experimental icon add Bin --from @acme/glyph-library/solid --id bin --appearance solid` (a variant of an icon you added; the value must be in `axes`)',
            ],
            [
              'One file per icon, default export',
              '`experimental icon add Rocket --from @acme/glyph-library/rocket --default --definition rocket`',
            ],
            [
              'Icon data objects',
              'Declare an `adapter`, then `experimental icon add Rocket --from @acme/glyph-data --definition rocket`',
            ],
            [
              'SVG strings or URLs',
              'Declare an `adapter` that renders them, then `experimental icon add` as above',
            ],
            [
              'Your own component files',
              '`experimental icon add Rocket --from ./src/icons/rocket.js --definition rocket`',
            ],
          ],
        },
        {
          type: 'prose',
          text: 'An export that is not a component goes through your adapter: a function in your package that turns it into one. Declare it in the data file, `"adapter": {"module": "./src/adapt.js", "export": "adapt"}`, and `experimental icon add` writes `export const RocketIcon = adaptIcon(RocketIconSource);`:',
        },
        {
          type: 'code',
          lang: 'js',
          code: `// src/adapt.js
import {createElement} from 'react';

/** Turn one icon data object ({path}) into an icon component. */
export function adapt(data) {
  return function AdaptedIcon(props) {
    return createElement(
      'svg',
      {'viewBox': '0 0 24 24', 'width': '1em', 'height': '1em', 'fill': 'currentColor', ...props},
      createElement('path', {d: data.path}),
    );
  };
}`,
        },
      ],
    },
    {
      id: 'theme-map',
      title: 'The theme map',
      content: [
        {
          type: 'prose',
          text: 'The generated module also exports `themeIcons`: one entry per built-in definition in `map`, each an element of your own icon, hidden from assistive technology and sized `1em`. The CLI rewrites it on every `experimental icon add` and `experimental icon map`, so you never write it by hand, and `integration check` proves it matches `map`. A theme uses it in one line:',
        },
        {
          type: 'code',
          lang: 'tsx',
          code: `import {defineTheme} from '@astryxdesign/core/theme';
import {themeIcons} from '@acme/icons';

export const brand = defineTheme({name: 'brand', icons: themeIcons});`,
        },
      ],
    },
    {
      id: 'check-the-set',
      title: 'Check the set',
      content: [
        {
          type: 'prose',
          text: "`astryx integration check` reads the set without running your icons. An unmapped built-in definition is an error that names the definition's description and words, so you or your agent can pick the icon; the message suggests an `experimental icon map` command only when one of your icons has the definition's name or one of its words as its whole id, and never guesses. Its icon-set codes:",
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`invalid_icon_set` (error): the descriptor, data file, or a definition file is invalid, for example a repeated `id`, an icon with no words, or a `map` key that is neither an Astryx definition nor one in your `definitions` folder. The set is withdrawn: apps do not see it.',
            '`icon_builtin_definition_missing` (error): a built-in definition is not in `map`.',
            '`icon_definition_unused` (warning): a definition you declared is not in `map`.',
            "`icon_definition_shadowed` (warning): a definition you declared now exists in Astryx; map to Astryx's and remove yours.",
            '`icon_module_not_public` (error), `icon_export_name` (warning), `icon_not_component` (error): the export contract above.',
            '`icon_export_missing` (error): an export, the generated module, or the adapter does not exist; when a re-export cannot be followed, the message names it.',
            "`icon_module_invalid` (error): the set's module, a file it re-exports, or the generated module does not parse; reported once, instead of a missing export per icon.",
            "`icon_generated_types_mismatch` (error): the generated module's declaration file is missing or does not match it.",
            '`icon_theme_map_mismatch` (error) and `icon_theme_map_unchecked` (warning): the theme map disagrees with the built-in entries of `map`, or has an entry the reader cannot read.',
            '`icon_source_version_drift` and `icon_license_notice_missing` (warnings): the data names another library version than the package depends on, or a set with an upstream ships no license notice.',
          ],
        },
        {
          type: 'prose',
          text: 'The other Astryx definitions your set leaves unmapped are not issues: a library need not draw every definition. They are listed under "Unmapped icon definitions (optional)", and in the JSON as the validate result\'s `iconSets`: for each set, `unmappedDefinitions` (each `{name, description, words}`) and `suggestions` (each `{definition, icon}`, for any unmapped definition one of your icons fits). They are never counted and never fail a check.',
        },
        {
          type: 'prose',
          text: 'Errors fail the check. Warnings fail only with `--strict`. A set that maps every built-in definition and every definition it declares passes `--strict`, which integrations run in their build ({@link generic:checks}). The flow, start to finish: `experimental icon new-set` → `integration check` → `experimental icon add` (or `experimental icon map`) for each definition it lists → `integration check` passes.',
        },
      ],
    },
    {
      id: 'publish',
      title: 'Before you publish',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Run `astryx integration verify` yourself before publishing. Do not put it in `prepublishOnly`: under `npm publish --dry-run` its own `npm pack` becomes a dry run too, and it checks nothing.',
            "Declare `@astryxdesign/cli` as an optional peer (`peerDependenciesMeta`). A required peer an app cannot satisfy makes npm remove the app's CLI without a word. Icon sets are experimental, so no version range promises them: any CLI release that has `astryx experimental icon` reads a set, and the format may change in a patch release. A CLI without it reads `experimental` as a manifest key it does not know: `astryx doctor` there warns that your package was published against a newer Astryx CLI, and your icons, icon definitions, and template icon mapping do not appear ({@link generic:versioning}).",
            'Your package needs `react` (the theme map and adapter use it): declare it as a peer, as Core does.',
          ],
        },
      ],
    },
    {
      id: 'share-a-definition',
      title: 'Share a definition with every set',
      content: [
        {
          type: 'prose',
          text: "Your own definitions need no change to Astryx. To share one with every set, open a pull request that copies its file into the CLI's icon definitions folder, with a description and words. Its name must not clash with another definition.",
        },
      ],
    },
    {
      id: 'how-apps-use-it',
      title: 'How apps use it',
      content: [
        {
          type: 'code',
          lang: 'bash',
          code: `npx astryx experimental icon delete              # ranked matches with import lines
npx astryx experimental icon outline/bin         # one icon and every variant
npx astryx experimental icon --list              # installed sets and their definition coverage
npx astryx experimental icon use outline         # make it the project's icon set`,
        },
        {
          type: 'prose',
          text: "A template declares, in its descriptor's `icons`, the definition each imported icon draws (`{TrashIcon: 'delete'}`). Once the project sets `experimental.iconSet` in astryx.config (`experimental icon use` writes it), each declared icon becomes the set's icon for that definition. An icon the set does not map keeps its original import, and the copy reports every icon as mapped or kept. Nothing is guessed from names.",
        },
      ],
    },
    {
      id: 'reference',
      title: 'Where icon sets show up',
      content: [
        {
          type: 'prose',
          text: 'Every place the CLI reads or reports icon sets, all experimental. Outside `astryx experimental icon`, each appears only in a project that sets `experimental.iconSet`; `astryx search` never returns icons:',
        },
        {
          type: 'table',
          headers: ['Where', 'What'],
          rows: [
            [
              '`experimental.iconSet` in astryx.config',
              "The project's icon set, by set name or as `<package>/<set>`, and the opt-in: templates, discover, and doctor read icon sets only when it is set. `astryx experimental icon` ranks its icons first, and without it treats the only installed set as the project's. `astryx experimental icon use` writes it.",
            ],
            [
              '`experimental.iconSets` in the integration manifest',
              "The folder that holds the package's icon sets, relative to package.json. `astryx experimental icon new-set` declares it.",
            ],
            [
              "A template descriptor's `icons`",
              "The icon definition each imported icon draws, by imported name (`{TrashIcon: 'delete'}`). `astryx template` and `astryx build` then report `icons` (status, set, mapped, kept) in the receipt and write the set's icons.",
            ],
            [
              '`astryx discover`',
              "A package's sets (`iconSets`) and, for `@scope/name/<set>`, the set's display name, license, icon count, and definitions; `--type icon-set` keeps only sets.",
            ],
            [
              '`astryx doctor`',
              'The `icon-sets` check: fails when `experimental.iconSet` names a set that is not installed, and warns when two packages ship a set by that name or a set was withdrawn.',
            ],
            [
              'JSON types',
              '`icon.search`, `icon.detail`, `icon.list`, `icon.use`, `icon.map`, `icon.add`, `icon.definitionMatches`, `icon.newSet`, and `icon.newDefinition`, from the matching `astryx experimental icon` command.',
            ],
          ],
        },
      ],
    },
  ],
};
