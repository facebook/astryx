# @stylexjs/babel-plugin

StyleX expects you to transform all `js`/`ts`/`tsx` files with `@stylexjs/babel-plugin`.
In addition to transforming JS code, this plugin also produces an Array of CSS rules. All the CSS rules
generated from all JS files within your project should be concatenated together and converted to a CSS
file using the `processStyles` function which is also exported from the same module.

`@stylexjs/babel-plugin` is fairly lightweight. It pre-computes `stylex` related functions like
`stylex.create` and `stylex.keyframes` by converting the argument AST to a JS object and transforming them
by passing them to the functions of the corresponding names within `@stylex/shared`


## Babel Metadata

The StyleX Babel plugin does more than transform JavaScript (or TypeScript) files. It also returns a list of injected styles. The way that such a value can be returned while transforming a JS file is by using Babel's `metadata` API.

An example of this can be seen in some of the tests, but the result of using Babel's `transform(...)` function returns an object contains at least two keys:

1. `code` which is the transformed JS code
2. `metadata` is an object of metadata that the plugin may want to return as a side-effect.

e.g.

```js
const result = transformSync(sourceCode, {
  filename: opts.filename,
  parserOpts: { flow: { all: true } },
  plugins: [stylexPlugin, opts],
});

const transformedCode = result.code;
const injectedStyles = result.metadata.stylex;
```
