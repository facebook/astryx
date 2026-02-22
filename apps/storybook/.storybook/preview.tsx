import type {Preview, Decorator} from '@storybook/react';
import * as React from 'react';
import {XDSTheme} from '@xds/core';
import {defaultTheme} from '@xds/theme-default';
import {neutralTheme} from '@xds/theme-neutral';

// Import the base reset and typography stylesheets
import '@xds/core/reset.css';
import '@xds/core/typography.css';

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
  const themeKey = (context.globals?.xdsTheme || 'default') as string;
  const mode = context.globals?.colorMode === 'dark' ? 'dark' : 'light';

  // No theme — render with just base defineVars defaults
  if (themeKey === 'none') {
    return (
      <div
        className="xds-typography"
        style={{
          colorScheme: mode,
          padding: 16,
        }}>
        <Story />
      </div>
    );
  }

  const theme = themes[themeKey as keyof typeof themes] || defaultTheme;

  return (
    <XDSTheme theme={theme} mode={mode}>
      <div
        className="xds-typography"
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
          {value: 'none', title: 'None (base tokens)', icon: 'close'},
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
