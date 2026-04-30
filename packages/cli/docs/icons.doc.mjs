/**
 * @file Icons reference doc — semantic icon names available in XDS
 */

/** @type {import('../../core/src/docs-types').ReferenceDoc} */
export const docs = {
  name: 'icons',
  title: 'XDS Icons',
  description:
    "Semantic icon names available in XDS. These adapt to the active theme's icon registry.",

  sections: [
    {
      title: 'Available Names',
      content: [
        {
          type: 'prose',
          text: 'Components that accept an icon prop use XDSIconType \u2014 either a semantic name string or a direct SVG component. The semantic names below are resolved through the global icon registry.',
        },
        {
          type: 'table',
          headers: ['Name', 'Usage'],
          rows: [
            ['close', 'Dismiss, close dialogs/panels'],
            ['chevronDown', 'Dropdown triggers, expand/collapse'],
            ['chevronLeft', 'Navigate back, previous'],
            ['chevronRight', 'Navigate forward, next'],
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
      content: [
        {
          type: 'prose',
          text: 'For icons not in the semantic list, pass an SVG component directly. Any ComponentType<SVGProps<SVGSVGElement>> works \u2014 XDSIcon applies size and color styling automatically.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Using custom SVG components',
          code: `import { PhotoIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from 'lucide-react';

<XDSIcon icon={PhotoIcon} size="lg" />
<XDSIcon icon={HeartIcon} color="negative" />`,
        },
      ],
    },
    {
      title: 'Theme Overrides',
      content: [
        {
          type: 'prose',
          text: 'Themes can replace the default SVGs for any semantic name using registerIcons(). This lets you swap the entire icon set (e.g. heroicons \u2192 lucide) without touching component code.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Registering theme icons',
          code: `import { registerIcons } from '@xds/core/Icon';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

registerIcons({
  close: <XMarkIcon />,
  chevronDown: <ChevronDownIcon />,
  // ... override as many as needed
});`,
        },
      ],
    },
    {
      title: 'Adding New Icons',
      content: [
        {
          type: 'prose',
          text: 'To add a new semantic icon name to XDS:',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            'Add the name to XDSIconName type in packages/core/src/Icon/globalIconRegistry.tsx',
            'Add the default SVG to packages/core/src/Icon/defaultIcons.tsx',
            'Add a row to the Available Names table in packages/cli/docs/icons.doc.mjs',
          ],
        },
      ],
    },
  ],
};
