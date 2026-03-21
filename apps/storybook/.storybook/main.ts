import type {StorybookConfig} from '@storybook/react-vite';
import stylex from '@stylexjs/unplugin';
import path from 'path';

const rootDir = path.resolve(__dirname, '../../..');
const coreDist = path.resolve(rootDir, 'packages/core/dist');
const labSrc = path.resolve(rootDir, 'packages/lab/src');

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
        // Declare CSS layer order — establishes priority:
        // xds-reset < xds-base < xds-theme
        // All are lower than unlayered consumer styles.
        {
          name: 'xds-css-layer-order',
          transformIndexHtml() {
            return [
              {
                tag: 'style',
                children: '@layer xds-reset, xds-base, xds-theme;',
                injectTo: 'head-prepend',
              },
            ];
          },
        },
        ...filteredPlugins,
        // StyleX for stories and @xds/lab only (not @xds/core — that uses dist CSS).
        // useCSSLayers: false so story styles are unlayered and don't interfere
        // with the dist layer model.
        stylex.vite({
          dev: false,
          useCSSLayers: false,
          styleResolution: 'application-order',
          aliases: {
            '@xds/core/*': [path.join(coreDist, '*')],
            '@xds/core': [coreDist],
            '@xds/lab/*': [path.join(labSrc, '*')],
            '@xds/lab': [labSrc],
          },
          unstable_moduleResolution: {
            type: 'commonJS',
            rootDir: rootDir,
          },
          lightningcssOptions: {
            targets: lightningcssTargets,
          },
        }),
      ],
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          // Dist path — requires `yarn build` before running storybook.
          // Component JS + CSS from dist (layered).
          // reset.css imported via relative path in preview.tsx (not in dist).
          '@xds/core/xds.css': path.join(coreDist, 'xds.css'),
          '@xds/core': coreDist,
          '@xds/lab': labSrc,
          '@xds/theme-default': path.join(
            rootDir,
            'packages/themes/default/dist',
          ),
          '@xds/theme-neutral': path.join(
            rootDir,
            'packages/themes/neutral/dist',
          ),
          '@xds/theme-brutalist': path.join(
            rootDir,
            'packages/themes/brutalist/dist',
          ),
        },
      },
      css: {
        transformer: 'lightningcss',
        lightningcss: {
          targets: lightningcssTargets,
        },
      },
    };
  },
};

export default config;
