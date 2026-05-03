'use client';

import * as React from 'react';
import {XDSButton} from '@xds/core/Button';
import {XDSIconButton} from '@xds/core/IconButton';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSNumberInput} from '@xds/core/NumberInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSCard} from '@xds/core/Card';
import {XDSHStack, XDSVStack, XDSStack} from '@xds/core/Stack';
import {
  XDSLayout,
  XDSLayoutHeader,
  XDSLayoutContent,
  XDSLayoutFooter,
} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBanner} from '@xds/core/Banner';
import {XDSChatToolCalls} from '@xds/core/Chat';
import type {XDSChatToolCallItem} from '@xds/core/Chat';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSDialog, XDSDialogHeader} from '@xds/core/Dialog';
import {XDSToken} from '@xds/core/Token';
import {XDSSlider} from '@xds/core/Slider';
import {XDSSelector} from '@xds/core/Selector';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
import {XDSTable, proportional, pixel} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {XDSDivider} from '@xds/core/Divider';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSPopover} from '@xds/core/Popover';
import {XDSHoverCard} from '@xds/core/HoverCard';
import {XDSTooltip} from '@xds/core/Tooltip';
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {
  XDSSegmentedControl,
  XDSSegmentedControlItem,
} from '@xds/core/SegmentedControl';
import {XDSSkeleton} from '@xds/core/Skeleton';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSIcon} from '@xds/core/Icon';
import {XDSLink} from '@xds/core/Link';
import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';
import {XDSCollapsible, XDSCollapsibleGroup} from '@xds/core/Collapsible';
import {XDSCalendar} from '@xds/core/Calendar';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavItem,
  XDSSideNavSection,
  XDSSideNavCollapseButton,
  XDSSideNavHeading,
} from '@xds/core/SideNav';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSPowerSearch, usePowerSearchConfig} from '@xds/core/PowerSearch';
import type {PowerSearchFilter} from '@xds/core/PowerSearch';
import {
  XDSTheme,
  defineTheme,
  expandTypeScale,
  expandRadiusScale,
  expandColorScale,
  generateThemeCSSFlat,
} from '@xds/core/theme';
import type {XDSDefinedTheme} from '@xds/core/theme';
import {templates} from '../../../../generated/templateRegistry';
import {
  colorDefaults,
  spacingDefaults,
  radiusDefaults,
  typographyDefaults,
  textSizeDefaults,
  fontWeightDefaults,
  typeScaleDefaults,
  sizeDefaults,
  shadowDefaults,
  durationDefaults,
  easeDefaults,
  transitionDefaults,
} from '@xds/core/theme';
import {defaultIconRegistry} from '@xds/theme-default';
import {
  HomeIcon,
  FolderIcon,
  CubeIcon,
  XMarkIcon,
  ChartBarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PhotoIcon,
  SwatchIcon,
  Square3Stack3DIcon,
  StopIcon,
  LanguageIcon,
  ArrowsPointingOutIcon,
  SunIcon,
  ClockIcon,
  BoltIcon,
  SparklesIcon,
  CodeBracketIcon,
  ViewfinderCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  FolderIcon as FolderIconSolid,
} from '@heroicons/react/24/solid';
import {MoonIcon, ContrastIcon} from './docsite-icons';

// =============================================================================
// Font Options (shared between Body and Heading selectors)
// =============================================================================

const FONT_OPTIONS = [
  {
    value:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    label: 'System (Default)',
  },
  {value: '"Inter", -apple-system, sans-serif', label: 'Inter'},
  {value: '"Roboto", -apple-system, sans-serif', label: 'Roboto'},
  {value: '"DM Sans", -apple-system, sans-serif', label: 'DM Sans'},
  {value: '"Figtree", -apple-system, sans-serif', label: 'Figtree'},
  {value: '"Poppins", -apple-system, sans-serif', label: 'Poppins'},
  {
    value: '"IBM Plex Sans", -apple-system, sans-serif',
    label: 'IBM Plex Sans',
  },
  {
    value: '"Source Sans 3", -apple-system, sans-serif',
    label: 'Source Sans',
  },
  {value: '"Noto Sans", -apple-system, sans-serif', label: 'Noto Sans'},
  {value: 'Georgia, "Times New Roman", serif', label: 'Georgia (Serif)'},
];

// =============================================================================
// Collapsible Section
// =============================================================================

function CollapsibleSection({
  title,
  children,
  onTarget,
}: {
  id: string;
  title: string;
  collapsed?: Record<string, boolean>;
  onToggle?: (id: string) => void;
  children: React.ReactNode;
  defaultIsOpen?: boolean;
  onTarget?: () => void;
}) {
  return (
    <XDSVStack gap={3}>
      <XDSHStack gap={1} align="center">
        <XDSText type="label" weight="semibold">
          {title}
        </XDSText>
        {onTarget && (
          <XDSIconButton
            icon={<ViewfinderCircleIcon width="1em" height="1em" />}
            label={`Highlight ${title} in preview`}
            variant="ghost"
            size="sm"
            onClick={onTarget}
          />
        )}
      </XDSHStack>
      {children}
    </XDSVStack>
  );
}

// =============================================================================
// Token Groups
// =============================================================================

const TOKEN_GROUP_ICONS: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  colors: SwatchIcon,
  spacing: Square3Stack3DIcon,
  radius: StopIcon,
  typography: LanguageIcon,
  size: ArrowsPointingOutIcon,
  shadow: SunIcon,
  duration: ClockIcon,
  easing: BoltIcon,
};

const TOKEN_GROUPS = {
  colors: {
    label: 'Colors',
    description:
      'Semantic color tokens for text, backgrounds, borders, and states',
    tokens: colorDefaults,
  },
  spacing: {
    label: 'Spacing',
    description: 'Consistent spacing scale for margins, padding, and gaps',
    tokens: spacingDefaults,
  },
  radius: {
    label: 'Radius',
    description: 'Border radius tokens for rounded corners',
    tokens: radiusDefaults,
  },
  typography: {
    label: 'Typography',
    description: 'Font families, sizes, weights, and line heights',
    tokens: {
      ...typographyDefaults,
      ...textSizeDefaults,
      ...fontWeightDefaults,
    },
  },
  size: {
    label: 'Size',
    description: 'Component size tokens (sm, md, lg)',
    tokens: sizeDefaults,
  },
  shadow: {
    label: 'Elevation',
    description: 'Shadow tokens',
    tokens: shadowDefaults,
  },
  duration: {
    label: 'Duration',
    description: 'Motion duration tokens',
    tokens: durationDefaults,
  },
  easing: {
    label: 'Easing',
    description: 'Motion easing tokens',
    tokens: easeDefaults,
  },
} as const;

type TokenGroupKey = keyof typeof TOKEN_GROUPS;

// =============================================================================
// Component-Scoped CSS Custom Properties
// =============================================================================

interface ComponentVar {
  name: string;
  default: string;
  description: string;
  options: Array<{value: string; label: string}>;
}

const RADIUS_OPTIONS = [
  {value: 'var(--radius-none)', label: 'None — 0px'},
  {value: 'var(--radius-inner)', label: 'Inner — 2px'},
  {value: 'var(--radius-element)', label: 'Element — 4px'},
  {value: 'var(--radius-container)', label: 'Container — 8px'},
  {value: 'var(--radius-page)', label: 'Page — 16px'},
  {value: 'var(--radius-full)', label: 'Full — 9999px'},
];

const SPACING_OPTIONS = [
  {value: 'var(--spacing-0-5)', label: '0.5'},
  {value: 'var(--spacing-1)', label: '1'},
  {value: 'var(--spacing-2)', label: '2'},
  {value: 'var(--spacing-3)', label: '3'},
  {value: 'var(--spacing-4)', label: '4'},
  {value: 'var(--spacing-6)', label: '6'},
  {value: 'var(--spacing-8)', label: '8'},
];

const COMPONENT_VAR_TO_OVERRIDE: Record<
  string,
  {component: string; cssProperty: string}
> = {
  '--button-radius': {component: 'button', cssProperty: 'borderRadius'},
  '--button-focus-offset': {
    component: 'button',
    cssProperty: '--button-focus-offset',
  },
  '--button-icon-only-aspect': {
    component: 'button',
    cssProperty: '--button-icon-only-aspect',
  },
  '--card-radius': {component: 'card', cssProperty: 'borderRadius'},
  '--dialog-radius': {component: 'dialog', cssProperty: 'borderRadius'},
  '--dropdown-radius': {
    component: 'dropdown-menu',
    cssProperty: 'borderRadius',
  },
  '--dropdown-padding': {component: 'dropdown-menu', cssProperty: 'padding'},
  '--popover-radius': {component: 'popover', cssProperty: 'borderRadius'},
  '--hovercard-radius': {component: 'hovercard', cssProperty: 'borderRadius'},
  '--input-radius': {component: 'field', cssProperty: 'borderRadius'},
  '--banner-radius': {component: 'banner', cssProperty: 'borderRadius'},
  '--composer-radius': {
    component: 'chat-composer',
    cssProperty: 'borderRadius',
  },
  '--composer-padding': {component: 'chat-composer', cssProperty: 'padding'},
};

const COMPONENT_VAR_NAMES = new Set(Object.keys(COMPONENT_VAR_TO_OVERRIDE));

const COMPONENT_VARS: Record<string, {label: string; vars: ComponentVar[]}> = {
  button: {
    label: 'Button',
    vars: [
      {
        name: '--button-radius',
        default: 'var(--radius-element)',
        description: 'Border radius',
        options: RADIUS_OPTIONS,
      },
      {
        name: '--button-press-scale',
        default: 'scale(0.98)',
        description: 'Active press transform',
        options: [
          {value: 'scale(1)', label: 'None'},
          {value: 'scale(0.99)', label: 'Subtle'},
          {value: 'scale(0.98)', label: 'Default'},
          {value: 'scale(0.96)', label: 'Strong'},
          {value: 'scale(0.94)', label: 'Heavy'},
        ],
      },
      {
        name: '--button-disabled-opacity',
        default: '0.5',
        description: 'Opacity when disabled',
        options: [
          {value: '0.3', label: '0.3'},
          {value: '0.4', label: '0.4'},
          {value: '0.5', label: '0.5 (Default)'},
          {value: '0.6', label: '0.6'},
          {value: '0.7', label: '0.7'},
          {value: '1', label: '1.0 (Opaque)'},
        ],
      },
      {
        name: '--button-focus-offset',
        default: '3px',
        description: 'Focus ring outline offset',
        options: [
          {value: '1px', label: '1px'},
          {value: '2px', label: '2px'},
          {value: '3px', label: '3px (Default)'},
          {value: '4px', label: '4px'},
          {value: '6px', label: '6px'},
        ],
      },
      {
        name: '--button-icon-only-aspect',
        default: '1 / 1',
        description: 'Aspect ratio for icon-only buttons',
        options: [
          {value: '1 / 1', label: '1:1 Square (Default)'},
          {value: 'auto', label: 'Auto'},
        ],
      },
    ],
  },
  card: {
    label: 'Card',
    vars: [
      {
        name: '--card-radius',
        default: 'var(--radius-container)',
        description: 'Border radius',
        options: RADIUS_OPTIONS,
      },
    ],
  },
  dialog: {
    label: 'Dialog',
    vars: [
      {
        name: '--dialog-radius',
        default: 'var(--radius-container)',
        description: 'Border radius',
        options: RADIUS_OPTIONS,
      },
    ],
  },
  'dropdown-menu': {
    label: 'Dropdown Menu',
    vars: [
      {
        name: '--dropdown-radius',
        default: 'var(--radius-element)',
        description: 'Border radius of menu popup',
        options: RADIUS_OPTIONS,
      },
      {
        name: '--dropdown-padding',
        default: 'var(--spacing-1)',
        description: 'Inner padding of menu popup',
        options: SPACING_OPTIONS,
      },
    ],
  },
  popover: {
    label: 'Popover',
    vars: [
      {
        name: '--popover-radius',
        default: 'var(--radius-element)',
        description: 'Border radius',
        options: RADIUS_OPTIONS,
      },
    ],
  },
  hovercard: {
    label: 'Hover Card',
    vars: [
      {
        name: '--hovercard-radius',
        default: 'var(--radius-container)',
        description: 'Border radius',
        options: RADIUS_OPTIONS,
      },
    ],
  },
  field: {
    label: 'Field / Input',
    vars: [
      {
        name: '--input-radius',
        default: 'var(--radius-element)',
        description: 'Border radius of input fields',
        options: RADIUS_OPTIONS,
      },
    ],
  },
  banner: {
    label: 'Banner',
    vars: [
      {
        name: '--banner-radius',
        default: 'var(--radius-container)',
        description: 'Border radius',
        options: RADIUS_OPTIONS,
      },
    ],
  },
  'chat-composer': {
    label: 'Chat Composer',
    vars: [
      {
        name: '--composer-radius',
        default: 'var(--radius-page)',
        description: 'Border radius of composer body',
        options: RADIUS_OPTIONS,
      },
      {
        name: '--composer-padding',
        default: 'var(--spacing-3)',
        description: 'Padding of composer body',
        options: SPACING_OPTIONS,
      },
    ],
  },
};

const RATIO_OPTIONS = [
  {value: 1.067, label: '1.067 — Minor Second'},
  {value: 1.125, label: '1.125 — Major Second'},
  {value: 1.2, label: '1.200 — Minor Third'},
  {value: 1.25, label: '1.250 — Major Third'},
  {value: 1.333, label: '1.333 — Perfect Fourth'},
  {value: 1.414, label: '1.414 — Augmented Fourth'},
  {value: 1.5, label: '1.500 — Perfect Fifth'},
  {value: 1.618, label: '1.618 — Golden Ratio'},
];

// =============================================================================
// Color Categories
// =============================================================================

const COLOR_CATEGORIES = {
  'Core Semantic': [
    '--color-accent',
    '--color-accent-muted',
    '--color-neutral',
    '--color-overlay',
  ],
  'Interactive States': [
    '--color-overlay-hover',
    '--color-overlay-pressed',
    '--color-accent',
    '--color-error',
    '--color-success',
    '--color-warning',
    '--color-background-muted',
  ],
  Text: [
    '--color-text-primary',
    '--color-text-secondary',
    '--color-text-disabled',
    '--color-text-accent',
    '--color-on-dark',
  ],
  Icon: [
    '--color-icon-primary',
    '--color-icon-secondary',
    '--color-icon-disabled',
  ],
  'Surface Variants': [
    '--color-background-surface',
    '--color-background-body',
    '--color-background-card',
    '--color-background-popover',
  ],
  'Status/Sentiment': [
    '--color-success',
    '--color-success-muted',
    '--color-error',
    '--color-error-muted',
    '--color-warning',
    '--color-warning-muted',
  ],
  Divider: ['--color-border', '--color-border-emphasized'],
  Effects: ['--color-skeleton', '--color-shadow', '--color-tint-hover'],
  'Palette: Blue': [
    '--color-background-blue',
    '--color-border-blue',
    '--color-icon-blue',
    '--color-text-blue',
  ],
  'Palette: Green': [
    '--color-background-green',
    '--color-border-green',
    '--color-icon-green',
    '--color-text-green',
  ],
  'Palette: Red': [
    '--color-background-red',
    '--color-border-red',
    '--color-icon-red',
    '--color-text-red',
  ],
  'Palette: Yellow': [
    '--color-background-yellow',
    '--color-border-yellow',
    '--color-icon-yellow',
    '--color-text-yellow',
  ],
  'Palette: Orange': [
    '--color-background-orange',
    '--color-border-orange',
    '--color-icon-orange',
    '--color-text-orange',
  ],
  'Palette: Purple': [
    '--color-background-purple',
    '--color-border-purple',
    '--color-icon-purple',
    '--color-text-purple',
  ],
  'Palette: Pink': [
    '--color-background-pink',
    '--color-border-pink',
    '--color-icon-pink',
    '--color-text-pink',
  ],
  'Palette: Teal': [
    '--color-background-teal',
    '--color-border-teal',
    '--color-icon-teal',
    '--color-text-teal',
  ],
  'Palette: Cyan': [
    '--color-background-cyan',
    '--color-border-cyan',
    '--color-icon-cyan',
    '--color-text-cyan',
  ],
  'Palette: Gray': [
    '--color-background-gray',
    '--color-border-gray',
    '--color-icon-gray',
    '--color-text-gray',
  ],
} as const;

// =============================================================================
// Typography Categories
// =============================================================================

const TYPOGRAPHY_CATEGORIES = {
  'Font Families': [
    '--font-family-body',
    '--font-family-heading',
    '--font-family-code',
  ],
  'Heading 1': {
    description: 'Primary page title (24px default)',
    tokens: [
      '--text-heading-1-size',
      '--text-heading-1-weight',
      '--text-heading-1-leading',
    ],
  },
  'Heading 2': {
    description: 'Section title (20px default)',
    tokens: [
      '--text-heading-2-size',
      '--text-heading-2-weight',
      '--text-heading-2-leading',
    ],
  },
  'Heading 3': {
    description: 'Subsection title (17px default)',
    tokens: [
      '--text-heading-3-size',
      '--text-heading-3-weight',
      '--text-heading-3-leading',
    ],
  },
  'Heading 4': {
    description: 'Card/component title (14px — base anchor)',
    tokens: [
      '--text-heading-4-size',
      '--text-heading-4-weight',
      '--text-heading-4-leading',
    ],
  },
  'Heading 5': {
    description: 'Minor heading (12px default)',
    tokens: [
      '--text-heading-5-size',
      '--text-heading-5-weight',
      '--text-heading-5-leading',
    ],
  },
  'Heading 6': {
    description: 'Smallest heading (10px default)',
    tokens: [
      '--text-heading-6-size',
      '--text-heading-6-weight',
      '--text-heading-6-leading',
    ],
  },
  'Body Text': {
    description: 'Default paragraph text',
    tokens: ['--text-body-size', '--text-body-weight', '--text-body-leading'],
  },
  'Large Text': {
    description: 'Intro/lead paragraphs',
    tokens: [
      '--text-large-size',
      '--text-large-weight',
      '--text-large-leading',
    ],
  },
  'Label Text': {
    description: 'Form labels, UI labels',
    tokens: [
      '--text-label-size',
      '--text-label-weight',
      '--text-label-leading',
    ],
  },
  'Supporting Text': {
    description: 'Captions, helper text',
    tokens: [
      '--text-supporting-size',
      '--text-supporting-weight',
      '--text-supporting-leading',
    ],
  },
  'Code Text': {
    description: 'Inline code, code blocks',
    tokens: ['--text-code-size', '--text-code-weight', '--text-code-leading'],
  },
  'All Text Sizes': [
    '--font-size-4xs',
    '--font-size-3xs',
    '--font-size-2xs',
    '--font-size-xs',
    '--font-size-sm',
    '--font-size-base',
    '--font-size-lg',
    '--font-size-xl',
    '--font-size-2xl',
    '--font-size-3xl',
    '--font-size-4xl',
  ],
  'All Font Weights': [
    '--font-weight-normal',
    '--font-weight-medium',
    '--font-weight-semibold',
    '--font-weight-bold',
  ],
  'All Line Heights': [
    '--leading-tight',
    '--leading-snug',
    '--leading-base',
    '--leading-normal',
    '--leading-relaxed',
  ],
} as const;

type TypographyCategoryValue =
  | string[]
  | {description: string; tokens: string[]};

// =============================================================================
// Helper Functions
// =============================================================================

function parseLightDark(value: string): {light: string; dark: string} | null {
  const match = value.match(/^light-dark\(([^,]+),\s*([^)]+)\)$/);
  if (match) {
    return {light: match[1].trim(), dark: match[2].trim()};
  }
  return null;
}

function parseColorWithAlpha(
  value: string,
): {hex: string; alpha: number} | null {
  const hex8Match = value.match(/^#([0-9A-Fa-f]{8})$/);
  if (hex8Match) {
    const hex = '#' + hex8Match[1].slice(0, 6);
    const alpha = parseInt(hex8Match[1].slice(6, 8), 16) / 255;
    return {hex, alpha: Math.round(alpha * 100) / 100};
  }
  const hex6Match = value.match(/^#([0-9A-Fa-f]{6})$/);
  if (hex6Match) {
    return {hex: value, alpha: 1};
  }
  const hex3Match = value.match(/^#([0-9A-Fa-f]{3})$/);
  if (hex3Match) {
    const r = hex3Match[1][0];
    const g = hex3Match[1][1];
    const b = hex3Match[1][2];
    return {hex: `#${r}${r}${g}${g}${b}${b}`, alpha: 1};
  }
  const rgbaMatch = value.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
  );
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(rgbaMatch[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(rgbaMatch[3], 10).toString(16).padStart(2, '0');
    const alpha = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
    return {hex: `#${r}${g}${b}`, alpha};
  }
  return null;
}

function colorWithAlphaToString(hex: string, alpha: number): string {
  if (alpha >= 1) {
    return hex.toUpperCase();
  }
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${alphaHex}`.toUpperCase();
}

function getTokenLabel(tokenName: string): string {
  return tokenName
    .replace(/^--/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// =============================================================================
// Token Editor Components
// =============================================================================

function ColorSwatch({
  tokenName,
  value,
  onChange,
  mode,
}: {
  tokenName: string;
  value: string;
  onChange: (tokenName: string, value: string) => void;
  mode: 'light' | 'dark';
}) {
  const parsed = parseLightDark(value);
  const displayValue = parsed
    ? mode === 'light'
      ? parsed.light
      : parsed.dark
    : value;
  const colorParsed = parseColorWithAlpha(displayValue);
  const hasColorPicker = colorParsed !== null;

  const handleColorChange = (newHex: string, newAlpha?: number) => {
    const alpha = newAlpha ?? colorParsed?.alpha ?? 1;
    const newColor = colorWithAlphaToString(newHex, alpha);
    const newValue = parsed
      ? mode === 'light'
        ? `light-dark(${newColor}, ${parsed.dark})`
        : `light-dark(${parsed.light}, ${newColor})`
      : newColor;
    onChange(tokenName, newValue);
  };

  const handleAlphaChange = (newAlpha: number) => {
    if (colorParsed) {
      handleColorChange(colorParsed.hex, newAlpha);
    }
  };

  return (
    <div
      style={{
        padding: '10px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
      <XDSText
        type="supporting"
        color="primary"
        maxLines={1}
        style={{flexShrink: 0}}>
        {getTokenLabel(tokenName)}
      </XDSText>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
          justifyContent: 'flex-end',
        }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            backgroundColor: displayValue,
            border: '1px solid var(--color-border-emphasized)',
            flexShrink: 0,
            position: 'relative',
            cursor: hasColorPicker ? 'pointer' : undefined,
            backgroundImage:
              colorParsed && colorParsed.alpha < 1
                ? `linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)`
                : undefined,
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
          }}>
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 6,
              backgroundColor: displayValue,
              pointerEvents: 'none',
            }}
          />
          {hasColorPicker && colorParsed && (
            <input
              type="color"
              value={colorParsed.hex}
              onChange={e => handleColorChange(e.target.value)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
                border: 'none',
                padding: 0,
                zIndex: 1,
              }}
            />
          )}
        </div>
        <XDSTextInput
          label={tokenName}
          isLabelHidden
          size="sm"
          value={
            hasColorPicker && colorParsed
              ? `${colorParsed.hex}  ${Math.round(colorParsed.alpha * 100)}%`
              : displayValue
          }
          onChange={(val: string) => {
            const parts = val.trim().split(/\s+/);
            const hex = parts[0] || '';
            const pctStr = parts.find(p => p.endsWith('%'));
            const alpha = pctStr
              ? Math.min(100, Math.max(0, Number(pctStr.replace('%', '')))) /
                100
              : (colorParsed?.alpha ?? 1);
            if (hex.startsWith('#') && hex.length >= 4) {
              handleColorChange(hex, alpha);
            } else {
              const newValue = parsed
                ? mode === 'light'
                  ? `light-dark(${val}, ${parsed.dark})`
                  : `light-dark(${parsed.light}, ${val})`
                : val;
              onChange(tokenName, newValue);
            }
          }}
          style={{width: 120}}
        />
      </div>
    </div>
  );
}

function SpacingEditor({
  tokenName,
  value,
  onChange,
}: {
  tokenName: string;
  value: string;
  onChange: (tokenName: string, value: string) => void;
}) {
  const numValue = parseInt(value, 10);
  return (
    <XDSHStack
      gap={3}
      vAlign="center"
      style={{
        padding: '8px 12px',
        borderRadius: 8,
        backgroundColor: 'var(--color-background-body)',
      }}>
      <div
        style={{
          width: Math.min(numValue, 48),
          height: 24,
          backgroundColor: 'var(--color-accent)',
          borderRadius: 4,
          flexShrink: 0,
        }}
      />
      <XDSVStack gap={0} style={{flex: 1, minWidth: 0}}>
        <XDSText type="supporting" color="primary" maxLines={1}>
          {getTokenLabel(tokenName)}
        </XDSText>
        <XDSText type="supporting" color="secondary" maxLines={1}>
          {tokenName}
        </XDSText>
      </XDSVStack>
      <div style={{width: 80}}>
        <XDSTextInput
          label="Value"
          isLabelHidden
          value={value}
          onChange={val => onChange(tokenName, val)}
          size="sm"
        />
      </div>
    </XDSHStack>
  );
}

function RadiusEditor({
  tokenName,
  value,
  onChange,
}: {
  tokenName: string;
  value: string;
  onChange: (tokenName: string, value: string) => void;
}) {
  return (
    <XDSHStack
      gap={3}
      vAlign="center"
      style={{
        padding: '8px 12px',
        borderRadius: 8,
        backgroundColor: 'var(--color-background-body)',
      }}>
      <div
        style={{
          width: 32,
          height: 32,
          backgroundColor: 'var(--color-accent)',
          borderRadius: value,
          flexShrink: 0,
        }}
      />
      <XDSVStack gap={0} style={{flex: 1, minWidth: 0}}>
        <XDSText type="supporting" color="primary" maxLines={1}>
          {getTokenLabel(tokenName)}
        </XDSText>
        <XDSText type="supporting" color="secondary" maxLines={1}>
          {tokenName}
        </XDSText>
      </XDSVStack>
      <div style={{width: 80}}>
        <XDSTextInput
          label="Value"
          isLabelHidden
          value={value}
          onChange={val => onChange(tokenName, val)}
          size="sm"
        />
      </div>
    </XDSHStack>
  );
}

function TypographyEditor({
  tokenName,
  value,
  onChange,
}: {
  tokenName: string;
  value: string;
  onChange: (tokenName: string, value: string) => void;
}) {
  const isFont = tokenName.includes('font-') && !tokenName.includes('weight');
  const isSize = tokenName.includes('text-');
  const isWeight = tokenName.includes('weight');
  const isLeading = tokenName.includes('leading');

  return (
    <XDSHStack
      gap={3}
      vAlign="center"
      style={{
        padding: '8px 12px',
        borderRadius: 8,
        backgroundColor: 'var(--color-background-body)',
      }}>
      <div
        style={{
          width: 48,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: isSize ? value : '14px',
          fontWeight: isWeight ? value : 400,
          fontFamily: isFont ? value : 'inherit',
          lineHeight: isLeading ? value : 1.4,
          color: 'var(--color-text-primary)',
          flexShrink: 0,
        }}>
        Aa
      </div>
      <XDSVStack gap={0} style={{flex: 1, minWidth: 0}}>
        <XDSText type="supporting" color="primary" maxLines={1}>
          {getTokenLabel(tokenName)}
        </XDSText>
        <XDSText type="supporting" color="secondary" maxLines={1}>
          {tokenName}
        </XDSText>
      </XDSVStack>
      <div style={{width: 200}}>
        <XDSTextInput
          label="Value"
          isLabelHidden
          value={value}
          onChange={val => onChange(tokenName, val)}
          size="sm"
        />
      </div>
    </XDSHStack>
  );
}

// =============================================================================
// Preview Components
// =============================================================================

interface SpacingRow extends Record<string, unknown> {
  token: string;
  value: string;
  preview: React.ReactNode;
}

const spacingTableColumns: XDSTableColumn<SpacingRow>[] = [
  {key: 'token', header: 'Token'},
  {key: 'value', header: 'Value'},
  {key: 'preview', header: 'Preview'},
];

const ROW: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};
const FULL_W: React.CSSProperties = {width: '100%'};
const CHART: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: 'var(--spacing-1)',
  height: 80,
};
const BAR_BASE: React.CSSProperties = {
  flex: 1,
  borderRadius: 'var(--radius-inner)',
  backgroundColor: 'var(--color-accent)',
  minWidth: 0,
};
const SEC_BOX: React.CSSProperties = {
  backgroundColor: 'var(--color-background-muted)',
  borderRadius: 'var(--radius-container)',
  padding: 'var(--spacing-3)',
};
const CARD_WRAP: React.CSSProperties = {
  breakInside: 'avoid' as const,
  marginBottom: 'var(--spacing-6)',
};

function Sparkline({values}: {values: number[]}) {
  return (
    <XDSHStack gap={0.5} vAlign="end">
      {values.map((v, i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: v,
            borderRadius: 2,
            backgroundColor: 'var(--color-accent)',
          }}
        />
      ))}
    </XDSHStack>
  );
}

function ComponentPreview() {
  const [settingsTab, setSettingsTab] = React.useState('general');
  const [brightness, setBrightness] = React.useState(65);
  const [colorTemp, setColorTemp] = React.useState(45);
  const [switch1, setSwitch1] = React.useState(false);
  const [switch2, setSwitch2] = React.useState(true);
  const [check1, setCheck1] = React.useState(false);
  const [check2, setCheck2] = React.useState(true);
  const [sliderValue, setSliderValue] = React.useState(50);
  const [selectorValue, setSelectorValue] = React.useState('Apple');
  const [progressValue, setProgressValue] = React.useState(65);
  const [interactionsTab, setInteractionsTab] = React.useState('overview');

  return (
    <div
      style={{
        columnCount: 3,
        columnGap: 'var(--spacing-6)',
        minHeight: '100%',
      }}>
      {/* Contribution History */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <XDSVStack gap={1}>
                  <div style={ROW}>
                    <XDSHeading level={3}>Contribution History</XDSHeading>
                    <XDSBadge label="+12% vs last month" variant="info" />
                  </div>
                  <XDSText type="supporting" color="secondary">
                    Last 6 months of activity
                  </XDSText>
                </XDSVStack>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSVStack gap={3}>
                  <div style={CHART}>
                    {[40, 55, 60, 70, 55, 65].map((h, i) => (
                      <div key={i} style={{...BAR_BASE, height: h}} />
                    ))}
                  </div>
                  <XDSHStack gap={4}>
                    {['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'].map(m => (
                      <XDSText key={m} type="supporting" color="secondary">
                        {m}
                      </XDSText>
                    ))}
                  </XDSHStack>
                  <XDSDivider variant="strong" />
                  <XDSHStack gap={3}>
                    <div style={{...SEC_BOX, flex: 1}}>
                      <XDSVStack gap={1}>
                        <XDSText type="supporting" color="secondary">
                          UPCOMING
                        </XDSText>
                        <XDSText type="label">May 25, 2024</XDSText>
                        <XDSText type="supporting" color="secondary">
                          $1,000 scheduled
                        </XDSText>
                      </XDSVStack>
                    </div>
                    <div style={{...SEC_BOX, flex: 1}}>
                      <XDSVStack gap={1}>
                        <XDSText type="supporting" color="secondary">
                          AUTO-SAVE PLAN
                        </XDSText>
                        <XDSText type="label">Accelerated</XDSText>
                        <XDSText type="supporting" color="secondary">
                          Recurring weekly
                        </XDSText>
                      </XDSVStack>
                    </div>
                  </XDSHStack>
                </XDSVStack>
              </XDSLayoutContent>
            }
            footer={
              <XDSLayoutFooter>
                <XDSButton
                  label="View Full Report"
                  variant="primary"
                  style={FULL_W}
                />
              </XDSLayoutFooter>
            }
          />
        </XDSCard>
      </div>

      {/* Savings Targets */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <div style={ROW}>
                  <XDSHeading level={3}>Savings Targets</XDSHeading>
                  <XDSButton label="New Goal" size="sm" />
                </div>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSVStack gap={4}>
                  <XDSBanner
                    status="info"
                    title="On Track"
                    description="Your retirement savings are ahead of schedule by $12,000 this quarter."
                  />
                  <XDSText type="supporting" color="secondary">
                    Active milestones for 2024
                  </XDSText>
                  <XDSVStack gap={1}>
                    <XDSText type="supporting" color="secondary">
                      RETIREMENT
                    </XDSText>
                    <XDSHeading level={2}>$420,000</XDSHeading>
                    <XDSProgressBar label="Retirement" value={65} />
                    <div style={ROW}>
                      <XDSText type="supporting" color="secondary">
                        65% achieved
                      </XDSText>
                      <XDSText type="supporting" color="secondary">
                        $273,000
                      </XDSText>
                    </div>
                  </XDSVStack>
                  <XDSVStack gap={1}>
                    <XDSText type="supporting" color="secondary">
                      REAL ESTATE
                    </XDSText>
                    <XDSHeading level={2}>$85,000</XDSHeading>
                    <XDSProgressBar label="Real Estate" value={32} />
                    <div style={ROW}>
                      <XDSText type="supporting" color="secondary">
                        32% achieved
                      </XDSText>
                      <XDSText type="supporting" color="secondary">
                        $27,200
                      </XDSText>
                    </div>
                  </XDSVStack>
                </XDSVStack>
              </XDSLayoutContent>
            }
          />
        </XDSCard>
      </div>

      {/* Buy Investment */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <XDSHeading level={3}>Buy Investment</XDSHeading>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSVStack gap={4}>
                  <XDSTextInput
                    label="Amount to Invest"
                    value="1,000.00"
                    onChange={() => {}}
                  />
                  <XDSSelector
                    label="Order Type"
                    options={['Market Order', 'Limit Order', 'Stop Order']}
                    value="Market Order"
                    onChange={() => {}}
                  />
                  <XDSText type="supporting" color="secondary">
                    Market orders execute at the current price.
                  </XDSText>
                  <XDSDivider variant="strong" />
                  <div style={ROW}>
                    <XDSText type="body">Estimated Shares</XDSText>
                    <XDSText type="body" weight="bold">
                      1.95
                    </XDSText>
                  </div>
                  <div style={ROW}>
                    <XDSText type="body">Buying Power</XDSText>
                    <XDSText type="body" weight="bold">
                      $12,450.00
                    </XDSText>
                  </div>
                </XDSVStack>
              </XDSLayoutContent>
            }
            footer={
              <XDSLayoutFooter>
                <XDSButton
                  label="Review Order"
                  variant="primary"
                  style={FULL_W}
                />
              </XDSLayoutFooter>
            }
          />
        </XDSCard>
      </div>

      {/* Recent Transactions */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <div style={ROW}>
                  <XDSVStack gap={1}>
                    <XDSHeading level={3}>Recent Transactions</XDSHeading>
                    <XDSText type="supporting" color="secondary">
                      Your latest account activity.
                    </XDSText>
                  </XDSVStack>
                  <XDSLink href="#">
                    View All
                  </XDSLink>
                </div>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSTable
                  data={[
                    {
                      id: '1',
                      name: 'Blue Bottle Coffee',
                      cat: 'Food & Drink',
                      date: 'Today, 10:24 AM',
                      amt: '-$6.50',
                    },
                    {
                      id: '2',
                      name: 'Whole Foods Market',
                      cat: 'Groceries',
                      date: 'Yesterday',
                      amt: '-$142.30',
                    },
                    {
                      id: '3',
                      name: 'Stripe Payout',
                      cat: 'Income',
                      date: 'Oct 12',
                      amt: '+$4,200.00',
                    },
                    {
                      id: '4',
                      name: 'Uber Technologies',
                      cat: 'Transport',
                      date: 'Oct 11',
                      amt: '-$24.10',
                    },
                  ]}
                  idKey="id"
                  density="compact"
                  isStriped
                  dividers="none"
                  columns={[
                    {
                      key: 'name',
                      header: '',
                      width: proportional(2),
                      renderCell: (txn: {name: string; cat: string}) => (
                        <XDSHStack gap={3} vAlign="center">
                          <XDSAvatar name={txn.name} size="small" />
                          <XDSVStack gap={0}>
                            <XDSText type="body" weight="bold">
                              {txn.name}
                            </XDSText>
                            <XDSText type="supporting" color="secondary">
                              {txn.cat}
                            </XDSText>
                          </XDSVStack>
                        </XDSHStack>
                      ),
                    },
                    {
                      key: 'amt',
                      header: '',
                      width: proportional(1),
                      renderCell: (txn: {amt: string; date: string}) => (
                        <XDSVStack gap={0} style={{alignItems: 'flex-end'}}>
                          <XDSText type="body" weight="bold">
                            {txn.amt}
                          </XDSText>
                          <XDSText type="supporting" color="secondary">
                            {txn.date}
                          </XDSText>
                        </XDSVStack>
                      ),
                    },
                  ]}
                />
              </XDSLayoutContent>
            }
          />
        </XDSCard>
      </div>

      {/* Stock Performance */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSVStack gap={3}>
            <XDSHeading level={3}>Stock Performance</XDSHeading>
            <XDSText type="supporting" color="secondary">
              6-month price history.
            </XDSText>
            <XDSSelector
              label="Ticker"
              options={['VOO', 'AAPL', 'GOOGL', 'MSFT']}
              value="VOO"
              onChange={() => {}}
            />
            <div style={CHART}>
              {[30, 45, 38, 52, 48, 55, 42, 60, 58, 65, 50, 70].map((h, i) => (
                <div key={i} style={{...BAR_BASE, height: h}} />
              ))}
            </div>
          </XDSVStack>
        </XDSCard>
      </div>

      {/* Card Balance */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSVStack gap={3}>
            <div style={ROW}>
              <XDSVStack gap={0}>
                <XDSText type="supporting" color="secondary">
                  Card Balance
                </XDSText>
                <XDSHeading level={3}>US$12.94</XDSHeading>
                <XDSText type="supporting" color="secondary">
                  US$ 1,337.06 Available
                </XDSText>
              </XDSVStack>
              <XDSVStack gap={0} style={{alignItems: 'flex-end'}}>
                <XDSText type="supporting" color="secondary">
                  Payment Due
                </XDSText>
                <XDSHeading level={3}>1 Apr</XDSHeading>
                <XDSLink href="#">
                  Pay Early
                </XDSLink>
              </XDSVStack>
            </div>
            <XDSText type="supporting" color="secondary">
              Yearly Activity
            </XDSText>
            <div style={CHART}>
              {[20, 35, 15, 45, 30, 50, 25, 40, 55, 35, 45, 30].map((h, i) => (
                <div key={i} style={{...BAR_BASE, height: h}} />
              ))}
            </div>
          </XDSVStack>
        </XDSCard>
      </div>

      {/* Power Usage */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSVStack gap={3}>
            <XDSHeading level={3}>Power Usage</XDSHeading>
            <XDSText type="supporting" color="secondary">
              Whole Home
            </XDSText>
            <div style={CHART}>
              {[60, 45, 70, 55, 40, 65, 50, 35, 55, 45, 60, 50].map((h, i) => (
                <div key={i} style={{...BAR_BASE, height: h}} />
              ))}
            </div>
            <XDSDivider variant="strong" />
            <div style={ROW}>
              <XDSVStack gap={0}>
                <XDSText type="supporting" color="secondary">
                  Currently Using
                </XDSText>
                <XDSText type="label" weight="bold">
                  3.4 kW
                </XDSText>
              </XDSVStack>
              <XDSVStack gap={0}>
                <XDSText type="supporting" color="secondary">
                  Solar Gen
                </XDSText>
                <XDSText type="label" weight="bold" color="active">
                  +1.2 kW
                </XDSText>
              </XDSVStack>
            </div>
            <XDSVStack gap={1}>
              <XDSText type="supporting" color="secondary">
                Battery Level
              </XDSText>
              <XDSProgressBar label="Battery" value={85} hasValueLabel />
            </XDSVStack>
          </XDSVStack>
        </XDSCard>
      </div>

      {/* Clearinghouse Balance */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSVStack gap={4}>
            <XDSText type="supporting" color="secondary">
              Clearhouse Balance
            </XDSText>
            <XDSHeading level={1}>$0.00</XDSHeading>
            <XDSHStack gap={2} vAlign="center">
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-success)',
                }}
              />
              <XDSText type="supporting" color="secondary">
                Pending Setup
              </XDSText>
            </XDSHStack>
            <XDSDivider variant="strong" />
            <div style={ROW}>
              <XDSText type="body">Net Royalties</XDSText>
              <XDSText type="body" weight="bold">
                $0.00
              </XDSText>
            </div>
            <div style={ROW}>
              <XDSText type="body">Processing Fee</XDSText>
              <XDSText type="body" weight="bold">
                -$0.00
              </XDSText>
            </div>
            <XDSDivider variant="strong" />
            <div style={ROW}>
              <XDSText type="body">Total Ready to Claim</XDSText>
              <XDSText type="body" weight="bold">
                $0.00 USD
              </XDSText>
            </div>
            <XDSText type="supporting" color="secondary">
              Once your bank is connected, balances over $10.00 are
              automatically eligible for monthly distribution.
            </XDSText>
          </XDSVStack>
        </XDSCard>
      </div>

      {/* Payout Preferences */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <div style={ROW}>
                  <XDSHeading level={3}>Payout Preferences</XDSHeading>
                  <XDSButton
                    label="Close"
                    icon={<XDSIcon icon="close" size="sm" />}
                    variant="ghost"
                    size="sm"
                    isIconOnly
                  />
                </div>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSVStack gap={4}>
                  <XDSText type="supporting" color="secondary">
                    Receiving Method
                  </XDSText>
                  <XDSTextInput
                    label="Account Holder Name"
                    value="Synthetic Horizons Music LLC"
                    onChange={() => {}}
                  />
                  <XDSRadioList
                    label="Receiving Method"
                    value="bank"
                    onChange={() => {}}>
                    <XDSRadioListItem
                      value="bank"
                      label="Bank Transfer — SWIFT / IBAN"
                    />
                    <XDSRadioListItem
                      value="paypal"
                      label="PayPal — Instant Payout"
                    />
                  </XDSRadioList>
                  <XDSTextInput
                    label="IBAN / Account Number"
                    value="DE89 3704 0044 ..."
                    onChange={() => {}}
                  />
                </XDSVStack>
              </XDSLayoutContent>
            }
            footer={
              <XDSLayoutFooter>
                <XDSButton
                  label="Save Payout Settings"
                  variant="primary"
                  style={FULL_W}
                />
              </XDSLayoutFooter>
            }
          />
        </XDSCard>
      </div>

      {/* Q2 Dividend Income */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <div style={ROW}>
                  <XDSVStack gap={1}>
                    <XDSHeading level={3}>Q2 Dividend Income</XDSHeading>
                    <XDSText type="supporting" color="secondary">
                      Quarterly dividend payouts across your portfolio holdings.
                    </XDSText>
                  </XDSVStack>
                  <XDSButton
                    label="Close"
                    icon={<XDSIcon icon="close" size="sm" />}
                    variant="ghost"
                    size="sm"
                    isIconOnly
                  />
                </div>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSVStack gap={3}>
                  {[
                    {
                      name: 'Vanguard VIG',
                      shares: '450 Shares',
                      amt: '$1,842.10',
                    },
                    {name: 'S&P 500 VOO', shares: '112 Shares', amt: '$928.40'},
                    {name: 'Apple AAPL', shares: '85 Shares', amt: '$340.00'},
                    {
                      name: 'Realty Income',
                      shares: '320 Shares',
                      amt: '$1,139.50',
                    },
                  ].map((d, i) => (
                    <div key={i} style={ROW}>
                      <XDSVStack gap={0}>
                        <XDSText type="body" weight="bold">
                          {d.name}
                        </XDSText>
                        <XDSText type="supporting" color="secondary">
                          {d.shares}
                        </XDSText>
                      </XDSVStack>
                      <XDSHStack gap={2} vAlign="center">
                        <Sparkline values={[8, 12, 6, 15, 10, 18]} />
                        <XDSText type="body" weight="bold">
                          {d.amt}
                        </XDSText>
                      </XDSHStack>
                    </div>
                  ))}
                </XDSVStack>
              </XDSLayoutContent>
            }
          />
        </XDSCard>
      </div>

      {/* Payments Navigation */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSVStack gap={4}>
            <XDSBreadcrumbs variant="supporting">
              <XDSBreadcrumbItem href="#">Home</XDSBreadcrumbItem>
              <XDSBreadcrumbItem href="#">...</XDSBreadcrumbItem>
              <XDSBreadcrumbItem isCurrent>Payments</XDSBreadcrumbItem>
            </XDSBreadcrumbs>
            <XDSDivider variant="strong" />
            <XDSCollapsibleGroup type="single" defaultValue="0">
              {[
                {
                  title: 'Change transfer limit',
                  desc: 'Adjust how much you can send from your balance.',
                },
                {
                  title: 'Scheduled transfers',
                  desc: 'Set up a transfer to send at a later date.',
                },
                {
                  title: 'Direct Debits',
                  desc: 'Set up and manage regular payments.',
                },
                {
                  title: 'Recurring card payments',
                  desc: 'Manage your repeated card transactions.',
                },
              ].map((item, i) => (
                <XDSCollapsible
                  key={i}
                  value={String(i)}
                  defaultIsOpen={i === 0}
                  trigger={
                    <XDSText type="body" weight="bold">
                      {item.title}
                    </XDSText>
                  }>
                  <XDSText type="supporting" color="secondary">
                    {item.desc}
                  </XDSText>
                </XDSCollapsible>
              ))}
            </XDSCollapsibleGroup>
          </XDSVStack>
        </XDSCard>
      </div>

      {/* FAQ / Settings Tabs */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <XDSTabList value={settingsTab} onChange={setSettingsTab}>
                  <XDSTab value="general" label="General" />
                  <XDSTab value="billing" label="Billing" />
                  <XDSTab value="goals" label="Goals" />
                </XDSTabList>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSVStack gap={3}>
                  <XDSText type="label" weight="bold">
                    How do I set up a custom financial goal?
                  </XDSText>
                  <XDSText type="body" color="secondary">
                    Click New Goal from the Savings Targets card. Choose a
                    category, set a target amount and date, and we&apos;ll
                    calculate the monthly contribution needed.
                  </XDSText>
                  <XDSDivider variant="strong" />
                  <XDSText type="label" weight="bold">
                    Can I track multiple goals at once?
                  </XDSText>
                  <XDSDivider variant="strong" />
                  <XDSText type="label" weight="bold">
                    How are monthly contributions calculated?
                  </XDSText>
                </XDSVStack>
              </XDSLayoutContent>
            }
            footer={
              <XDSLayoutFooter>
                <XDSButton
                  label="Contact Support"
                  variant="secondary"
                  style={FULL_W}
                />
              </XDSLayoutFooter>
            }
          />
        </XDSCard>
      </div>

      {/* Savings Target Progress */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSVStack gap={3}>
            <XDSHeading level={2}>$24,000</XDSHeading>
            <XDSText type="supporting" color="secondary">
              80% of $30,000
            </XDSText>
            <XDSProgressBar label="Savings Progress" value={80} />
            <XDSDivider variant="strong" />
            <div style={ROW}>
              <XDSText type="body">Projected Finish</XDSText>
              <XDSText type="body" weight="bold">
                October 2024
              </XDSText>
            </div>
            <div style={ROW}>
              <XDSText type="body">Monthly Average</XDSText>
              <XDSText type="body" weight="bold">
                $1,250
              </XDSText>
            </div>
            <div style={ROW}>
              <XDSText type="body">Top Contributor</XDSText>
              <XDSText type="body" weight="bold">
                Auto-Transfer
              </XDSText>
            </div>
          </XDSVStack>
        </XDSCard>
      </div>

      {/* Kitchen Island (Smart Home) */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <div style={ROW}>
                  <XDSHeading level={3}>Kitchen Island</XDSHeading>
                  <XDSSwitch label="On" value={true} onChange={() => {}} />
                </div>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSVStack gap={4}>
                  <XDSText type="supporting" color="secondary">
                    Hue Color Ambient
                  </XDSText>
                  <XDSHStack gap={2}>
                    {['Cooking', 'Dining', 'Nightlight', 'Focus'].map(m => (
                      <XDSToken key={m} label={m} />
                    ))}
                  </XDSHStack>
                  <XDSSlider
                    label="Brightness"
                    value={brightness}
                    onChange={(v: number) => setBrightness(v)}
                  />
                  <XDSSlider
                    label="Color Temp"
                    value={colorTemp}
                    onChange={(v: number) => setColorTemp(v)}
                  />
                </XDSVStack>
              </XDSLayoutContent>
            }
          />
        </XDSCard>
      </div>

      {/* Upcoming Payments */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSVStack gap={3}>
            <XDSHeading level={3}>Upcoming Payments</XDSHeading>
            <XDSText type="supporting" color="secondary">
              Select a date to view scheduled payments.
            </XDSText>
            <XDSCalendar />
            <XDSDivider variant="strong" />
            {[
              {
                name: 'Netflix Subscription',
                date: 'Apr 15, 2024',
                amt: '$19.99',
              },
              {name: 'Rent Payment', date: 'Apr 1, 2024', amt: '$2,400.00'},
              {name: 'Auto Insurance', date: 'Apr 22, 2024', amt: '$186.00'},
            ].map((p, i) => (
              <div key={i} style={ROW}>
                <XDSVStack gap={0}>
                  <XDSText type="body" weight="bold">
                    {p.name}
                  </XDSText>
                  <XDSText type="supporting" color="secondary">
                    {p.date}
                  </XDSText>
                </XDSVStack>
                <XDSText type="body" weight="bold">
                  {p.amt}
                </XDSText>
              </div>
            ))}
          </XDSVStack>
        </XDSCard>
      </div>

      {/* Syncing Accounts */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            content={
              <XDSLayoutContent>
                <XDSHStack gap={3} vAlign="center">
                  <XDSSpinner size="sm" />
                  <XDSVStack gap={1}>
                    <XDSHeading level={3}>Syncing your accounts</XDSHeading>
                    <XDSText type="supporting" color="secondary">
                      We&apos;re pulling in your latest transactions. This
                      usually takes a few seconds.
                    </XDSText>
                  </XDSVStack>
                </XDSHStack>
              </XDSLayoutContent>
            }
            footer={
              <XDSLayoutFooter>
                <XDSButton label="Cancel" variant="ghost" style={FULL_W} />
              </XDSLayoutFooter>
            }
          />
        </XDSCard>
      </div>

      {/* Notifications */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSLayout
            height="auto"
            header={
              <XDSLayoutHeader>
                <XDSVStack gap={1}>
                  <XDSHeading level={3}>Notifications</XDSHeading>
                  <XDSText type="supporting" color="secondary">
                    Choose what you want to be notified about.
                  </XDSText>
                </XDSVStack>
              </XDSLayoutHeader>
            }
            content={
              <XDSLayoutContent>
                <XDSVStack gap={4}>
                  <XDSCheckboxInput
                    label="Transaction alerts"
                    value={true}
                    onChange={() => {}}
                  />
                  <XDSText type="supporting" color="secondary">
                    Deposits, withdrawals, and transfers.
                  </XDSText>
                  <XDSCheckboxInput
                    label="Security alerts"
                    value={false}
                    onChange={() => {}}
                  />
                  <XDSText type="supporting" color="secondary">
                    Login attempts and account changes.
                  </XDSText>
                  <XDSCheckboxInput
                    label="Goal milestones"
                    value={false}
                    onChange={() => {}}
                  />
                  <XDSText type="supporting" color="secondary">
                    Updates at 25%, 50%, 75%, and 100%.
                  </XDSText>
                </XDSVStack>
              </XDSLayoutContent>
            }
            footer={
              <XDSLayoutFooter>
                <XDSButton
                  label="Save Preferences"
                  variant="primary"
                  style={FULL_W}
                />
              </XDSLayoutFooter>
            }
          />
        </XDSCard>
      </div>

      {/* Dollar-Cost Averaging */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSVStack gap={3}>
            <XDSHeading level={3}>Dollar-Cost Averaging</XDSHeading>
            <XDSText type="supporting" color="secondary">
              A strategy for building wealth over time.
            </XDSText>
            <XDSText type="body" color="secondary">
              Over time, this smooths out the average cost of your investments.
              When prices drop, your fixed amount buys more shares. When prices
              rise, you buy fewer.
            </XDSText>
          </XDSVStack>
        </XDSCard>
      </div>

      {/* Buttons & Overlays */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSVStack gap={4}>
            <XDSHeading level={3}>Buttons & Overlays</XDSHeading>
            <XDSHStack gap={2} wrap="wrap">
              <XDSButton label="Primary" variant="primary" onClick={() => {}} />
              <XDSButton
                label="Secondary"
                variant="secondary"
                onClick={() => {}}
              />
              <XDSButton label="Ghost" variant="ghost" onClick={() => {}} />
              <XDSDropdownMenu
                button={{label: 'Dropdown', variant: 'secondary'}}
                items={[
                  {label: 'Edit', onClick: () => {}},
                  {label: 'Duplicate', onClick: () => {}},
                  {type: 'divider' as const},
                  {label: 'Delete', onClick: () => {}},
                ]}
              />
            </XDSHStack>
            <XDSDivider variant="strong" />
            <XDSHStack gap={2} vAlign="center" wrap="wrap">
              <XDSPopover
                content={<PopoverSettingsContent />}
                placement="below">
                <XDSButton label="Popover" variant="secondary" size="sm" />
              </XDSPopover>
              <XDSHoverCard
                content={
                  <XDSVStack gap={1} style={{padding: 12, maxWidth: 240}}>
                    <XDSText type="label" display="block">
                      HoverCard
                    </XDSText>
                    <XDSText type="supporting" color="secondary">
                      Hover to trigger.
                    </XDSText>
                  </XDSVStack>
                }
                placement="below">
                <XDSButton
                  label="HoverCard"
                  variant="secondary"
                  size="sm"
                  onClick={() => {}}
                />
              </XDSHoverCard>
              <XDSTooltip content="Tooltip preview">
                <XDSButton
                  label="Tooltip"
                  variant="secondary"
                  size="sm"
                  onClick={() => {}}
                />
              </XDSTooltip>
            </XDSHStack>
          </XDSVStack>
        </XDSCard>
      </div>

      {/* Form Controls */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSVStack gap={4}>
            <XDSHeading level={3}>Form Controls</XDSHeading>
            <XDSHStack gap={4} wrap="wrap">
              <XDSSwitch
                label="Switch A"
                value={switch1}
                onChange={setSwitch1}
              />
              <XDSSwitch
                label="Switch B"
                value={switch2}
                onChange={setSwitch2}
              />
              <XDSCheckboxInput
                label="Check A"
                value={check1}
                onChange={setCheck1}
              />
              <XDSCheckboxInput
                label="Check B"
                value={check2}
                onChange={setCheck2}
              />
            </XDSHStack>
            <XDSDivider variant="strong" />
            <XDSHStack gap={4} vAlign="end">
              <div style={{flex: 1, maxWidth: 200}}>
                <XDSSlider
                  label="Volume"
                  value={sliderValue}
                  onChange={setSliderValue}
                  min={0}
                  max={100}
                />
              </div>
              <div style={{maxWidth: 160}}>
                <XDSSelector
                  label="Fruit"
                  options={['Apple', 'Banana', 'Orange', 'Mango']}
                  value={selectorValue}
                  onChange={setSelectorValue}
                />
              </div>
            </XDSHStack>
          </XDSVStack>
        </XDSCard>
      </div>

      {/* Loading & Status */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSVStack gap={4}>
            <XDSHeading level={3}>Loading & Status</XDSHeading>
            <XDSHStack gap={4} vAlign="center">
              <XDSSpinner size="sm" />
              <XDSSpinner size="md" />
              <XDSSpinner size="lg" />
            </XDSHStack>
            <XDSDivider variant="strong" />
            <XDSVStack gap={2}>
              <XDSHStack gap={3} vAlign="center">
                <XDSSkeleton
                  width={40}
                  height={40}
                  radius="rounded"
                  index={0}
                />
                <XDSVStack gap={1} style={{flex: 1}}>
                  <XDSSkeleton width={160} height={14} index={1} />
                  <XDSSkeleton width={100} height={10} index={2} />
                </XDSVStack>
              </XDSHStack>
              <XDSSkeleton width="100%" height={12} index={3} />
              <XDSSkeleton width="80%" height={12} index={4} />
            </XDSVStack>
            <XDSDivider variant="strong" />
            <XDSVStack gap={3}>
              <XDSProgressBar
                value={progressValue}
                label={`${progressValue}%`}
              />
              <XDSHStack gap={2}>
                {[0, 25, 50, 75, 100].map(v => (
                  <XDSButton
                    key={v}
                    label={`${v}%`}
                    variant="ghost"
                    size="sm"
                    onClick={() => setProgressValue(v)}
                  />
                ))}
              </XDSHStack>
            </XDSVStack>
            <XDSDivider variant="strong" />
            <XDSHStack gap={4} vAlign="center">
              <XDSHStack gap={2} vAlign="center">
                <XDSStatusDot variant="positive" label="Online" isPulsing />
                <XDSText type="body">Online</XDSText>
              </XDSHStack>
              <XDSHStack gap={2} vAlign="center">
                <XDSStatusDot variant="warning" label="Away" isPulsing />
                <XDSText type="body">Away</XDSText>
              </XDSHStack>
              <XDSHStack gap={2} vAlign="center">
                <XDSStatusDot variant="negative" label="Busy" isPulsing />
                <XDSText type="body">Busy</XDSText>
              </XDSHStack>
            </XDSHStack>
          </XDSVStack>
        </XDSCard>
      </div>

      {/* Surface Interactions */}
      <div style={CARD_WRAP}>
        <XDSCard>
          <XDSVStack gap={4}>
            <XDSHeading level={3}>Surface Interactions</XDSHeading>
            <XDSTabList value={interactionsTab} onChange={setInteractionsTab}>
              <XDSTab value="overview" label="Overview" />
              <XDSTab value="analytics" label="Analytics" />
              <XDSTab value="reports" label="Reports" />
              <XDSTab value="settings" label="Settings" />
            </XDSTabList>
            <XDSDivider variant="strong" />
            <XDSList density="balanced">
              <XDSListItem
                label="Dashboard"
                description="View your metrics"
                onClick={() => {}}
              />
              <XDSListItem
                label="Projects"
                description="Manage active projects"
                onClick={() => {}}
              />
              <XDSListItem
                label="Settings"
                description="Configure preferences"
                onClick={() => {}}
              />
            </XDSList>
          </XDSVStack>
        </XDSCard>
      </div>
    </div>
  );
}

function LandingPagePreview() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '48px'}}>
      <div style={{textAlign: 'center', padding: '48px 24px'}}>
        <XDSBadge variant="info" label="New Release" />
        <XDSHeading level={1} style={{marginTop: 16, marginBottom: 12}}>
          Ship faster with XDS
        </XDSHeading>
        <XDSText
          type="large"
          color="secondary"
          display="block"
          style={{
            marginBottom: 24,
            maxWidth: 520,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
          A design system for building internal tools. Open internals, plugin
          architecture, and automatic spacing.
        </XDSText>
        <div style={{display: 'flex', gap: '8px', justifyContent: 'center'}}>
          <XDSButton label="Get Started" />
          <XDSButton label="Documentation" variant="secondary" />
        </div>
      </div>
      <XDSDivider variant="strong" />
      <div>
        <XDSHeading level={2} style={{marginBottom: 16}}>
          Features
        </XDSHeading>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
          }}>
          {[
            {
              title: 'Open Internals',
              desc: 'All primitives exported and composable. No black boxes.',
            },
            {
              title: 'Plugin Architecture',
              desc: 'Transform and extend components through a unified plugin system.',
            },
            {
              title: 'AI-Ready',
              desc: 'JSDoc annotations with composition hints for LLM-assisted development.',
            },
          ].map(f => (
            <XDSCard key={f.title} padding={3}>
              <XDSHeading level={3} style={{marginBottom: 8}}>
                {f.title}
              </XDSHeading>
              <XDSText type="body" color="secondary">
                {f.desc}
              </XDSText>
            </XDSCard>
          ))}
        </div>
      </div>
      <XDSCard padding={4}>
        <XDSText type="large" display="block" style={{marginBottom: 12}}>
          &ldquo;XDS cut our dev time in half. The type scale system alone saved
          us weeks of bikeshedding.&rdquo;
        </XDSText>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <XDSAvatar name="Alex Chen" size="small" />
          <div>
            <XDSText type="label">Alex Chen</XDSText>
            <XDSText type="supporting" color="secondary">
              {' '}
              · Engineering Lead
            </XDSText>
          </div>
        </div>
      </XDSCard>
      <div style={{textAlign: 'center', padding: '32px 0'}}>
        <XDSHeading level={2} style={{marginBottom: 8}}>
          Ready to build?
        </XDSHeading>
        <XDSText
          type="body"
          color="secondary"
          display="block"
          style={{marginBottom: 16}}>
          Get started with XDS in under 5 minutes.
        </XDSText>
        <XDSButton label="Start Building" />
      </div>
    </div>
  );
}

interface MetricRow extends Record<string, unknown> {
  metric: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'flat';
}

const dashboardColumns: XDSTableColumn<MetricRow>[] = [
  {key: 'metric', header: 'Metric'},
  {key: 'value', header: 'Value'},
  {key: 'change', header: 'Change'},
];

function DashboardPreview() {
  const [tab, setTab] = React.useState('overview');
  const metrics: MetricRow[] = [
    {metric: 'Total Users', value: '12,847', change: '+12.3%', trend: 'up'},
    {metric: 'Active Sessions', value: '3,421', change: '+8.1%', trend: 'up'},
    {
      metric: 'Avg Response Time',
      value: '142ms',
      change: '-5.2%',
      trend: 'down',
    },
    {metric: 'Error Rate', value: '0.03%', change: '-18.7%', trend: 'down'},
    {metric: 'API Calls (24h)', value: '2.4M', change: '+3.1%', trend: 'up'},
    {metric: 'Storage Used', value: '847 GB', change: '+1.2%', trend: 'flat'},
  ];

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <div>
          <XDSHeading level={1}>Dashboard</XDSHeading>
          <XDSText type="supporting" color="secondary">
            Last updated 2 minutes ago
          </XDSText>
        </div>
        <div style={{display: 'flex', gap: '8px'}}>
          <XDSButton label="Export" variant="secondary" size="sm" />
          <XDSButton label="Refresh" size="sm" />
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
        }}>
        {[
          {label: 'Revenue', value: '$48.2K', delta: '+12%'},
          {label: 'Users', value: '12,847', delta: '+8%'},
          {label: 'Uptime', value: '99.97%', delta: '—'},
          {label: 'NPS', value: '72', delta: '+3'},
        ].map(kpi => (
          <XDSCard key={kpi.label} padding={3}>
            <XDSText type="supporting" color="secondary" display="block">
              {kpi.label}
            </XDSText>
            <XDSHeading level={2} style={{marginTop: 4}}>
              {kpi.value}
            </XDSHeading>
            <XDSText
              type="supporting"
              color={kpi.delta.startsWith('+') ? 'active' : 'secondary'}>
              {kpi.delta}
            </XDSText>
          </XDSCard>
        ))}
      </div>
      <div>
        <XDSTabList value={tab} onChange={setTab}>
          <XDSTab value="overview" label="Overview" />
          <XDSTab value="performance" label="Performance" />
          <XDSTab value="errors" label="Errors" />
        </XDSTabList>
        <div style={{marginTop: '16px'}}>
          <XDSTable
            columns={dashboardColumns}
            data={metrics}
            density="compact"
          />
        </div>
      </div>
      <XDSBanner
        status="info"
        title="System Update"
        description="A new version of the API is available. Review the changelog for breaking changes."
        endContent={
          <XDSButton label="View Changelog" variant="secondary" size="sm" />
        }
      />
      <div
        style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px'}}>
        <XDSCard padding={3}>
          <XDSHeading level={3} style={{marginBottom: 12}}>
            Recent Activity
          </XDSHeading>
          {[
            {
              user: 'Sarah K.',
              action: 'deployed v2.4.1 to production',
              time: '5 min ago',
            },
            {
              user: 'Mike R.',
              action: 'merged PR #247: fix auth flow',
              time: '23 min ago',
            },
            {
              user: 'Cindy Z.',
              action: 'created issue #312: token audit',
              time: '1 hr ago',
            },
            {
              user: 'Alex C.',
              action: 'updated dashboard metrics query',
              time: '2 hr ago',
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 0',
                borderBottom: i < 3 ? '1px solid var(--color-divider)' : 'none',
              }}>
              <XDSAvatar name={item.user} size="small" />
              <div style={{flex: 1}}>
                <XDSText type="label">{item.user}</XDSText>
                <XDSText type="body" color="secondary">
                  {' '}
                  {item.action}
                </XDSText>
              </div>
              <XDSText type="supporting" color="secondary">
                {item.time}
              </XDSText>
            </div>
          ))}
        </XDSCard>
        <XDSCard padding={3}>
          <XDSHeading level={3} style={{marginBottom: 12}}>
            Quick Stats
          </XDSHeading>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {[
              {label: 'CPU Usage', value: 43},
              {label: 'Memory', value: 67},
              {label: 'Storage', value: 82},
            ].map(stat => (
              <div key={stat.label}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}>
                  <XDSText type="supporting">{stat.label}</XDSText>
                  <XDSText type="supporting" color="secondary">
                    {stat.value}%
                  </XDSText>
                </div>
                <XDSProgressBar
                  value={stat.value}
                  label={stat.label}
                  isLabelHidden
                />
              </div>
            ))}
          </div>
        </XDSCard>
      </div>
    </div>
  );
}

// Minimal motion preview sub-components — kept compact since the full
// MotionPreview table page provides the richest test surface.

function PopoverSettingsContent() {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [sounds, setSounds] = React.useState(true);

  return (
    <XDSVStack gap={3} style={{width: 240}}>
      <XDSText type="label" display="block">
        Settings
      </XDSText>
      <XDSDivider variant="strong" />
      <XDSSwitch
        label="Notifications"
        description="Receive push notifications"
        value={notifications}
        onChange={setNotifications}
      />
      <XDSSwitch
        label="Dark mode"
        description="Use dark color theme"
        value={darkMode}
        onChange={setDarkMode}
      />
      <XDSSwitch
        label="Sounds"
        description="Play sounds for actions"
        value={sounds}
        onChange={setSounds}
      />
    </XDSVStack>
  );
}

function MicroInteractionsPreview() {
  const [switch1, setSwitch1] = React.useState(false);
  const [switch2, setSwitch2] = React.useState(true);
  const [check1, setCheck1] = React.useState(false);
  const [check2, setCheck2] = React.useState(true);
  const [sliderValue, setSliderValue] = React.useState(50);
  const [selectorValue, setSelectorValue] = React.useState('Apple');

  return (
    <XDSCard>
      <XDSVStack gap={4}>
        <XDSText type="label" display="block">
          Micro-Interactions
        </XDSText>
        <div>
          <XDSText type="supporting" color="secondary" display="block">
            Buttons — hover, press, focus
          </XDSText>
          <XDSHStack gap={2} style={{marginTop: 8}}>
            <XDSButton label="Primary" variant="primary" onClick={() => {}} />
            <XDSButton
              label="Secondary"
              variant="secondary"
              onClick={() => {}}
            />
            <XDSButton label="Ghost" variant="ghost" onClick={() => {}} />
            <XDSDropdownMenu
              button={{label: 'Dropdown', variant: 'secondary'}}
              items={[
                {label: 'Edit', onClick: () => {}},
                {label: 'Duplicate', onClick: () => {}},
                {type: 'divider' as const},
                {label: 'Delete', onClick: () => {}},
              ]}
            />
          </XDSHStack>
        </div>
        <XDSDivider variant="strong" />
        <div>
          <XDSText type="supporting" color="secondary" display="block">
            Popover / HoverCard / Tooltip
          </XDSText>
          <XDSHStack
            gap={2}
            vAlign="center"
            style={{marginTop: 8, flexWrap: 'wrap'}}>
            <XDSPopover content={<PopoverSettingsContent />} placement="below">
              <XDSButton label="Popover" variant="secondary" size="sm" />
            </XDSPopover>
            <XDSHoverCard
              content={
                <div style={{padding: 12, maxWidth: 240}}>
                  <XDSText
                    type="label"
                    display="block"
                    style={{marginBottom: 4}}>
                    HoverCard
                  </XDSText>
                  <XDSText type="supporting" color="secondary">
                    Hover to trigger.
                  </XDSText>
                </div>
              }
              placement="below">
              <XDSButton
                label="HoverCard"
                variant="secondary"
                size="sm"
                onClick={() => {}}
              />
            </XDSHoverCard>
            <XDSTooltip content="Tooltip preview">
              <XDSButton
                label="Tooltip"
                variant="secondary"
                size="sm"
                onClick={() => {}}
              />
            </XDSTooltip>
          </XDSHStack>
        </div>
        <XDSDivider variant="strong" />
        <div>
          <XDSText type="supporting" color="secondary" display="block">
            Switches & Checkboxes
          </XDSText>
          <XDSHStack gap={4} style={{marginTop: 8}}>
            <XDSSwitch label="Switch 1" value={switch1} onChange={setSwitch1} />
            <XDSSwitch label="Switch 2" value={switch2} onChange={setSwitch2} />
            <XDSCheckboxInput
              label="Check A"
              value={check1}
              onChange={setCheck1}
            />
            <XDSCheckboxInput
              label="Check B"
              value={check2}
              onChange={setCheck2}
            />
          </XDSHStack>
        </div>
        <XDSDivider variant="strong" />
        <div>
          <XDSText type="supporting" color="secondary" display="block">
            Slider & Selector
          </XDSText>
          <XDSHStack gap={4} vAlign="end" style={{marginTop: 8}}>
            <div style={{flex: 1, maxWidth: 200}}>
              <XDSSlider
                label="Volume"
                value={sliderValue}
                onChange={setSliderValue}
                min={0}
                max={100}
              />
            </div>
            <div style={{maxWidth: 160}}>
              <XDSSelector
                label="Fruit"
                options={['Apple', 'Banana', 'Orange', 'Mango']}
                value={selectorValue}
                onChange={setSelectorValue}
              />
            </div>
          </XDSHStack>
        </div>
      </XDSVStack>
    </XDSCard>
  );
}

function LoadingStatusPreview() {
  const [progressValue, setProgressValue] = React.useState(65);
  return (
    <XDSCard>
      <XDSVStack gap={4}>
        <XDSText type="label" display="block">
          Loading & Status
        </XDSText>
        <XDSHStack gap={4} vAlign="center">
          <XDSSpinner size="sm" />
          <XDSSpinner size="md" />
          <XDSSpinner size="lg" />
        </XDSHStack>
        <XDSDivider variant="strong" />
        <XDSVStack gap={2}>
          <XDSHStack gap={3} vAlign="center">
            <XDSSkeleton width={40} height={40} radius="rounded" index={0} />
            <XDSVStack gap={1} style={{flex: 1}}>
              <XDSSkeleton width={160} height={14} index={1} />
              <XDSSkeleton width={100} height={10} index={2} />
            </XDSVStack>
          </XDSHStack>
          <XDSSkeleton width="100%" height={12} index={3} />
          <XDSSkeleton width="80%" height={12} index={4} />
        </XDSVStack>
        <XDSDivider variant="strong" />
        <XDSVStack gap={3}>
          <XDSProgressBar value={progressValue} label={`${progressValue}%`} />
          <XDSHStack gap={2}>
            {[0, 25, 50, 75, 100].map(v => (
              <XDSButton
                key={v}
                label={`${v}%`}
                variant="ghost"
                size="sm"
                onClick={() => setProgressValue(v)}
              />
            ))}
          </XDSHStack>
        </XDSVStack>
        <XDSDivider variant="strong" />
        <XDSHStack gap={4} vAlign="center">
          <XDSHStack gap={2} vAlign="center">
            <XDSStatusDot variant="positive" label="Online" isPulsing />
            <XDSText type="body">Online</XDSText>
          </XDSHStack>
          <XDSHStack gap={2} vAlign="center">
            <XDSStatusDot variant="warning" label="Away" isPulsing />
            <XDSText type="body">Away</XDSText>
          </XDSHStack>
          <XDSHStack gap={2} vAlign="center">
            <XDSStatusDot variant="negative" label="Busy" isPulsing />
            <XDSText type="body">Busy</XDSText>
          </XDSHStack>
        </XDSHStack>
      </XDSVStack>
    </XDSCard>
  );
}

function SurfaceInteractionsPreview() {
  const [activeTab, setActiveTab] = React.useState('overview');
  return (
    <XDSCard>
      <XDSVStack gap={4}>
        <XDSText type="label" display="block">
          Surface Interactions
        </XDSText>
        <XDSTabList value={activeTab} onChange={setActiveTab}>
          <XDSTab value="overview" label="Overview" />
          <XDSTab value="analytics" label="Analytics" />
          <XDSTab value="reports" label="Reports" />
          <XDSTab value="settings" label="Settings" />
        </XDSTabList>
        <XDSDivider variant="strong" />
        <XDSList density="balanced">
          <XDSListItem
            label="Dashboard"
            description="View your metrics"
            onClick={() => {}}
          />
          <XDSListItem
            label="Projects"
            description="Manage active projects"
            onClick={() => {}}
          />
          <XDSListItem
            label="Settings"
            description="Configure preferences"
            onClick={() => {}}
          />
        </XDSList>
      </XDSVStack>
    </XDSCard>
  );
}

function MotionPreview() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [overlayOpen, setOverlayOpen] = React.useState(false);
  const [pushOpen, setPushOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(1200);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [filters, setFilters] = React.useState<PowerSearchFilter[]>([]);
  const fieldDefs = [
    {key: 'name', type: 'string', label: 'Name'},
    {key: 'email', type: 'string', label: 'Email'},
    {
      key: 'role',
      type: 'enum',
      label: 'Role',
      enumValues: [
        {value: 'engineer', label: 'Engineer'},
        {value: 'designer', label: 'Designer'},
        {value: 'pm', label: 'PM'},
      ],
    },
  ] as const;
  const {config, applyFilters} = usePowerSearchConfig(fieldDefs, 'Users');

  const allUsers = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'engineer',
    },
    {id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'designer'},
    {id: '3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'pm'},
    {
      id: '4',
      name: 'Diana Prince',
      email: 'diana@example.com',
      role: 'engineer',
    },
    {id: '5', name: 'Eve Davis', email: 'eve@example.com', role: 'designer'},
  ];
  const filteredUsers = applyFilters(filters, allUsers);
  const roleLabels: Record<string, string> = {
    Engineer: 'Engineer',
    Designer: 'Designer',
    PM: 'PM',
    engineer: 'Engineer',
    designer: 'Designer',
    pm: 'PM',
  };

  const tableColumns: XDSTableColumn<(typeof allUsers)[0]>[] = [
    {key: 'name', header: 'Name', width: proportional(2)},
    ...(containerWidth > 975
      ? [{key: 'email' as const, header: 'Email', width: proportional(2)}]
      : []),
    {
      key: 'role',
      header: 'Role',
      width: pixel(120),
      renderCell: (user: (typeof allUsers)[0]) =>
        roleLabels[user.role] ?? user.role,
    },
  ];

  const dur = {
    medMin: 'var(--duration-medium-min)',
    med: 'var(--duration-medium)',
  };
  const ease = 'var(--ease-standard)';
  const motionSlideIn = `${dur.med} ${ease}`;
  const motionSlideOut = `${dur.medMin} ${ease}`;

  return (
    <div
      ref={containerRef}
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        overflow: 'hidden',
        height: '630px',
        position: 'relative',
        fontFamily: 'var(--font-family-body)',
        fontSize: 'var(--font-size-base)',
        lineHeight: 'var(--leading-base)',
        color: 'var(--color-text-primary)',
      }}>
      <XDSAppShell
        height="fill"
        style={{height: '100%'}}
        variant="section"
        contentPadding={0}
        sideNav={
          <XDSSideNav
            collapsible={{
              isCollapsed: sidebarCollapsed,
              onCollapsedChange: setSidebarCollapsed,
              hasButton: false,
            }}
            header={
              <XDSSideNavHeading
                icon={
                  <XDSNavIcon
                    icon={<CubeIcon style={{width: 16, height: 16}} />}
                  />
                }
                heading="My App"
                headingHref="/"
              />
            }
            footerIcons={<XDSSideNavCollapseButton />}>
            <XDSSideNavSection title="Main">
              <XDSSideNavItem
                label="Dashboard"
                icon={HomeIcon}
                selectedIcon={HomeIconSolid}
                isSelected
                onClick={() => {}}
              />
              <XDSSideNavItem
                label="Projects"
                icon={FolderIcon}
                selectedIcon={FolderIconSolid}
                onClick={() => {}}
                endContent={<XDSBadge label="3" />}
              />
              <XDSSideNavItem
                label="Analytics"
                icon={ChartBarIcon}
                onClick={() => {}}
              />
              <XDSSideNavItem
                label="Team"
                icon={UserGroupIcon}
                onClick={() => {}}
              />
            </XDSSideNavSection>
            <XDSSideNavSection title="Documents">
              <XDSSideNavItem
                label="All Documents"
                icon={DocumentTextIcon}
                onClick={() => {}}
              />
            </XDSSideNavSection>
          </XDSSideNav>
        }>
        <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
          <div
            style={{
              padding: '12px var(--spacing-3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              borderBottom: '1px solid var(--color-border)',
            }}>
            <XDSHeading level={2}>Users</XDSHeading>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <div style={{flex: 1}}>
                <XDSPowerSearch
                  config={config}
                  filters={filters}
                  onChange={newFilters => setFilters([...newFilters])}
                  placeholder="Search..."
                  label="Filter users"
                  resultCount={filteredUsers.length}
                />
              </div>
              <XDSHStack gap={1}>
                <XDSButton
                  label="Modal"
                  variant="secondary"
                  onClick={() => setModalOpen(true)}
                />
                <XDSButton
                  label="Overlay"
                  variant={overlayOpen ? 'primary' : 'secondary'}
                  onClick={() => setOverlayOpen(!overlayOpen)}
                />
                <XDSButton
                  label="Push"
                  variant="secondary"
                  onClick={() => setPushOpen(!pushOpen)}
                />
              </XDSHStack>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flex: 1,
              overflow: 'hidden',
              position: 'relative',
            }}>
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                minWidth: 0,
                cursor: 'pointer',
              }}
              onClick={e => {
                const row = (e.target as HTMLElement).closest('tr');
                if (
                  !row ||
                  !row.parentElement ||
                  row.parentElement.tagName === 'THEAD'
                )
                  return;
                const index = Array.from(row.parentElement.children).indexOf(
                  row,
                );
                const user = filteredUsers[index];
                if (user) {
                  setSelectedUser(user);
                  setPushOpen(true);
                }
              }}>
              <XDSTable
                data={filteredUsers}
                columns={tableColumns}
                hasHover
                idKey="id"
              />
            </div>
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: '40%',
                maxWidth: '480px',
                borderLeft: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-background-surface)',
                transform: overlayOpen ? 'translateX(0)' : 'translateX(100%)',
                opacity: overlayOpen ? 1 : 0,
                transition: overlayOpen
                  ? `transform ${motionSlideIn}, opacity ${motionSlideIn}`
                  : `transform ${motionSlideOut}, opacity ${motionSlideOut}`,
                display: 'flex',
                flexDirection: 'column',
                zIndex: 5,
              }}>
              <div
                style={{
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <XDSText type="label">Details</XDSText>
                <XDSButton
                  label="Close"
                  icon={<XMarkIcon style={{width: 16, height: 16}} />}
                  variant="ghost"
                  size="sm"
                  onClick={() => setOverlayOpen(false)}
                  isIconOnly
                />
              </div>
            </div>
            <div
              style={{
                flexShrink: 0,
                width: pushOpen ? '40%' : '0px',
                maxWidth: pushOpen ? '480px' : '0px',
                overflow: 'hidden',
                borderLeft: pushOpen ? '1px solid var(--color-border)' : 'none',
                backgroundColor: 'var(--color-background-surface)',
                opacity: pushOpen ? 1 : 0,
                transition: pushOpen
                  ? `width ${motionSlideIn}, max-width ${motionSlideIn}, opacity ${motionSlideIn}`
                  : `width ${motionSlideOut}, max-width ${motionSlideOut}, opacity ${motionSlideOut}`,
                display: 'flex',
                flexDirection: 'column',
              }}>
              <div
                style={{
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  whiteSpace: 'nowrap',
                }}>
                <XDSText type="label">
                  {selectedUser?.name ?? 'Details'}
                </XDSText>
                <XDSButton
                  label="Close"
                  icon={<XMarkIcon style={{width: 16, height: 16}} />}
                  variant="ghost"
                  size="sm"
                  onClick={() => setPushOpen(false)}
                  isIconOnly
                />
              </div>
              {selectedUser && (
                <div
                  style={{padding: 'var(--spacing-3)', whiteSpace: 'nowrap'}}>
                  <XDSVStack gap={2}>
                    <div>
                      <XDSText
                        type="supporting"
                        color="secondary"
                        display="block">
                        Email
                      </XDSText>
                      <XDSText type="body">{selectedUser.email}</XDSText>
                    </div>
                    <div>
                      <XDSText
                        type="supporting"
                        color="secondary"
                        display="block">
                        Role
                      </XDSText>
                      <XDSText type="body">
                        {roleLabels[selectedUser.role] ?? selectedUser.role}
                      </XDSText>
                    </div>
                  </XDSVStack>
                </div>
              )}
            </div>
          </div>
        </div>
      </XDSAppShell>
      <XDSDialog isOpen={modalOpen} onOpenChange={setModalOpen}>
        <div style={{padding: 'var(--spacing-3)', flex: 1}}>
          <XDSText type="body" color="secondary">
            Modal dialog with directional entry animation.
          </XDSText>
        </div>
        <div
          style={{
            padding: 'var(--spacing-2) var(--spacing-3)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--spacing-2)',
          }}>
          <XDSButton
            label="Cancel"
            variant="secondary"
            onClick={() => setModalOpen(false)}
          />
          <XDSButton
            label="Confirm"
            variant="primary"
            onClick={() => setModalOpen(false)}
          />
        </div>
      </XDSDialog>
    </div>
  );
}

// =============================================================================
// Token Scale Preview
// =============================================================================

const SECTION_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const SECTION_TITLE: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#888',
};

const SCALE_ROW: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 200px 200px',
  alignItems: 'center',
  gap: 8,
};

const CODE_LABEL: React.CSSProperties = {
  fontSize: 12,
  fontFamily: 'monospace',
  color: '#888',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

function TokenScalePreview({tokens}: {tokens: Record<string, string>}) {
  const resolveSize = (raw: string) => {
    if (!raw) return raw;
    const resolved = raw.startsWith('var(')
      ? tokens[raw.slice(4, -1)] || raw
      : raw;
    return resolved;
  };
  const toPx = (raw: string) => {
    const resolved = resolveSize(raw);
    if (resolved.endsWith('rem'))
      return `${Math.round(parseFloat(resolved) * 16)}px`;
    return resolved;
  };

  const colorsSection = (
    <div style={SECTION_STYLE}>
      <span style={SECTION_TITLE}>Colors</span>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        {[
          {token: '--color-accent', label: 'accent'},
          {token: '--color-accent-muted', label: 'accent-muted'},
          {token: '--color-neutral', label: 'neutral'},
          {token: '--color-background-card', label: 'card'},
          {token: '--color-background-surface', label: 'surface'},
          {token: '--color-text-primary', label: 'text'},
          {token: '--color-text-secondary', label: 'text-secondary'},
          {token: '--color-border', label: 'border'},
        ].map(({token, label}) => {
          const raw = tokens[token] || '';
          const parsed = parseLightDark(raw);
          const displayVal = parsed ? parsed.light : raw;
          return (
            <div key={token} style={SCALE_ROW}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  backgroundColor: `var(${token})`,
                  border: '1px solid #ddd',
                  flexShrink: 0,
                }}
              />
              <span style={CODE_LABEL}>{label}</span>
              <span style={CODE_LABEL}>{displayVal}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const typographySection = (
    <div style={SECTION_STYLE}>
      <span style={SECTION_TITLE}>Typography</span>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        {(['display-1', 'display-2', 'display-3'] as const).map(type => (
          <div key={type} style={SCALE_ROW}>
            <div style={{overflow: 'hidden'}}>
              <XDSText type={type} maxLines={1}>
                Display
              </XDSText>
            </div>
            <span style={CODE_LABEL}>{type}</span>
            <span style={CODE_LABEL}>
              {toPx(tokens[`--text-${type}-size`] || '')}
            </span>
          </div>
        ))}
        {([1, 2, 3, 4] as const).map(level => (
          <div key={level} style={SCALE_ROW}>
            <div style={{overflow: 'hidden'}}>
              <XDSHeading level={level} maxLines={1}>
                Heading {level}
              </XDSHeading>
            </div>
            <span style={CODE_LABEL}>h{level}</span>
            <span style={CODE_LABEL}>
              {toPx(tokens[`--text-heading-${level}-size`] || '')}
            </span>
          </div>
        ))}
        {(['large', 'body', 'label', 'supporting', 'code'] as const).map(
          type => (
            <div key={type} style={SCALE_ROW}>
              <div style={{overflow: 'hidden'}}>
                <XDSText type={type} maxLines={1}>
                  {type === 'code'
                    ? 'const theme = defineTheme()'
                    : 'The quick brown fox'}
                </XDSText>
              </div>
              <span style={CODE_LABEL}>{type}</span>
              <span style={CODE_LABEL}>
                {toPx(tokens[`--text-${type}-size`] || '')}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );

  const spacingSection = (
    <div style={SECTION_STYLE}>
      <span style={SECTION_TITLE}>Spacing</span>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        {[0.5, 1, 2, 3, 4, 6, 8, 12].map(step => {
          const key = String(step).replace('.', '-');
          const val = tokens[`--spacing-${key}`] || '0px';
          return (
            <div key={step} style={SCALE_ROW}>
              <div style={{display: 'flex', alignItems: 'center'}}>
                <div
                  style={{
                    width: val,
                    height: val,
                    backgroundColor: 'var(--color-accent-muted)',
                    border: '1px dashed var(--color-accent)',
                    transition: 'width 200ms ease, height 200ms ease',
                  }}
                />
              </div>
              <span style={CODE_LABEL}>{step}</span>
              <span style={CODE_LABEL}>{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const radiusSection = (
    <div style={SECTION_STYLE}>
      <span style={SECTION_TITLE}>Corner Radius</span>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        {(['none', 'inner', 'element', 'container', 'page'] as const).map(
          name => {
            const val = tokens[`--radius-${name}`] || '0px';
            return (
              <div key={name} style={SCALE_ROW}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: 'var(--color-accent-muted)',
                    border: '1px dashed var(--color-accent)',
                    borderRadius: val,
                    flexShrink: 0,
                    transition: 'border-radius 200ms ease',
                  }}
                />
                <span style={CODE_LABEL}>{name}</span>
                <span style={CODE_LABEL}>{val}</span>
              </div>
            );
          },
        )}
      </div>
    </div>
  );

  const sizeSection = (
    <div style={SECTION_STYLE}>
      <span style={SECTION_TITLE}>Element Size</span>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        {(['sm', 'md', 'lg'] as const).map(size => {
          const val = tokens[`--size-element-${size}`] || '32px';
          return (
            <div key={size} style={SCALE_ROW}>
              <div
                style={{
                  width: `calc(${val} * 2.4)`,
                  height: val,
                  backgroundColor: 'var(--color-accent-muted)',
                  border: '1px dashed var(--color-accent)',
                  borderRadius: 8,
                  flexShrink: 0,
                  transition: 'width 200ms ease, height 200ms ease',
                }}
              />
              <span style={CODE_LABEL}>{size}</span>
              <span style={CODE_LABEL}>{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{containerType: 'inline-size'}}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 32,
        }}>
        <style>{`@container (min-width: 720px) { .token-scale-grid { grid-template-columns: 1fr auto 1fr !important; } }`}</style>
        <div
          className="token-scale-grid"
          style={{display: 'grid', gridTemplateColumns: '1fr', gap: 32}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 32}}>
            {colorsSection}
            {spacingSection}
            {sizeSection}
          </div>
          <div
            className="token-scale-divider"
            style={{width: 1, backgroundColor: 'var(--color-border)'}}
          />
          <div style={{display: 'flex', flexDirection: 'column', gap: 32}}>
            {typographySection}
            {radiusSection}
          </div>
        </div>
        <style>{`@container (max-width: 719px) { .token-scale-divider { display: none !important; } }`}</style>
      </div>
    </div>
  );
}

// =============================================================================
// Preview Tabs
// =============================================================================

function TemplateIframePreview({
  slug,
  theme,
  mode,
}: {
  slug: string;
  theme: XDSDefinedTheme;
  mode: 'light' | 'dark';
}) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const href =
    templates.find((t: {slug: string; href: string}) => t.slug === slug)
      ?.href ?? `/templates/${slug}/`;

  React.useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const inject = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;
      doc.documentElement.setAttribute('data-xds-theme', theme.name);
      doc.documentElement.setAttribute('data-color-scheme', mode);
      doc.documentElement.style.colorScheme = mode;

      // Hide the PreviewShell toolbar inside the iframe
      const root = doc.body?.firstElementChild as HTMLElement | null;
      if (root) {
        const toolbar = root.firstElementChild as HTMLElement | null;
        if (toolbar) toolbar.style.display = 'none';
      }

      let styleEl = doc.querySelector<HTMLStyleElement>(
        'style[data-xds-editor-theme]',
      );
      if (!styleEl) {
        styleEl = doc.createElement('style');
        styleEl.setAttribute('data-xds-editor-theme', 'true');
        doc.head.appendChild(styleEl);
      }
      styleEl.textContent = generateThemeCSSFlat(theme);
    };
    iframe.addEventListener('load', inject);
    inject();
    return () => iframe.removeEventListener('load', inject);
  }, [theme, mode, slug]);

  return (
    <iframe
      ref={iframeRef}
      src={href}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: 'var(--radius-container)',
      }}
    />
  );
}

function PreviewContent({
  activePreview,
  tokens,
  theme,
  mode,
}: {
  activePreview: string;
  tokens?: Record<string, string>;
  theme?: XDSDefinedTheme;
  mode?: 'light' | 'dark';
}) {
  return (
    <div
      style={
        activePreview.startsWith('template:') ? {height: '100%'} : undefined
      }>
      {activePreview === 'preview' && <ComponentPreview />}
      {activePreview === 'landing' && <LandingPagePreview />}
      {activePreview === 'dashboard' && <DashboardPreview />}
      {activePreview === 'table' && <MotionPreview />}
      {activePreview === 'tokens' && tokens && (
        <TokenScalePreview tokens={tokens} />
      )}
      {activePreview.startsWith('template:') && theme && mode && (
        <TemplateIframePreview
          slug={activePreview.slice(9)}
          theme={theme}
          mode={mode}
        />
      )}
    </div>
  );
}

// =============================================================================
// Code Generator
// =============================================================================

function generateThemeCode(
  themeName: string,
  tokens: Record<string, string>,
  defaults: Record<string, string>,
  typeScaleBase?: number,
  typeScaleRatio?: number,
): string {
  const changedTokens: Record<string, string> = {};
  const hasCustomTypeScale =
    typeScaleBase !== undefined &&
    typeScaleRatio !== undefined &&
    (typeScaleBase !== 14 || typeScaleRatio !== 1.2);
  const typeScaleTokenKeys = new Set(Object.keys(typeScaleDefaults));

  const componentOverrides: Record<
    string,
    Record<string, Record<string, string>>
  > = {};

  for (const [key, value] of Object.entries(tokens)) {
    if (value === defaults[key]) continue;
    if (hasCustomTypeScale && typeScaleTokenKeys.has(key)) continue;
    const mapping = COMPONENT_VAR_TO_OVERRIDE[key];
    if (mapping) {
      const {component, cssProperty} = mapping;
      if (!componentOverrides[component]) componentOverrides[component] = {};
      if (!componentOverrides[component].base)
        componentOverrides[component].base = {};
      componentOverrides[component].base[cssProperty] = value;
    } else {
      changedTokens[key] = value;
    }
  }

  const hasTokenOverrides = Object.keys(changedTokens).length > 0;
  const hasComponentOverrides = Object.keys(componentOverrides).length > 0;

  const setupComment = [
    `// Setup:`,
    `// 1. Save this file as src/theme.ts`,
    `// 2. Import in your app:`,
    `//`,
    `//    import { XDSTheme } from '@xds/core';`,
    `//    import { ${themeName}Theme } from './theme';`,
    `//`,
    `//    <XDSTheme theme={${themeName}Theme}>`,
    `//      <App />`,
    `//    </XDSTheme>`,
  ].join('\n');

  if (!hasTokenOverrides && !hasCustomTypeScale && !hasComponentOverrides) {
    return `import { defineTheme } from '@xds/core/theme';\n\n${setupComment}\n\nexport const ${themeName}Theme = defineTheme({\n  name: '${themeName}',\n  tokens: {},\n});`;
  }

  const parts: string[] = [];
  if (hasCustomTypeScale) {
    parts.push(
      `  typography: { scale: { base: ${typeScaleBase}, ratio: ${typeScaleRatio} } },`,
    );
  }
  if (hasTokenOverrides) {
    const tokenEntries = Object.entries(changedTokens)
      .map(([key, value]) => {
        const parsed = parseLightDark(value);
        if (parsed)
          return `    '${key}': ['${parsed.light}', '${parsed.dark}'],`;
        return `    '${key}': '${value}',`;
      })
      .join('\n');
    parts.push(`  tokens: {\n${tokenEntries}\n  },`);
  } else {
    parts.push(`  tokens: {},`);
  }
  if (hasComponentOverrides) {
    const compEntries = Object.entries(componentOverrides)
      .map(([comp, rules]) => {
        const ruleEntries = Object.entries(rules)
          .map(([ruleKey, props]) => {
            const propEntries = Object.entries(props)
              .map(([prop, val]) => `        ${prop}: '${val}',`)
              .join('\n');
            return `      '${ruleKey}': {\n${propEntries}\n      },`;
          })
          .join('\n');
        return `    '${comp}': {\n${ruleEntries}\n    },`;
      })
      .join('\n');
    parts.push(`  components: {\n${compEntries}\n  },`);
  }

  return `import { defineTheme } from '@xds/core/theme';\n\n${setupComment}\n\nexport const ${themeName}Theme = defineTheme({\n  name: '${themeName}',\n${parts.join('\n')}\n});`;
}

// =============================================================================
// Main ThemeEditorView Component
// =============================================================================

export function ThemeEditorView({
  activeView,
  setActiveView,
  initialImage,
  initialTheme,
  onImageConsumed,
}: {
  activeView: string;
  setActiveView: (
    view: 'craft' | 'explore' | 'docs' | 'profile' | 'theme',
  ) => void;
  initialImage?: string | null;
  initialTheme?: {accent: string; font?: string; radius?: number} | null;
  onImageConsumed?: () => void;
}) {
  // Token editing state
  const [activeGroup, setActiveGroup] = React.useState<TokenGroupKey>('colors');
  const [activeColorCategory, setActiveColorCategory] =
    React.useState<string>('Core Semantic');
  const [activeTypographyCategory, setActiveTypographyCategory] =
    React.useState<string>('Heading 1');
  const [themeName] = React.useState('custom');
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');
  const [showCode, setShowCode] = React.useState(false);
  const [pushPanelOpen, setPushPanelOpen] = React.useState(false);
  const [overlayPanelOpen, setOverlayPanelOpen] = React.useState(false);
  const [activePreview, setActivePreview] = React.useState('preview');

  const isMotionGroup = activeGroup === 'duration' || activeGroup === 'easing';

  const [typeScaleBase, setTypeScaleBase] = React.useState(14);
  const [typeScaleRatio, setTypeScaleRatio] = React.useState(1.2);
  const [panelMode, setPanelMode] = React.useState<'editor' | 'target' | 'raw'>(
    'editor',
  );
  const [targetComponent, setTargetComponent] = React.useState<string | null>(
    null,
  );
  const [collapsedSections, setCollapsedSections] = React.useState<
    Record<string, boolean>
  >({});
  const toggleSection = React.useCallback((id: string) => {
    setCollapsedSections(prev => ({...prev, [id]: !prev[id]}));
  }, []);

  React.useEffect(() => {
    if (panelMode === 'editor') setActivePreview('tokens');
    if (panelMode === 'target') setActivePreview('preview');
  }, [panelMode]);
  const [flashComponent, setFlashComponent] = React.useState<string | null>(
    null,
  );
  const [customVars, setCustomVars] = React.useState<Set<string>>(new Set());
  const previewRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!flashComponent || !previewRef.current) return;
    const container = previewRef.current;
    const selector = `.xds-${flashComponent}`;
    const elements = container.querySelectorAll<HTMLElement>(selector);
    if (elements.length === 0) {
      setFlashComponent(null);
      return;
    }
    elements.forEach(el => el.classList.add('xds-target-flash'));
    const timer = setTimeout(() => {
      elements.forEach(el => el.classList.remove('xds-target-flash'));
      setFlashComponent(null);
    }, 3000);
    return () => {
      clearTimeout(timer);
      elements.forEach(el => el.classList.remove('xds-target-flash'));
    };
  }, [flashComponent]);

  const [radiusBase, setRadiusBase] = React.useState(4);
  const [spacingBase, setSpacingBase] = React.useState(4);
  const [sizeBase, setSizeBase] = React.useState(32);
  const [durationStep, setDurationStep] = React.useState(1);
  const [activePreset, setActivePreset] = React.useState<string | null>(
    'default',
  );
  const [autoPickColors, setAutoPickColors] = React.useState(false);

  const [aiImagePreview, setAiImagePreview] = React.useState<string | null>(
    null,
  );
  const [aiAnalyzing, setAiAnalyzing] = React.useState(false);
  const [aiError, setAiError] = React.useState<string | null>(null);
  const [showGenerate, setShowGenerate] = React.useState(false);
  const [aiToolCalls, setAiToolCalls] = React.useState<XDSChatToolCallItem[]>(
    [],
  );

  const UNIFIED_PRESETS = React.useMemo(
    () => ({
      compact: {
        typeBase: 12,
        typeRatio: 1.125,
        spacing: 2,
        radius: 2,
        sizeMd: 28,
      },
      default: {
        typeBase: 14,
        typeRatio: 1.2,
        spacing: 4,
        radius: 4,
        sizeMd: 32,
      },
      comfortable: {
        typeBase: 16,
        typeRatio: 1.25,
        spacing: 6,
        radius: 6,
        sizeMd: 40,
      },
      gigantic: {
        typeBase: 18,
        typeRatio: 1.414,
        spacing: 8,
        radius: 12,
        sizeMd: 48,
      },
    }),
    [],
  );

  const applyTypeScale = React.useCallback((base: number, ratio: number) => {
    setActivePreset(null);
    setTypeScaleBase(base);
    setTypeScaleRatio(ratio);
    setTokens(prev => ({...prev, ...expandTypeScale({base, ratio})}));
  }, []);

  const applySpacingScale = React.useCallback((base: number) => {
    setActivePreset(null);
    setSpacingBase(base);
    const steps = [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const keys = [
      '0',
      '0-5',
      '1',
      '1-5',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '12',
    ];
    const patch: Record<string, string> = {};
    steps.forEach((step, i) => {
      patch[`--spacing-${keys[i]}`] = `${Math.round(base * step)}px`;
    });
    setTokens(prev => ({...prev, ...patch}));
  }, []);

  const applySizeScale = React.useCallback((base: number) => {
    setActivePreset(null);
    setSizeBase(base);
    setTokens(prev => ({
      ...prev,
      '--size-element-sm': `${base - 4}px`,
      '--size-element-md': `${base}px`,
      '--size-element-lg': `${base + 4}px`,
    }));
  }, []);

  const applyRadiusScale = React.useCallback((base: number) => {
    setActivePreset(null);
    setRadiusBase(base);
    setTokens(prev => ({
      ...prev,
      ...expandRadiusScale({base, multiplier: 1}),
    }));
  }, []);

  const applyDurationScale = React.useCallback((multiplier: number) => {
    setDurationStep(multiplier);
    const defaults = {
      '--duration-fast-min': 130,
      '--duration-fast': 175,
      '--duration-fast-max': 230,
      '--duration-medium-min': 310,
      '--duration-medium': 410,
      '--duration-medium-max': 550,
      '--duration-slow-min': 730,
      '--duration-slow': 975,
      '--duration-slow-max': 1300,
    };
    const patch: Record<string, string> = {};
    for (const [key, base] of Object.entries(defaults)) {
      patch[key] = `${Math.round(base / multiplier)}ms`;
    }
    setTokens(prev => ({...prev, ...patch}));
  }, []);

  const applyUnifiedPreset = React.useCallback(
    (presetKey: string) => {
      const p = UNIFIED_PRESETS[presetKey as keyof typeof UNIFIED_PRESETS];
      if (!p) return;
      setActivePreset(presetKey);
      setTypeScaleBase(p.typeBase);
      setTypeScaleRatio(p.typeRatio);
      setSpacingBase(p.spacing);
      setRadiusBase(p.radius);
      setSizeBase(p.sizeMd);
      setTokens(prev => {
        const spacingSteps = [
          0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
        ];
        const spacingKeys = [
          '0',
          '0-5',
          '1',
          '1-5',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          '10',
          '11',
          '12',
        ];
        const spacingPatch: Record<string, string> = {};
        spacingSteps.forEach((step, i) => {
          spacingPatch[`--spacing-${spacingKeys[i]}`] =
            `${Math.round(p.spacing * step)}px`;
        });
        return {
          ...prev,
          ...expandTypeScale({base: p.typeBase, ratio: p.typeRatio}),
          ...spacingPatch,
          ...expandRadiusScale({base: p.radius, multiplier: 1}),
          '--size-element-sm': `${p.sizeMd - p.spacing}px`,
          '--size-element-md': `${p.sizeMd}px`,
          '--size-element-lg': `${p.sizeMd + p.spacing}px`,
        };
      });
    },
    [UNIFIED_PRESETS],
  );

  const FONT_LABEL_TO_VALUE: Record<string, string> = React.useMemo(
    () => ({
      System:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      Inter: '"Inter", -apple-system, sans-serif',
      Roboto: '"Roboto", -apple-system, sans-serif',
      'DM Sans': '"DM Sans", -apple-system, sans-serif',
      Figtree: '"Figtree", -apple-system, sans-serif',
      Poppins: '"Poppins", -apple-system, sans-serif',
      'IBM Plex Sans': '"IBM Plex Sans", -apple-system, sans-serif',
      'Source Sans': '"Source Sans 3", -apple-system, sans-serif',
      'Noto Sans': '"Noto Sans", -apple-system, sans-serif',
      Georgia: 'Georgia, "Times New Roman", serif',
    }),
    [],
  );

  const applyAITheme = React.useCallback(
    (result: {
      accentColor: string;
      headingFont: string;
      bodyFont: string;
      spacingBase: number;
      radiusBase: number;
      typeScaleBase: number;
      typeScaleRatio: number;
      sizeBase: number;
    }) => {
      const clampedSpacing = Math.max(
        2,
        Math.min(16, Math.round(result.spacingBase / 2) * 2),
      );
      const clampedRadius = Math.max(
        0,
        Math.min(18, Math.round(result.radiusBase / 2) * 2),
      );
      const clampedTypeBase = Math.max(
        10,
        Math.min(24, Math.round(result.typeScaleBase)),
      );
      const clampedSize = Math.max(
        24,
        Math.min(56, Math.round(result.sizeBase / 2) * 2),
      );

      const validRatios = [1.067, 1.125, 1.2, 1.25, 1.333, 1.414, 1.5, 1.618];
      const closestRatio = validRatios.reduce((best, r) =>
        Math.abs(r - result.typeScaleRatio) <
        Math.abs(best - result.typeScaleRatio)
          ? r
          : best,
      );

      setActivePreset(null);
      setTypeScaleBase(clampedTypeBase);
      setTypeScaleRatio(closestRatio);
      setSpacingBase(clampedSpacing);
      setRadiusBase(clampedRadius);
      setSizeBase(clampedSize);
      setAutoPickColors(true);

      const headingValue =
        FONT_LABEL_TO_VALUE[result.headingFont] ||
        FONT_LABEL_TO_VALUE['System'];
      const bodyValue =
        FONT_LABEL_TO_VALUE[result.bodyFont] || FONT_LABEL_TO_VALUE['System'];

      const spacingSteps = [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const spacingKeys = [
        '0',
        '0-5',
        '1',
        '1-5',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
      ];
      const spacingPatch: Record<string, string> = {};
      spacingSteps.forEach((step, i) => {
        spacingPatch[`--spacing-${spacingKeys[i]}`] =
          `${Math.round(clampedSpacing * step)}px`;
      });

      const accentHex = result.accentColor?.startsWith('#')
        ? result.accentColor
        : '#0066FF';
      const colorPatch = expandColorScale({accent: accentHex});

      setTokens(prev => ({
        ...prev,
        ...expandTypeScale({base: clampedTypeBase, ratio: closestRatio}),
        ...spacingPatch,
        ...expandRadiusScale({base: clampedRadius, multiplier: 1}),
        ...colorPatch,
        '--color-accent': accentHex,
        '--font-family-heading': headingValue,
        '--font-family-body': bodyValue,
        '--size-element-sm': `${clampedSize - 4}px`,
        '--size-element-md': `${clampedSize}px`,
        '--size-element-lg': `${clampedSize + 4}px`,
      }));
    },
    [FONT_LABEL_TO_VALUE],
  );

  const handleImageUpload = React.useCallback(
    async (file: File) => {
      setAiError(null);
      setAiAnalyzing(true);
      setShowGenerate(true);

      const previewUrl = URL.createObjectURL(file);
      setAiImagePreview(previewUrl);

      const steps: XDSChatToolCallItem[] = [
        {name: 'Analyzing image', target: file.name, status: 'running'},
        {name: 'Extracting color palette', status: 'pending'},
        {name: 'Detecting typography', status: 'pending'},
        {name: 'Generating theme tokens', status: 'pending'},
      ];
      setAiToolCalls([...steps]);

      try {
        await new Promise(resolve => setTimeout(resolve, 600));
        steps[0] = {...steps[0], status: 'complete', duration: '0.6s'};
        steps[1] = {...steps[1], status: 'running'};
        setAiToolCalls([...steps]);

        await new Promise(resolve => setTimeout(resolve, 400));
        steps[1] = {...steps[1], status: 'complete', duration: '0.4s'};
        steps[2] = {...steps[2], status: 'running'};
        setAiToolCalls([...steps]);

        await new Promise(resolve => setTimeout(resolve, 300));
        steps[2] = {...steps[2], status: 'complete', duration: '0.3s'};
        steps[3] = {...steps[3], status: 'running'};
        setAiToolCalls([...steps]);

        await new Promise(resolve => setTimeout(resolve, 200));
        steps[3] = {...steps[3], status: 'complete', duration: '0.2s'};
        setAiToolCalls([...steps]);

        const mockResult = {
          accentColor: '#0064E0',
          headingFont: 'Inter',
          bodyFont: 'System',
          spacingBase: 4,
          radiusBase: 8,
          typeScaleBase: 14,
          typeScaleRatio: 1.2,
          sizeBase: 36,
          density: 'default' as const,
          notes:
            'Demo extraction — upload triggers a mock response to show the flow.',
        };

        applyAITheme(mockResult);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        setAiError(errMsg);
        const runningIdx = steps.findIndex(s => s.status === 'running');
        if (runningIdx >= 0) {
          steps[runningIdx] = {
            ...steps[runningIdx],
            status: 'error',
            errorMessage: errMsg,
          };
          setAiToolCalls([...steps]);
        }
      } finally {
        setAiAnalyzing(false);
      }
    },
    [applyAITheme],
  );

  React.useEffect(() => {
    if (!initialTheme) return;
    const fontLabel = initialTheme.font
      ? initialTheme.font.split(',')[0].replace(/["']/g, '').trim()
      : 'System';
    applyAITheme({
      accentColor: initialTheme.accent,
      headingFont: fontLabel,
      bodyFont: fontLabel,
      spacingBase: 4,
      radiusBase: initialTheme.radius ?? 8,
      typeScaleBase: 14,
      typeScaleRatio: 1.2,
      sizeBase: 32,
    });
    if (initialImage) {
      setAiImagePreview(initialImage);
    }
    onImageConsumed?.();
  }, [initialTheme]);

  // Resize state (docsite layout pattern)
  const [editorPanelWidth, setEditorPanelWidth] = React.useState(400);
  const [isEditorResizing, setIsEditorResizing] = React.useState(false);

  const allDefaults: Record<string, string> = React.useMemo(
    () => ({
      ...colorDefaults,
      ...spacingDefaults,
      ...radiusDefaults,
      ...typographyDefaults,
      ...textSizeDefaults,
      ...fontWeightDefaults,
      ...typeScaleDefaults,
      ...sizeDefaults,
      ...shadowDefaults,
      ...durationDefaults,
      ...easeDefaults,
      ...transitionDefaults,
    }),
    [],
  );

  const [tokens, setTokens] =
    React.useState<Record<string, string>>(allDefaults);

  const handleTokenChange = React.useCallback(
    (tokenName: string, value: string) => {
      setTokens(prev => ({...prev, [tokenName]: value}));
    },
    [],
  );

  const handleReset = React.useCallback(() => {
    setTokens(allDefaults);
    setTypeScaleBase(14);
    setTypeScaleRatio(1.2);
    setRadiusBase(4);
    setSpacingBase(4);
    setSizeBase(32);
    setDurationStep(1);
    setActivePreset('default');
  }, [allDefaults]);

  const typeScaleKeys = React.useMemo(
    () => new Set(Object.keys(typeScaleDefaults)),
    [],
  );

  const currentTheme = React.useMemo(() => {
    const tokenOverrides: Record<string, string> = {};
    const componentOverrides: Record<
      string,
      Record<string, Record<string, string>>
    > = {};
    for (const [key, value] of Object.entries(tokens)) {
      const mapping = COMPONENT_VAR_TO_OVERRIDE[key];
      if (mapping && value !== allDefaults[key]) {
        const {component, cssProperty} = mapping;
        if (!componentOverrides[component]) {
          componentOverrides[component] = {};
        }
        if (!componentOverrides[component].base) {
          componentOverrides[component].base = {};
        }
        componentOverrides[component].base[cssProperty] = value;
      } else if (typeScaleKeys.has(key) || value !== allDefaults[key]) {
        tokenOverrides[key] = value;
      }
    }
    return defineTheme({
      name: themeName,
      typography: {scale: {base: typeScaleBase, ratio: typeScaleRatio}},
      tokens: tokenOverrides as Partial<Record<string, string>>,
      components:
        Object.keys(componentOverrides).length > 0
          ? componentOverrides
          : undefined,
      icons: defaultIconRegistry,
    });
  }, [
    tokens,
    themeName,
    allDefaults,
    typeScaleBase,
    typeScaleRatio,
    typeScaleKeys,
  ]);

  const handleEditorResizeStart = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsEditorResizing(true);
      const startX = e.clientX;
      const startWidth = editorPanelWidth;
      const onMouseMove = (ev: MouseEvent) => {
        const maxWidth = Math.floor(window.innerWidth / 2);
        const newWidth = Math.min(
          Math.max(startWidth + (ev.clientX - startX), 280),
          maxWidth,
        );
        setEditorPanelWidth(newWidth);
      };
      const onMouseUp = () => {
        setIsEditorResizing(false);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [editorPanelWidth],
  );

  // ---------------------------------------------------------------------------
  // Token Editor Renderer
  // ---------------------------------------------------------------------------

  const renderTokenEditor = () => {
    const group = TOKEN_GROUPS[activeGroup];

    if (activeGroup === 'colors') {
      const seen = new Set<string>();
      return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
          {Object.entries(COLOR_CATEGORIES).map(([category, tokenNames]) => {
            const uniqueTokens = tokenNames.filter(t => {
              if (seen.has(t)) return false;
              seen.add(t);
              return true;
            });
            if (uniqueTokens.length === 0) return null;
            return (
              <React.Fragment key={category}>
                <XDSText
                  type="supporting"
                  color="secondary"
                  style={{marginTop: 8, marginBottom: 2}}>
                  {category}
                </XDSText>
                {uniqueTokens.map(tokenName => (
                  <ColorSwatch
                    key={tokenName}
                    tokenName={tokenName}
                    value={tokens[tokenName] || ''}
                    onChange={handleTokenChange}
                    mode={mode}
                  />
                ))}
              </React.Fragment>
            );
          })}
        </div>
      );
    }

    if (activeGroup === 'spacing' || activeGroup === 'size') {
      return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          {Object.keys(group.tokens).map(tokenName => (
            <SpacingEditor
              key={tokenName}
              tokenName={tokenName}
              value={tokens[tokenName] || ''}
              onChange={handleTokenChange}
            />
          ))}
        </div>
      );
    }

    if (activeGroup === 'radius') {
      return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          {Object.keys(group.tokens).map(tokenName => (
            <RadiusEditor
              key={tokenName}
              tokenName={tokenName}
              value={tokens[tokenName] || ''}
              onChange={handleTokenChange}
            />
          ))}
        </div>
      );
    }

    if (activeGroup === 'typography') {
      const seen = new Set<string>();
      return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
          {Object.entries(TYPOGRAPHY_CATEGORIES).map(
            ([category, categoryValue]) => {
              const catTokens: string[] = Array.isArray(categoryValue)
                ? (categoryValue as string[])
                : (categoryValue as unknown as {tokens: string[]}).tokens;
              const uniqueTokens = catTokens.filter(t => {
                if (seen.has(t)) return false;
                seen.add(t);
                return true;
              });
              if (uniqueTokens.length === 0) return null;
              return (
                <React.Fragment key={category}>
                  <XDSText
                    type="supporting"
                    color="secondary"
                    style={{marginTop: 8, marginBottom: 2}}>
                    {category}
                  </XDSText>
                  {uniqueTokens.map(tokenName => (
                    <TypographyEditor
                      key={tokenName}
                      tokenName={tokenName}
                      value={tokens[tokenName] || ''}
                      onChange={handleTokenChange}
                    />
                  ))}
                </React.Fragment>
              );
            },
          )}
        </div>
      );
    }

    return (
      <XDSVStack gap={2}>
        {Object.keys(group.tokens).map(tokenName => (
          <XDSHStack
            key={tokenName}
            gap={3}
            vAlign="center"
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              backgroundColor: 'var(--color-background-body)',
            }}>
            <XDSVStack gap={0} style={{flex: 1, minWidth: 0}}>
              <XDSText type="supporting" color="primary" maxLines={1}>
                {getTokenLabel(tokenName)}
              </XDSText>
              <XDSText type="supporting" color="secondary" maxLines={1}>
                {tokenName}
              </XDSText>
            </XDSVStack>
            <div style={{width: 200}}>
              <XDSTextInput
                label="Value"
                isLabelHidden
                value={tokens[tokenName] || ''}
                onChange={val => handleTokenChange(tokenName, val)}
                size="sm"
              />
            </div>
          </XDSHStack>
        ))}
      </XDSVStack>
    );
  };

  // ---------------------------------------------------------------------------
  // Layout — docsite split-panel pattern
  // ---------------------------------------------------------------------------

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--color-background-surface, #fff)',
      }}>
      <style>
        {'@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=DM+Sans:wght@400;500;600;700&family=Figtree:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Fira+Code:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap");' +
          '.xds-editor-resize-handle { opacity: 0; transition: opacity 150ms ease, background-color 150ms ease; }' +
          '.xds-editor-resize-grip:hover .xds-editor-resize-handle { opacity: 0.6; }' +
          '.xds-editor-resize-grip[data-resizing="true"] .xds-editor-resize-handle { opacity: 1; }' +
          '@keyframes xds-flash-fade { 0% { outline: 2px solid var(--color-accent); outline-offset: 2px; } 100% { outline: 2px solid transparent; outline-offset: 2px; } }' +
          '.xds-target-flash { animation: xds-flash-fade 3s ease-out forwards; }'}
      </style>

      {/* Left Panel — Sidebar Nav + Editor */}
      <div
        style={{
          width: editorPanelWidth,
          minWidth: 280,
          maxWidth: '50vw',
          flexShrink: 0,
          display: 'flex',
          gap: 0,
        }}>
        {/* Sidebar Navigation Rail */}
        <XDSSideNav
          collapsible={{isCollapsed: true, hasButton: false}}
          header={
            <XDSIconButton
              icon={<ArrowLeftIcon width="1em" height="1em" />}
              label="Back"
              variant="ghost"
              size="md"
              onClick={() => setActiveView('craft')}
            />
          }>
          <XDSSideNavSection title="Views" isHeaderHidden>
            <XDSSideNavItem
              label="Theme Editor"
              icon={SparklesIcon}
              selectedIcon={SparklesIcon}
              isSelected={panelMode === 'editor'}
              onClick={() => setPanelMode('editor')}
            />
            <XDSSideNavItem
              label="Component Tokens"
              icon={CubeIcon}
              selectedIcon={CubeIcon}
              isSelected={panelMode === 'target'}
              onClick={() => {
                setPanelMode('target');
                setActivePreview('preview');
              }}
            />
            <XDSSideNavItem
              label="Raw Tokens"
              icon={CodeBracketIcon}
              selectedIcon={CodeBracketIcon}
              isSelected={panelMode === 'raw'}
              onClick={() => setPanelMode('raw')}
            />
          </XDSSideNavSection>
        </XDSSideNav>

        {/* Editor Panel Content */}
        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--color-background-card, #fff)',
            borderRadius: 16,
            border: '1px solid var(--color-divider, #e0e0e0)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column' as const,
            margin: '8px 0 8px 0',
          }}>
          {/* Panel Header */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <XDSHeading level={4}>
              {panelMode === 'editor'
                ? 'Theme Editor'
                : panelMode === 'target'
                  ? 'Component Tokens'
                  : 'Raw Tokens'}
            </XDSHeading>
            <XDSHStack gap={1}>
              <XDSButton
                label="Generate"
                variant="ghost"
                size="sm"
                onClick={() => setShowGenerate(true)}
              />
              <XDSButton
                label="Reset"
                variant="ghost"
                size="sm"
                onClick={handleReset}
              />
            </XDSHStack>
          </div>

          {/* Raw Tokens sub-tabs */}
          {panelMode === 'raw' && (
            <div
              style={{
                padding: '8px 12px',
                marginLeft: 0,
                marginRight: 0,
                borderBottom: '1px solid var(--color-border)',
                overflowX: 'auto',
              }}>
              <XDSToggleButtonGroup
                label="Token category"
                type="single"
                size="sm"
                value={activeGroup}
                onChange={(v: string | null) => {
                  if (v != null) setActiveGroup(v as TokenGroupKey);
                }}>
                {(Object.keys(TOKEN_GROUPS) as TokenGroupKey[]).map(
                  groupKey => {
                    const IconComp = TOKEN_GROUP_ICONS[groupKey];
                    const isActive = activeGroup === groupKey;
                    return (
                      <XDSToggleButton
                        key={groupKey}
                        label={TOKEN_GROUPS[groupKey].label}
                        value={groupKey}
                        isIconOnly={!isActive}
                        icon={
                          IconComp ? (
                            <XDSIcon icon={IconComp} size="xsm" />
                          ) : undefined
                        }
                      />
                    );
                  },
                )}
              </XDSToggleButtonGroup>
            </div>
          )}

          {/* Scrollable editor content */}
          <div style={{flex: 1, overflow: 'auto', padding: '16px'}}>
            {panelMode === 'editor' ? (
              <XDSVStack gap={5}>
                {/* Color — Collapsible */}
                <CollapsibleSection
                  id="color"
                  title="Color"
                  collapsed={collapsedSections}
                  onToggle={toggleSection}>
                  <XDSHStack
                    vAlign="center"
                    style={{marginBottom: 4, justifyContent: 'space-between'}}>
                    <XDSText type="label" color="secondary">
                      Create from accent
                    </XDSText>
                    <XDSSwitch
                      label="Create from accent"
                      isLabelHidden
                      value={autoPickColors}
                      onChange={val => {
                        setAutoPickColors(val);
                        if (val) {
                          const accentRaw = tokens['--color-accent'] || '';
                          const parsed = parseLightDark(accentRaw);
                          const accentHex = parsed ? parsed.light : accentRaw;
                          if (accentHex && accentHex.startsWith('#')) {
                            const derived = expandColorScale({
                              accent: accentHex,
                            });
                            setTokens(prev => ({...prev, ...derived}));
                          }
                        }
                      }}
                    />
                  </XDSHStack>
                  <ColorSwatch
                    tokenName="--color-accent"
                    value={tokens['--color-accent'] || ''}
                    onChange={(name, value) => {
                      handleTokenChange(name, value);
                      if (autoPickColors) {
                        const parsed = parseLightDark(value);
                        const hex = parsed ? parsed.light : value;
                        if (hex && hex.startsWith('#') && hex.length >= 7) {
                          const derived = expandColorScale({accent: hex});
                          setTokens(prev => ({
                            ...prev,
                            [name]: value,
                            ...derived,
                          }));
                        }
                      }
                    }}
                    mode={mode}
                  />
                  {!autoPickColors && (
                    <XDSVStack gap={0}>
                      {[
                        '--color-neutral',
                        '--color-background-card',
                        '--color-background-surface',
                        '--color-text-primary',
                      ].map(tokenName => (
                        <ColorSwatch
                          key={tokenName}
                          tokenName={tokenName}
                          value={tokens[tokenName] || ''}
                          onChange={handleTokenChange}
                          mode={mode}
                        />
                      ))}
                    </XDSVStack>
                  )}
                </CollapsibleSection>

                <XDSDivider />
                {/* Presets — Collapsible */}
                <CollapsibleSection
                  id="presets"
                  title="Presets"
                  collapsed={collapsedSections}
                  onToggle={toggleSection}>
                  <div style={{display: 'flex', gap: 6}}>
                    {Object.entries(UNIFIED_PRESETS).map(([key, p]) => {
                      const isSelected = activePreset === key;
                      const gap =
                        key === 'compact'
                          ? 1
                          : key === 'default'
                            ? 2
                            : key === 'comfortable'
                              ? 3
                              : 4;
                      const cornerR =
                        key === 'compact'
                          ? 1
                          : key === 'default'
                            ? 2
                            : key === 'comfortable'
                              ? 3
                              : 5;
                      return (
                        <div
                          key={key}
                          onClick={() => applyUnifiedPreset(key)}
                          style={{
                            flex: 1,
                            padding: '10px 6px 8px',
                            borderRadius: 10,
                            border: 'none',
                            backgroundColor: isSelected
                              ? 'var(--color-accent-muted, rgba(0,100,224,0.1))'
                              : 'var(--color-background-wash, rgba(0,0,0,0.04))',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease',
                            display: 'flex',
                            flexDirection: 'column' as const,
                            alignItems: 'center',
                            gap: 6,
                          }}>
                          <svg width={32} height={32} viewBox="0 0 32 32">
                            <rect
                              x={0}
                              y={0}
                              width={32}
                              height={8}
                              rx={cornerR}
                              fill={
                                isSelected
                                  ? 'var(--color-accent, #0064E0)'
                                  : 'var(--color-text-quaternary)'
                              }
                              opacity={0.5}
                            />
                            <rect
                              x={0}
                              y={8 + gap}
                              width={15 - gap / 2}
                              height={32 - 8 - gap}
                              rx={cornerR}
                              fill={
                                isSelected
                                  ? 'var(--color-accent, #0064E0)'
                                  : 'var(--color-text-quaternary)'
                              }
                            />
                            <rect
                              x={15 + gap / 2}
                              y={8 + gap}
                              width={32 - 15 - gap / 2}
                              height={(32 - 8 - gap * 2) / 2}
                              rx={cornerR}
                              fill={
                                isSelected
                                  ? 'var(--color-accent, #0064E0)'
                                  : 'var(--color-text-quaternary)'
                              }
                              opacity={0.7}
                            />
                            <rect
                              x={15 + gap / 2}
                              y={8 + gap + (32 - 8 - gap * 2) / 2 + gap}
                              width={32 - 15 - gap / 2}
                              height={(32 - 8 - gap * 2) / 2}
                              rx={cornerR}
                              fill={
                                isSelected
                                  ? 'var(--color-accent, #0064E0)'
                                  : 'var(--color-text-quaternary)'
                              }
                              opacity={0.7}
                            />
                          </svg>
                          <XDSText
                            type="supporting"
                            style={{
                              fontSize: 10,
                              color: isSelected
                                ? 'var(--color-accent, #0064E0)'
                                : 'var(--color-text-secondary)',
                            }}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </XDSText>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleSection>

                {/* Typography — Collapsible */}
                <CollapsibleSection
                  id="typography"
                  title="Typography"
                  collapsed={collapsedSections}
                  onToggle={toggleSection}>
                  <XDSVStack gap={4}>
                    <div style={{display: 'flex', gap: 8}}>
                      {[
                        {
                          token: '--font-family-heading',
                          label: 'Heading',
                        },
                        {
                          token: '--font-family-body',
                          label: 'Body',
                        },
                      ].map(({token, label}) => (
                        <div key={token} style={{flex: 1, minWidth: 0}}>
                          <XDSText
                            type="label"
                            color="secondary"
                            style={{marginBottom: 4, display: 'block'}}>
                            {label}
                          </XDSText>
                          <XDSSelector
                            label={label}
                            isLabelHidden
                            options={FONT_OPTIONS}
                            value={tokens[token] || FONT_OPTIONS[0].value}
                            onChange={(val: string) =>
                              handleTokenChange(token, val)
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <XDSHStack
                        gap={1}
                        vAlign="center"
                        style={{marginBottom: 4}}>
                        <XDSText type="label" color="secondary">
                          Type Size
                        </XDSText>
                        <XDSTooltip
                          content={`Geometric scale: size = round(base × ratio^step). Base = ${typeScaleBase}px, ratio = ${typeScaleRatio.toFixed(3)}.`}>
                          <XDSIcon icon="info" size="sm" color="secondary" />
                        </XDSTooltip>
                      </XDSHStack>
                      <div
                        style={{display: 'flex', alignItems: 'center', gap: 8}}>
                        <XDSToggleButtonGroup
                          label="Type size preset"
                          type="single"
                          size="sm"
                          value={String(typeScaleBase)}
                          onChange={(v: string | null) => {
                            if (v != null)
                              applyTypeScale(Number(v), typeScaleRatio);
                          }}>
                          <XDSToggleButton label="S" value="12">
                            S
                          </XDSToggleButton>
                          <XDSToggleButton label="M" value="14">
                            M
                          </XDSToggleButton>
                          <XDSToggleButton label="L" value="16">
                            L
                          </XDSToggleButton>
                          <XDSToggleButton label="XL" value="18">
                            XL
                          </XDSToggleButton>
                        </XDSToggleButtonGroup>
                        <div style={{flex: 1}} />
                        <XDSNumberInput
                          label="Type size"
                          isLabelHidden
                          value={typeScaleBase}
                          onChange={(v: number) =>
                            applyTypeScale(v, typeScaleRatio)
                          }
                          min={10}
                          max={24}
                          step={1}
                          units="px"
                          size="sm"
                        />
                      </div>
                    </div>
                    <div>
                      <XDSText
                        type="label"
                        color="secondary"
                        style={{marginBottom: 4}}>
                        Type Scale
                      </XDSText>
                      <XDSSelector
                        label="Type Scale"
                        isLabelHidden
                        options={[
                          ...RATIO_OPTIONS.map(opt => ({
                            value: String(opt.value),
                            label: opt.label,
                          })),
                          {
                            value: 'custom',
                            label: !RATIO_OPTIONS.some(
                              o => Math.abs(o.value - typeScaleRatio) < 0.001,
                            )
                              ? `Custom — ${typeScaleRatio.toFixed(3)}`
                              : 'Custom...',
                          },
                        ]}
                        value={
                          !RATIO_OPTIONS.some(
                            o => Math.abs(o.value - typeScaleRatio) < 0.001,
                          )
                            ? 'custom'
                            : String(typeScaleRatio)
                        }
                        onChange={(v: string) => {
                          if (v !== 'custom')
                            applyTypeScale(typeScaleBase, Number(v));
                        }}
                      />
                    </div>
                  </XDSVStack>
                </CollapsibleSection>

                {/* Shape & Layout — Collapsible */}
                <CollapsibleSection
                  id="shape"
                  title="Shape & Layout"
                  collapsed={collapsedSections}
                  onToggle={toggleSection}>
                  <XDSVStack gap={4}>
                    <div>
                      <XDSHStack
                        gap={1}
                        vAlign="center"
                        style={{marginBottom: 4}}>
                        <XDSText type="label" color="secondary">
                          Corner Radius
                        </XDSText>
                        <XDSTooltip
                          content={`Linear scale: inner = ${radiusBase}px (1×), element = ${radiusBase * 2}px (2×), container = ${radiusBase * 3}px (3×), page = ${Math.round(radiusBase * 7)}px (7×).`}>
                          <XDSIcon icon="info" size="sm" color="secondary" />
                        </XDSTooltip>
                      </XDSHStack>
                      <div
                        style={{display: 'flex', alignItems: 'center', gap: 8}}>
                        <XDSToggleButtonGroup
                          label="Radius preset"
                          type="single"
                          size="sm"
                          value={String(radiusBase)}
                          onChange={(v: string | null) => {
                            if (v != null) applyRadiusScale(Number(v));
                          }}>
                          <XDSToggleButton label="S" value="2">
                            S
                          </XDSToggleButton>
                          <XDSToggleButton label="M" value="4">
                            M
                          </XDSToggleButton>
                          <XDSToggleButton label="L" value="6">
                            L
                          </XDSToggleButton>
                          <XDSToggleButton label="XL" value="12">
                            XL
                          </XDSToggleButton>
                        </XDSToggleButtonGroup>
                        <div style={{flex: 1}} />
                        <XDSNumberInput
                          label="Radius"
                          isLabelHidden
                          value={radiusBase}
                          onChange={(v: number) => applyRadiusScale(v)}
                          min={0}
                          max={18}
                          step={2}
                          units="px"
                          size="sm"
                        />
                      </div>
                    </div>
                    <div>
                      <XDSHStack
                        gap={1}
                        vAlign="center"
                        style={{marginBottom: 4}}>
                        <XDSText type="label" color="secondary">
                          Spacing
                        </XDSText>
                        <XDSTooltip
                          content={`Linear scale: step N = ${spacingBase}px × N. All spacing tokens are multiples of the base unit.`}>
                          <XDSIcon icon="info" size="sm" color="secondary" />
                        </XDSTooltip>
                      </XDSHStack>
                      <div
                        style={{display: 'flex', alignItems: 'center', gap: 8}}>
                        <XDSToggleButtonGroup
                          label="Spacing preset"
                          type="single"
                          size="sm"
                          value={String(spacingBase)}
                          onChange={(v: string | null) => {
                            if (v != null) applySpacingScale(Number(v));
                          }}>
                          <XDSToggleButton label="S" value="2">
                            S
                          </XDSToggleButton>
                          <XDSToggleButton label="M" value="4">
                            M
                          </XDSToggleButton>
                          <XDSToggleButton label="L" value="6">
                            L
                          </XDSToggleButton>
                          <XDSToggleButton label="XL" value="8">
                            XL
                          </XDSToggleButton>
                        </XDSToggleButtonGroup>
                        <div style={{flex: 1}} />
                        <XDSNumberInput
                          label="Spacing"
                          isLabelHidden
                          value={spacingBase}
                          onChange={(v: number) => applySpacingScale(v)}
                          min={0}
                          max={16}
                          step={2}
                          units="px"
                          size="sm"
                        />
                      </div>
                    </div>
                    <div>
                      <XDSHStack
                        gap={1}
                        vAlign="center"
                        style={{marginBottom: 4}}>
                        <XDSText type="label" color="secondary">
                          Element Size
                        </XDSText>
                        <XDSTooltip
                          content={`Step scale: sm = ${sizeBase - 4}px (md − grid), md = ${sizeBase}px (base), lg = ${sizeBase + 4}px (md + grid).`}>
                          <XDSIcon icon="info" size="sm" color="secondary" />
                        </XDSTooltip>
                      </XDSHStack>
                      <div
                        style={{display: 'flex', alignItems: 'center', gap: 8}}>
                        <XDSToggleButtonGroup
                          label="Element size preset"
                          type="single"
                          size="sm"
                          value={String(sizeBase)}
                          onChange={(v: string | null) => {
                            if (v != null) applySizeScale(Number(v));
                          }}>
                          <XDSToggleButton label="S" value="28">
                            S
                          </XDSToggleButton>
                          <XDSToggleButton label="M" value="32">
                            M
                          </XDSToggleButton>
                          <XDSToggleButton label="L" value="40">
                            L
                          </XDSToggleButton>
                          <XDSToggleButton label="XL" value="48">
                            XL
                          </XDSToggleButton>
                        </XDSToggleButtonGroup>
                        <div style={{flex: 1}} />
                        <XDSNumberInput
                          label="Element size"
                          isLabelHidden
                          value={sizeBase}
                          onChange={(v: number) => applySizeScale(v)}
                          min={24}
                          max={56}
                          step={2}
                          units="px"
                          size="sm"
                        />
                      </div>
                    </div>
                  </XDSVStack>
                </CollapsibleSection>

                {/* Motion — Collapsible */}
                <CollapsibleSection
                  id="motion"
                  title="Motion"
                  collapsed={collapsedSections}
                  onToggle={toggleSection}>
                  <XDSHStack gap={1} vAlign="center" style={{marginBottom: 4}}>
                    <XDSText type="label" color="secondary">
                      Duration
                    </XDSText>
                    <XDSTooltip
                      content={`Speed multiplier for all motion. Current: ${durationStep}× (e.g. medium = ${Math.round(410 / durationStep)}ms).`}>
                      <XDSIcon icon="info" size="sm" color="secondary" />
                    </XDSTooltip>
                  </XDSHStack>
                  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <XDSToggleButtonGroup
                      label="Duration preset"
                      type="single"
                      size="sm"
                      value={String(durationStep)}
                      onChange={(v: string | null) => {
                        if (v != null) applyDurationScale(Number(v));
                      }}>
                      <XDSToggleButton label="0.5×" value="0.5">
                        0.5×
                      </XDSToggleButton>
                      <XDSToggleButton label="1×" value="1">
                        1×
                      </XDSToggleButton>
                      <XDSToggleButton label="1.5×" value="1.5">
                        1.5×
                      </XDSToggleButton>
                      <XDSToggleButton label="2×" value="2">
                        2×
                      </XDSToggleButton>
                    </XDSToggleButtonGroup>
                    <div style={{flex: 1}} />
                    <XDSNumberInput
                      label="Duration"
                      isLabelHidden
                      value={durationStep}
                      onChange={(v: number) =>
                        applyDurationScale(Math.round(v * 10) / 10)
                      }
                      min={0.5}
                      max={2}
                      step={0.1}
                      units="×"
                      size="sm"
                    />
                  </div>
                </CollapsibleSection>
              </XDSVStack>
            ) : panelMode === 'target' ? (
              <XDSVStack gap={2}>
                {Object.entries(COMPONENT_VARS).map(([key, comp]) => (
                  <CollapsibleSection
                    key={key}
                    id={`comp-${key}`}
                    title={comp.label}
                    collapsed={collapsedSections}
                    onToggle={id => {
                      toggleSection(id);
                    }}
                    onTarget={() => setFlashComponent(key)}>
                    <XDSVStack gap={1}>
                      {comp.vars.map(v => {
                        const currentValue = tokens[v.name] || '';
                        const isCustom = customVars.has(v.name);
                        const isPresetValue =
                          !isCustom &&
                          (!currentValue ||
                            v.options.some(o => o.value === currentValue));

                        return (
                          <div
                            key={v.name}
                            style={{
                              padding: '6px 0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 10,
                            }}>
                            <div style={{flex: 1, minWidth: 0}}>
                              <XDSText
                                type="supporting"
                                color="primary"
                                maxLines={1}>
                                {v.description}
                              </XDSText>
                            </div>
                            <div style={{flexShrink: 0, width: 130}}>
                              {!isPresetValue ? (
                                <XDSTextInput
                                  label={v.name}
                                  isLabelHidden
                                  size="sm"
                                  value={currentValue}
                                  placeholder={v.default}
                                  onChange={(val: string) => {
                                    if (val.trim() === '') {
                                      setTokens(prev => {
                                        const next = {...prev};
                                        delete next[v.name];
                                        return next;
                                      });
                                      setCustomVars(prev => {
                                        const next = new Set(prev);
                                        next.delete(v.name);
                                        return next;
                                      });
                                    } else {
                                      handleTokenChange(v.name, val);
                                    }
                                  }}
                                />
                              ) : (
                                <XDSSelector
                                  label={v.name}
                                  isLabelHidden
                                  size="sm"
                                  options={[
                                    ...v.options,
                                    {value: '__custom__', label: 'Custom...'},
                                  ]}
                                  value={currentValue || v.default}
                                  onChange={(val: string) => {
                                    if (val === '__custom__') {
                                      setCustomVars(prev =>
                                        new Set(prev).add(v.name),
                                      );
                                    } else {
                                      handleTokenChange(v.name, val);
                                    }
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </XDSVStack>
                  </CollapsibleSection>
                ))}
              </XDSVStack>
            ) : (
              renderTokenEditor()
            )}
          </div>
        </div>
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={handleEditorResizeStart}
        data-resizing={isEditorResizing}
        className="xds-editor-resize-grip"
        style={{
          width: 16,
          flexShrink: 0,
          cursor: 'col-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          backgroundColor: 'transparent',
        }}>
        <div
          className="xds-editor-resize-handle"
          style={{
            width: 3,
            height: 32,
            borderRadius: 2,
            backgroundColor: isEditorResizing
              ? 'var(--color-icon-primary, #111)'
              : 'var(--color-border-strong, #ccc)',
          }}
        />
      </div>

      {/* Right Panel — Preview */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column' as const,
          minWidth: 0,
          overflow: 'hidden',
          marginLeft: -16,
          paddingLeft: 0,
        }}>
        {/* Preview toolbar */}
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--color-background-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <XDSDropdownMenu
              button={{
                label: activePreview.startsWith('template:')
                  ? (templates.find(
                      (t: {slug: string; name: string}) =>
                        t.slug === activePreview.slice(9),
                    )?.name ?? 'Template')
                  : ((
                      {
                        preview: 'Component Preview',
                        landing: 'Landing Page',
                        dashboard: 'Dashboard',
                        tokens: 'Token Preview',
                        table: 'Table Page',
                      } as Record<string, string>
                    )[activePreview] ?? activePreview),
                variant: 'ghost',
                size: 'md',
              }}
              items={[
                {
                  label: 'Token Preview',
                  onClick: () => setActivePreview('tokens'),
                },
                {
                  label: 'Component Preview',
                  onClick: () => setActivePreview('preview'),
                },
                {
                  label: 'Landing Page',
                  onClick: () => setActivePreview('landing'),
                },
                {
                  label: 'Dashboard',
                  onClick: () => setActivePreview('dashboard'),
                },
                {label: 'Table Page', onClick: () => setActivePreview('table')},
                {type: 'divider' as const},
                ...templates
                  .filter((t: {isReady?: boolean}) => t.isReady)
                  .map((t: {name: string; slug: string}) => ({
                    label: t.name,
                    onClick: () => setActivePreview(`template:${t.slug}`),
                  })),
              ]}
            />
          </div>
          <XDSSegmentedControl
            label="Color mode"
            value={mode}
            onChange={v => setMode(v as 'light' | 'dark')}
            size="sm">
            <XDSSegmentedControlItem
              value="light"
              label="Light"
              icon={<ContrastIcon />}
              isLabelHidden
            />
            <XDSSegmentedControlItem
              value="dark"
              label="Dark"
              icon={<MoonIcon />}
              isLabelHidden
            />
          </XDSSegmentedControl>
          <XDSButton
            label={showCode ? 'Hide Code' : 'Export Theme'}
            variant="secondary"
            size="sm"
            onClick={() => setShowCode(!showCode)}
          />
        </div>

        {/* Code panel (collapsible) */}
        {showCode && (
          <div
            style={{
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-background-body)',
              maxHeight: '300px',
              overflow: 'auto',
            }}>
            <XDSCodeBlock
              code={generateThemeCode(
                themeName,
                tokens,
                allDefaults,
                typeScaleBase,
                typeScaleRatio,
              )}
              language="typescript"
              size="sm"
            />
          </div>
        )}

        {/* Preview content wrapped in theme */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}>
          <XDSTheme theme={currentTheme} mode={mode}>
            <div
              ref={previewRef}
              style={{
                flex: 1,
                overflow: 'auto',
                position: 'relative',
                padding: 24,
                marginLeft: 16,
                marginRight: 16,
                backgroundColor: 'var(--color-background-surface)',
                borderRadius: 'var(--radius-container)',
              }}>
              <PreviewContent
                activePreview={activePreview}
                tokens={tokens}
                theme={currentTheme}
                mode={mode}
              />

              {/* Overlay panel */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: '40%',
                  maxWidth: 480,
                  borderLeft: '1px solid var(--color-border)',
                  backgroundColor: mode === 'dark' ? '#1F1F22' : '#FFFFFF',
                  transform: overlayPanelOpen
                    ? 'translateX(0)'
                    : 'translateX(100%)',
                  opacity: overlayPanelOpen ? 1 : 0,
                  transition:
                    'transform var(--duration-medium) var(--ease-standard), opacity var(--duration-medium) var(--ease-standard)',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 10,
                  boxShadow: overlayPanelOpen ? 'var(--shadow-high)' : 'none',
                }}>
                <div
                  style={{
                    padding: 'var(--spacing-2) var(--spacing-3)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <XDSText type="label">Overlay Panel</XDSText>
                  <XDSButton
                    label="Close"
                    icon={<XMarkIcon style={{width: 16, height: 16}} />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setOverlayPanelOpen(false)}
                    isIconOnly
                  />
                </div>
                <div style={{padding: 'var(--spacing-3)'}}>
                  <XDSText type="supporting" color="secondary">
                    Slides over content without resizing it.
                  </XDSText>
                </div>
              </div>

              {/* Push panel */}
              <div
                style={{
                  flexShrink: 0,
                  width: pushPanelOpen ? '40%' : '0px',
                  maxWidth: pushPanelOpen ? 480 : 0,
                  overflow: 'hidden',
                  borderLeft: pushPanelOpen
                    ? '1px solid var(--color-border)'
                    : 'none',
                  backgroundColor: mode === 'dark' ? '#1F1F22' : '#FFFFFF',
                  opacity: pushPanelOpen ? 1 : 0,
                  transition:
                    'width var(--duration-medium) var(--ease-standard), max-width var(--duration-medium) var(--ease-standard), opacity var(--duration-medium) var(--ease-standard)',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                <div
                  style={{
                    padding: 'var(--spacing-2) var(--spacing-3)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    whiteSpace: 'nowrap',
                  }}>
                  <XDSText type="label">Push Panel</XDSText>
                  <XDSButton
                    label="Close"
                    icon={<XMarkIcon style={{width: 16, height: 16}} />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setPushPanelOpen(false)}
                    isIconOnly
                  />
                </div>
                <div
                  style={{padding: 'var(--spacing-3)', whiteSpace: 'nowrap'}}>
                  <XDSText type="supporting" color="secondary">
                    Pushes content to make room.
                  </XDSText>
                </div>
              </div>
            </div>
          </XDSTheme>
        </div>
      </div>
      <XDSDialog
        isOpen={showGenerate}
        onOpenChange={setShowGenerate}
        width={480}>
        <XDSDialogHeader
          title="Generate from image"
          onOpenChange={setShowGenerate}
        />
        <XDSVStack gap={3} style={{padding: 'var(--spacing-3)'}}>
          <XDSText type="body" color="secondary">
            Upload a screenshot or design mockup and the AI will extract accent
            colors, typography, spacing, and radius to generate a complete
            theme.
          </XDSText>
          <XDSButton
            label={aiAnalyzing ? 'Analyzing...' : 'Upload image'}
            variant="secondary"
            size="sm"
            isDisabled={aiAnalyzing}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/png,image/jpeg,image/webp';
              input.onchange = () => {
                const file = input.files?.[0];
                if (file) handleImageUpload(file);
              };
              input.click();
            }}
          />
          {aiImagePreview && (
            <img
              src={aiImagePreview}
              alt="Uploaded reference"
              style={{
                width: '100%',
                borderRadius: 8,
                objectFit: 'cover',
                maxHeight: 240,
              }}
            />
          )}
          {aiToolCalls.length > 0 && (
            <XDSChatToolCalls calls={aiToolCalls} defaultIsExpanded />
          )}
          {aiError && (
            <XDSBanner
              status="error"
              title="Generation failed"
              description={aiError}
              isDismissable
              onDismiss={() => setAiError(null)}
            />
          )}
        </XDSVStack>
      </XDSDialog>
    </div>
  );
}
