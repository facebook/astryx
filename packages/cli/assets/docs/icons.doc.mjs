// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Icons reference doc: semantic icon names available in Astryx
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  name: 'icons',
  title: 'Icons',
  category: 'foundations',
  description:
    "Semantic icon names available in the design system. These adapt to the active theme's icon registry.",

  sections: [
    {
      title: 'Available Names',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'Components that accept an icon prop use IconType: either a semantic name string or a direct SVG component. The semantic names below are resolved through the global icon registry.',
        },
        {
          type: 'table',
          headers: ['Name', 'Usage'],
          rows: [
            ['close', 'Dismiss, close dialogs/panels'],
            ['chevronDown', 'Dropdown triggers, expand/collapse'],
            ['chevronLeft', 'Navigate back, previous'],
            ['chevronRight', 'Navigate forward, next'],
            ['chevronsLeft', 'Jump to first, skip to start'],
            ['chevronsRight', 'Jump to last, skip to end'],
            ['check', 'Checkbox checked, confirm'],
            ['success', 'Success status indicator'],
            ['error', 'Error status indicator'],
            ['warning', 'Warning status indicator'],
            ['info', 'Info status indicator, tooltips'],
            ['calendar', 'Date pickers, scheduling'],
            ['clock', 'Time pickers, timestamps'],
            ['externalLink', 'Links opening in new tab'],
            ['menu', 'Hamburger menu, navigation toggle'],
            ['moreHorizontal', 'Overflow menu, additional actions'],
            ['search', 'Search inputs, find'],
            ['arrowUp', 'Sort ascending, move up'],
            ['arrowDown', 'Sort descending, move down'],
            ['arrowsUpDown', 'Sortable column indicator'],
            ['funnel', 'Filter controls'],
            ['eyeSlash', 'Hidden/visibility toggle'],
            ['viewColumns', 'Column visibility settings'],
            ['copy', 'Copy to clipboard'],
            ['checkDouble', 'Copied confirmation'],
            ['wrench', 'Settings, configuration'],
            ['stop', 'Stop/cancel action'],
            ['microphone', 'Voice input, audio recording'],
          ],
        },
      ],
    },
    {
      title: 'Custom Icons',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'For icons not in the semantic list, pass an SVG component directly. Any ComponentType<SVGProps<SVGSVGElement>> works; Icon applies size and color styling automatically.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Using custom SVG components',
          code: `import { PhotoIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from 'lucide-react';

<Icon icon={PhotoIcon} size="lg" />
<Icon icon={HeartIcon} color="negative" />`,
        },
      ],
    },
    {
      title: 'Theme Overrides',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'Themes can replace the default SVGs for any semantic name with the `icons` field in `defineTheme()`. This lets you swap the icon set (e.g. heroicons → lucide) without touching component code, and keeps lookup scoped to the active theme instead of mutating global defaults.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Theme-scoped icons',
          code: `import {defineTheme} from '@astryxdesign/core/theme';
import {XMarkIcon, ChevronDownIcon} from '@heroicons/react/24/outline';

export const brandTheme = defineTheme({
  name: 'brand',
  icons: {
    close: <XMarkIcon />,
    chevronDown: <ChevronDownIcon />,
  },
});`,
        },
      ],
    },
    {
      title: 'Component and Library Icons',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'A glyph that belongs to one component or library gets a namespaced key (`numberInput:stepperDown`, `richtext:bold`) instead of a new semantic name. It resolves through the same registry and a theme overrides it the same way, but the shared IconName list stays reserved for glyphs the whole system uses — so adding one does not make every downstream icon registry grow a key.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Owning and theming a namespaced icon',
          code: `// The component renders it like any other name, keeping size and color.
<Icon icon="numberInput:stepperDown" size="xsm" />

// A theme maps it independently of the shared chevron.
export const brandTheme = defineTheme({
  name: 'brand',
  icons: {
    chevronDown: <ChevronDownIcon />,
    'numberInput:stepperDown': <CaretDownFilledIcon />,
  },
});`,
        },
        {
          type: 'prose',
          text: 'Ship the fallback in `defaultIcons` under the same key so the glyph still renders with no theme, or pass one to `getExtendedIcon(key, fallback)` when the icon lives outside core.',
        },
      ],
    },
    {
      title: 'Adding New Icons',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'To add a new semantic icon name to the design system — only for a glyph the whole system shares; a component-owned one takes a namespaced key instead:',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            'Add the name to IconName type in `packages/core/src/Icon/globalIconRegistry.tsx`',
            'Add the default SVG to `packages/core/src/Icon/defaultIcons.tsx`',
            'Add a row to the Available Names table in `packages/cli/assets/docs/icons.doc.mjs`',
          ],
        },
      ],
    },
  ],
};
