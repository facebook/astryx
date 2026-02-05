import type { StorybookConfig } from '@storybook/react-vite';
import { join, dirname } from 'path';
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
    // Filter out any existing StyleX plugins to avoid conflicts
    const filteredPlugins = config.plugins?.filter(
      (plugin: any) => !(plugin?.name?.includes?.('stylex'))
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
          },
          unstable_moduleResolution: {
            type: 'commonJS',
            rootDir: rootDir,
          },
        }),
      ],
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@xds/core': coreRoot,
        },
      },
    };
  },
};

export default config;
