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
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSRadioList} from '@xds/core/RadioList';
import {XDSTheme, defineTheme} from '@xds/core/theme';
import {
  colorDefaults,
  spacingDefaults,
  radiusDefaults,
  typographyDefaults,
  textSizeDefaults,
  lineHeightDefaults,
  fontWeightDefaults,
  sizeDefaults,
  elevationDefaults,
  transitionDefaults,
} from '@xds/core/theme';
import {defaultIconRegistry} from '@xds/theme-default/icons';

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
  elevation: {
    label: 'Elevation',
    description: 'Shadow and elevation tokens',
    tokens: elevationDefaults,
  },
  transition: {
    label: 'Transition',
    description: 'Animation timing tokens',
    tokens: transitionDefaults,
  },
} as const;

type TokenGroupKey = keyof typeof TOKEN_GROUPS;

// =============================================================================
// Color Categories for better organization
// =============================================================================

const COLOR_CATEGORIES = {
  'Core Semantic': [
    '--color-accent',
    '--color-accent-deemphasized',
    '--color-accent-text',
    '--color-surface',
    '--color-wash',
    '--color-overlay',
  ],
  'Interactive States': [
    '--color-hover-overlay',
    '--color-pressed-overlay',
    '--color-focus-outline',
    '--color-focus-outline-error',
    '--color-focus-outline-success',
    '--color-focus-outline-warning',
    '--color-deemphasized',
  ],
  Text: [
    '--color-text-primary',
    '--color-text-secondary',
    '--color-text-disabled',
    '--color-text-link',
    '--color-text-placeholder',
    '--color-text-on-media',
  ],
  Icon: [
    '--color-icon-primary',
    '--color-icon-secondary',
    '--color-icon-tertiary',
    '--color-icon-disabled',
    '--color-icon-on-media',
  ],
  'Surface Variants': ['--color-card', '--color-popover', '--color-navbar'],
  'Status/Sentiment': [
    '--color-positive',
    '--color-positive-deemphasized',
    '--color-negative',
    '--color-negative-deemphasized',
    '--color-warning',
    '--color-warning-deemphasized',
    '--color-educational',
    '--color-educational-deemphasized',
  ],
  Divider: [
    '--color-divider',
    '--color-divider-high-contrast',
    '--color-divider-emphasized',
  ],
  Effects: [
    '--color-disabled-overlay',
    '--color-glimmer',
    '--color-glimmer-high-contrast',
    '--color-shadow-elevation',
    '--color-hover-tint',
  ],
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
  const isHex = displayValue.startsWith('#');

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
          border: '1px solid var(--color-divider-emphasized)',
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
      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
        {isHex && (
          <input
            type="color"
            value={displayValue.slice(0, 7)}
            onChange={e => {
              const newValue = parsed
                ? mode === 'light'
                  ? `light-dark(${e.target.value}, ${parsed.dark})`
                  : `light-dark(${parsed.light}, ${e.target.value})`
                : e.target.value;
              onChange(tokenName, newValue);
            }}
            style={{
              width: '28px',
              height: '28px',
              padding: 0,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          />
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
            border: '1px solid var(--color-divider-emphasized)',
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
          border: '1px solid var(--color-divider-emphasized)',
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
          border: '1px solid var(--color-divider-emphasized)',
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
          border: '1px solid var(--color-divider-emphasized)',
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

function ComponentPreview() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState('overview');
  const [switchValue, setSwitchValue] = React.useState(true);
  const [sliderValue, setSliderValue] = React.useState(50);
  const [checkboxValue, setCheckboxValue] = React.useState(false);
  const [radioValue, setRadioValue] = React.useState('option1');

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
      {/* Buttons */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Buttons
        </XDSText>
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          <XDSButton label="Primary" variant="primary" />
          <XDSButton label="Secondary" variant="secondary" />
          <XDSButton label="Ghost" variant="ghost" />
          <XDSButton label="Destructive" variant="destructive" />
          <XDSButton label="Disabled" variant="primary" isDisabled />
          <XDSButton label="Loading" variant="primary" isLoading />
        </div>
      </div>

      {/* Badges */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Badges
        </XDSText>
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          <XDSBadge label="Default" />
          <XDSBadge label="Primary" variant="primary" />
          <XDSBadge label="Ghost" variant="ghost" />
          <XDSBadge label="Positive" sentiment="positive" />
          <XDSBadge label="Negative" sentiment="negative" />
          <XDSBadge label="Warning" sentiment="warning" />
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
          onChange={setRadioValue}
          options={[
            {value: 'option1', label: 'Option 1'},
            {value: 'option2', label: 'Option 2'},
            {value: 'option3', label: 'Option 3'},
          ]}
        />
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
        <XDSTabList
          tabs={[
            {id: 'overview', label: 'Overview'},
            {id: 'details', label: 'Details'},
            {id: 'settings', label: 'Settings'},
          ]}
          selectedId={selectedTab}
          onSelect={setSelectedTab}
        />
      </div>

      {/* Avatar */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Avatars
        </XDSText>
        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <XDSAvatar name="John Doe" size="sm" />
          <XDSAvatar name="Jane Smith" size="md" />
          <XDSAvatar name="Bob Wilson" size="lg" />
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
            sentiment="info"
          />
          <XDSBanner
            title="Success"
            description="Operation completed successfully."
            sentiment="positive"
          />
          <XDSBanner
            title="Warning"
            description="Please review before continuing."
            sentiment="warning"
          />
          <XDSBanner
            title="Error"
            description="Something went wrong."
            sentiment="negative"
          />
        </div>
      </div>

      {/* Card */}
      <div>
        <XDSText type="label" style={{marginBottom: '12px', display: 'block'}}>
          Card
        </XDSText>
        <XDSCard padding="md">
          <XDSStack gap="sm">
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
          onClose={() => setDialogOpen(false)}
          title="Sample Dialog">
          <XDSStack gap="md">
            <XDSText type="body">
              This is a sample dialog to preview how dialogs look with the
              current theme settings.
            </XDSText>
            <div
              style={{display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>
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
        </XDSDialog>
      </div>
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
): string {
  const changedTokens: Record<string, string> = {};

  for (const [key, value] of Object.entries(tokens)) {
    if (value !== defaults[key]) {
      changedTokens[key] = value;
    }
  }

  if (Object.keys(changedTokens).length === 0) {
    return `import { defineTheme } from '@xds/core/theme';

export const ${themeName}Theme = defineTheme({
  name: '${themeName}',
  tokens: {},
});`;
  }

  const tokenEntries = Object.entries(changedTokens)
    .map(([key, value]) => {
      const parsed = parseLightDark(value);
      if (parsed) {
        return `    '${key}': ['${parsed.light}', '${parsed.dark}'],`;
      }
      return `    '${key}': '${value}',`;
    })
    .join('\n');

  return `import { defineTheme } from '@xds/core/theme';

export const ${themeName}Theme = defineTheme({
  name: '${themeName}',
  tokens: {
${tokenEntries}
  },
});`;
}

// =============================================================================
// Main Theme Editor Component
// =============================================================================

function ThemeEditorComponent() {
  const [activeGroup, setActiveGroup] = React.useState<TokenGroupKey>('colors');
  const [activeColorCategory, setActiveColorCategory] =
    React.useState<string>('Core Semantic');
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');
  const [themeName, setThemeName] = React.useState('custom');
  const [showCode, setShowCode] = React.useState(false);

  // Collect all defaults
  const allDefaults = React.useMemo(
    () => ({
      ...colorDefaults,
      ...spacingDefaults,
      ...radiusDefaults,
      ...typographyDefaults,
      ...textSizeDefaults,
      ...lineHeightDefaults,
      ...fontWeightDefaults,
      ...sizeDefaults,
      ...elevationDefaults,
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
  }, [allDefaults]);

  // Create a theme from current tokens
  const currentTheme = React.useMemo(() => {
    const tokenOverrides: Record<string, string> = {};
    for (const [key, value] of Object.entries(tokens)) {
      if (value !== allDefaults[key]) {
        tokenOverrides[key] = value;
      }
    }
    return defineTheme({
      name: themeName,
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
          <div style={{marginBottom: '8px'}}>
            <select
              value={activeColorCategory}
              onChange={e => setActiveColorCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid var(--color-divider-emphasized)',
                borderRadius: '8px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
              }}>
              {Object.keys(COLOR_CATEGORIES).map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

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
      return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          {Object.keys(group.tokens).map(tokenName => (
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
                border: '1px solid var(--color-divider-emphasized)',
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
        height: '100vh',
        backgroundColor: 'var(--color-wash)',
      }}>
      {/* Left Panel - Token Editor */}
      <div
        style={{
          width: '400px',
          borderRight: '1px solid var(--color-divider-emphasized)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--color-surface)',
        }}>
        {/* Header */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid var(--color-divider)',
          }}>
          <XDSHeading level={3}>Theme Editor</XDSHeading>
          <XDSText type="supporting" style={{marginTop: '4px'}}>
            Customize XDS design tokens
          </XDSText>
        </div>

        {/* Theme name input */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-divider)',
          }}>
          <XDSTextInput
            label="Theme Name"
            value={themeName}
            onChange={setThemeName}
            size="sm"
          />
        </div>

        {/* Mode toggle */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-divider)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <XDSText type="label">Edit Mode</XDSText>
          <div style={{display: 'flex', gap: '8px'}}>
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

        {/* Token group tabs */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--color-divider)',
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
            borderBottom: '1px solid var(--color-divider)',
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
            borderTop: '1px solid var(--color-divider)',
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
            padding: '16px 24px',
            borderBottom: '1px solid var(--color-divider)',
            backgroundColor: 'var(--color-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <div>
            <XDSHeading level={4}>Live Preview</XDSHeading>
            <XDSText type="supporting">See your changes in real-time</XDSText>
          </div>
        </div>

        {/* Code panel (collapsible) */}
        {showCode && (
          <div
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--color-divider)',
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
                border: '1px solid var(--color-divider-emphasized)',
                fontSize: '12px',
                fontFamily: 'var(--font-code)',
                overflow: 'auto',
                margin: 0,
                color: 'var(--color-text-primary)',
              }}>
              {generateThemeCode(themeName, tokens, allDefaults)}
            </pre>
          </div>
        )}

        {/* Preview content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
          }}>
          <XDSTheme theme={currentTheme} mode={mode}>
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: '12px',
                padding: '24px',
                minHeight: '100%',
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
    // Disable the theme decorator for this story since we manage our own theme
    xdsTheme: 'none',
  },
};
