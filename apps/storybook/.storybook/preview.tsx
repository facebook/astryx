// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Preview, Decorator} from '@storybook/react';
import * as React from 'react';
import {Theme, LayerProvider} from '@astryxdesign/core';
import {neutralTheme} from '@astryxdesign/theme-neutral';
import {stoneTheme} from '@astryxdesign/theme-stone';
import {y2kTheme} from '@astryxdesign/theme-y2k';
// Import the base reset stylesheet
import '@astryxdesign/core/reset.css';

/**
 * Map of available themes
 */
const themes = {
  neutral: neutralTheme,
  stone: stoneTheme,
  y2k: y2kTheme,
};

/**
 * Decorator that wraps all stories in the Astryx Theme provider.
 *
 * Sets `color-scheme` on the document root so that CSS `light-dark()`
 * resolves correctly at every level of the page — not just inside the
 * Theme wrapper div.  Without this, the iframe's `<html>` and
 * `<body>` keep the browser-default `color-scheme` (typically "light")
 * and toggling the toolbar has no visible effect.
 */
const withTheme: Decorator = (Story, context) => {
  // Get theme selection from toolbar
  const themeKey = (context.globals?.astryxTheme || 'neutral') as string;
  const mode = context.globals?.colorMode === 'dark' ? 'dark' : 'light';

  // Sync color-scheme to the document root so light-dark() works
  // everywhere, including on <html>/<body> backgrounds and any
  // elements rendered outside the Theme wrapper.
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

  const theme = themes[themeKey as keyof typeof themes] || neutralTheme;

  return (
    <Theme theme={theme} mode={mode}>
      <LayerProvider>
        <div
          style={{
            backgroundColor: 'var(--color-background-surface)',
            padding: 16,
          }}>
          <Story />
        </div>
      </LayerProvider>
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
    astryxTheme: {
      description: 'Astryx Theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          {value: 'none', title: 'None (base tokens)', icon: 'close'},
          {value: 'neutral', title: 'Neutral', icon: 'circle'},
          {value: 'stone', title: 'Stone', icon: 'circlehollow'},
          {value: 'y2k', title: 'Y2K', icon: 'lightning'},
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
    astryxTheme: 'neutral',
    colorMode: 'light',
  },
  decorators: [withTheme],
};

export default preview;
