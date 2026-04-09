import type {Meta, StoryObj} from '@storybook/react';
import * as React from 'react';
import {XDSMediaTheme, defineTheme} from '@xds/core/theme';
import {XDSButton} from '@xds/core/Button';
import {XDSLink} from '@xds/core/Link';
import {XDSText} from '@xds/core/Text';
import {XDSBadge} from '@xds/core/Badge';
import {XDSIcon} from '@xds/core/Icon';
import {XDSStack} from '@xds/core/Stack';
import {XDSTheme} from '@xds/core/theme';
import {defaultTheme} from '@xds/theme-default';
import {neutralTheme} from '@xds/theme-neutral';
import {brutalistTheme} from '@xds/theme-brutalist';
import {XDSCard} from '@xds/core/Card';

// =============================================================================
// Meta
// =============================================================================

const meta: Meta = {
  title: 'Theme/XDSMediaTheme',
  parameters: {
    docs: {
      description: {
        component:
          'Inverted surface theming context. Wraps children so they render correctly on dark or light backgrounds — buttons, links, text, and icons all pick up the right colors automatically.',
      },
    },
  },
};

export default meta;

// =============================================================================
// On Dark Surface
// =============================================================================

function OnDarkDemo() {
  return (
    <div
      style={{
        backgroundColor: 'light-dark(#0A1317, #FFFFFF)',
        borderRadius: 'var(--radius-container)',
        padding: 16,
      }}>
      <XDSMediaTheme surface="dark">
        <XDSStack gap={3}>
          <XDSText>
            Content on a dark surface — text, icons, and interactive elements
            automatically adapt.
          </XDSText>
          <XDSStack direction="row" gap={2} align="center">
            <XDSButton label="Primary" />
            <XDSButton label="Secondary" variant="secondary" />
            <XDSButton label="Ghost" variant="ghost" />
            <XDSLink href="#" hasUnderline>
              A link
            </XDSLink>
          </XDSStack>
          <XDSStack direction="row" gap={2} align="center">
            <XDSBadge label="Badge" />
            <XDSIcon icon="info" size="md" />
            <XDSIcon icon="checkCircle" size="md" />
          </XDSStack>
        </XDSStack>
      </XDSMediaTheme>
    </div>
  );
}

export const OnDark: StoryObj = {
  render: () => <OnDarkDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Content on a dark (inverted) surface. Text becomes light, icons invert, and button interaction states use white-tinted overlays.',
      },
    },
  },
};

// =============================================================================
// On Light Surface (dark mode)
// =============================================================================

function OnLightDemo() {
  return (
    <XDSTheme theme={defaultTheme} mode="dark">
      <div
        style={{
          padding: 16,
          backgroundColor: 'var(--color-background-surface)',
        }}>
        <XDSText>Dark mode page background</XDSText>
        <div
          style={{
            backgroundColor: 'light-dark(#0A1317, #FFFFFF)',
            borderRadius: 'var(--radius-container)',
            padding: 16,
            marginTop: 12,
          }}>
          <XDSMediaTheme surface="light">
            <XDSStack gap={3}>
              <XDSText>
                Content on a light surface in dark mode — text and icons become
                dark.
              </XDSText>
              <XDSStack direction="row" gap={2} align="center">
                <XDSButton label="Primary" />
                <XDSButton label="Secondary" variant="secondary" />
                <XDSButton label="Ghost" variant="ghost" />
                <XDSLink href="#" hasUnderline>
                  A link
                </XDSLink>
              </XDSStack>
            </XDSStack>
          </XDSMediaTheme>
        </div>
      </div>
    </XDSTheme>
  );
}

export const OnLight: StoryObj = {
  render: () => <OnLightDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Content on a light surface in dark mode. The inverse of OnDark — dark text on a light background when the page is dark.',
      },
    },
  },
};

// =============================================================================
// Toast-like Example
// =============================================================================

function ToastDemo() {
  return (
    <XDSStack gap={3}>
      {/* Info toast */}
      <div
        style={{
          backgroundColor: 'light-dark(#0A1317, #FFFFFF)',
          borderRadius: 'var(--radius-container)',
          padding: '12px 16px',
          boxShadow: 'var(--shadow-med)',
          width: 400,
        }}>
        <XDSMediaTheme surface="dark">
          <XDSStack direction="row" gap={3} align="center">
            <XDSText style={{flex: 1}}>Changes saved successfully.</XDSText>
            <XDSButton label="Undo" variant="secondary" size="sm" />
            <XDSButton
              label="Dismiss"
              variant="ghost"
              size="sm"
              icon={<XDSIcon icon="close" size="sm" />}
            />
          </XDSStack>
        </XDSMediaTheme>
      </div>

      {/* Error toast */}
      <div
        style={{
          backgroundColor: 'light-dark(#AA071E, #E3193B)',
          borderRadius: 'var(--radius-container)',
          padding: '12px 16px',
          boxShadow: 'var(--shadow-med)',
          width: 400,
        }}>
        <XDSMediaTheme surface="dark">
          <XDSStack direction="row" gap={3} align="center">
            <XDSText style={{flex: 1}}>
              Failed to save. Check your connection.
            </XDSText>
            <XDSButton
              label="Dismiss"
              variant="ghost"
              size="sm"
              icon={<XDSIcon icon="close" size="sm" />}
            />
          </XDSStack>
        </XDSMediaTheme>
      </div>
    </XDSStack>
  );
}

export const ToastExample: StoryObj = {
  render: () => <ToastDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Toast-like notifications using XDSMediaTheme. The dark surface sets up the right token context — buttons and text just work without manual color overrides.',
      },
    },
  },
};

// =============================================================================
// Component Override Boundary
// =============================================================================

/**
 * This is the key demo: themes with component overrides (brutalist has pill
 * buttons, uppercase text, thick borders on cards/ghost buttons). Inside
 * XDSMediaTheme, those component overrides STILL apply — structural styling
 * is preserved. Only the color tokens change for the inverted surface.
 */

function ComponentOverrideBoundaryDemo() {
  return (
    <XDSTheme theme={brutalistTheme}>
      <XDSStack gap={4}>
        <XDSText weight="semibold">
          Brutalist theme — notice the component overrides: pill buttons,
          uppercase text, thick card borders, bordered ghost buttons.
        </XDSText>

        {/* Normal surface — themed component overrides apply */}
        <XDSCard>
          <XDSStack gap={2} style={{padding: 16}}>
            <XDSText type="supporting" weight="semibold">
              Normal surface (themed overrides)
            </XDSText>
            <XDSStack direction="row" gap={2} align="center">
              <XDSButton label="Primary" />
              <XDSButton label="Secondary" variant="secondary" />
              <XDSButton label="Ghost" variant="ghost" />
              <XDSBadge label="Badge" />
            </XDSStack>
          </XDSStack>
        </XDSCard>

        {/* Inverted surface — scope boundary blocks component overrides */}
        <div
          style={{
            backgroundColor: 'light-dark(#0A1317, #FFFFFF)',
            borderRadius: 'var(--radius-element)',
            padding: 16,
          }}>
          <XDSMediaTheme surface="dark">
            <XDSStack gap={2}>
              <XDSText type="supporting" weight="semibold">
                Dark surface (same overrides, inverted tokens)
              </XDSText>
              <XDSStack direction="row" gap={2} align="center">
                <XDSButton label="Primary" />
                <XDSButton label="Secondary" variant="secondary" />
                <XDSButton label="Ghost" variant="ghost" />
                <XDSBadge label="Badge" />
              </XDSStack>
            </XDSStack>
          </XDSMediaTheme>
        </div>
      </XDSStack>
    </XDSTheme>
  );
}

export const ComponentOverrideBoundary: StoryObj = {
  render: () => <ComponentOverrideBoundaryDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Shows component overrides flowing through to the media context. Brutalist theme applies bold component overrides (pill buttons, uppercase, thick borders) — these are preserved inside XDSMediaTheme. Only the color tokens change for the inverted surface.',
      },
    },
  },
};

// =============================================================================
// Themed — shows it works across different themes
// =============================================================================

function ThemedDemo() {
  return (
    <XDSStack gap={4}>
      {[
        {theme: defaultTheme, label: 'Default Theme'},
        {theme: neutralTheme, label: 'Neutral Theme'},
        {theme: brutalistTheme, label: 'Brutalist Theme'},
      ].map(({theme, label}) => (
        <XDSTheme key={label} theme={theme}>
          <XDSStack gap={2}>
            <XDSText weight="semibold">{label}</XDSText>
            <XDSStack direction="row" gap={3}>
              {/* Normal surface */}
              <div
                style={{
                  backgroundColor: 'var(--color-background-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-container)',
                  padding: 16,
                  flex: 1,
                }}>
                <XDSStack gap={2}>
                  <XDSText type="supporting">Normal surface</XDSText>
                  <XDSButton label="Button" variant="secondary" />
                  <XDSButton label="Ghost" variant="ghost" />
                  <XDSLink href="#">Link</XDSLink>
                </XDSStack>
              </div>
              {/* Inverted surface */}
              <div
                style={{
                  backgroundColor: 'light-dark(#0A1317, #FFFFFF)',
                  borderRadius: 'var(--radius-container)',
                  padding: 16,
                  flex: 1,
                }}>
                <XDSMediaTheme surface="dark">
                  <XDSStack gap={2}>
                    <XDSText type="supporting">Dark surface</XDSText>
                    <XDSButton label="Button" variant="secondary" />
                    <XDSButton label="Ghost" variant="ghost" />
                    <XDSLink href="#">Link</XDSLink>
                  </XDSStack>
                </XDSMediaTheme>
              </div>
            </XDSStack>
          </XDSStack>
        </XDSTheme>
      ))}
    </XDSStack>
  );
}

export const AcrossThemes: StoryObj = {
  render: () => <ThemedDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Side-by-side comparison across themes. Left column shows normal surface with themed component overrides. Right column shows XDSMediaTheme dark surface — same components, inverted tokens, default styles.',
      },
    },
  },
};

// =============================================================================
// Custom on-media overrides
// =============================================================================

const customTheme = defineTheme({
  name: 'custom-media',
  tokens: {
    '--color-accent': ['#7C3AED', '#A78BFA'],
  },
  onDark: {
    tokens: {
      // Custom: use a tinted accent color on dark surfaces instead of white
      '--color-accent': '#C4B5FD',
      '--color-text-accent': '#C4B5FD',
    },
  },
});

function CustomOverridesDemo() {
  return (
    <XDSTheme theme={customTheme}>
      <XDSStack gap={3}>
        <XDSText>
          This theme has a custom <code>onDark</code> config — the accent color
          on dark surfaces is a lighter purple instead of plain white.
        </XDSText>
        <div
          style={{
            backgroundColor: 'light-dark(#0A1317, #FFFFFF)',
            borderRadius: 'var(--radius-container)',
            padding: 16,
          }}>
          <XDSMediaTheme surface="dark">
            <XDSStack direction="row" gap={2} align="center">
              <XDSButton label="Accent button" />
              <XDSButton label="Secondary" variant="secondary" />
              <XDSLink href="#" hasUnderline>
                Accent link
              </XDSLink>
            </XDSStack>
          </XDSMediaTheme>
        </div>
      </XDSStack>
    </XDSTheme>
  );
}

export const CustomOverrides: StoryObj = {
  render: () => <CustomOverridesDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Themes can provide custom `onDark` / `onLight` overrides in `defineTheme()` to fine-tune how components look on inverted surfaces.',
      },
    },
  },
};
