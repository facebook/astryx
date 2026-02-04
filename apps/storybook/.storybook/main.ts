import type { StorybookConfig } from '@storybook/react-vite';
import { join, dirname } from 'path';
import { mergeConfig } from 'vite';
import stylex from '@stylexjs/unplugin';
import path from 'path';

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}

const rootDir = path.resolve(__dirname, '../../..');
const coreRoot = path.resolve(__dirname, '../../../packages/core/src');

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
  viteFinal: async (config) => {
    return mergeConfig(config, {
      plugins: [
        stylex.vite({
          // Always use dev mode - injects styles via JavaScript
          // This works reliably in both dev and production builds
          dev: true,
          useCSSLayers: true,
          styleResolution: 'application-order',
          aliases: {
            '@xds/core/*': [path.join(rootDir, 'packages/core/src/*')],
            '@xds/core': [path.join(rootDir, 'packages/core/src')],
          },
          unstable_moduleResolution: {
            type: 'commonJS',
            rootDir: rootDir,
          },
        }),
      ],
      resolve: {
        alias: {
          '@xds/core': coreRoot,
        },
      },
    });
  },
};

export default config;
