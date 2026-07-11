// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build-umd.mjs
 * Post-build script that bundles the compiled ESM (dist/index.js) into a single
 * browser-global IIFE file for direct <script> / CDN usage.
 *
 * Usage: node scripts/build-umd.mjs   (runs after build:esm + build:css)
 *
 * Output:
 *   packages/core/dist/astryx.umd.js      global: window.Astryx
 *   packages/core/dist/astryx.umd.js.map
 *
 * react / react-dom are EXTERNAL, resolved to the browser globals React /
 * ReactDOM (matching peerDependencies) — consumers load React via their own
 * <script> tags. The StyleX runtime (@stylexjs/stylex) IS bundled in, since
 * components call stylex.props() at runtime and CDN users should not need a
 * second global.
 *
 * Drop-in usage (pair with the precompiled stylesheet):
 *   <link rel="stylesheet" href=".../@astryxdesign/core/dist/astryx.css" />
 *   <script crossorigin src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
 *   <script crossorigin src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
 *   <script src=".../@astryxdesign/core/dist/astryx.umd.js"></script>
 *   <script>const { Button } = window.Astryx; ...</script>
 */

import {build} from 'esbuild';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CORE = path.resolve(__dirname, '..', 'packages/core');
const ENTRY = path.resolve(CORE, 'dist/index.js');
const OUTFILE = path.resolve(CORE, 'dist/astryx.umd.js');

// React 19 public named exports that compiled component code may import.
// Anything not listed falls back to a property lookup on the global at runtime.
const REACT_NAMED = [
  'Children', 'Component', 'Fragment', 'Profiler', 'PureComponent',
  'StrictMode', 'Suspense', 'cloneElement', 'createContext', 'createElement',
  'createRef', 'forwardRef', 'isValidElement', 'lazy', 'memo', 'startTransition',
  'use', 'useActionState', 'useCallback', 'useContext', 'useDebugValue',
  'useDeferredValue', 'useEffect', 'useId', 'useImperativeHandle',
  'useInsertionEffect', 'useLayoutEffect', 'useMemo', 'useOptimistic',
  'useReducer', 'useRef', 'useState', 'useSyncExternalStore', 'useTransition',
  'version',
];

const REACT_DOM_NAMED = [
  'createPortal', 'flushSync', 'preconnect', 'prefetchDNS', 'preinit',
  'preinitModule', 'preload', 'preloadModule', 'requestFormReset', 'version',
];

function reactGlobalsPlugin() {
  const filter = /^(react|react-dom|react-dom\/client|react\/jsx-runtime)$/;
  return {
    name: 'react-globals',
    setup(b) {
      b.onResolve({filter}, args => ({path: args.path, namespace: 'rg'}));
      b.onLoad({filter: /.*/, namespace: 'rg'}, args => {
        if (args.path === 'react') {
          return {loader: 'js', contents: namedReexport('React', REACT_NAMED)};
        }
        if (args.path === 'react-dom') {
          return {
            loader: 'js',
            contents:
              namedReexport('ReactDOM', REACT_DOM_NAMED) +
              `\nexport const render = R.render;\nexport const unmountComponentAtNode = R.unmountComponentAtNode;`,
          };
        }
        if (args.path === 'react-dom/client') {
          return {
            loader: 'js',
            contents: `const R = globalThis.ReactDOM;
export const createRoot = R.createRoot;
export const hydrateRoot = R.hydrateRoot;
export default R;`,
          };
        }
        // react/jsx-runtime — map to React.jsx / jsxs / Fragment with a
        // createElement fallback for React builds that omit the runtime helpers.
        return {
          loader: 'js',
          contents: `const R = globalThis.React;
const _h = (type, props, key) => {
  const p = props || {};
  const {children, ...rest} = p;
  if (key !== undefined) rest.key = key;
  const kids = children === undefined ? [] : (Array.isArray(children) ? children : [children]);
  return R.createElement(type, rest, ...kids);
};
export const jsx = R.jsx || _h;
export const jsxs = R.jsxs || _h;
export const Fragment = R.Fragment;
export default R;`,
        };
      });
    },
  };
}

function namedReexport(globalName, names) {
  const lines = names.map(n => `export const ${n} = R.${n};`).join('\n');
  return `const R = globalThis.${globalName};\n${lines}\nexport default R;`;
}

await build({
  entryPoints: [ENTRY],
  outfile: OUTFILE,
  bundle: true,
  format: 'iife',
  globalName: 'Astryx',
  platform: 'browser',
  target: ['es2020'],
  minify: true,
  sourcemap: true,
  legalComments: 'none',
  banner: {
    js: '/* @astryxdesign/core UMD bundle — requires global React & ReactDOM (see dist/astryx.umd.js header). */',
  },
  plugins: [reactGlobalsPlugin()],
});

console.log('Built dist/astryx.umd.js (global: Astryx)');
