#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file apply-recipe.mjs
 * @input --app <dir> --recipe <id>
 * @output The app, with that recipe's edits applied in place
 * @position internal/vibe-tests/setup-test — the deterministic arms
 *
 * Each recipe is a TRANSCRIPTION of a setup instruction we ship, applied to an
 * app that already has Tailwind. They exist for two reasons:
 *
 *   1. the mechanism-verification run — measuring what our own documented
 *      recipes do to an existing app, with no agent in the loop, so the harness
 *      can be trusted before it is pointed at agents;
 *   2. the ceiling arm — `directed` hands an agent the recipe verbatim, so a
 *      tier the ceiling cannot clear is a product gap rather than a guidance gap.
 *
 * Every edit asserts. A recipe that no longer applies to the fixture throws
 * instead of quietly producing an unpatched arm that then scores as "clean".
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

const CSS = path.join('app', 'globals.css');
const MAIN = 'main.tsx';
const PAGE = path.join('app', 'page.tsx');

const read = (app, rel) => fs.readFileSync(path.join(app, rel), 'utf8');
const write = (app, rel, s) => fs.writeFileSync(path.join(app, rel), s);

function edit(app, rel, fn) {
  const before = read(app, rel);
  const after = fn(before);
  if (after === before) throw new Error(`recipe edit did not apply: ${rel}`);
  write(app, rel, after);
}

/** The three-line CSS the docs give a non-Tailwind app. */
const ASTRYX_IMPORTS = [
  "@import '@astryxdesign/core/reset.css';",
  "@import '@astryxdesign/core/astryx.css';",
  "@import '@astryxdesign/theme-neutral/theme.css';",
];

/**
 * packages/core/README.md § "Next.js + Tailwind", and `astryx docs
 * styling-libraries` § Tailwind. Both print the same block, and both write it as
 * the whole file: the app's own `@import 'tailwindcss'` has to go, because
 * Tailwind is now imported in three pieces so Astryx can sit between them.
 */
function documentedTailwindBlock({bridge}) {
  return [
    '@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;',
    '',
    "@import 'tailwindcss/theme.css' layer(theme);",
    "@import 'tailwindcss/preflight.css' layer(base);",
    ...ASTRYX_IMPORTS,
    ...(bridge ? ["@import '@astryxdesign/core/tailwind-theme.css';"] : []),
    "@import 'tailwindcss/utilities.css' layer(utilities);",
  ].join('\n');
}

function replaceTailwindEntry(app, block) {
  edit(app, CSS, css => {
    if (!/@import ['"]tailwindcss['"];/.test(css)) {
      throw new Error("fixture no longer starts from `@import 'tailwindcss';`");
    }
    return css.replace(/@import ['"]tailwindcss['"];/, block);
  });
}

/** Wrap the app in the theme provider, as every setup path instructs. */
function addThemeProvider(app, {mode}) {
  const modeProp = mode ? ` mode="${mode}"` : '';
  edit(app, MAIN, src =>
    src
      .replace(
        "import RunsPage from './app/page';",
        [
          "import {Theme} from '@astryxdesign/core/theme';",
          "import {neutralTheme} from '@astryxdesign/theme-neutral/built';",
          "import RunsPage from './app/page';",
        ].join('\n'),
      )
      .replace(
        '<RunsPage />',
        `<Theme theme={neutralTheme}${modeProp}>\n      <RunsPage />\n    </Theme>`,
      ),
  );
}

/** One real component, so the arm is a system that is actually in use. */
function useOneComponent(app) {
  edit(app, PAGE, src =>
    src
      .replace(
        "import {Button} from '@/components/ui/button';",
        [
          "import {Button} from '@/components/ui/button';",
          "import {Button as AstryxButton} from '@astryxdesign/core/Button';",
        ].join('\n'),
      )
      .replace(
        /(\s+)<Button size="sm" variant="outline" className="h-8 text-xs">\n\s+Refresh\n\s+<\/Button>/,
        (m, indent) =>
          `${m}${indent}<AstryxButton label="Deploy" variant="primary" />`,
      ),
  );
}

export const RECIPES = {
  /** What our docs say today, applied literally. */
  'docs-verbatim': app => {
    replaceTailwindEntry(app, documentedTailwindBlock({bridge: true}));
    addThemeProvider(app, {});
    useOneComponent(app);
  },

  /**
   * The same, minus the Tailwind bridge — what an app gets if it notices that
   * `tailwind-theme.css` re-points names it is already using. No document says
   * to do this; it is here to separate the bridge's damage from the rest.
   */
  'docs-no-bridge': app => {
    replaceTailwindEntry(app, documentedTailwindBlock({bridge: false}));
    addThemeProvider(app, {});
    useOneComponent(app);
  },

  /**
   * Candidate recipe for an app that already has Tailwind: declare the layer
   * order, keep the app's own Tailwind entry, add the three Astryx sheets, and
   * tell the provider which color scheme the app is. Four lines and a prop,
   * against the documented seven-line replacement.
   */
  'layered-in-place': app => {
    edit(app, CSS, css => {
      if (!/@import ['"]tailwindcss['"];/.test(css)) {
        throw new Error(
          "fixture no longer starts from `@import 'tailwindcss';`",
        );
      }
      return css.replace(
        /@import ['"]tailwindcss['"];/,
        [
          '@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;',
          '',
          "@import 'tailwindcss';",
          ...ASTRYX_IMPORTS,
        ].join('\n'),
      );
    });
    addThemeProvider(app, {mode: 'dark'});
    useOneComponent(app);
  },
};

// ── cli ──────────────────────────────────────────────────────────────

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const get = name => {
    const i = args.indexOf(`--${name}`);
    return i === -1 ? undefined : args[i + 1];
  };
  const app = path.resolve(get('app') ?? '.');
  const id = get('recipe');
  const recipe = RECIPES[id];
  if (!recipe) {
    console.error(
      `Unknown recipe: ${id}. Known: ${Object.keys(RECIPES).join(', ')}`,
    );
    process.exit(2);
  }
  recipe(app);
  console.log(`applied ${id} to ${app}`);
}
