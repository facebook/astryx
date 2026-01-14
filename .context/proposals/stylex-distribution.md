# StyleX Distribution Pattern

## Status

Proposed

## Context

XDS is a component library that uses StyleX for styling. We needed to decide how to distribute the library to consuming applications (Next.js, Vite, etc.).

The StyleX team recommended a specific pattern based on their example:
https://github.com/facebook/stylex/tree/main/examples/example-nextjs

## Proposal

**Ship source code with StyleX runtime only. Consumer apps run the StyleX build plugins.**

### Component Library (`@xds/core`)

- Uses only `@stylexjs/stylex` as a dependency (runtime package)
- Ships raw `.tsx` source files containing `stylex.create()` calls
- Does NOT run `@stylexjs/babel-plugin` or `@stylexjs/postcss-plugin`
- Essentially a "source distribution"

```json
// @xds/core/package.json
{
  "dependencies": {
    "@stylexjs/stylex": "^0.17.0"
  },
  "exports": {
    ".": "./src/index.ts",
    "./Button": "./src/Button/index.ts"
  }
}
```

### Consuming App (Next.js, Vite, Storybook, etc.)

For Next.js:
- Runs `@stylexjs/babel-plugin` to transform StyleX calls
- Runs `@stylexjs/postcss-plugin` to extract CSS

For Vite, Webpack/Rspack, and Esbuild:
- Use `@stylexjs/unplugin` to generate and bundle CSS
- Processes both its own code AND `@xds/core` imports
- Handles all CSS extraction at build time

```js
// postcss.config.mjs in consumer app
stylexPlugin({
  include: [
    'src/**/*.{ts,tsx}',           // App's own code
    'node_modules/@xds/core/**/*', // XDS components
  ],
  // ...
})
```

## Consequences

### Benefits

1. **No pre-compilation needed** - Library doesn't need a complex build step for styles
2. **Consumer controls CSS output** - Apps can configure CSS layers, extraction, etc.
3. **Tree-shaking works naturally** - Consumer's bundler handles dead code elimination
4. **Simpler library packaging** - Just ship TypeScript source
5. **Theme tokens resolve correctly** - CSS variables are processed in app context

### Tradeoffs

1. **Consumer must configure StyleX** - Apps need babel + postcss plugins set up
2. **Include paths required** - PostCSS config must explicitly include `@xds/core` paths
3. **Build time at consumer** - StyleX processing happens during app build, not library build

## References

- StyleX Next.js example: https://github.com/facebook/stylex/tree/main/examples/example-nextjs
- StyleX Storybook example: https://github.com/facebook/stylex/tree/main/examples/example-storybook
