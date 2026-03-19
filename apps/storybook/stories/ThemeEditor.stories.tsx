import type {Meta, StoryObj} from '@storybook/react';
import * as React from 'react';
import {XDSButton} from '@xds/core/Button';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSBadge} from '@xds/core/Badge';
import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Stack';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBanner} from '@xds/core/Banner';
import {XDSTabList} from '@xds/core/TabList';
import {XDSDialog} from '@xds/core/Dialog';
import {XDSToken} from '@xds/core/Token';
import {XDSSlider} from '@xds/core/Slider';
import {XDSSelector} from '@xds/core/Selector';
import {XDSNumberInput} from '@xds/core/NumberInput';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
import {XDSTable} from '@xds/core/Table';
import type {XDSTableColumn} from '@xds/core/Table';
import {XDSDivider} from '@xds/core/Divider';
import {XDSLink} from '@xds/core/Link';
import {XDSTooltip} from '@xds/core/Tooltip';
import {XDSSkeleton} from '@xds/core/Skeleton';
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSBreadcrumbs, XDSBreadcrumbItem} from '@xds/core/Breadcrumbs';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSEmptyState} from '@xds/core/EmptyState';
import {XDSKbd} from '@xds/core/Kbd';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSCollapsible} from '@xds/core/Collapsible';
import {XDSCollapsibleGroup} from '@xds/core/Collapsible';
import {XDSPagination} from '@xds/core/Pagination';
import {XDSPopover} from '@xds/core/Popover';
import {XDSGrid, XDSGridSpan} from '@xds/core/Grid';
import {XDSHStack} from '@xds/core/Stack';
import {XDSVStack} from '@xds/core/Stack';
import {XDSCenter} from '@xds/core/Center';
import {XDSTheme, defineTheme, expandTypeScale} from '@xds/core/theme';
import {
  colorDefaults,
  spacingDefaults,
  radiusDefaults,
  typographyDefaults,
  textSizeDefaults,
  lineHeightDefaults,
  fontWeightDefaults,
  typeScaleDefaults,
  sizeDefaults,
  shadowDefaults,
  durationDefaults,
  easeDefaults,
  transitionDefaults,
} from '@xds/core/theme';
import {defaultIconRegistry} from '@xds/theme-default';

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
      ...lineHeightDefaults,
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
    '--color-secondary',
    '--color-surface',
    '--color-wash',
    '--color-overlay',
  ],
  'Interactive States': [
    '--color-overlay-hover',
    '--color-overlay-pressed',
    '--color-ring-focus',
    '--color-ring-focus-error',
    '--color-ring-focus-success',
    '--color-ring-focus-warning',
    '--color-muted',
  ],
  Text: [
    '--color-text-primary',
    '--color-text-secondary',
    '--color-text-disabled',
    '--color-text-link',
    '--color-text-on-dark-media',
  ],
  Icon: [
    '--color-icon-primary',
    '--color-icon-secondary',
    '--color-icon-disabled',
    '--color-icon-on-dark-media',
  ],
  'Surface Variants': ['--color-card', '--color-popover', '--color-navbar'],
  'Status/Sentiment': [
    '--color-success',
    '--color-success-muted',
    '--color-error',
    '--color-error-muted',
    '--color-warning',
    '--color-warning-muted',
    '--color-info',
    '--color-info-muted',
  ],
  Divider: [
    '--color-border',
    '--color-border-strong',
    '--color-border-emphasized',
  ],
  Effects: ['--color-skeleton', '--color-shadow', '--color-hover-tint'],
  'Palette: Blue': [
    '--color-blue-background',
    '--color-blue-border',
    '--color-blue-icon',
    '--color-blue-text',
  ],
  'Palette: Green': [
    '--color-green-background',
    '--color-green-border',
    '--color-green-icon',
    '--color-green-text',
  ],
  'Palette: Red': [
    '--color-red-background',
    '--color-red-border',
    '--color-red-icon',
    '--color-red-text',
  ],
  'Palette: Yellow': [
    '--color-yellow-background',
    '--color-yellow-border',
    '--color-yellow-icon',
    '--color-yellow-text',
  ],
  'Palette: Orange': [
    '--color-orange-background',
    '--color-orange-border',
    '--color-orange-icon',
    '--color-orange-text',
  ],
  'Palette: Purple': [
    '--color-purple-background',
    '--color-purple-border',
    '--color-purple-icon',
    '--color-purple-text',
  ],
  'Palette: Pink': [
    '--color-pink-background',
    '--color-pink-border',
    '--color-pink-icon',
    '--color-pink-text',
  ],
  'Palette: Teal': [
    '--color-teal-background',
    '--color-teal-border',
    '--color-teal-icon',
    '--color-teal-text',
  ],
  'Palette: Cyan': [
    '--color-cyan-background',
    '--color-cyan-border',
    '--color-cyan-icon',
    '--color-cyan-text',
  ],
  'Palette: Gray': [
    '--color-gray-background',
    '--color-gray-border',
    '--color-gray-icon',
    '--color-gray-text',
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
  'Font Families': ['--font-body', '--font-heading', '--font-code'],
  'Heading 1': {
    description: 'Primary page title (24px default)',
    tokens: ['--heading-1-size', '--heading-1-weight', '--heading-1-leading'],
  },
  'Heading 2': {
    description: 'Section title (20px default)',
    tokens: ['--heading-2-size', '--heading-2-weight', '--heading-2-leading'],
  },
  'Heading 3': {
    description: 'Subsection title (17px default)',
    tokens: ['--heading-3-size', '--heading-3-weight', '--heading-3-leading'],
  },
  'Heading 4': {
    description: 'Card/component title (14px — base anchor)',
    tokens: ['--heading-4-size', '--heading-4-weight', '--heading-4-leading'],
  },
  'Heading 5': {
    description: 'Minor heading (12px default)',
    tokens: ['--heading-5-size', '--heading-5-weight', '--heading-5-leading'],
  },
  'Heading 6': {
    description: 'Smallest heading (10px default)',
    tokens: ['--heading-6-size', '--heading-6-weight', '--heading-6-leading'],
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
    '--text-4xs',
    '--text-3xs',
    '--text-2xs',
    '--text-xsm',
    '--text-sm',
    '--text-base',
    '--text-lg',
    '--text-xl',
    '--text-2xl',
    '--text-3xl',
    '--text-4xl',
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
        backgroundColor: 'var(--color-wash)',
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
            fontFamily: 'var(--font-code)',
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
                fontFamily: 'var(--font-code)',
                border: '1px solid var(--color-border-emphasized)',
                borderRadius: '4px',
                backgroundColor: 'var(--color-surface)',
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
            fontFamily: 'var(--font-code)',
            border: '1px solid var(--color-border-emphasized)',
            borderRadius: '4px',
            backgroundColor: 'var(--color-surface)',
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
        backgroundColor: 'var(--color-wash)',
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
            fontFamily: 'var(--font-code)',
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
          fontFamily: 'var(--font-code)',
          border: '1px solid var(--color-border-emphasized)',
          borderRadius: '4px',
          backgroundColor: 'var(--color-surface)',
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
        backgroundColor: 'var(--color-wash)',
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
            fontFamily: 'var(--font-code)',
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
          fontFamily: 'var(--font-code)',
          border: '1px solid var(--color-border-emphasized)',
          borderRadius: '4px',
          backgroundColor: 'var(--color-surface)',
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
        backgroundColor: 'var(--color-wash)',
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
            fontFamily: 'var(--font-code)',
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
          fontFamily: 'var(--font-code)',
          border: '1px solid var(--color-border-emphasized)',
          borderRadius: '4px',
          backgroundColor: 'var(--color-surface)',
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

// =============================================================================
// Dashboard Example — Transaction Table Data
// =============================================================================

interface TransactionRow extends Record<string, unknown> {
  id: string;
  name: string;
  transactionId: string;
  card: string;
  amount: string;
}

const transactionColumns: XDSTableColumn<TransactionRow>[] = [
  {key: 'name', header: 'Name'},
  {key: 'transactionId', header: 'Transaction ID'},
  {key: 'card', header: 'Card'},
  {key: 'amount', header: 'Amount'},
];

const transactionData: TransactionRow[] = [
  {
    id: '1',
    name: 'iPhone 17 purchased',
    transactionId: '#21325554',
    card: '•••• 5635',
    amount: '$790',
  },
  {
    id: '2',
    name: 'Refrigerator',
    transactionId: '#21325554',
    card: '•••• 5635',
    amount: '$1,524',
  },
  {
    id: '3',
    name: 'Car Purchased',
    transactionId: '#21325554',
    card: '•••• 5635',
    amount: '$1,420',
  },
  {
    id: '4',
    name: 'Asus ExpertBook P1',
    transactionId: '#21325554',
    card: '•••• 5635',
    amount: '$1,250',
  },
];

function ComponentPreview() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState('overview');
  const [switchValue, setSwitchValue] = React.useState(true);
  const [sliderValue, setSliderValue] = React.useState(50);
  const [checkboxValue, setCheckboxValue] = React.useState(false);
  const [radioValue, setRadioValue] = React.useState('option1');
  const [selectorValue, setSelectorValue] = React.useState<string | undefined>(
    undefined,
  );
  const [numberValue, setNumberValue] = React.useState<number | null>(null);
  const [textAreaValue, setTextAreaValue] = React.useState('');
  const [paginationPage, setPaginationPage] = React.useState(1);

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
    <XDSVStack gap={8}>
      {/* Typography Scale - Article Example */}
      <XDSVStack gap={4}>
        <XDSText type="label">Typography Scale</XDSText>
        <XDSCard padding="lg">
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
                borderRadius: 'var(--radius-2)',
                backgroundColor: 'var(--color-wash)',
                border: '1px solid var(--color-border)',
                fontFamily: 'var(--font-code)',
                fontSize: 'var(--text-sm)',
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
    color: colorVars['--color-text-on-dark-media'],
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
            <XDSList listStyle="disc">
              <XDSListItem label="Automatic dark mode support via light-dark()" />
              <XDSListItem label="Centralized theme customization" />
              <XDSListItem label="Consistent visual language across components" />
              <XDSListItem label="Easy global updates when design changes" />
            </XDSList>

            <XDSText type="supporting">
              Last updated: March 2026 · 5 min read
            </XDSText>
          </article>
        </XDSCard>
      </XDSVStack>

      {/* Button Sizes */}
      <XDSVStack gap={3}>
        <XDSText type="label">Button Sizes</XDSText>
        <XDSVStack gap={4}>
          <XDSHStack gap={2} vAlign="center">
            <XDSText type="supporting" style={{width: '40px', flexShrink: 0}}>
              sm
            </XDSText>
            <XDSButton label="Primary" variant="primary" size="sm" />
            <XDSButton label="Secondary" variant="secondary" size="sm" />
            <XDSButton label="Ghost" variant="ghost" size="sm" />
            <XDSButton label="Destructive" variant="destructive" size="sm" />
          </XDSHStack>
          <XDSHStack gap={2} vAlign="center">
            <XDSText type="supporting" style={{width: '40px', flexShrink: 0}}>
              md
            </XDSText>
            <XDSButton label="Primary" variant="primary" size="md" />
            <XDSButton label="Secondary" variant="secondary" size="md" />
            <XDSButton label="Ghost" variant="ghost" size="md" />
            <XDSButton label="Destructive" variant="destructive" size="md" />
          </XDSHStack>
          <XDSHStack gap={2} vAlign="center">
            <XDSText type="supporting" style={{width: '40px', flexShrink: 0}}>
              lg
            </XDSText>
            <XDSButton label="Primary" variant="primary" size="lg" />
            <XDSButton label="Secondary" variant="secondary" size="lg" />
            <XDSButton label="Ghost" variant="ghost" size="lg" />
            <XDSButton label="Destructive" variant="destructive" size="lg" />
          </XDSHStack>
        </XDSVStack>
      </XDSVStack>

      {/* Button States */}
      <XDSVStack gap={3}>
        <XDSText type="label">Button States</XDSText>
        <XDSHStack gap={2} wrap="wrap">
          <XDSButton label="Default" variant="primary" />
          <XDSButton label="Disabled" variant="primary" isDisabled />
          <XDSButton label="Loading" variant="primary" isLoading />
        </XDSHStack>
      </XDSVStack>

      {/* Spacing Table */}
      <XDSVStack gap={3}>
        <XDSText type="label">Spacing Scale</XDSText>
        <XDSTable
          columns={spacingTableColumns}
          data={spacingData}
          getRowKey={row => row.token}
          density="compact"
          dividers="rows"
        />
      </XDSVStack>

      {/* Badges */}
      <XDSVStack gap={3}>
        <XDSText type="label">Badges</XDSText>
        <XDSHStack gap={2} wrap="wrap">
          <XDSBadge label="Default" />
          <XDSBadge label="Primary" variant="primary" />
          <XDSBadge label="Ghost" variant="ghost" />
          <XDSBadge label="Positive" sentiment="positive" />
          <XDSBadge label="Negative" sentiment="negative" />
          <XDSBadge label="Warning" sentiment="warning" />
        </XDSHStack>
      </XDSVStack>

      {/* Tokens */}
      <XDSVStack gap={3}>
        <XDSText type="label">Tokens</XDSText>
        <XDSHStack gap={2} wrap="wrap">
          <XDSToken label="Default" />
          <XDSToken label="Blue" color="blue" />
          <XDSToken label="Green" color="green" />
          <XDSToken label="Red" color="red" />
          <XDSToken label="Purple" color="purple" />
          <XDSToken label="Orange" color="orange" />
        </XDSHStack>
      </XDSVStack>

      {/* Form Controls */}
      <XDSVStack gap={3}>
        <XDSText type="label">Form Controls</XDSText>
        <XDSVStack gap={3} style={{maxWidth: '300px'}}>
          <XDSTextInput label="Text Input" placeholder="Enter text..." />
          <XDSSwitch
            label="Toggle Switch"
            isSelected={switchValue}
            onChange={setSwitchValue}
          />
          <XDSCheckboxInput
            label="Checkbox"
            isSelected={checkboxValue}
            onChange={setCheckboxValue}
          />
          <XDSSlider
            label="Slider"
            value={sliderValue}
            onChange={setSliderValue}
            minValue={0}
            maxValue={100}
          />
        </XDSVStack>
      </XDSVStack>

      {/* Radio List */}
      <XDSVStack gap={3}>
        <XDSText type="label">Radio List</XDSText>
        <XDSRadioList
          label="Select an option"
          value={radioValue}
          onChange={setRadioValue}>
          <XDSRadioListItem value="option1" label="Option 1" />
          <XDSRadioListItem value="option2" label="Option 2" />
          <XDSRadioListItem value="option3" label="Option 3" />
        </XDSRadioList>
      </XDSVStack>

      {/* Progress */}
      <XDSVStack gap={3}>
        <XDSText type="label">Progress</XDSText>
        <XDSVStack gap={2} style={{maxWidth: '300px'}}>
          <XDSProgressBar value={25} label="25%" />
          <XDSProgressBar value={50} label="50%" />
          <XDSProgressBar value={75} label="75%" />
        </XDSVStack>
      </XDSVStack>

      {/* Tabs */}
      <XDSVStack gap={3}>
        <XDSText type="label">Tabs</XDSText>
        <XDSTabList
          tabs={[
            {id: 'overview', label: 'Overview'},
            {id: 'details', label: 'Details'},
            {id: 'settings', label: 'Settings'},
          ]}
          selectedId={selectedTab}
          onSelect={setSelectedTab}
        />
      </XDSVStack>

      {/* Avatar */}
      <XDSVStack gap={3}>
        <XDSText type="label">Avatars</XDSText>
        <XDSHStack gap={2} vAlign="center">
          <XDSAvatar name="John Doe" size="sm" />
          <XDSAvatar name="Jane Smith" size="md" />
          <XDSAvatar name="Bob Wilson" size="lg" />
        </XDSHStack>
      </XDSVStack>

      {/* Banner */}
      <XDSVStack gap={3}>
        <XDSText type="label">Banners</XDSText>
        <XDSVStack gap={2}>
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
        </XDSVStack>
      </XDSVStack>

      {/* Card */}
      <XDSVStack gap={3}>
        <XDSText type="label">Card</XDSText>
        <XDSCard padding="md">
          <XDSStack gap="sm">
            <XDSHeading level={4}>Card Title</XDSHeading>
            <XDSText type="body">
              This is a sample card with some content to demonstrate how cards
              look with the current theme.
            </XDSText>
            <XDSHStack gap={2}>
              <XDSButton label="Action" variant="primary" size="sm" />
              <XDSButton label="Cancel" variant="ghost" size="sm" />
            </XDSHStack>
          </XDSStack>
        </XDSCard>
      </XDSVStack>

      {/* Dialog trigger */}
      <XDSVStack gap={3}>
        <XDSText type="label">Dialog</XDSText>
        <XDSButton
          label="Open Dialog"
          variant="secondary"
          onClick={() => setDialogOpen(true)}
        />
        <XDSDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Sample Dialog">
          <div style={{padding: '0 24px 24px 24px'}}>
            <XDSStack gap="md">
              <XDSText type="body">
                This is a sample dialog to preview how dialogs look with the
                current theme settings.
              </XDSText>
              <XDSTextInput
                label="Example Input"
                placeholder="Type something..."
              />
              <XDSHStack gap={2} hAlign="end">
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
              </XDSHStack>
            </XDSStack>
          </div>
        </XDSDialog>
      </XDSVStack>

      {/* Links */}
      <XDSVStack gap={3}>
        <XDSText type="label">Links</XDSText>
        <XDSHStack gap={4} wrap="wrap" vAlign="center">
          <XDSLink href="#" label="Default link">
            Default link
          </XDSLink>
          <XDSLink href="#" label="Active link" color="active">
            Active link
          </XDSLink>
          <XDSLink href="#" label="Secondary link" color="secondary">
            Secondary link
          </XDSLink>
          <XDSLink href="#" label="Underlined" hasUnderline>
            Always underlined
          </XDSLink>
          <XDSLink href="#" label="External link" isExternalLink>
            External link
          </XDSLink>
        </XDSHStack>
      </XDSVStack>

      {/* Tooltip */}
      <XDSVStack gap={3}>
        <XDSText type="label">Tooltip</XDSText>
        <XDSHStack gap={3} vAlign="center">
          <XDSTooltip content="Helpful tooltip text" placement="above">
            <XDSButton
              label="Hover for tooltip"
              variant="secondary"
              size="sm"
            />
          </XDSTooltip>
          <XDSTooltip content="Another tooltip" placement="below">
            <XDSBadge label="Hover me too" />
          </XDSTooltip>
        </XDSHStack>
      </XDSVStack>

      {/* Selector & NumberInput */}
      <XDSVStack gap={3}>
        <XDSText type="label">Selector &amp; Number Input</XDSText>
        <XDSVStack gap={3} style={{maxWidth: '300px'}}>
          <XDSSelector
            label="Fruit"
            options={['Apple', 'Banana', 'Orange', 'Mango', 'Pineapple']}
            value={selectorValue}
            onChange={setSelectorValue}
            placeholder="Select a fruit..."
          />
          <XDSNumberInput
            label="Quantity"
            value={numberValue}
            onChange={setNumberValue}
            placeholder="Enter a number"
          />
        </XDSVStack>
      </XDSVStack>

      {/* TextArea */}
      <XDSVStack gap={3}>
        <XDSText type="label">Text Area</XDSText>
        <XDSVStack style={{maxWidth: '400px'}}>
          <XDSTextArea
            label="Description"
            placeholder="Enter a longer description..."
            value={textAreaValue}
            onChange={setTextAreaValue}
          />
        </XDSVStack>
      </XDSVStack>

      {/* Breadcrumbs */}
      <XDSVStack gap={3}>
        <XDSText type="label">Breadcrumbs</XDSText>
        <XDSBreadcrumbs>
          <XDSBreadcrumbItem href="#">Home</XDSBreadcrumbItem>
          <XDSBreadcrumbItem href="#">Projects</XDSBreadcrumbItem>
          <XDSBreadcrumbItem href="#">Design System</XDSBreadcrumbItem>
          <XDSBreadcrumbItem isCurrent>Theme Editor</XDSBreadcrumbItem>
        </XDSBreadcrumbs>
      </XDSVStack>

      {/* Dropdown Menu */}
      <XDSVStack gap={3}>
        <XDSText type="label">Dropdown Menu</XDSText>
        <XDSHStack gap={2}>
          <XDSDropdownMenu
            button={{label: 'Actions'}}
            items={[
              {label: 'Edit', onClick: () => {}},
              {label: 'Duplicate', onClick: () => {}},
              {type: 'divider' as const},
              {label: 'Delete', onClick: () => {}},
            ]}
          />
          <XDSDropdownMenu
            button={{label: 'More', variant: 'ghost'}}
            items={[
              {label: 'Settings', onClick: () => {}},
              {label: 'Export', onClick: () => {}},
              {label: 'Help', onClick: () => {}},
            ]}
          />
        </XDSHStack>
      </XDSVStack>

      {/* Popover */}
      <XDSVStack gap={3}>
        <XDSText type="label">Popover</XDSText>
        <XDSPopover
          content={
            <XDSStack gap="sm" style={{padding: '16px', maxWidth: '240px'}}>
              <XDSHeading level={5}>Popover Title</XDSHeading>
              <XDSText type="body">
                This is a popover with some content. It appears on click and
                uses the theme surface color.
              </XDSText>
              <XDSButton label="Got it" variant="primary" size="sm" />
            </XDSStack>
          }>
          <XDSButton label="Open Popover" variant="secondary" />
        </XDSPopover>
      </XDSVStack>

      {/* Status Dots */}
      <XDSVStack gap={3}>
        <XDSText type="label">Status Dots</XDSText>
        <XDSHStack gap={4} vAlign="center">
          <XDSHStack gap={1.5} vAlign="center">
            <XDSStatusDot variant="positive" label="Online" />
            <XDSText type="body">Online</XDSText>
          </XDSHStack>
          <XDSHStack gap={1.5} vAlign="center">
            <XDSStatusDot variant="warning" label="Away" />
            <XDSText type="body">Away</XDSText>
          </XDSHStack>
          <XDSHStack gap={1.5} vAlign="center">
            <XDSStatusDot variant="negative" label="Offline" />
            <XDSText type="body">Offline</XDSText>
          </XDSHStack>
          <XDSHStack gap={1.5} vAlign="center">
            <XDSStatusDot variant="info" label="Busy" />
            <XDSText type="body">Busy</XDSText>
          </XDSHStack>
          <XDSHStack gap={1.5} vAlign="center">
            <XDSStatusDot variant="positive" label="Live" isPulsing />
            <XDSText type="body">Live</XDSText>
          </XDSHStack>
        </XDSHStack>
      </XDSVStack>

      {/* Keyboard Shortcuts */}
      <XDSVStack gap={3}>
        <XDSText type="label">Keyboard Shortcuts</XDSText>
        <XDSHStack gap={4} wrap="wrap" vAlign="center">
          <XDSKbd keys="mod+k" />
          <XDSKbd keys="mod+shift+p" />
          <XDSKbd keys="ctrl+c" />
          <XDSKbd keys="shift+enter" />
          <XDSKbd keys="alt+tab" />
        </XDSHStack>
      </XDSVStack>

      {/* Skeleton Loading */}
      <XDSVStack gap={3}>
        <XDSText type="label">Skeleton Loading</XDSText>
        <XDSCard padding="md">
          <XDSHStack gap={3} vAlign="start">
            <XDSSkeleton width={48} height={48} radius="rounded" />
            <XDSVStack gap={2} style={{flex: 1}}>
              <XDSSkeleton width="60%" height={16} index={0} />
              <XDSSkeleton width="100%" height={12} index={1} />
              <XDSSkeleton width="80%" height={12} index={2} />
            </XDSVStack>
          </XDSHStack>
        </XDSCard>
      </XDSVStack>

      {/* Spinner */}
      <XDSVStack gap={3}>
        <XDSText type="label">Spinner</XDSText>
        <XDSHStack gap={4} vAlign="center">
          <XDSSpinner size="sm" />
          <XDSSpinner size="md" />
          <XDSSpinner size="lg" />
        </XDSHStack>
      </XDSVStack>

      {/* List */}
      <XDSVStack gap={3}>
        <XDSText type="label">List</XDSText>
        <XDSCard padding="none">
          <XDSList
            hasDividers
            header={
              <div style={{padding: '12px 16px'}}>
                <XDSText type="label">Settings</XDSText>
              </div>
            }>
            <XDSListItem
              label="Notifications"
              description="Manage your alerts and preferences"
            />
            <XDSListItem
              label="Privacy"
              description="Control your data and visibility"
            />
            <XDSListItem
              label="Appearance"
              description="Customize the look and feel"
            />
          </XDSList>
        </XDSCard>
      </XDSVStack>

      {/* Collapsible */}
      <XDSVStack gap={3}>
        <XDSText type="label">Collapsible</XDSText>
        <XDSCollapsibleGroup type="single" defaultValue="general">
          <XDSVStack gap={2}>
            <XDSCard padding="md">
              <XDSCollapsible trigger="General Settings" value="general">
                <XDSText
                  type="body"
                  style={{paddingTop: '8px', display: 'block'}}>
                  Configure your general preferences including language,
                  timezone, and display options.
                </XDSText>
              </XDSCollapsible>
            </XDSCard>
            <XDSCard padding="md">
              <XDSCollapsible trigger="Privacy Settings" value="privacy">
                <XDSText
                  type="body"
                  style={{paddingTop: '8px', display: 'block'}}>
                  Manage who can see your profile, activity, and personal
                  information.
                </XDSText>
              </XDSCollapsible>
            </XDSCard>
            <XDSCard padding="md">
              <XDSCollapsible trigger="Notifications" value="notifications">
                <XDSText
                  type="body"
                  style={{paddingTop: '8px', display: 'block'}}>
                  Choose which notifications you receive and how they are
                  delivered.
                </XDSText>
              </XDSCollapsible>
            </XDSCard>
          </XDSVStack>
        </XDSCollapsibleGroup>
      </XDSVStack>

      {/* Pagination */}
      <XDSVStack gap={3}>
        <XDSText type="label">Pagination</XDSText>
        <XDSPagination
          page={paginationPage}
          onChange={setPaginationPage}
          totalItems={200}
          pageSize={10}
          variant="pages"
        />
      </XDSVStack>
      {/* ================================================================= */}
      {/* Dashboard Example — Finance-style layout                         */}
      {/* ================================================================= */}
      <XDSVStack gap={4}>
        <XDSText type="label">Dashboard Example</XDSText>

        <XDSGrid columns={3} gap={4}>
          {/* --- Row 1: Revenue Card --- */}
          <XDSCard padding="lg">
            <XDSStack gap="md">
              <XDSText type="supporting">Total Revenue</XDSText>
              <XDSHeading level={1}>$25,562.05</XDSHeading>
              <XDSHStack gap={2} vAlign="center">
                <XDSText type="supporting">Compare to last month</XDSText>
                <XDSBadge label="+15.46%" sentiment="positive" />
              </XDSHStack>
            </XDSStack>
          </XDSCard>

          {/* --- Row 1: All Track in One (spans 2 cols) --- */}
          <XDSGridSpan columns={2}>
            <XDSCard padding="lg">
              <XDSVStack gap={4}>
                <XDSHStack hAlign="between" vAlign="center">
                  <XDSHeading level={4}>All track in one</XDSHeading>
                  <XDSButton label="View all" variant="ghost" size="sm" />
                </XDSHStack>
                <XDSGrid columns={2} gap={3}>
                  <XDSCard padding="md">
                    <XDSStack gap="sm">
                      <XDSText type="supporting">Current Balance</XDSText>
                      <XDSHeading level={3}>$52,024.00</XDSHeading>
                      <XDSBadge label="+55.46%" sentiment="positive" />
                    </XDSStack>
                  </XDSCard>
                  <XDSCard padding="md">
                    <XDSStack gap="sm">
                      <XDSText type="supporting">Income</XDSText>
                      <XDSHeading level={3}>$32,024.00</XDSHeading>
                      <XDSBadge label="+55.46%" sentiment="positive" />
                    </XDSStack>
                  </XDSCard>
                  <XDSCard padding="md">
                    <XDSStack gap="sm">
                      <XDSText type="supporting">Savings</XDSText>
                      <XDSHeading level={3}>$12,124.00</XDSHeading>
                      <XDSBadge label="+55.46%" sentiment="positive" />
                    </XDSStack>
                  </XDSCard>
                  <XDSCard padding="md">
                    <XDSStack gap="sm">
                      <XDSText type="supporting">Expenses</XDSText>
                      <XDSHeading level={3}>$5,014.00</XDSHeading>
                      <XDSBadge label="+55.46%" sentiment="warning" />
                    </XDSStack>
                  </XDSCard>
                </XDSGrid>
              </XDSVStack>
            </XDSCard>
          </XDSGridSpan>

          {/* --- Row 2: Daily Transactions Limit --- */}
          <XDSCard padding="lg">
            <XDSStack gap="md">
              <XDSHStack hAlign="between" vAlign="center">
                <XDSText type="label">Daily Transactions limit</XDSText>
                <XDSText type="supporting">95%</XDSText>
              </XDSHStack>
              <XDSProgressBar value={95} label="95%" />
              <XDSText type="supporting">$1,250 used from $3,050 limit</XDSText>
            </XDSStack>
          </XDSCard>

          {/* --- Row 2: Quick Transfer --- */}
          <XDSCard padding="lg">
            <XDSStack gap="md">
              <XDSHeading level={4}>Quick Transfer</XDSHeading>
              <XDSHStack gap={4} vAlign="start">
                <XDSVStack gap={1} hAlign="center">
                  <XDSAvatar name="Sara Lee" size="lg" />
                  <XDSText type="supporting">Sara</XDSText>
                </XDSVStack>
                <XDSVStack gap={1} hAlign="center">
                  <XDSAvatar name="Ishan Patel" size="lg" />
                  <XDSText type="supporting">Ishan</XDSText>
                </XDSVStack>
                <XDSVStack gap={1} hAlign="center">
                  <XDSAvatar name="Jon Doe" size="lg" />
                  <XDSText type="supporting">Jon</XDSText>
                </XDSVStack>
                <XDSVStack gap={1} hAlign="center">
                  <XDSAvatar name="Alex Nguyen" size="lg" />
                  <XDSText type="supporting">Alex</XDSText>
                </XDSVStack>
                <XDSVStack gap={1} hAlign="center">
                  <XDSCenter
                    width={40}
                    height={40}
                    style={{
                      borderRadius: 'var(--radius-rounded)',
                      border: '2px dashed var(--color-divider-emphasized)',
                      color: 'var(--color-text-secondary)',
                      fontSize: '18px',
                    }}>
                    +
                  </XDSCenter>
                  <XDSText type="supporting">Add</XDSText>
                </XDSVStack>
              </XDSHStack>
            </XDSStack>
          </XDSCard>

          {/* --- Row 2: Your Savings --- */}
          <XDSCard padding="lg">
            <XDSVStack gap={4}>
              <XDSHStack hAlign="between" vAlign="center">
                <XDSHeading level={4}>Your savings</XDSHeading>
                <XDSButton label="View all" variant="ghost" size="sm" />
              </XDSHStack>
              <XDSVStack gap={3}>
                <XDSVStack gap={0.5}>
                  <XDSHStack hAlign="between" vAlign="center">
                    <XDSText type="body">New Car</XDSText>
                    <XDSText type="supporting">55%</XDSText>
                  </XDSHStack>
                  <XDSProgressBar value={55} label="55%" />
                  <XDSHStack hAlign="end">
                    <XDSText type="supporting">$10,520 / $50,000</XDSText>
                  </XDSHStack>
                </XDSVStack>
                <XDSVStack gap={0.5}>
                  <XDSHStack hAlign="between" vAlign="center">
                    <XDSText type="body">New House Rent</XDSText>
                    <XDSText type="supporting">85%</XDSText>
                  </XDSHStack>
                  <XDSProgressBar value={85} label="85%" />
                  <XDSHStack hAlign="end">
                    <XDSText type="supporting">$10,520 / $150,000</XDSText>
                  </XDSHStack>
                </XDSVStack>
                <XDSVStack gap={0.5}>
                  <XDSHStack hAlign="between" vAlign="center">
                    <XDSText type="body">New Bike</XDSText>
                    <XDSText type="supporting">85%</XDSText>
                  </XDSHStack>
                  <XDSProgressBar value={85} label="85%" />
                  <XDSHStack hAlign="end">
                    <XDSText type="supporting">$3,020 / $7,000</XDSText>
                  </XDSHStack>
                </XDSVStack>
              </XDSVStack>
            </XDSVStack>
          </XDSCard>

          {/* --- Row 3: Balance Spending Table (full width) --- */}
          <XDSGridSpan columns="full">
            <XDSCard padding="lg">
              <XDSVStack gap={4}>
                <XDSHStack hAlign="between" vAlign="center">
                  <XDSHeading level={4}>Balance Spending</XDSHeading>
                  <XDSHStack gap={2}>
                    <XDSTextInput
                      label="Search"
                      isLabelHidden
                      placeholder="Searching"
                      size="sm"
                    />
                    <XDSButton label="Filter" variant="ghost" size="sm" />
                  </XDSHStack>
                </XDSHStack>
                <XDSTable
                  columns={transactionColumns}
                  data={transactionData}
                  getRowKey={row => row.id}
                  density="balanced"
                  dividers="rows"
                />
              </XDSVStack>
            </XDSCard>
          </XDSGridSpan>
        </XDSGrid>
      </XDSVStack>

      {/* Empty State */}
      <XDSVStack gap={3}>
        <XDSText type="label">Empty State</XDSText>
        <XDSCard padding="none">
          <XDSEmptyState
            icon={<span style={{fontSize: '48px'}}>🔍</span>}
            title="No results found"
            description="Try adjusting your search or filters to find what you need."
            actions={
              <>
                <XDSButton
                  label="Clear filters"
                  variant="secondary"
                  size="sm"
                />
                <XDSButton label="Browse all" variant="primary" size="sm" />
              </>
            }
          />
        </XDSCard>
      </XDSVStack>
    </XDSVStack>
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
      `  typeScale: { base: ${typeScaleBase}, ratio: ${typeScaleRatio} },`,
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

  // Load Figtree from Google Fonts
  React.useEffect(() => {
    const id = 'figtree-font-link';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Collect all defaults, with Figtree fonts and pill buttons
  const allDefaults = React.useMemo(
    () => ({
      ...colorDefaults,
      ...spacingDefaults,
      ...radiusDefaults,
      ...typographyDefaults,
      ...textSizeDefaults,
      ...lineHeightDefaults,
      ...fontWeightDefaults,
      ...typeScaleDefaults,
      ...sizeDefaults,
      ...shadowDefaults,
      ...durationDefaults,
      ...easeDefaults,
      ...transitionDefaults,
      // Override defaults for a modern look
      '--font-body': "'Figtree', sans-serif",
      '--font-heading': "'Figtree', sans-serif",
      '--radius-2': '9999px',
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
  // (--heading-1-size, --text-body-size, etc.) are consumed by the
  // heading/text CSS rules in the preview.
  //
  // Type scale tokens are ALWAYS included (even at default values) because
  // the component overrides reference var(--heading-1-size) etc., and those
  // unhashed CSS custom properties only exist when the theme explicitly sets them.
  const typeScaleKeys = React.useMemo(
    () => new Set(Object.keys(typeScaleDefaults)),
    [],
  );

  const currentTheme = React.useMemo(() => {
    const tokenOverrides: Record<string, string> = {};
    for (const [key, value] of Object.entries(tokens)) {
      // Always include type scale tokens — the component CSS rules reference
      // var(--heading-1-size) etc. which only exist when the theme sets them.
      if (typeScaleKeys.has(key) || value !== allDefaults[key]) {
        tokenOverrides[key] = value;
      }
    }
    return defineTheme({
      name: themeName,
      typeScale: {base: typeScaleBase, ratio: typeScaleRatio},
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
            onChange={v => setActiveColorCategory(v)}
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
            backgroundColor: 'var(--color-wash)',
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
            onChange={v => applyTypeScale(v, typeScaleRatio)}
            formatValue={v => `${v}px`}
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
            onChange={v => {
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
              onChange={v => applyTypeScale(typeScaleBase, v / 1000)}
              formatValue={v => (v / 1000).toFixed(3)}
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
              backgroundColor: 'var(--color-surface)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}>
            {[1, 2, 3, 4, 5, 6].map(level => {
              const size = tokens[`--heading-${level}-size`] || '';
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
                      fontSize: size,
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
                    {size}
                  </XDSText>
                </div>
              );
            })}
          </div>
          <XDSText type="code" color="secondary">
            size = {typeScaleBase} × {typeScaleRatio.toFixed(3)}^step · h4 =
            anchor
          </XDSText>
        </div>
      );

      const categoryValue = TYPOGRAPHY_CATEGORIES[
        activeTypographyCategory as keyof typeof TYPOGRAPHY_CATEGORIES
      ] as TypographyCategoryValue | undefined;

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
            onChange={v => setActiveTypographyCategory(v)}
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
                backgroundColor: 'var(--color-wash)',
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
              backgroundColor: 'var(--color-wash)',
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
                  fontFamily: 'var(--font-code)',
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
                fontFamily: 'var(--font-code)',
                border: '1px solid var(--color-border-emphasized)',
                borderRadius: '4px',
                backgroundColor: 'var(--color-surface)',
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
        backgroundColor: 'var(--color-wash)',
      }}>
      {/* Left Panel - Token Editor */}
      <div
        style={{
          width: '400px',
          borderRight: '1px solid var(--color-border-emphasized)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--color-surface)',
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
            backgroundColor: 'var(--color-surface)',
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
              backgroundColor: 'var(--color-wash)',
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
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border-emphasized)',
                fontSize: '12px',
                fontFamily: 'var(--font-code)',
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
            overflow: 'auto',
          }}>
          <XDSTheme theme={currentTheme} mode={mode}>
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                padding: '24px',
              }}>
              <ComponentPreview />
            </div>
          </XDSTheme>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Storybook Meta
// =============================================================================

const meta: Meta = {
  title: 'Theme Editor',
  parameters: {
    layout: 'fullscreen',
    docs: {
      page: null,
    },
  },
};

export default meta;

type Story = StoryObj;

export const ThemeEditor: Story = {
  render: () => <ThemeEditorComponent />,
  parameters: {
    // Use default theme for the editor chrome (left panel).
    // The preview panel wraps its own <XDSTheme theme={currentTheme}>.
    xdsTheme: 'default',
  },
};
