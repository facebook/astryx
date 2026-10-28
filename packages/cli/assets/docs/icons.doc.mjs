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
            ['upload', 'Upload files or content'],
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
<Icon icon={HeartIcon} color="error" />`,
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
        {
          type: 'prose',
          text: "An entry can also be a function of the request, so the theme maps Icon's size to its icon library's own props or artwork. `Icon` calls it with `{size, variant}`, where `size` is the size it renders at (`xsm`, `sm`, `md`, or `lg`: an explicit `size`, else the owning component's default, else `md`). Reads that return one node — `getIcon()`, `useIcon()`, `getIconRegistry()`, and the theme's `icons` field — call it with `{size: 'md'}`. The same entry shape works in `registerIcons()`.",
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'A size-aware icon entry',
          code: `import {defineTheme} from '@astryxdesign/core/theme';
import {Info} from 'lucide-react';

export const brandTheme = defineTheme({
  name: 'brand',
  icons: {
    // A heavier stroke keeps the small size legible.
    info: ({size}) => <Info strokeWidth={size === 'sm' || size === 'xsm' ? 2.5 : 2} />,
  },
});`,
        },
        {
          type: 'prose',
          text: 'Keep the function pure and synchronous: it computes its result from the request only, with no hooks, DOM or SVG measurement, browser globals, network access, mutable module state, or side effects. Its result is final. Returning `null` draws no glyph instead of falling back to a registered or built-in icon, while a `null` or `undefined` node entry still falls back. A child theme that sets an entry for a key replaces the inherited entry for that key.',
        },
      ],
    },
    {
      title: 'Component and Library Icons',
      category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'A glyph that belongs to one component or library gets a namespaced key (`numberInput:stepperDown`, `richtext:bold`) instead of a new semantic name. It resolves through the same registry and a theme overrides it the same way, but the shared IconName list stays reserved for glyphs the whole system uses, so adding one does not make every downstream icon registry grow a key.',
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
          text: 'Outside core, pass a fallback to `getExtendedIcon(key, fallback)` so the glyph renders with no theme.',
        },
      ],
    },
  ],
};
