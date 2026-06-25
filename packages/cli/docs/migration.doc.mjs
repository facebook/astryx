// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'migration',
  title: 'Migration Guide',
  category: 'guide',
  description:
    'How to migrate an existing Tailwind, shadcn, or Radix application to the design system incrementally.',

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
            'Install the design system and run init so the project has package scripts, theme CSS, and agent docs.',
            'Wrap the app root with Theme and choose the initial light, dark, or system mode behavior.',
            'Make Tailwind and design system CSS layer order explicit before replacing components.',
            'Move the persistent frame first: AppShell, TopNav, SideNav, page content, and mobile navigation.',
            'Replace shared primitives: Button, IconButton, TextInput, NumberInput, Switch, CheckboxInput, RadioList, Selector, Tabs, Dialog, AlertDialog, Banner, Toast, Badge, Card, Table, and ListItem.',
            'Replace global workflows: command palette, settings popover, theme toggle, search, filters, create flows, and destructive confirmation dialogs.',
            'Remove legacy Tailwind classes from each completed surface, keeping only token-backed layout utilities or local wrappers that still need to be migrated.',
            'Verify both light and dark modes, keyboard navigation, responsive layout, and empty/error/loading states before moving to the next route.',
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
          code: `npx astryx docs migration
npx astryx docs theme
npx astryx docs styling
npx astryx template --list --type block
npx astryx template AppShellTopNavWithSideNav --skeleton
npx astryx template PopoverSettingsPanel --skeleton
npx astryx component AppShell
npx astryx component SideNav
npx astryx component TopNav
npx astryx component CommandPalette
npx astryx component Button
npx astryx component TextInput`,
        },
        {
          type: 'prose',
          text: 'Use --dense when pasting output into an AI coding tool, and use --json when building automated migration reports.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Dense and JSON modes',
          code: `npx astryx docs migration --dense
npx astryx component Button --json`,
        },
      ],
    },
    {
      title: 'Theme and CSS Setup',
      content: [
        {
          type: 'prose',
          text: 'Mount Theme at the app root so every migrated component reads the same token set. Keep the mode in application state if users can switch between light and dark themes.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Root provider with explicit mode',
          code: `import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {useState} from 'react';
import '@astryxdesign/theme-neutral/theme.css';

export function AppRoot({children}: {children: React.ReactNode}) {
  const [mode, setMode] = useState<'system' | 'light' | 'dark'>('system');

  return (
    <Theme theme={neutralTheme} mode={mode}>
      <SettingsContext.Provider value={{mode, setMode}}>
        {children}
      </SettingsContext.Provider>
    </Theme>
  );
}`,
        },
        {
          type: 'prose',
          text: 'When Tailwind remains in the app, declare layer order once in the global CSS file. design system reset and theme CSS should load before Tailwind utilities so migrated components keep design system defaults while legacy utility classes still work.',
        },
        {
          type: 'code',
          lang: 'css',
          label: 'Tailwind v4 coexistence',
          code: `@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
@import "@astryxdesign/theme-neutral/theme.css";
@import "@astryxdesign/core/tailwind-theme.css";
@import "tailwindcss/utilities.css" layer(utilities);`,
        },
      ],
    },
    {
      title: 'Move the App Frame First',
      content: [
        {
          type: 'prose',
          text: 'Start with AppShell so page migration happens inside the final navigation, spacing, surface, and responsive frame. This also exposes theme and color issues early because every route shares the same shell.',
        },
        {
          type: 'table',
          headers: ['Legacy surface', 'Component', 'Notes'],
          rows: [
            ['Header', 'TopNav', 'Use for product identity, global actions, account entry, and command/search trigger.'],
            ['Sidebar', 'SideNav', 'Use sections and nested nav items for route groups. Keep selection state driven by the router.'],
            ['Main page wrapper', 'AppShell + Layout', 'Let the shell own persistent structure; let route components own page content.'],
            ['Mobile drawer nav', 'MobileNav or AppShell mobile behavior', 'Verify focus, close behavior, and route changes on narrow viewports.'],
            ['Settings menu', 'Popover + Layout + Switch', 'Use as the home for theme mode and app preferences.'],
          ],
        },
      ],
    },
    {
      title: 'Map shadcn and Radix Primitives',
      content: [
        {
          type: 'prose',
          text: 'Do not wrap old shadcn components in design system styles. Replace the primitive with the component that owns the behavior, accessibility, state classes, and token usage.',
        },
        {
          type: 'table',
          headers: ['Existing primitive', 'Component', 'Migration note'],
          rows: [
            ['button / shadcn Button', 'Button or IconButton', 'Use Button for labeled commands and IconButton for icon-only toolbar actions.'],
            ['input', 'TextInput', 'Keep validation state in status props rather than ad hoc border classes.'],
            ['textarea', 'TextArea', 'Use when multiline editing is the primary action.'],
            ['switch', 'Switch', 'Use for persisted boolean settings, including theme mode when represented as a binary choice.'],
            ['checkbox', 'CheckboxInput or CheckboxList', 'Use list variants for grouped selection.'],
            ['radio group', 'RadioList', 'Use when one option must be selected from a visible set.'],
            ['select / combobox', 'Selector or Typeahead', 'Use Selector for bounded options and Typeahead for searchable async options.'],
            ['tabs used as page nav', 'TabList', 'Use route state or current page state as the source of truth.'],
            ['command dialog', 'CommandPalette', 'Keep app-specific search sources outside the shell and feed searchable items.'],
            ['dropdown action menu', 'DropdownMenu or MoreMenu', 'Use MoreMenu for compact overflow actions.'],
            ['alert / callout', 'Banner or Toast', 'Use Banner for page or section messages and Toast for transient feedback.'],
            ['dialog', 'Dialog or AlertDialog', 'Use AlertDialog for destructive confirmation and Dialog for task flows.'],
            ['card-like list row', 'ListItem', 'Prefer ListItem for selectable rows instead of styling Button as a row.'],
          ],
        },
      ],
    },
    {
      title: 'Command Palette, Settings, and Theme',
      content: [
        {
          type: 'prose',
          text: 'Move global search to CommandPalette once the shell exists. Treat the palette as a view over app commands: routes, contextual actions, create actions, filters, recent items, and entity results. Keep data normalization in app code so search sources always return arrays of searchable items.',
        },
        {
          type: 'prose',
          text: 'Put light and dark mode controls in the settings popover or account menu. The switch or selector should update the mode passed to Theme, not toggle isolated body classes.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Settings popover theme control',
          code: `function ThemeModeSwitch() {
  const {mode, setMode} = useSettings();
  const isDark = mode === 'dark';

  return (
    <Switch
      label="Dark mode"
      description="Use the dark color theme"
      value={isDark}
      onChange={next => setMode(next ? 'dark' : 'light')}
    />
  );
}`,
        },
      ],
    },
    {
      title: 'Verification Checklist',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Run the app in light and dark mode and check that surfaces, borders, text, icons, hover states, focus rings, and status colors flow together.',
            'Open the command palette from the shell, type into it, select items by keyboard, and confirm focus returns to the trigger.',
            'Check the SideNav at collapsed, expanded, active, hover, nested, and mobile states.',
            'Verify settings popovers and dialogs in jsdom and in a real browser because native dialog and Popover APIs may need test shims.',
            'Search for leftover hardcoded Tailwind colors, arbitrary hex values, and one-off hover colors after each route migration.',
            'Run component tests, build, and at least one browser screenshot pass for each migrated route.',
          ],
        },
      ],
    },
    {
      title: 'AI Migration Prompt',
      content: [
        {
          type: 'prose',
          text: 'When using an AI coding agent, give it an explicit migration loop instead of asking for a full-app rewrite.',
        },
        {
          type: 'code',
          lang: 'text',
          label: 'Paste this into your AI',
          code: `We are migrating this existing Tailwind/shadcn app to XDS incrementally.

First run:
- npx astryx docs migration --dense
- npx astryx docs theme --dense
- npx astryx docs styling --dense
- npx astryx template AppShellTopNavWithSideNav --skeleton

Then migrate one route or shell surface at a time. Keep business logic and routing intact. Replace shadcn/Radix/Tailwind primitives with XDS components, remove hardcoded colors, verify light and dark mode, and take screenshots before moving to the next surface.`,
        },
      ],
    },
  ],
};
