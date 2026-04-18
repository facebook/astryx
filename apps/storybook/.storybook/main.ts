import type {StorybookConfig} from '@storybook/react-vite';
import {xdsStylex} from '@xds/build/vite';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../..');

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
  addons: ['@storybook/addon-links', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {defaultName: 'Docs'},
  viteFinal: async config => {
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
        {
          name: 'xds-color-scheme',
          transformIndexHtml() {
            return [
              {
                tag: 'style',
                children: ':root { color-scheme: light; }',
                injectTo: 'head-prepend',
              },
            ];
          },
        },
        ...filteredPlugins,
        ...xdsStylex({
          stylexOptions: {
            dev: false,
            styleResolution: 'application-order',
            aliases: {
              '@xds/core/*': [path.join(rootDir, 'packages/core/src/*')],
              '@xds/core': [path.join(rootDir, 'packages/core/src')],
              '@xds/theme-default/*': [
                path.join(rootDir, 'packages/themes/default/src/*'),
              ],
              '@xds/theme-neutral/*': [
                path.join(rootDir, 'packages/themes/neutral/src/*'),
              ],
              '@xds/theme-brutalist/*': [
                path.join(rootDir, 'packages/themes/brutalist/src/*'),
              ],
            },
            unstable_moduleResolution: {
              type: 'commonJS',
              rootDir: rootDir,
            },
            lightningcssOptions: {
              targets: lightningcssTargets,
            },
          },
          libraryPattern: 'packages/',
        }),
      ],
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@xds/core': path.resolve(rootDir, 'packages/core/src'),
          '@xds/theme-default': path.resolve(
            rootDir,
            'packages/themes/default/src/source.ts',
          ),
          '@xds/theme-neutral': path.resolve(
            rootDir,
            'packages/themes/neutral/src/source.ts',
          ),
          '@xds/theme-brutalist': path.resolve(
            rootDir,
            'packages/themes/brutalist/src/source.ts',
          ),
          '@xds/vega': path.resolve(rootDir, 'packages/vega/src'),
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
