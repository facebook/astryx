// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs migration/migration-setup`: theme and CSS setup,
 * cascade layer safety, layer audit, and the foundation smoke test.
 */

import {foundationLayers, foundationCSS} from './foundation-css.mjs';

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'migration-setup',
  title: 'Setup',
  placement: {parent: 'namespace:migration', slot: 'guides', order: 10},
  category: 'guide',
  description:
    'Install the theme, wire CSS layers, audit resets, and run the foundation smoke test before migrating any surface.',
  keywords: [
    'setup',
    'theme',
    'reset',
    'smoke test',
    'layer audit',
    'Tailwind coexistence',
  ],

  sections: [
    {
      title: 'Overview',
      content: [
        {
          type: 'prose',
          text: 'Treat migration as a product-shell and workflow migration, not a global class replacement. Start by putting the app inside Theme and AppShell, then move one route or surface at a time to design system primitives while keeping existing data, routing, and business logic intact.',
        },
        {
          type: 'prose',
          text: 'Tailwind can coexist during migration. Use it for legacy wrappers and local layout while replacing interactive controls, navigation, command surfaces, forms, alerts, dialogs, and settings UI with components.',
        },
      ],
    },
    {
      title: 'Recommended Order',
      content: [
        {
          type: 'list',
          style: 'ordered',
          items: [
            'Install the packages and run `astryx init` for agent docs, then add the reset, `astryx.css`, and theme CSS imports (see Theme and CSS Setup below).',
            'Wrap the app root with Theme and choose the initial light, dark, or system mode behavior.',
            'Make Tailwind and design system CSS layer order explicit before replacing components.',
            'Render the foundation smoke test page and confirm primitives keep their padding before migrating any surface.',
            'Move the persistent frame first: AppShell, TopNav, SideNav, page content, and mobile navigation. See {@link generic:component-migration}.',
            'Replace shared primitives: Button, IconButton, TextInput, NumberInput, Switch, CheckboxInput, RadioList, Selector, TabList, Dialog, AlertDialog, Banner, Toast, Badge, Card, Table, and ListItem. See {@link generic:component-migration}.',
            'Replace global workflows: command palette, settings popover, theme toggle, search, filters, create flows, and destructive confirmation dialogs.',
            'Remove legacy Tailwind classes from each completed surface, keeping only token-backed layout utilities or local wrappers that still need to be migrated.',
            'Verify both light and dark modes, keyboard navigation, responsive layout, and empty/error/loading states before moving to the next route. See {@link generic:migration-verification}.',
          ],
        },
      ],
    },
    {
      title: 'CLI Workflow',
      content: [
        {
          type: 'prose',
          text: 'Use the CLI as the migration checklist. Read the docs for the pattern you are about to touch, inspect a matching template skeleton, then read the exact component docs before editing.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Migration-oriented CLI pass',
          code: `astryx docs migration
astryx docs theme
astryx docs styling
astryx template --list --type block
astryx template AppShellTopNavWithSideNav --skeleton
astryx template PopoverSettingsPanel --skeleton
astryx component AppShell
astryx component SideNav
astryx component TopNav
astryx component CommandPalette
astryx component Button
astryx component TextInput`,
        },
        {
          type: 'prose',
          text: 'For a shorter read to paste into an AI coding tool, add `--detail brief` (one line per section) or `--detail compact`. Use `--json` when building automated migration reports.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Short and JSON modes',
          code: `astryx docs migration --full --detail brief
astryx component Button --json`,
        },
      ],
    },
    {
      title: 'Theme and CSS Setup',
      content: [
        {
          type: 'prose',
          text: 'For published components without Tailwind, use these two foundation files. Declare the layer order separately so CSS-import hoisting cannot move a reset above the library. This recipe uses the Neutral theme; replace its CSS, fonts and built theme module together when choosing another theme.',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'layers.css (import first)',
          code: foundationLayers,
        },
        {
          type: 'code',
          lang: 'css',
          label: 'globals.css (without Tailwind)',
          code: foundationCSS,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'AppRoot.tsx',
          code: `import type {ReactNode} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';

export function AppRoot({children}: {children: ReactNode}) {
  return <Theme theme={neutralTheme} mode="system">{children}</Theme>;
}`,
        },
        {
          type: 'prose',
          text: 'When Tailwind remains in the app, declare layer order once in the global CSS file. Load the Astryx reset and theme CSS before Tailwind utilities so migrated components keep design system defaults while legacy utility classes still work. On Tailwind v4, use the imports and layer order in {@link generic:tailwind}.',
        },
        {
          type: 'prose',
          text: 'Import layers.css first in the app entry or root layout, then globals.css, then modules that mount your theme. The first declaration fixes each layer’s rank before any stylesheets can name it in a different order. Tailwind v4 uses the same layer order and its own import recipe in {@link generic:tailwind}.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Root layout or app entry',
          code: `import './layers.css'; // first: fixes layer rank before stylesheet imports
import './globals.css';

import {AppRoot} from './AppRoot';`,
        },
        {
          type: 'prose',
          text: 'On Tailwind v3 there is no preflight.css to import, so wrap the @tailwind base directive in a named layer instead. Keep utilities unlayered so existing app utility classes still win everywhere. Put the `@layer` order line in its own `layers.css` and import it first, before `globals.css`: Next.js (webpack or Turbopack) and other bundlers that hoist CSS imports move the imported files above an inline `@layer` line, so the order would arrive too late.',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'layers.css (imported first)',
          code: `@layer reset, tw-preflight, astryx-base, astryx-theme;`,
        },
        {
          type: 'code',
          lang: 'css',
          label: 'globals.css (Tailwind v3 coexistence)',
          code: `@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
@import "@astryxdesign/theme-neutral/theme.css";

@layer tw-preflight {
  @tailwind base; /* layered: astryx-theme now wins over preflight */
}
@tailwind components;
@tailwind utilities; /* unlayered: legacy utility classes keep winning */`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Root layout or app entry (Tailwind v3)',
          code: `import './layers.css'; // first: declares the cascade-layer order
import './globals.css';

import {AppRoot} from './AppRoot';`,
        },
      ],
    },
    {
      id: 'cascade-layer-safety',
      title: 'Why resets break cascade layers',
      content: [
        {
          type: 'prose',
          text: 'In a stylesheet with no layers at all, a zero-specificity reset like `* { padding: 0 }` loses to any class selector, so most developers treat resets as harmless. Layers change the rules twice: unlayered styles beat every named layer, and a later layer beats an earlier one, both regardless of specificity. The same reset therefore wins against every component style either by staying unlayered or by landing in a layer declared after astryx-base. Same CSS, opposite outcome, and no error or warning when it happens.',
        },
        {
          type: 'prose',
          text: 'This is the most common way an adoption breaks, through one of two @import mechanisms. A top-level @import without the layer() keyword keeps the legacy reset unlayered, where it overrides every design system layer. And an @import nested inside a file that was itself imported into a layer inherits that surrounding layer, so a reset can silently land in a consumer layer above astryx-base. Either way the fix is the same: import the legacy reset into the lowest layer explicitly.',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'Legacy reset, explicitly layered',
          code: `/* was: @import "./legacy-reset.css";  (unlayered: beats every layer) */
@import "./legacy-reset.css" layer(reset);`,
        },
        {
          type: 'prose',
          text: 'Before building screens, check every stylesheet against the cascade layer audit below.',
        },
      ],
    },
    {
      id: 'layer-audit',
      title: 'Cascade layer audit',
      content: [
        {
          type: 'prose',
          text: 'Audit the layers around the design system with this checklist before building screens.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Declare the canonical @layer order once, before any @import. With Next.js (webpack or Turbopack) and other bundlers that hoist CSS imports, the order declaration must live in its own CSS file imported first, such as layers.css, because the bundler hoists @import content above the inline CSS that follows it.',
            'Audit every pre-existing global or reset stylesheet and assign each one to a layer deliberately. Top-level imports without layer() stay unlayered and beat every layer; imports nested inside a layered file inherit that layer.',
            'Remove or demote the app legacy reset. The design system ships its own :where() reset in the lowest layer, so any app reset belongs in that same reset layer and never in a layer above astryx-base.',
            'Layer Tailwind preflight. On Tailwind v4, import preflight.css with layer(base). On Tailwind v3, wrap the @tailwind base directive in a named layer (see the snippet in Theme and CSS Setup). Unlayered preflight overrides theme CSS silently.',
            'Set moduleResolution to bundler or node16 and newer so subpath imports like @astryxdesign/core/reset.css resolve.',
            'Theme with defineTheme and the accent family API instead of changing colour tokens individually. Changing only --color-accent can leave its foreground unchanged; generate the matching foreground from the accent scale rather than assuming contrast.',
            'Run the foundation smoke test below and view a few components in both light and dark mode before migrating any route.',
          ],
        },
        {
          type: 'prose',
          text: 'One more mental model shift: className still reaches the DOM, but whether it overrides a component is a layer question, not a source-order question. Use the utilities layer for Tailwind v4; the Tailwind v3 recipe above deliberately keeps its legacy utilities unlayered.',
        },
      ],
    },
    {
      id: 'foundation-smoke-test',
      title: 'Foundation Smoke Test',
      content: [
        {
          type: 'prose',
          text: 'Run this in your own app before feature work, after importing its real global CSS and mounting its normal theme. A passing Astryx playground does not validate the stylesheets around your application.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Scaffold the check inside your app',
          code: `astryx template FoundationSmoke src/FoundationSmoke.tsx`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Temporary page inside your existing app layout',
          code: `import FoundationSmoke from './FoundationSmoke';

export default function FoundationCheckPage() {
  return <FoundationSmoke />;
}`,
        },
        {
          type: 'prose',
          text: 'The scaffold renders Button, TextInput, Card and Table with default component styles and stable check markers. Keep the existing app CSS and theme; do not add padding overrides or a separate stylesheet that hides the integration problem. The button is a styling specimen, not an in-page test runner.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Automated check against your running app',
          code: `npm install --save-dev playwright
npx playwright install chromium
node node_modules/@astryxdesign/cli/assets/checks/foundation-smoke.mjs \\
  --url http://localhost:5173/foundation-check/ \\
  --output-dir test-results/foundation`,
        },
        {
          type: 'prose',
          text: 'Replace the URL with your actual check page. Run from the app root so the check uses your installed Playwright. The script is shipped with the CLI; no Astryx repository checkout is required. It exits non-zero for a missing screen, browser errors, or zero/unresolved padding on any logical side of the labelled Button. Use the same command in your app’s test workflow.',
        },
        {
          type: 'prose',
          text: 'To test the check itself, add --self-test. Each control opens a fresh page: the universal padding reset in reset must preserve the baseline; the same reset in a later product layer and unlayered must collapse padding and be rejected. These injected controls are temporary and do not rewrite your app CSS.',
        },
        {
          type: 'prose',
          text: 'This is a collapsed-padding smoke check, not proof that every token, utility, colour or interaction is correct. If it fails, inspect the stylesheet that zeroes padding and remove it or import it into reset explicitly. View the page in light and dark mode as well.',
        },
      ],
    },
  ],
};
