// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Icons consumer reference
 * @input Semantic names, supplied artwork and typed local icon-library adapters
 * @output Theme-scoped fixed/adaptive artwork and safe direct-adapter guidance
 * @position Builder-facing icons reference; no role or component enrollment API
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
          text: 'Components that accept an icon prop use IconType: either a semantic name string or a direct SVG component. Semantic names use the active theme artwork, then the registered defaults.',
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
    {
      title: 'Adaptive Artwork and Dimensions',
      category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'Declare supplied sizes, appearances, and exact or numeric-range weights with `defineIconCapabilities`. Bind a default-first tree with `defineAdaptiveIcon`; sparse branches use the nearest supplied default, never invented artwork. `iconCapabilities` adds theme dimensions and atomic `presentation.default`/`presentation.bySize`; explicit Icon requests win. For production theme builds, import the registry itself from a separate module, not only its SVG components. Compile that module alongside your package and use the existing `--icons-specifier` option when its compiled path differs. The JavaScript and types preserve these values, not the stylesheet.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'icons.tsx — importable bound registry',
          code: `import {defineIconCapabilities, defineAdaptiveIcon} from '@astryxdesign/core/Icon';
import {SearchOutline, SearchFilled} from './artwork';

export const capabilities = defineIconCapabilities({appearances: ['outline', 'filled']});
export const icons = {search: defineAdaptiveIcon(capabilities, {
  default: <SearchOutline />,
  byAppearance: {filled: <SearchFilled />},
})};`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'brandTheme.ts — import the registry and contract',
          code: `import {defineTheme} from '@astryxdesign/core/theme';
import {icons, capabilities} from './icons';

export const brandTheme = defineTheme({
  name: 'brand',
  icons,
  iconCapabilities: {
    contract: capabilities,
    sizeOverrides: {md: '24px'},
    presentation: {default: {appearance: 'outline'}, bySize: {sm: {appearance: 'filled'}}},
  },
});`,
        },
        {
          type: 'prose',
          text: 'Explicit sizes and standalone md use active theme dimension overrides. Implicit built-in sizes in existing components keep their released rem box; omitted overrides and built-in null clears retain rem scaling. Custom icon-size names have canonical contract dimensions and do not extend control size props. Application type augmentation does not install runtime capabilities. `getIcon`, `getExtendedIcon`, and `useIcon` still return React nodes without extra request arguments; ordinary direct SVGs do not receive appearance or weight.',
        },
      ],
    },
    {
      title: 'Direct Library Adapters',
      category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'Use createIconAdapter once when a direct library export should follow theme presentation. Its local contract narrows each request, and propNames declares the primitive library props the mapper may return (appearance and weight are the defaults). Ordinary direct SVG components remain fixed. With no supported intent the wrapped component uses its own default without calling the mapper. Keep the contract, mapper, component and adapted export in an importable library module; compile it alongside the theme package. Functions stay imports, not generated function text.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'product-icons.tsx — adapt a supplied library component',
          code: `import {createIconAdapter, defineIconCapabilities} from '@astryxdesign/core/Icon';
import {ProductIconImpl} from './artwork.js';

export const capabilities = defineIconCapabilities({
  appearances: ['outline', 'filled'],
  weights: {range: {min: 100, max: 900}},
});
const adaptProductIcon = createIconAdapter({
  capabilities,
  propNames: ['glyphStyle', 'thickness'],
  resolveProps(request) {
    return {glyphStyle: request.appearance, thickness: request.weight};
  },
});
export const ProductIcon = adaptProductIcon(ProductIconImpl);`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Use the same library contract with a theme',
          code: `import {Icon} from '@astryxdesign/core/Icon';
import {defineTheme, Theme} from '@astryxdesign/core/theme';
import {capabilities, ProductIcon} from './product-icons.js';

const brandTheme = defineTheme({
  name: 'brand',
  iconCapabilities: {
    contract: capabilities,
    presentation: {default: {appearance: 'filled', weight: 525.5}},
  },
});

<Theme theme={brandTheme}><Icon icon={ProductIcon} /></Theme>;`,
        },
        {
          type: 'prose',
          text: 'ProductIconImpl must support optional primitive glyphStyle and thickness props as well as SVGProps. The .js imports refer to the compiled modules. A mapper cannot change source selection, color, accessibility, events, refs, styles or children. Unsupported explicit appearance or weight warns once in development; unsupported theme choices silently use the library default. Invalid mapping results safely render that default. Missing size support is normal fallback, not a warning. Consumer SVG, ref, event and styling props retain their normal precedence.',
        },
      ],
    },
  ],
};
