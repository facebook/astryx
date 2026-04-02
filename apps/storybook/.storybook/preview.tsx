import type {Preview, Decorator} from '@storybook/react';
import * as React from 'react';
import {XDSTheme} from '@xds/core';
import {defaultTheme} from '@xds/theme-default';
import {neutralTheme} from '@xds/theme-neutral';
import {brutalistTheme} from '@xds/theme-brutalist';

// Import the base reset stylesheet
import '@xds/core/reset.css';

/**
 * Map of available themes
 */
const themes = {
  default: defaultTheme,
  neutral: neutralTheme,
  brutalist: brutalistTheme,
};

/**
 * Decorator that wraps all stories in the XDS Theme provider.
 *
 * Sets `color-scheme` on the document root so that CSS `light-dark()`
 * resolves correctly at every level of the page — not just inside the
 * XDSTheme wrapper div.  Without this, the iframe's `<html>` and
 * `<body>` keep the browser-default `color-scheme` (typically "light")
 * and toggling the toolbar has no visible effect.
 */
const withXDSTheme: Decorator = (Story, context) => {
  // Get theme selection from toolbar
  const themeKey = (context.globals?.xdsTheme || 'default') as string;
  const mode = context.globals?.colorMode === 'dark' ? 'dark' : 'light';

  // Sync color-scheme to the document root so light-dark() works
  // everywhere, including on <html>/<body> backgrounds and any
  // elements rendered outside the XDSTheme wrapper.
  React.useEffect(() => {
    document.documentElement.style.setProperty('color-scheme', mode);
  }, [mode]);

  // No theme — render with just base defineVars defaults
  if (themeKey === 'none') {
    return (
      <div
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
        style={{
          backgroundColor: 'var(--color-background-surface)',
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
          {value: 'brutalist', title: 'Brutalist', icon: 'lightning'},
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
