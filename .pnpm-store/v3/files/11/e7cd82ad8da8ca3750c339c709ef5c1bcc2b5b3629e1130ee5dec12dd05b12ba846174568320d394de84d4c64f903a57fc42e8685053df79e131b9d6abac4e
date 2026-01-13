# @stylexjs/shared

This package contains most of the core JavaScript logic for stylex.

It exports two primary functions `create` and `keyframes`.

1. `create` - takes a map of style rules. The return value includes: a) the map with each style value replaced by a unique, reproducible, hashed `className` string, and b) a list of the CSS styles to be inserted into the document.
2. `keyframes` - takes a `@keyframes` animation as JS object. Returns a hashed string and the style to be injected.

#### ⭐️ `create`

The `stylex.create` function is implemented here and can be found within `stylex-create.js` and is the default export of a function named `styleXCreateSet(...)`.

##### `styleXCreateSet(...)`

> The function is called `styleXCreateSet` because `stylex.create` transforms a "set" or collection of multiple style [namespaces](#namespace)

This function itself mostly just traverses over the objects to run each [namespaces](#namespace) through the `styleXCreateNamespace(...)` function. Other than that, it takes the styles to be injected from each namespace in a [Namespace Set](#namespace-set) and deduplicates them so the style isn't injected multiple times if it's used within multiple Namespaces in the same set.

##### `styleXCreateNamespace(...)`

> This function has been kept separate in case we want to add a new function to the StyleX API in the future called `stylex.createOne` which transforms a single [namespace](#namespace) instead of a [Namespace Set](#namespace-set)

This function is responsible to transforming a [namespace](#namespace) to a [Compiled Namespace](#compiled-namespace) by hashing each key value pair and returning an object where the values have been replaced by classNames.

**Step 1**

The first step here is expanding all [shorthands](#shorthands) into their individual properties. To do this we `.flatMap` over the object entries of the Namespace and use the `expandShorthands(...)` function defined within `expand-shorthands.js`

**Step 2**

We hash each style `[key, value]` pair and generate a className and an associated CSS rule. This is done in the `convertToClassName(...)` function defined within [`convert-to-className.js`](#convert-to-classname-shared-package). (Explained below)

**Step 3**

Using the classNames generated in _step 2_ above, we collect all the individual style keys along with their associated classNames in the `resolvedNamespace` object.

All the generated CSS rules from _step 2_ are collected in the `injectedStyles` object.

The `[resolvedNamespace, injectedStyles]` is returned.

##### Back to `styleXCreateSet(...)`

`styleXCreateSet(...)` takes all the `[resolvedNamespace, finalInjectedStyles]` tuples and returns a tuple of `[compiledNamespaceSet, allInjectedStyles]`

### Back to `create` with the `@stylexjs/babel-plugin` package

The `create` function within the babel plugin package takes the `stylex.create(...)` function call and replaces it with the `compiledNamespaceSet`.

It also takes each of the `injectedStyles` and:

1. Either injects it as a `stylex.inject` call (if in `dev` mode)
2. Or, adds it to the array of injected styles on [`babel.state.metadata`](#babel-metadata)

#### ⭐️ `keyframes`

This is the function backing `stylex.keyframes`. It works similarly to `create` but it's more simplified since it only defines a single CSS `@keyframes` rule and returns a single string.

Here again, the source AST is converted to a JS object and passed to `stylex-keyframes.js` within the `shared` package.

There, first the shorthands are expanded and then the whole objects is hashed. The resulting hash is used as the generated `animation name` for a `@keyframes` rule.

The "name" and the CSS `@keyframes` rules are returned as a tuple.

The `stylex.keyframes` call is replaced with the final string.

The CSS `@keyframes` rule is either injected using `stylex.inject` in dev mode or set onto the `stylex` array on [`babel.state.metadata`](#babel-metadata).

#### `convert-to-className` (`shared` package)

This function is responsible for converting a single style key-value pair into a tuple of `[key, className, CSSRules]`

It does so in the following steps:

1. Convert the camelCased keys that are used by end-users to define [Namespaces](#namespace) and convert them to the dash-separated keys used within CSS.
2. Hash `key` + (any `pseudo` or `at-rule`) + `value` to generate a className
3. Generate the CSS rule using the `generateCSSRule` function defined in [`generate-css-rule.js`](#generate-css-rulejs) in the `shared` package.

#### `generate-css-rule.js`

This function takes a CSS key value pair, checks if has an RTL counterpart and returns them along side a pre-configured priority based on the type of CSS rule it is.
