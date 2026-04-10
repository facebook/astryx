'use client';

import * as React from 'react';
import {XDSButton} from '@xds/core/Button';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSCard} from '@xds/core/Card';
import {XDSHStack, XDSVStack, XDSStack} from '@xds/core/Stack';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBanner} from '@xds/core/Banner';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSDialog} from '@xds/core/Dialog';
import {XDSToken} from '@xds/core/Token';
import {XDSSlider} from '@xds/core/Slider';
import {XDSSelector} from '@xds/core/Selector';
import {XDSNumberInput} from '@xds/core/NumberInput';
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
import {XDSSkeleton} from '@xds/core/Skeleton';
import {XDSStatusDot} from '@xds/core/StatusDot';
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
import {XDSTheme, defineTheme, expandTypeScale} from '@xds/core/theme';
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
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  FolderIcon as FolderIconSolid,
} from '@heroicons/react/24/solid';

// =============================================================================
// Token Groups for the Editor
// =============================================================================

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
// Color Categories for better organization
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
// Typography Categories - Organized by semantic usage
// =============================================================================

/**
 * Typography tokens organized by semantic text styles.
 * Each style shows which tokens it uses (size, weight, line-height).
 */
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

/**
 * Parse light-dark() values to extract light and dark mode colors
 */
function parseLightDark(value: string): {light: string; dark: string} | null {
  const match = value.match(/^light-dark\(([^,]+),\s*([^)]+)\)$/);
  if (match) {
    return {light: match[1].trim(), dark: match[2].trim()};
  }
  return null;
}

/**
 * Parse a color value to extract hex and alpha components
 * Handles: #RGB, #RRGGBB, #RRGGBBAA, rgba(), etc.
 */
function parseColorWithAlpha(
  value: string,
): {hex: string; alpha: number} | null {
  // Handle #RRGGBBAA format
  const hex8Match = value.match(/^#([0-9A-Fa-f]{8})$/);
  if (hex8Match) {
    const hex = '#' + hex8Match[1].slice(0, 6);
    const alpha = parseInt(hex8Match[1].slice(6, 8), 16) / 255;
    return {hex, alpha: Math.round(alpha * 100) / 100};
  }

  // Handle #RRGGBB format
  const hex6Match = value.match(/^#([0-9A-Fa-f]{6})$/);
  if (hex6Match) {
    return {hex: value, alpha: 1};
  }

  // Handle #RGB format
  const hex3Match = value.match(/^#([0-9A-Fa-f]{3})$/);
  if (hex3Match) {
    const r = hex3Match[1][0];
    const g = hex3Match[1][1];
    const b = hex3Match[1][2];
    return {hex: `#${r}${r}${g}${g}${b}${b}`, alpha: 1};
  }

  // Handle rgba() format
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

/**
 * Convert hex + alpha back to a color string
 */
function colorWithAlphaToString(hex: string, alpha: number): string {
  if (alpha >= 1) {
    return hex.toUpperCase();
  }
  const alphaHex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${alphaHex}`.toUpperCase();
}

/**
 * Get a human-readable label from a token name
 */
function getTokenLabel(tokenName: string): string {
  return tokenName
    .replace(/^--/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// =============================================================================
// Token Editor Components
// =============================================================================

interface ColorSwatchProps {
  tokenName: string;
  value: string;
  onChange: (tokenName: string, value: string) => void;
  mode: 'light' | 'dark';
}

function ColorSwatch({tokenName, value, onChange, mode}: ColorSwatchProps) {
  const parsed = parseLightDark(value);
  const displayValue = parsed
    ? mode === 'light'
      ? parsed.light
      : parsed.dark
    : value;

  // Parse color with alpha
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
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        borderRadius: '8px',
        backgroundColor: 'var(--color-background-body)',
      }}>
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          backgroundColor: displayValue,
          border: '1px solid var(--color-border-emphasized)',
          flexShrink: 0,
          // Checkerboard pattern for alpha preview
          backgroundImage:
            colorParsed && colorParsed.alpha < 1
              ? `linear-gradient(45deg, #ccc 25%, transparent 25%), 
                 linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                 linear-gradient(45deg, transparent 75%, #ccc 75%), 
                 linear-gradient(-45deg, transparent 75%, #ccc 75%)`
              : undefined,
          backgroundSize: '8px 8px',
          backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
        }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '6px',
            backgroundColor: displayValue,
          }}
        />
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            marginBottom: '2px',
          }}>
          {getTokenLabel(tokenName)}
        </div>
        <code
          style={{
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family-code)',
          }}>
          {tokenName}
        </code>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
        {hasColorPicker && colorParsed && (
          <>
            <input
              type="color"
              value={colorParsed.hex}
              onChange={e => handleColorChange(e.target.value)}
              style={{
                width: '28px',
                height: '28px',
                padding: 0,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            />
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={Math.round(colorParsed.alpha * 100)}
              onChange={e => handleAlphaChange(Number(e.target.value) / 100)}
              title="Alpha %"
              style={{
                width: '50px',
                padding: '4px 6px',
                fontSize: '12px',
                fontFamily: 'var(--font-family-code)',
                border: '1px solid var(--color-border-emphasized)',
                borderRadius: '4px',
                backgroundColor: 'var(--color-background-surface)',
                color: 'var(--color-text-primary)',
                textAlign: 'center',
              }}
            />
            <span
              style={{
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
              }}>
              %
            </span>
          </>
        )}
        <input
          type="text"
          value={displayValue}
          onChange={e => {
            const newValue = parsed
              ? mode === 'light'
                ? `light-dark(${e.target.value}, ${parsed.dark})`
                : `light-dark(${parsed.light}, ${e.target.value})`
              : e.target.value;
            onChange(tokenName, newValue);
          }}
          style={{
            width: '100px',
            padding: '4px 8px',
            fontSize: '12px',
            fontFamily: 'var(--font-family-code)',
            border: '1px solid var(--color-border-emphasized)',
            borderRadius: '4px',
            backgroundColor: 'var(--color-background-surface)',
            color: 'var(--color-text-primary)',
          }}
        />
      </div>
    </div>
  );
}

interface SpacingEditorProps {
  tokenName: string;
  value: string;
  onChange: (tokenName: string, value: string) => void;
}

function SpacingEditor({tokenName, value, onChange}: SpacingEditorProps) {
  const numValue = parseInt(value, 10);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        borderRadius: '8px',
        backgroundColor: 'var(--color-background-body)',
      }}>
      <div
        style={{
          width: `${Math.min(numValue, 48)}px`,
          height: '24px',
          backgroundColor: 'var(--color-accent)',
          borderRadius: '4px',
          flexShrink: 0,
        }}
      />
      <div style={{flex: 1, minWidth: 0}}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            marginBottom: '2px',
          }}>
          {getTokenLabel(tokenName)}
        </div>
        <code
          style={{
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family-code)',
          }}>
          {tokenName}
        </code>
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(tokenName, e.target.value)}
        style={{
          width: '80px',
          padding: '4px 8px',
          fontSize: '12px',
          fontFamily: 'var(--font-family-code)',
          border: '1px solid var(--color-border-emphasized)',
          borderRadius: '4px',
          backgroundColor: 'var(--color-background-surface)',
          color: 'var(--color-text-primary)',
        }}
      />
    </div>
  );
}

interface RadiusEditorProps {
  tokenName: string;
  value: string;
  onChange: (tokenName: string, value: string) => void;
}

function RadiusEditor({tokenName, value, onChange}: RadiusEditorProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        borderRadius: '8px',
        backgroundColor: 'var(--color-background-body)',
      }}>
      <div
        style={{
          width: '32px',
          height: '32px',
          backgroundColor: 'var(--color-accent)',
          borderRadius: value,
          flexShrink: 0,
        }}
      />
      <div style={{flex: 1, minWidth: 0}}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            marginBottom: '2px',
          }}>
          {getTokenLabel(tokenName)}
        </div>
        <code
          style={{
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family-code)',
          }}>
          {tokenName}
        </code>
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(tokenName, e.target.value)}
        style={{
          width: '80px',
          padding: '4px 8px',
          fontSize: '12px',
          fontFamily: 'var(--font-family-code)',
          border: '1px solid var(--color-border-emphasized)',
          borderRadius: '4px',
          backgroundColor: 'var(--color-background-surface)',
          color: 'var(--color-text-primary)',
        }}
      />
    </div>
  );
}

interface TypographyEditorProps {
  tokenName: string;
  value: string;
  onChange: (tokenName: string, value: string) => void;
}

function TypographyEditor({tokenName, value, onChange}: TypographyEditorProps) {
  const isFont = tokenName.includes('font-') && !tokenName.includes('weight');
  const isSize = tokenName.includes('text-');
  const isWeight = tokenName.includes('weight');
  const isLeading = tokenName.includes('leading');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        borderRadius: '8px',
        backgroundColor: 'var(--color-background-body)',
      }}>
      <div
        style={{
          width: '48px',
          height: '32px',
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
      <div style={{flex: 1, minWidth: 0}}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
            marginBottom: '2px',
          }}>
          {getTokenLabel(tokenName)}
        </div>
        <code
          style={{
            fontSize: '11px',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-family-code)',
          }}>
          {tokenName}
        </code>
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(tokenName, e.target.value)}
        style={{
          width: isFont ? '200px' : '80px',
          padding: '4px 8px',
          fontSize: '12px',
          fontFamily: 'var(--font-family-code)',
          border: '1px solid var(--color-border-emphasized)',
          borderRadius: '4px',
          backgroundColor: 'var(--color-background-surface)',
          color: 'var(--color-text-primary)',
        }}
      />
    </div>
  );
}

// =============================================================================
// Component Preview
// =============================================================================

// =============================================================================
// Spacing Table Data
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

function ComponentPreview() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState('overview');
  const [switchValue, setSwitchValue] = React.useState(true);
  const [sliderValue, setSliderValue] = React.useState(50);
  const [checkboxValue, setCheckboxValue] = React.useState(false);
  const [radioValue, setRadioValue] = React.useState('option1');

  // Spacing data for table
  const spacingData: SpacingRow[] = Object.entries(spacingDefaults).map(
    ([token, value]) => ({
      token,
      value,
      preview: (
        <div
          style={{
            width: value,
            height: '16px',
            backgroundColor: 'var(--color-accent)',
            borderRadius: '2px',
          }}
        />
      ),
    }),
  );

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
      {/* Typography Scale - Article Example */}
      <div>
        <XDSText type="label" style={{marginBottom: '16px', display: 'block'}}>
          Typography Scale
        </XDSText>
        <XDSCard padding={4}>
          <article>
            <XDSHeading level={1}>Building Design Systems</XDSHeading>
            <XDSText
              type="supporting"
              style={{
                marginTop: '8px',
                marginBottom: '24px',
                display: 'block',
              }}>
              A guide to creating consistent, scalable UI components
            </XDSText>

            <XDSText
              type="large"
              style={{marginBottom: '16px', display: 'block'}}>
              Design systems provide a shared vocabulary between designers and
              developers, enabling teams to build products faster and more
              consistently.
            </XDSText>

            <XDSDivider style={{margin: '24px 0'}} />

            <XDSHeading level={2} style={{marginBottom: '12px'}}>
              Why Tokens Matter
            </XDSHeading>
            <XDSText
              type="body"
              style={{marginBottom: '16px', display: 'block'}}>
              Design tokens are the visual design atoms of the design system —
              specifically, they are named entities that store visual design
              attributes. We use them in place of hard-coded values to ensure
              flexibility and consistency.
            </XDSText>

            <XDSHeading level={3} style={{marginBottom: '8px'}}>
              Example: Using Color Tokens
            </XDSHeading>
            <XDSText
              type="body"
              style={{marginBottom: '12px', display: 'block'}}>
              Instead of using raw hex values, reference semantic tokens:
            </XDSText>

            {/* Code Block */}
            <pre
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-element)',
                backgroundColor: 'var(--color-background-body)',
                border: '1px solid var(--color-border)',
                fontFamily: 'var(--font-family-code)',
                fontSize: 'var(--font-size-sm)',
                lineHeight: 'var(--leading-normal)',
                overflow: 'auto',
                margin: '0 0 16px 0',
              }}>
              <code
                style={{
                  color: 'var(--color-text-primary)',
                }}>
                {`// ❌ Don't use raw values
const styles = stylex.create({
  button: {
    backgroundColor: '#0064E0',
    color: '#FFFFFF',
  },
});

// ✅ Use semantic tokens
const styles = stylex.create({
  button: {
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-on-dark'],
  },
});`}
              </code>
            </pre>

            <XDSHeading level={4} style={{marginBottom: '8px'}}>
              Benefits of This Approach
            </XDSHeading>
            <XDSText
              type="body"
              style={{marginBottom: '8px', display: 'block'}}>
              Using tokens provides several advantages:
            </XDSText>
            <ul
              style={{
                margin: '0 0 16px 0',
                paddingLeft: '24px',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--font-size-base)',
                lineHeight: 'var(--leading-base)',
              }}>
              <li>Automatic dark mode support via light-dark()</li>
              <li>Centralized theme customization</li>
              <li>Consistent visual language across components</li>
              <li>Easy global updates when design changes</li>
            </ul>

            <XDSText type="supporting">
              Last updated: March 2026 · 5 min read
            </XDSText>
          </article>
        </XDSCard>
      </div>

      {/* Button Sizes */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Button Sizes
        </XDSText>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
          <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
            <XDSText type="supporting" style={{width: '40px', flexShrink: 0}}>
              sm
            </XDSText>
            <XDSButton label="Primary" variant="primary" size="sm" />
            <XDSButton label="Secondary" variant="secondary" size="sm" />
            <XDSButton label="Ghost" variant="ghost" size="sm" />
            <XDSButton label="Destructive" variant="destructive" size="sm" />
          </div>
          <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
            <XDSText type="supporting" style={{width: '40px', flexShrink: 0}}>
              md
            </XDSText>
            <XDSButton label="Primary" variant="primary" size="md" />
            <XDSButton label="Secondary" variant="secondary" size="md" />
            <XDSButton label="Ghost" variant="ghost" size="md" />
            <XDSButton label="Destructive" variant="destructive" size="md" />
          </div>
          <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
            <XDSText type="supporting" style={{width: '40px', flexShrink: 0}}>
              lg
            </XDSText>
            <XDSButton label="Primary" variant="primary" size="lg" />
            <XDSButton label="Secondary" variant="secondary" size="lg" />
            <XDSButton label="Ghost" variant="ghost" size="lg" />
            <XDSButton label="Destructive" variant="destructive" size="lg" />
          </div>
        </div>
      </div>

      {/* Button States */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Button States
        </XDSText>
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          <XDSButton label="Default" variant="primary" />
          <XDSButton label="Disabled" variant="primary" isDisabled />
          <XDSButton label="Loading" variant="primary" isLoading />
        </div>
      </div>

      {/* Spacing Table */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Spacing Scale
        </XDSText>
        <XDSTable
          columns={spacingTableColumns}
          data={spacingData}
          density="compact"
          dividers="rows"
        />
      </div>

      {/* Badges */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Badges
        </XDSText>
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          <XDSBadge label="Neutral" />
          <XDSBadge label="Info" variant="info" />
          <XDSBadge label="Success" variant="success" />
          <XDSBadge label="Warning" variant="warning" />
          <XDSBadge label="Error" variant="error" />
        </div>
      </div>

      {/* Tokens */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Tokens
        </XDSText>
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          <XDSToken label="Default" />
          <XDSToken label="Blue" color="blue" />
          <XDSToken label="Green" color="green" />
          <XDSToken label="Red" color="red" />
          <XDSToken label="Purple" color="purple" />
          <XDSToken label="Orange" color="orange" />
        </div>
      </div>

      {/* Form Controls */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Form Controls
        </XDSText>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '300px',
          }}>
          <XDSTextInput
            label="Text Input"
            placeholder="Enter text..."
            value=""
            onChange={() => {}}
          />
          <XDSSwitch
            label="Toggle Switch"
            value={switchValue}
            onChange={setSwitchValue}
          />
          <XDSCheckboxInput
            label="Checkbox"
            value={checkboxValue}
            onChange={setCheckboxValue}
          />
          <XDSSlider
            label="Slider"
            value={sliderValue}
            onChange={setSliderValue}
            min={0}
            max={100}
          />
        </div>
      </div>

      {/* Radio List */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Radio List
        </XDSText>
        <XDSRadioList
          label="Select an option"
          value={radioValue}
          onChange={setRadioValue}>
          <XDSRadioListItem value="option1" label="Option 1" />
          <XDSRadioListItem value="option2" label="Option 2" />
          <XDSRadioListItem value="option3" label="Option 3" />
        </XDSRadioList>
      </div>

      {/* Progress */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Progress
        </XDSText>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxWidth: '300px',
          }}>
          <XDSProgressBar value={25} label="25%" />
          <XDSProgressBar value={50} label="50%" />
          <XDSProgressBar value={75} label="75%" />
        </div>
      </div>

      {/* Tabs */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Tabs
        </XDSText>
        <XDSTabList value={selectedTab} onChange={setSelectedTab}>
          <XDSTab value="overview" label="Overview" />
          <XDSTab value="details" label="Details" />
          <XDSTab value="settings" label="Settings" />
        </XDSTabList>
      </div>

      {/* Avatar */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Avatars
        </XDSText>
        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <XDSAvatar name="John Doe" size="small" />
          <XDSAvatar name="Jane Smith" size="medium" />
          <XDSAvatar name="Bob Wilson" size="large" />
        </div>
      </div>

      {/* Banner */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Banners
        </XDSText>
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          <XDSBanner
            title="Information"
            description="This is an informational banner."
            status="info"
          />
          <XDSBanner
            title="Success"
            description="Operation completed successfully."
            status="success"
          />
          <XDSBanner
            title="Warning"
            description="Please review before continuing."
            status="warning"
          />
          <XDSBanner
            title="Error"
            description="Something went wrong."
            status="error"
          />
        </div>
      </div>

      {/* Card */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Card
        </XDSText>
        <XDSCard padding={3}>
          <XDSStack direction="vertical" gap={2}>
            <XDSHeading level={4}>Card Title</XDSHeading>
            <XDSText type="body">
              This is a sample card with some content to demonstrate how cards
              look with the current theme.
            </XDSText>
            <div style={{display: 'flex', gap: '8px'}}>
              <XDSButton label="Action" variant="primary" size="sm" />
              <XDSButton label="Cancel" variant="ghost" size="sm" />
            </div>
          </XDSStack>
        </XDSCard>
      </div>

      {/* Dialog trigger */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Dialog
        </XDSText>
        <XDSButton
          label="Open Dialog"
          variant="secondary"
          onClick={() => setDialogOpen(true)}
        />
        <XDSDialog
          isOpen={dialogOpen}
          onOpenChange={open => setDialogOpen(open)}>
          <div style={{padding: '0 24px 24px 24px'}}>
            <XDSStack direction="vertical" gap={3}>
              <XDSText type="body">
                This is a sample dialog to preview how dialogs look with the
                current theme settings.
              </XDSText>
              <XDSTextInput
                label="Example Input"
                placeholder="Type something..."
                value=""
                onChange={() => {}}
              />
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'flex-end',
                }}>
                <XDSButton
                  label="Cancel"
                  variant="ghost"
                  onClick={() => setDialogOpen(false)}
                />
                <XDSButton
                  label="Confirm"
                  variant="primary"
                  onClick={() => setDialogOpen(false)}
                />
              </div>
            </XDSStack>
          </div>
        </XDSDialog>
      </div>
    </div>
  );
}

// =============================================================================
// Landing Page Preview
// =============================================================================

function LandingPagePreview() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '48px'}}>
      {/* Hero */}
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

      <XDSDivider />

      {/* Features */}
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

      {/* Testimonial */}
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

      {/* CTA */}
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

// =============================================================================
// Dashboard Preview
// =============================================================================

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
      {/* Header */}
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

      {/* KPI Cards */}
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

      {/* Tabs + Table */}
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

      {/* Activity Banner */}
      <XDSBanner
        status="info"
        title="System Update"
        description="A new version of the API is available. Review the changelog for breaking changes."
        endContent={
          <XDSButton label="View Changelog" variant="secondary" size="sm" />
        }
      />

      {/* Bottom section */}
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
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                }}>
                <XDSText type="supporting">CPU Usage</XDSText>
                <XDSText type="supporting" color="secondary">
                  43%
                </XDSText>
              </div>
              <XDSProgressBar value={43} label="API Latency" isLabelHidden />
            </div>
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                }}>
                <XDSText type="supporting">Memory</XDSText>
                <XDSText type="supporting" color="secondary">
                  67%
                </XDSText>
              </div>
              <XDSProgressBar value={67} label="Error Rate" isLabelHidden />
            </div>
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                }}>
                <XDSText type="supporting">Storage</XDSText>
                <XDSText type="supporting" color="secondary">
                  82%
                </XDSText>
              </div>
              <XDSProgressBar value={82} label="Uptime" isLabelHidden />
            </div>
          </div>
        </XDSCard>
      </div>
    </div>
  );
}

// =============================================================================
// Preview Tabs (wraps all preview modes)
// =============================================================================

function PreviewTabs({
  isMotionGroup,
  pushOpen,
  setPushOpen,
  overlayOpen,
  setOverlayOpen,
}: {
  isMotionGroup: boolean;
  pushOpen: boolean;
  setPushOpen: (v: boolean) => void;
  overlayOpen: boolean;
  setOverlayOpen: (v: boolean) => void;
}) {
  const [activePreview, setActivePreview] = React.useState('preview');

  React.useEffect(() => {
    if (!isMotionGroup && activePreview === 'table') {
      setActivePreview('preview');
    }
    if (
      isMotionGroup &&
      (activePreview === 'landing' || activePreview === 'dashboard')
    ) {
      setActivePreview('preview');
    }
  }, [isMotionGroup, activePreview]);

  return (
    <div>
      <XDSTabList value={activePreview} onChange={setActivePreview}>
        <XDSTab value="preview" label="Preview" />
        {!isMotionGroup && <XDSTab value="landing" label="Landing Page" />}
        {!isMotionGroup && <XDSTab value="dashboard" label="Dashboard" />}
        {isMotionGroup && <XDSTab value="table" label="Table Page" />}
      </XDSTabList>
      <div style={{marginTop: '24px'}}>
        {activePreview === 'preview' &&
          (isMotionGroup ? (
            <XDSVStack gap={4}>
              <NavigationOverlaysPreview
                pushOpen={pushOpen}
                setPushOpen={setPushOpen}
                overlayOpen={overlayOpen}
                setOverlayOpen={setOverlayOpen}
              />
              <MicroInteractionsPreview />
              <LoadingStatusPreview />
              <SurfaceInteractionsPreview />
            </XDSVStack>
          ) : (
            <ComponentPreview />
          ))}
        {activePreview === 'landing' && <LandingPagePreview />}
        {activePreview === 'dashboard' && <DashboardPreview />}
        {activePreview === 'table' && <MotionPreview />}
      </div>
    </div>
  );
}

// =============================================================================
// Motion Preview (Table Page)
// =============================================================================

function MotionPreview() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [overlayOpen, setOverlayOpen] = React.useState(false);
  const [pushOpen, setPushOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<
    (typeof allUsers)[0] | null
  >(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(1200);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
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
            This modal uses XDSDialog with directional entry animation from the
            trigger element.
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
// Popover Settings Content
// =============================================================================

function PopoverSettingsContent() {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [sounds, setSounds] = React.useState(true);

  return (
    <XDSVStack gap={3} style={{width: 240}}>
      <XDSText type="label" display="block">
        Settings
      </XDSText>
      <XDSDivider />
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

// =============================================================================
// Navigation & Overlays Preview
// =============================================================================

function NavigationOverlaysPreview({
  pushOpen,
  setPushOpen,
  overlayOpen,
  setOverlayOpen,
}: {
  pushOpen: boolean;
  setPushOpen: (v: boolean) => void;
  overlayOpen: boolean;
  setOverlayOpen: (v: boolean) => void;
}) {
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <>
      <XDSCard>
        <XDSVStack gap={4}>
          <XDSText type="label" display="block">
            Navigation & Overlays
          </XDSText>
          <div>
            <XDSText type="supporting" color="secondary" display="block">
              Modal — directional entry from trigger · duration-medium-max
            </XDSText>
            <div style={{marginTop: 8}}>
              <XDSButton
                label="Open Modal"
                onClick={() => setModalOpen(true)}
              />
            </div>
          </div>
          <XDSDivider />
          <div>
            <XDSText type="supporting" color="secondary" display="block">
              Panels — overlay (slide over content) vs push (resizes content) ·
              duration-medium (enter) / duration-medium-min (exit)
            </XDSText>
            <div style={{marginTop: 8, display: 'flex', gap: 8}}>
              <XDSButton
                label="Overlay Panel"
                variant={overlayOpen ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setOverlayOpen(!overlayOpen)}
              />
              <XDSButton
                label="Push Panel"
                variant={pushOpen ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setPushOpen(!pushOpen)}
              />
            </div>
          </div>
        </XDSVStack>
      </XDSCard>
      <XDSDialog isOpen={modalOpen} onOpenChange={setModalOpen}>
        <div style={{padding: 'var(--spacing-3)'}}>
          <XDSText type="body" color="secondary">
            This modal uses the XDSDialog component with directional entry
            animation from the trigger element. Try adjusting the duration and
            easing tokens.
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
    </>
  );
}

// =============================================================================
// Micro-Interactions Preview
// =============================================================================

function MicroInteractionsPreview() {
  const [switch1, setSwitch1] = React.useState(false);
  const [switch2, setSwitch2] = React.useState(true);
  const [switch3, setSwitch3] = React.useState(false);
  const [check1, setCheck1] = React.useState(false);
  const [check2, setCheck2] = React.useState(true);
  const [check3, setCheck3] = React.useState(false);
  const [sliderValue, setSliderValue] = React.useState(50);
  const [selectorValue, setSelectorValue] = React.useState('Apple');
  const [statusInputValue, setStatusInputValue] =
    React.useState('ted@example.com');
  const [showStatus, setShowStatus] = React.useState(false);

  return (
    <XDSCard>
      <XDSVStack gap={4}>
        <XDSText type="label" display="block">
          Micro-Interactions
        </XDSText>
        <div>
          <XDSText type="supporting" color="secondary" display="block">
            Buttons — hover, press, focus · duration-fast · Dropdown ·
            duration-fast-max
          </XDSText>
          <XDSHStack gap={2} style={{marginTop: 8}}>
            <XDSButton label="Primary" variant="primary" onClick={() => {}} />
            <XDSButton
              label="Secondary"
              variant="secondary"
              onClick={() => {}}
            />
            <XDSButton label="Ghost" variant="ghost" onClick={() => {}} />
            <XDSButton
              label="Destructive"
              variant="destructive"
              onClick={() => {}}
            />
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
        <XDSDivider />
        <div>
          <XDSText type="supporting" color="secondary" display="block">
            Popover · duration-fast-max · HoverCard · duration-fast-max ·
            Tooltip · duration-fast-max — fade + translateY/X + scale ·
            direction-aware
          </XDSText>
          <XDSHStack
            gap={2}
            vAlign="center"
            style={{marginTop: 8, flexWrap: 'wrap'}}>
            <XDSPopover content={<PopoverSettingsContent />} placement="below">
              <XDSButton label="Below" variant="secondary" size="sm" />
            </XDSPopover>
            <XDSPopover content={<PopoverSettingsContent />} placement="above">
              <XDSButton label="Above" variant="secondary" size="sm" />
            </XDSPopover>
            <XDSPopover content={<PopoverSettingsContent />} placement="end">
              <XDSButton label="End" variant="secondary" size="sm" />
            </XDSPopover>
            <XDSPopover content={<PopoverSettingsContent />} placement="start">
              <XDSButton label="Start" variant="secondary" size="sm" />
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
                    Uses duration-fast-max. Hover to trigger.
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
            <XDSTooltip content="Tooltip — uses duration-fast-max">
              <XDSButton
                label="Tooltip"
                variant="secondary"
                size="sm"
                onClick={() => {}}
              />
            </XDSTooltip>
          </XDSHStack>
        </div>
        <XDSDivider />
        <div>
          <XDSText type="supporting" color="secondary" display="block">
            Switches — thumb slide, track color · duration-fast
          </XDSText>
          <XDSHStack gap={4} style={{marginTop: 8}}>
            <XDSSwitch label="Switch 1" value={switch1} onChange={setSwitch1} />
            <XDSSwitch label="Switch 2" value={switch2} onChange={setSwitch2} />
            <XDSSwitch label="Switch 3" value={switch3} onChange={setSwitch3} />
          </XDSHStack>
        </div>
        <XDSDivider />
        <div>
          <XDSText type="supporting" color="secondary" display="block">
            Checkbox — check transitions · duration-fast
          </XDSText>
          <XDSHStack gap={6} style={{marginTop: 8}}>
            <XDSCheckboxInput
              label="Option A"
              value={check1}
              onChange={setCheck1}
            />
            <XDSCheckboxInput
              label="Option B"
              value={check2}
              onChange={setCheck2}
            />
            <XDSCheckboxInput
              label="Option C"
              value={check3}
              onChange={setCheck3}
            />
          </XDSHStack>
        </div>
        <XDSDivider />
        <div>
          <XDSText type="supporting" color="secondary" display="block">
            Slider — thumb: duration-fast · tooltip: duration-fast-min
          </XDSText>
          <div style={{marginTop: 8, maxWidth: 300}}>
            <XDSSlider
              label="Volume"
              value={sliderValue}
              onChange={setSliderValue}
              min={0}
              max={100}
            />
          </div>
        </div>
        <XDSDivider />
        <div>
          <XDSText type="supporting" color="secondary" display="block">
            Input validation — status transition · duration-fast-max
          </XDSText>
          <XDSHStack gap={3} vAlign="end" style={{marginTop: 8}}>
            <div style={{flex: 1, maxWidth: 300}}>
              <XDSTextInput
                label="Email"
                value={statusInputValue}
                onChange={setStatusInputValue}
                placeholder="Enter email..."
                status={
                  showStatus
                    ? {type: 'success', message: 'Email verified'}
                    : undefined
                }
              />
            </div>
            <XDSButton
              label={showStatus ? 'Clear status' : 'Validate'}
              variant={showStatus ? 'ghost' : 'secondary'}
              onClick={() => setShowStatus(!showStatus)}
            />
          </XDSHStack>
        </div>
        <XDSDivider />
        <div>
          <XDSText type="supporting" color="secondary" display="block">
            Selector — open/close, chevron rotation · duration-fast-max
          </XDSText>
          <div style={{marginTop: 8, maxWidth: 200}}>
            <XDSSelector
              label="Fruit"
              options={['Apple', 'Banana', 'Orange', 'Mango']}
              value={selectorValue}
              onChange={setSelectorValue}
            />
          </div>
        </div>
      </XDSVStack>
    </XDSCard>
  );
}

// =============================================================================
// Loading & Status Preview
// =============================================================================

function LoadingStatusPreview() {
  const [progressValue, setProgressValue] = React.useState(65);

  return (
    <XDSCard>
      <XDSVStack gap={4}>
        <XDSText type="label" display="block">
          Loading & Status
        </XDSText>
        <div>
          <XDSText type="supporting" color="secondary" display="block">
            Spinners — continuous rotation · duration-medium-max
          </XDSText>
          <XDSHStack gap={4} vAlign="center" style={{marginTop: 8}}>
            <XDSSpinner size="sm" />
            <XDSSpinner size="md" />
            <XDSSpinner size="lg" />
          </XDSHStack>
        </div>
        <XDSDivider />
        <div>
          <XDSText type="supporting" color="secondary" display="block">
            Skeletons — pulsing opacity with stagger · duration-medium-max
          </XDSText>
          <XDSVStack gap={2} style={{marginTop: 8}}>
            <XDSHStack gap={3} vAlign="center">
              <XDSSkeleton width={40} height={40} radius="rounded" index={0} />
              <XDSVStack gap={1} style={{flex: 1}}>
                <XDSSkeleton width={160} height={14} index={1} />
                <XDSSkeleton width={100} height={10} index={2} />
              </XDSVStack>
            </XDSHStack>
            <XDSSkeleton width="100%" height={12} index={3} />
            <XDSSkeleton width="80%" height={12} index={4} />
            <XDSSkeleton width="60%" height={12} index={5} />
          </XDSVStack>
        </div>
        <XDSDivider />
        <div>
          <XDSText type="supporting" color="secondary" display="block">
            Progress — determinate: duration-medium · indeterminate: hardcoded
            1.5s
          </XDSText>
          <XDSVStack gap={3} style={{marginTop: 8}}>
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
        </div>
        <XDSDivider />
        <div>
          <XDSText type="supporting" color="secondary" display="block">
            Status dots — pulse animation · hardcoded 2s (continuous loop)
          </XDSText>
          <XDSHStack gap={4} vAlign="center" style={{marginTop: 8}}>
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
        </div>
      </XDSVStack>
    </XDSCard>
  );
}

// =============================================================================
// Surface Interactions Preview
// =============================================================================

function SurfaceInteractionsPreview() {
  const [activeTab, setActiveTab] = React.useState('overview');

  return (
    <XDSCard>
      <XDSVStack gap={4}>
        <XDSText type="label" display="block">
          Surface Interactions
        </XDSText>
        <div>
          <XDSText type="supporting" color="secondary" display="block">
            Tabs — color, active indicator · duration-fast
          </XDSText>
          <div style={{marginTop: 8}}>
            <XDSTabList value={activeTab} onChange={setActiveTab}>
              <XDSTab value="overview" label="Overview" />
              <XDSTab value="analytics" label="Analytics" />
              <XDSTab value="reports" label="Reports" />
              <XDSTab value="settings" label="Settings" />
            </XDSTabList>
          </div>
        </div>
        <XDSDivider />
        <div>
          <XDSText type="supporting" color="secondary" display="block">
            List items — background hover · duration-fast-min
          </XDSText>
          <div style={{marginTop: 8}}>
            <XDSList density="balanced" hasDividers>
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
          </div>
        </div>
      </XDSVStack>
    </XDSCard>
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

  // Check if type scale is non-default
  const hasCustomTypeScale =
    typeScaleBase !== undefined &&
    typeScaleRatio !== undefined &&
    (typeScaleBase !== 14 || typeScaleRatio !== 1.2);

  // If type scale is custom, exclude the generated type scale tokens from explicit tokens
  const typeScaleTokenKeys = new Set(Object.keys(typeScaleDefaults));

  for (const [key, value] of Object.entries(tokens)) {
    if (value !== defaults[key]) {
      // Skip type scale tokens if they'll be generated by typeScale config
      if (hasCustomTypeScale && typeScaleTokenKeys.has(key)) continue;
      changedTokens[key] = value;
    }
  }

  const hasTokenOverrides = Object.keys(changedTokens).length > 0;

  if (!hasTokenOverrides && !hasCustomTypeScale) {
    return `import { defineTheme } from '@xds/core/theme';

export const ${themeName}Theme = defineTheme({
  name: '${themeName}',
  tokens: {},
});`;
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
        if (parsed) {
          return `    '${key}': ['${parsed.light}', '${parsed.dark}'],`;
        }
        return `    '${key}': '${value}',`;
      })
      .join('\n');
    parts.push(`  tokens: {\n${tokenEntries}\n  },`);
  } else {
    parts.push(`  tokens: {},`);
  }

  return `import { defineTheme } from '@xds/core/theme';

export const ${themeName}Theme = defineTheme({
  name: '${themeName}',
${parts.join('\n')}
});`;
}

// =============================================================================
// Main Theme Editor Component
// =============================================================================

function ThemeEditorComponent() {
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

  // Collect all defaults
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

  // Type scale state — base and ratio for the interactive type scale editor
  const [typeScaleBase, setTypeScaleBase] = React.useState(14);
  const [typeScaleRatio, setTypeScaleRatio] = React.useState(1.2);

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
  }, [allDefaults]);

  // Create a theme from current tokens.
  // Uses defaultTheme's component overrides so that type scale tokens
  // (--text-heading-1-size, --text-body-size, etc.) are consumed by the
  // heading/text CSS rules in the preview.
  //
  // Type scale tokens are ALWAYS included (even at default values) because
  // the component overrides reference var(--text-heading-1-size) etc., and those
  // unhashed CSS custom properties only exist when the theme explicitly sets them.
  const typeScaleKeys = React.useMemo(
    () => new Set(Object.keys(typeScaleDefaults)),
    [],
  );

  const currentTheme = React.useMemo(() => {
    const tokenOverrides: Record<string, string> = {};
    for (const [key, value] of Object.entries(tokens)) {
      // Always include type scale tokens — the component CSS rules reference
      // var(--text-heading-1-size) etc. which only exist when the theme sets them.
      if (typeScaleKeys.has(key) || value !== allDefaults[key]) {
        tokenOverrides[key] = value;
      }
    }
    return defineTheme({
      name: themeName,
      typography: {scale: {base: typeScaleBase, ratio: typeScaleRatio}},
      tokens: tokenOverrides as Partial<Record<string, string>>,
      icons: defaultIconRegistry,
    });
  }, [tokens, themeName, allDefaults]);

  const renderTokenEditor = () => {
    const group = TOKEN_GROUPS[activeGroup];

    if (activeGroup === 'colors') {
      const categoryTokens =
        COLOR_CATEGORIES[
          activeColorCategory as keyof typeof COLOR_CATEGORIES
        ] || [];

      return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          {/* Color category selector */}
          <XDSSelector
            label="Color Category"
            isLabelHidden
            options={Object.keys(COLOR_CATEGORIES).map(category => ({
              value: category,
              label: category,
            }))}
            value={activeColorCategory}
            onChange={(v: string) => setActiveColorCategory(v)}
          />

          {categoryTokens.map(tokenName => (
            <ColorSwatch
              key={tokenName}
              tokenName={tokenName}
              value={tokens[tokenName] || ''}
              onChange={handleTokenChange}
              mode={mode}
            />
          ))}
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
      // Type scale controls
      const applyTypeScale = (base: number, ratio: number) => {
        setTypeScaleBase(base);
        setTypeScaleRatio(ratio);
        setTokens(prev => ({...prev, ...expandTypeScale({base, ratio})}));
      };

      // Named ratio options from musical/mathematical intervals
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
      const isCustomRatio = !RATIO_OPTIONS.some(
        o => Math.abs(o.value - typeScaleRatio) < 0.001,
      );

      const typeScaleSection = (
        <div
          style={{
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-background-body)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginBottom: '16px',
          }}>
          <XDSText type="label" color="secondary">
            Type Scale
          </XDSText>
          <XDSSlider
            label="Base Size"
            min={10}
            max={24}
            step={1}
            value={typeScaleBase}
            onChange={(v: number) => applyTypeScale(v, typeScaleRatio)}
            formatValue={(v: number) => `${v}px`}
            valueDisplay="text"
          />
          <XDSSelector
            label="Scale Ratio"
            options={[
              ...RATIO_OPTIONS.map(opt => ({
                value: String(opt.value),
                label: opt.label,
              })),
              {
                value: 'custom',
                label: isCustomRatio
                  ? `Custom — ${typeScaleRatio.toFixed(3)}`
                  : 'Custom…',
              },
            ]}
            value={isCustomRatio ? 'custom' : String(typeScaleRatio)}
            onChange={(v: string) => {
              if (v === 'custom') return;
              applyTypeScale(typeScaleBase, Number(v));
            }}
          />
          {isCustomRatio && (
            <XDSSlider
              label="Custom Ratio"
              isLabelHidden
              min={1050}
              max={1700}
              step={1}
              value={Math.round(typeScaleRatio * 1000)}
              onChange={(v: number) => applyTypeScale(typeScaleBase, v / 1000)}
              formatValue={(v: number) => (v / 1000).toFixed(3)}
              valueDisplay="text"
            />
          )}
          <div>
            <XDSText
              type="supporting"
              display="block"
              style={{marginBottom: '4px'}}>
              Recommended values
            </XDSText>
            <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap'}}>
              <XDSButton
                label="Functional"
                variant={
                  typeScaleBase === 12 && typeScaleRatio === 1.125
                    ? 'primary'
                    : 'ghost'
                }
                size="sm"
                onClick={() => applyTypeScale(12, 1.125)}
              />
              <XDSButton
                label="Default"
                variant={
                  typeScaleBase === 14 && typeScaleRatio === 1.2
                    ? 'primary'
                    : 'ghost'
                }
                size="sm"
                onClick={() => applyTypeScale(14, 1.2)}
              />
              <XDSButton
                label="Editorial"
                variant={
                  typeScaleBase === 16 && typeScaleRatio === 1.25
                    ? 'primary'
                    : 'ghost'
                }
                size="sm"
                onClick={() => applyTypeScale(16, 1.25)}
              />
            </div>
          </div>
          {/* Compact heading preview */}
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-background-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}>
            {[1, 2, 3, 4, 5, 6].map(level => {
              const sizeRaw = tokens[`--heading-${level}-size`] || '';
              // Resolve var() refs: "var(--font-size-2xl)" → look up --font-size-2xl in tokens
              const resolvedSize = sizeRaw.startsWith('var(')
                ? tokens[sizeRaw.slice(4, -1)] || sizeRaw
                : sizeRaw;
              // Convert rem to px for display: "1.5rem" → "24px"
              const displayPx = resolvedSize.endsWith('rem')
                ? `${Math.round(parseFloat(resolvedSize) * 16)}px`
                : resolvedSize;
              return (
                <div
                  key={level}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '8px',
                  }}>
                  <XDSText
                    type="code"
                    color="secondary"
                    style={{width: '18px', flexShrink: 0}}>
                    h{level}
                  </XDSText>
                  <span
                    style={{
                      fontSize: resolvedSize,
                      fontWeight: 600,
                      lineHeight: 1.3,
                      color: 'var(--color-text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                    Heading
                  </span>
                  <XDSText
                    type="code"
                    color="secondary"
                    style={{marginLeft: 'auto', flexShrink: 0}}>
                    {displayPx}
                  </XDSText>
                </div>
              );
            })}
            <div
              style={{
                borderTop: '1px solid var(--color-divider)',
                marginTop: '4px',
                paddingTop: '4px',
              }}>
              {(['large', 'body', 'supporting'] as const).map(type => {
                const sizeRaw = tokens[`--text-${type}-size`] || '';
                const resolvedSize = sizeRaw.startsWith('var(')
                  ? tokens[sizeRaw.slice(4, -1)] || sizeRaw
                  : sizeRaw;
                const displayPx = resolvedSize.endsWith('rem')
                  ? `${Math.round(parseFloat(resolvedSize) * 16)}px`
                  : resolvedSize;
                return (
                  <div
                    key={type}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '8px',
                    }}>
                    <XDSText
                      type="code"
                      color="secondary"
                      style={{width: '60px', flexShrink: 0}}>
                      {type}
                    </XDSText>
                    <span
                      style={{
                        fontSize: resolvedSize,
                        fontWeight: type === 'large' ? 600 : 400,
                        lineHeight: 1.4,
                        color:
                          type === 'supporting'
                            ? 'var(--color-text-secondary)'
                            : 'var(--color-text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                      Sample text
                    </span>
                    <XDSText
                      type="code"
                      color="secondary"
                      style={{marginLeft: 'auto', flexShrink: 0}}>
                      {displayPx}
                    </XDSText>
                  </div>
                );
              })}
            </div>
          </div>
          <XDSText type="code" color="secondary">
            size = {typeScaleBase} × {typeScaleRatio.toFixed(3)}^step · h4 =
            anchor
          </XDSText>
        </div>
      );

      const categoryValue = TYPOGRAPHY_CATEGORIES[
        activeTypographyCategory as keyof typeof TYPOGRAPHY_CATEGORIES
      ] as unknown as TypographyCategoryValue | undefined;

      // Get the list of tokens for this category
      const categoryTokens: string[] = categoryValue
        ? Array.isArray(categoryValue)
          ? categoryValue
          : categoryValue.tokens
        : [];

      const categoryDescription =
        categoryValue && !Array.isArray(categoryValue)
          ? categoryValue.description
          : null;

      // Determine sample text rendering for semantic categories
      const isSemanticStyle = categoryValue && !Array.isArray(categoryValue);

      return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          {typeScaleSection}

          {/* Typography category selector */}
          <XDSSelector
            label="Typography Category"
            isLabelHidden
            options={[
              {
                type: 'section' as const,
                title: 'Semantic Styles',
                options: Object.keys(TYPOGRAPHY_CATEGORIES)
                  .filter(
                    k =>
                      !Array.isArray(
                        TYPOGRAPHY_CATEGORIES[
                          k as keyof typeof TYPOGRAPHY_CATEGORIES
                        ],
                      ),
                  )
                  .map(category => ({value: category, label: category})),
              },
              {
                type: 'section' as const,
                title: 'Raw Tokens',
                options: Object.keys(TYPOGRAPHY_CATEGORIES)
                  .filter(k =>
                    Array.isArray(
                      TYPOGRAPHY_CATEGORIES[
                        k as keyof typeof TYPOGRAPHY_CATEGORIES
                      ],
                    ),
                  )
                  .map(category => ({value: category, label: category})),
              },
            ]}
            value={activeTypographyCategory}
            onChange={(v: string) => setActiveTypographyCategory(v)}
          />

          {/* Description for semantic styles */}
          {categoryDescription && (
            <XDSText
              type="supporting"
              display="block"
              style={{marginBottom: '4px'}}>
              {categoryDescription}
            </XDSText>
          )}

          {/* Sample text preview for semantic styles */}
          {isSemanticStyle && (
            <div
              style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-background-body)',
                border: '1px solid var(--color-border)',
                marginBottom: '8px',
              }}>
              <div
                style={{
                  fontSize: tokens[categoryTokens[0]] || 'inherit',
                  fontWeight: tokens[categoryTokens[1]] || 'inherit',
                  lineHeight: tokens[categoryTokens[2]] || 'inherit',
                  color: 'var(--color-text-primary)',
                }}>
                {activeTypographyCategory === 'Code Text'
                  ? 'const theme = defineTheme({...});'
                  : `The quick brown fox jumps over the lazy dog`}
              </div>
            </div>
          )}

          {/* Token editors */}
          {categoryTokens.map(tokenName => (
            <TypographyEditor
              key={tokenName}
              tokenName={tokenName}
              value={tokens[tokenName] || ''}
              onChange={handleTokenChange}
            />
          ))}
        </div>
      );
    }

    // Default: generic text input
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
        {Object.keys(group.tokens).map(tokenName => (
          <div
            key={tokenName}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-background-body)',
            }}>
            <div style={{flex: 1, minWidth: 0}}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                  marginBottom: '2px',
                }}>
                {getTokenLabel(tokenName)}
              </div>
              <code
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-family-code)',
                }}>
                {tokenName}
              </code>
            </div>
            <input
              type="text"
              value={tokens[tokenName] || ''}
              onChange={e => handleTokenChange(tokenName, e.target.value)}
              style={{
                width: '200px',
                padding: '4px 8px',
                fontSize: '12px',
                fontFamily: 'var(--font-family-code)',
                border: '1px solid var(--color-border-emphasized)',
                borderRadius: '4px',
                backgroundColor: 'var(--color-background-surface)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: 'var(--color-background-body)',
      }}>
      {/* Left Panel - Token Editor */}
      <div
        style={{
          width: '400px',
          borderRight: '1px solid var(--color-border-emphasized)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--color-background-surface)',
        }}>
        {/* Token group tabs */}
        <div
          style={{
            padding: '16px 16px 12px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap',
          }}>
          {(Object.keys(TOKEN_GROUPS) as TokenGroupKey[]).map(groupKey => (
            <XDSButton
              key={groupKey}
              label={TOKEN_GROUPS[groupKey].label}
              variant={activeGroup === groupKey ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveGroup(groupKey)}
            />
          ))}
        </div>

        {/* Group description */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-border)',
          }}>
          <XDSText type="supporting">
            {TOKEN_GROUPS[activeGroup].description}
          </XDSText>
        </div>

        {/* Token list */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px',
          }}>
          {renderTokenEditor()}
        </div>

        {/* Actions */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            gap: '8px',
          }}>
          <XDSButton label="Reset All" variant="ghost" onClick={handleReset} />
          <XDSButton
            label={showCode ? 'Hide Code' : 'Export Code'}
            variant="secondary"
            onClick={() => setShowCode(!showCode)}
          />
        </div>
      </div>
      {/* Right Panel - Preview */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
        {/* Preview header */}
        <div
          style={{
            padding: '12px 24px',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-background-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <XDSHeading level={4}>Live Preview</XDSHeading>
          <div style={{display: 'flex', gap: '4px'}}>
            <XDSButton
              label="Light"
              variant={mode === 'light' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setMode('light')}
            />
            <XDSButton
              label="Dark"
              variant={mode === 'dark' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setMode('dark')}
            />
          </div>
        </div>

        {/* Code panel (collapsible) */}
        {showCode && (
          <div
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-background-body)',
              maxHeight: '300px',
              overflow: 'auto',
            }}>
            <XDSText
              type="label"
              style={{marginBottom: '8px', display: 'block'}}>
              Generated Theme Code
            </XDSText>
            <pre
              style={{
                padding: '16px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-background-surface)',
                border: '1px solid var(--color-border-emphasized)',
                fontSize: '12px',
                fontFamily: 'var(--font-family-code)',
                overflow: 'auto',
                margin: 0,
                color: 'var(--color-text-primary)',
              }}>
              {generateThemeCode(
                themeName,
                tokens,
                allDefaults,
                typeScaleBase,
                typeScaleRatio,
              )}
            </pre>
          </div>
        )}

        {/* Preview content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
          <XDSTheme theme={currentTheme} mode={mode}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                overflow: 'hidden',
                position: 'relative',
              }}>
              <div style={{flex: 1, overflow: 'auto', minWidth: 0}}>
                <div
                  style={{
                    backgroundColor: 'var(--color-background-surface)',
                    padding: '24px',
                  }}>
                  <PreviewTabs
                    isMotionGroup={
                      activeGroup === 'duration' || activeGroup === 'easing'
                    }
                    pushOpen={pushPanelOpen}
                    setPushOpen={setPushPanelOpen}
                    overlayOpen={overlayPanelOpen}
                    setOverlayOpen={setOverlayPanelOpen}
                  />
                </div>
              </div>

              {/* Overlay panel — absolute, slides over content */}
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
                  transition: `transform var(--duration-medium) var(--ease-standard), opacity var(--duration-medium) var(--ease-standard)`,
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

              {/* Push panel — in flow, pushes content */}
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
                  transition: `width var(--duration-medium) var(--ease-standard), max-width var(--duration-medium) var(--ease-standard), opacity var(--duration-medium) var(--ease-standard)`,
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
    </div>
  );
}

export default function ThemeEditorPage() {
  return <ThemeEditorComponent />;
}
