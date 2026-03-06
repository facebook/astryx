/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'Icon',
  description:
    'Renders icons with XDS design system colors and sizes. Supports both direct SVG icon components and semantic icon names that adapt to the active theme.',
  features: [
    "Semantic Icon Names: Use names like 'close' or 'chevronDown' — resolved from the theme's icon registry",
    'Direct Icon Components: Pass any SVG icon component (heroicons, lucide, etc.) directly',
    "Theme-Adaptable: Semantic icons automatically match the active theme's icon set",
    'Built-in Fallbacks: 12 lightweight inline SVGs (~1.4KB) ensure icons render without a theme',
    'Theme Colors: Color variants mapped to XDS icon color tokens',
    'Consistent Sizing: Four size options aligned with common UI patterns',
    'Accessible: Icons are hidden from screen readers by default (aria-hidden)',
  ],
  props: [
    {
      name: 'icon',
      type: 'XDSIconName | ComponentType<SVGProps>',
      description: 'Semantic name or SVG icon component.',
      required: true,
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'tertiary' | 'disabled' | 'accent' | 'positive' | 'negative' | 'warning' | 'inherit'",
      description: 'Color variant mapped to XDS icon color tokens.',
      default: "'primary'",
    },
    {
      name: 'size',
      type: "'xsm' | 'sm' | 'md' | 'lg'",
      description: 'Icon size.',
      default: "'md'",
    },
  ],
  examples: [
    {
      label: 'Semantic icon names (theme-adaptable)',
      code: `import { XDSIcon } from '@xds/core/Icon';

// Semantic name — adapts to theme
<XDSIcon icon="close" />
<XDSIcon icon="chevronDown" size="sm" color="inherit" />
<XDSIcon icon="checkCircle" color="positive" />

// Great for building theme-adaptable UI
<XDSIcon icon="info" size="sm" color="secondary" />`,
    },
    {
      label: 'Direct icon components',
      code: `import { XDSIcon } from '@xds/core/Icon';
import { HomeIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';

// Direct component
<XDSIcon icon={HomeIcon} />
<XDSIcon icon={HomeIcon} color="accent" size="lg" />
<XDSIcon icon={HeartIcon} color="negative" />

// Accessible icon with label
<XDSIcon icon={HomeIcon} aria-hidden={false} aria-label="Home" role="img" />`,
    },
    {
      label: 'Icon sources',
      code: `// Heroicons
import {HomeIcon} from '@heroicons/react/24/outline';

// Lucide
import {Home} from 'lucide-react';

// Any component matching ComponentType<SVGProps<SVGSVGElement>>`,
    },
  ],
  theming: {
    componentKey: 'icon',
    surfaces: [
      {
        name: 'root',
        description: 'Root SVG element styles',
      },
    ],
  },
  accessibility: [
    'Icons are hidden from screen readers by default via aria-hidden="true" since icons are typically decorative.',
    'For meaningful icons, set aria-hidden={false}, role="img", and aria-label to provide accessible context.',
  ],
  notes: [
    'When icon is a semantic name string, resolution order is: (1) theme registry — if an XDSTheme is active and provides an icon for that name, it is used; (2) built-in fallback — otherwise, a lightweight inline SVG is rendered. Components always render visually complete, even without a theme. Themes can override any or all icons; the registry accepts partial overrides.',
    'When icon is a component, additional SVG props (like aria-label, role) are passed through to the underlying SVG element.',
    'flexShrink: 0 prevents icons from shrinking in flex containers.',
    'String mode wraps the resolved icon in a <span> with fontSize-based sizing so 1em-based registry icons scale correctly.',
    'Component mode passes stylex.props directly to the SVG element for zero-overhead styling.',
    'Semantic icon names and their usages — close (CloseButton, TimeInput): ✕ close/dismiss; chevronDown (DropdownMenu, Selector, TabMenu): ▾ expand/dropdown; chevronLeft (Calendar): ‹ previous; chevronRight (Calendar): › next; check (Selector, TabMenu): ✓ selected item; checkCircle (Input status): ✓○ success; xCircle (Input status): ✕○ error; warning (Input status): △! warning; info (FieldLabel): ⓘ information tooltip; calendar (DateInput): 📅 date picker; clock (TimeInput): 🕐 time picker; externalLink (Link): ↗ opens in new window.',
    'Color token mappings — primary: --color-icon-primary (default); secondary: --color-icon-secondary (de-emphasized); tertiary: --color-icon-tertiary (subtle/background); disabled: --color-icon-disabled (disabled state); accent: --color-accent (interactive/actionable); positive: --color-positive (success/confirmation); negative: --color-negative (error/destructive); warning: --color-warning (caution/attention); inherit: currentColor (inherits from parent text color).',
    'Size dimensions — xsm: 12x12px (dense UI, badges, indicators); sm: 16x16px (inline with text, compact UI); md: 20x20px (default, buttons, inputs); lg: 24x24px (emphasis, standalone icons).',
  ],
};
