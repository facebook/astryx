import type {StorybookConfig} from '@storybook/react-vite';
import stylex from '@stylexjs/unplugin';
import path from 'path';

const rootDir = path.resolve(__dirname, '../../..');
const coreRoot = path.resolve(__dirname, '../../../packages/core/src');
const themeRoot = path.resolve(__dirname, '../../../packages/theme/src');

/**
 * Browser targets for lightningcss.
 * Prevents lowering native light-dark() into --lightningcss-light/--lightningcss-dark
 * polyfill variables. XDS tokens use native light-dark() which is baseline 2024:
 * Chrome 123+, Firefox 120+, Safari 17.5+
 */
const lightningcssTargets = {
  chrome: 123 << 16,
  firefox: 120 << 16,
  safari: (17 << 16) | (5 << 8),
};

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async config => {
    // Filter out any existing StyleX plugins to avoid conflicts
    const filteredPlugins =
      config.plugins?.filter(
        plugin =>
          !(
            plugin &&
            typeof plugin === 'object' &&
            'name' in plugin &&
            typeof plugin.name === 'string' &&
            plugin.name.includes('stylex')
          ),
      ) || [];

    return {
      ...config,
      plugins: [
        ...filteredPlugins,
        stylex.vite({
          // Use production mode with CSS extraction
          dev: false,
          useCSSLayers: true,
          styleResolution: 'application-order',
          aliases: {
            '@xds/core/*': [path.join(rootDir, 'packages/core/src/*')],
            '@xds/core': [path.join(rootDir, 'packages/core/src')],
            '@xds/theme/*': [path.join(rootDir, 'packages/theme/src/*')],
          },
          unstable_moduleResolution: {
            type: 'commonJS',
            rootDir: rootDir,
          },
          // The StyleX unplugin runs its own internal lightningcss transform
          // with default targets of browserslist('>= 1%') which includes
          // Chrome 112 — a browser that doesn't support light-dark().
          // This causes light-dark() token values to be lowered into
          // --lightningcss-light/--lightningcss-dark polyfill variables,
          // which only work when a StyleX color-scheme class is applied.
          // Without XDSTheme (e.g. "none" theme in Storybook, or consumers
          // using @xds/core without a theme), the polyfill vars are undefined
          // and colors break. Setting targets here keeps light-dark() native.
          lightningcssOptions: {
            targets: lightningcssTargets,
          },
        }),
      ],
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@xds/core': coreRoot,
          '@xds/theme': themeRoot,
        },
      },
      css: {
        // Also set Vite's own CSS transformer targets to match, so any
        // non-StyleX CSS (e.g. manual .css imports) also preserves light-dark().
        transformer: 'lightningcss',
        lightningcss: {
          targets: lightningcssTargets,
        },
      },
    };
  },
};

export default config;
