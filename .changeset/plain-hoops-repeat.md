---
'@astryxdesign/core': patch
---

[fix] Compile dist with the production JSX transform — 0.1.5 shipped `jsxDEV`, which crashes every consumer that renders in production
@fatwang2

`@babel/preset-react` 8 derives its `development` option from the Babel env name
(`api.env(env => env === 'development')`), and Babel falls back to
`"development"` whenever `NODE_ENV`/`BABEL_ENV` is unset. The bump from 7.29.7 to
8.0.1 therefore flipped the published build to the development JSX transform
without any config change: 193 of 479 files in `@astryxdesign/core@0.1.5`'s
`dist` import `react/jsx-dev-runtime` and call `jsxDEV`, which React's
production build does not export.

The Babel configs for core, lab, and charts now pin `development: false`, and a
new `scripts/check-no-dev-jsx.mjs` guard fails the build if development JSX ever
reaches `dist` again.
