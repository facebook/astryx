# @stylexjs/stylex

StyleX is a JavaScript library for defining styles for optimized user
interfaces.

## Installation

To start playing with StyleX without having to set up any build settings you can
install just two packages:

```sh
npm install --save @stylexjs/stylex
```

### Compiler

StyleX is designed to extract styles to a static CSS style sheet during an app's
build process. StyleX provides a Babel plugin along with plugin integrations for
Webpack, Rollup and NextJS.

```sh
npm install --save-dev @stylexjs/babel-plugin
```

For more information on working with the compiler, please see the documentation
for
[`@stylexjs/babel-plugin`](https://www.npmjs.com/package/@stylexjs/babel-plugin).

### Runtime compiler

The runtime compiler should only be used for development and testing purposes.

```sh
npm install --save-dev @stylexjs/dev-runtime
```

Import `@stylexjs/dev-runtime` in your JS entry-point to set everything up.

```ts
import inject from '@stylexjs/dev-runtime';

if (process.env.NODE_ENV !== 'production') {
  inject({
    // configuration options
    classNamePrefix: 'x-',
    dev: true,
    test: false,
  });
}
```

For more information on working with the compiler, please see the documentation
for
[`@stylexjs/dev-runtime`](https://www.npmjs.com/package/@stylexjs/dev-runtime).

## API

### stylex.create()

Styles are defined as a map of CSS rules using `stylex.create()`. In the example
below, there are 2 different CSS rules. The names "root" and "highlighted" are
arbitrary names given to the rules.

```tsx
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    width: '100%',
    color: 'rgb(60,60,60)',
  },
  highlighted: {
    color: 'yellow',
  },
});
```

Pseudo-classes and Media Queries can be nested within style definitions:

```tsx
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    width: '100%',
    color: 'rgb(60,60,60)',
    maxWidth: {
      '@media (min-width: 800px)': '800px',
    },
  },
  highlighted: {
    color: 'yellow',
    opacity: {
      ':hover': '0.9',
    },
  },
});
```

The compiler will extract the rules to CSS and replace the rules in the source
code with a "compiled style" object.

### stylex.props()

Applying style rules to specific elements is done using `stylex.props`. Each
argument to this function must be a reference to a compiled style object, or an
array of compiled style objects. The function merges styles from left to right.

```tsx
<div {...stylex.props(styles.root, styles.highlighted)} />
```

The `stylex.props` function returns React props as required to render an
element. StyleX styles can still be passed to other components via props, but
only the components rendering host platform elements will use `stylex.props()`.
For example:

```tsx
const styles = stylex.create({
  internalRoot: {
    padding: 10,
  },
  exportedRoot: {
    position: 'relative',
  },
});

function InternalComponent(props) {
  return (
    <div {...props} {...stylex.props(styles.internalRoot, props.style)} />
  );
}

export function ExportedComponent(props) {
  return <InternalComponent style={[styles.exportedRoot, props.style]} />;
}
```

Styles can be conditionally included using standard JavaScript.

```tsx
<div {...stylex.props(styles.root, isHighlighted && styles.highlighted)} />
```

And the local merging of styles can be used to control the relative priority of
rules. For example, to allow a component's local styles to take priority over
style property values passed in via props.

```tsx
<div {...stylex.props(props.style, styles.root)} />
```

### stylex.firstThatWorks()

Defining fallback styles is done with `stylex.firstThatWorks()`. This is useful
for engines that may not support a specific style property.

```tsx
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  header: {
    position: stylex.firstThatWorks('sticky', '-webkit-sticky', 'fixed'),
  },
});
```

This is equivalent to defining CSS as follows:

```css
.header {
  position: fixed;
  position: -webkit-sticky;
  position: sticky;
}
```

## Types

StyleX comes with full support for Static Types.

### `StyleXStyles<>`

The most common type you might need to use is `StyleXStyles<>`. This lets you accept
an object of arbitrary StyleX styles.

```tsx
type Props = {
  ...
  style?: StyleXStyles<>,
};

function MyComponent({style, ...}: Props) {
  return (
    <div {...stylex.props(localStyles.foo, localStyles.bar, style)} />
  );
}
```

### `StyleXStylesWithout<>`

To disallow specific style properties, use the `StyleXStylesWithout<>` type.

```tsx
type Props = {
  // ...
  style?: StyleXStylesWithout<{
    position: unknown;
    display: unknown;
  }>;
};
```

### `StaticStyles<>`

To constrain the styles to specific properties and values, use the `StaticStyles<>`
type. For example, if a component
should accept `marginTop` but only accept one of `0`, `4`, or `8` pixels as
values.

```tsx
type Props = {
  ...
  style?: StaticStyles<{
    marginTop?: 0 | 4 | 8;
  }>,
};
```

## How StyleX works

StyleX produces atomic styles, which means that each CSS rule contains only a
single declaration and uses a unique class name. For example:

```tsx
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  root: {
    width: '100%',
    color: 'red',
  }
}
```

From this code, StyleX will generate 2 classes. One for the `width: '100%'`
declaration, and one for the `color: 'red'` declaration. If you use the
declaration `width: '100%'` anywhere else in your application, it will _reuse
the same CSS class_ rather than creating a new one.

One of the benefits of this approach is that the generated CSS file grows
_logarithmically_ as you add new styled components to your app. As more style
declarations are added to components, they are more likely to already be in use
elsewhere in the app. As a result of this CSS optimization, the generated CSS
style sheet for an app is usually small enough to be contained in a single file
and used across routes, avoiding style recalculation and layout thrashing as
users navigate through your app.
