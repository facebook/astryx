import type { Preview, Decorator } from '@storybook/react';
import * as React from 'react';
import { Theme } from '@xds/core/theme/Theme';
import { defaultTheme } from '@xds/core/theme/defaultTheme.stylex';
import { neutralTheme } from '@xds/core/theme/neutralTheme.stylex';

/**
 * Map of available themes
 */
const themes = {
  default: defaultTheme,
  neutral: neutralTheme,
};

/**
 * Decorator that wraps all stories in the XDS Theme provider
 */
const withXDSTheme: Decorator = (Story, context) => {
  // Get theme selection from toolbar
  const themeKey = (context.globals?.xdsTheme || 'default') as keyof typeof themes;
  const theme = themes[themeKey] || defaultTheme;

  // Get color mode from toolbar
  const mode = context.globals?.colorMode === 'dark' ? 'dark' : 'light';

  return (
    <Theme theme={theme} mode={mode}>
      <div
        style={{
          backgroundColor: 'var(--xds-surface)',
          padding: 16,
        }}
      >
        <Story />
      </div>
    </Theme>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true, // Disable backgrounds addon, use theme instead
    },
    layout: 'fullscreen',
  },
  globalTypes: {
    xdsTheme: {
      description: 'XDS Theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'default', title: 'Default', icon: 'circlehollow' },
          { value: 'neutral', title: 'Neutral', icon: 'circle' },
        ],
        dynamicTitle: true,
      },
    },
    colorMode: {
      description: 'Color mode',
      toolbar: {
        title: 'Mode',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    xdsTheme: 'default',
    colorMode: 'light',
  },
  decorators: [withXDSTheme],
};

export default preview;
