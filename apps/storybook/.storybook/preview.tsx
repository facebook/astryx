import type {Preview, Decorator} from '@storybook/react';
import * as React from 'react';
import {XDSTheme, defaultTheme, neutralTheme} from '@xds/core';

// Import the pre-built StyleX CSS from the core package
// Use relative path since @xds/core alias points to source, not dist
import '../../../packages/core/dist/index.css';

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
  const themeKey = (context.globals?.xdsTheme ||
    'default') as keyof typeof themes;
  const theme = themes[themeKey] || defaultTheme;

  // Get color mode from toolbar
  const mode = context.globals?.colorMode === 'dark' ? 'dark' : 'light';

  return (
    <XDSTheme theme={theme} mode={mode}>
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          padding: 16,
        }}>
        <Story />
      </div>
    </XDSTheme>
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
          {value: 'default', title: 'Default', icon: 'circlehollow'},
          {value: 'neutral', title: 'Neutral', icon: 'circle'},
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
          {value: 'light', title: 'Light', icon: 'sun'},
          {value: 'dark', title: 'Dark', icon: 'moon'},
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
