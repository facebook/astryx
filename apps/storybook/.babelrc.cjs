/**
 * @file .babelrc.cjs
 * @input Uses @babel/preset-react, @babel/preset-typescript, @stylexjs/babel-plugin
 * @output Babel configuration for React/TypeScript with StyleX
 * @position Build config; used by Vite and PostCSS for transpilation
 */

module.exports = {
  presets: [
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      '@stylexjs/babel-plugin',
      {
        dev: process.env.NODE_ENV === 'development',
        runtimeInjection: false,
        genConditionalClasses: true,
        treeshakeCompensation: true,
        unstable_moduleResolution: {
          type: 'commonJS',
          rootDir: __dirname,
        },
      },
    ],
  ],
};
