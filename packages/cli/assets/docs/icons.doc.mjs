// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Icons consumer reference
 * @input Semantic names, supplied artwork, local contracts and owner-declared roles
 * @output Theme-scoped icon authoring and finite role/state consumer boundaries
 * @position Builder-facing source contract; names Core's one participating role, no internal transport API
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
      id: 'component-role-state',
      title: 'Component Role and State Contract',
      category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'A component slot names a purpose, not artwork. Themes map owner-declared slots through componentIcons to a shared IconName or null; namespaced keys and SVGs belong in icons, not componentIcons. An omitted or undefined mapping uses the component fallback; null hides the glyph. Existing source-only slots declared as {slot: true} keep that behavior without joining role sizing or state presentation.',
        },
        {
          type: 'prose',
          text: 'A participating owner adds a finite states union to the canonical public ComponentIconSlotMap and explicitly calls declareComponentIconRole({slot, defaultSize, statePrecedence}). The defaultSize must be an icon-size name admitted by the owner’s type contract; the final active theme validates that size when it is resolved, not when the role is declared. Precedence lists every state exactly once, highest priority first. Broad string states do not participate. getComponentIconState(slot, conditions) selects the first declared state whose condition is true, or undefined when none is active. There is no shared state vocabulary; each role owns its meanings.',
        },
        {
          type: 'code',
          lang: 'ts',
          label:
            'Downstream owner declaration — source contract, not Core enrollment',
          code: `import {declareComponentIconRole, getComponentIconState} from '@astryxdesign/core/Icon';

declare module '@astryxdesign/core/Icon' {
  interface ComponentIconSlotMap {
    'document-action-leading': {slot: true; states: 'disabled' | 'selected'};
  }
}

declareComponentIconRole({
  slot: 'document-action-leading',
  defaultSize: 'sm',
  statePrecedence: ['disabled', 'selected'],
});
const state = getComponentIconState('document-action-leading', {
  disabled: false,
  selected: true,
}); // 'selected'`,
        },
        {
          type: 'prose',
          text: 'For an explicitly participating renderer, iconCapabilities.roleSizeOverrides chooses an admitted size by role; per-key null clears an inherited choice and restores the owner default. The final size selects presentation.bySize, including weight. presentation.byState selects appearance only from the one effective state; it never selects size or weight. Appearance order is explicit Icon intent, effective-state choice, final-size choice, then theme default. Weight order is explicit intent, final-size choice, then default. presentation replaces as a whole; null clears it.',
        },
        {
          type: 'code',
          lang: 'ts',
          label:
            'Theme policy for the declared role and supplied artwork contract',
          code: `import {defineTheme} from '@astryxdesign/core/theme';
import {icons, capabilities} from './icons'; // importable bound artwork registry

export const brandTheme = defineTheme({
  name: 'brand',
  icons,
  componentIcons: {'document-action-leading': 'search'},
  iconCapabilities: {
    contract: capabilities, // declares outline/filled supplied artwork
    roleSizeOverrides: {'document-action-leading': 'md'},
    presentation: {
      default: {appearance: 'outline'},
      byState: {selected: {appearance: 'filled'}},
    },
  },
});`,
        },
        {
          type: 'prose',
          text: 'These declarations do not enroll a renderer on their own. In Core, only the Button family participates: Button, IconButton and ToggleButton render a direct Icon in the `button-leading` role, which reports disabled, pressed or loading. Use a component’s own documentation to learn which role it renders. Public getComponentIconName(slot, fallback, source) and getComponentIcon(slot, fallback, source) keep their three-argument lookup contracts; useComponentIconName(slot, fallback) and useComponentIcon(slot, fallback) keep two arguments and return names or React nodes. There are no request/state arguments, public role renderer, provider, resolver or runtime registry operations. Icon retains only its independent size, appearance and weight intent; role/state transport is private.',
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
  ],
};
