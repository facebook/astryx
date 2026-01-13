# styleQ &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/necolas/styleq/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/styleq.svg?style=flat)](https://www.npmjs.com/package/styleq) [![Build Status](https://github.com/necolas/styleq/workflows/tests/badge.svg)](https://github.com/necolas/styleq/actions) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/necolas/styleq/blob/master/.github/CONTRIBUTING.md)

**styleQ** is a quick, small JavaScript runtime for merging the HTML class names produced by CSS compilers.

* High performance merging for initial render.
* Built-in memoization for updates.
* Merges static and dynamic styles.
* Supports various CSS compiler designs.
* 0.7 KB gzipped runtime.

## Use

Install:

```
npm install styleq
```

Import:

```js
import { styleq } from 'styleq';
```

## API

### styleq(...styles)

Merges style objects and produces a DOM `className` string and inline `style` object (camelCase property names).

```js
const [ className, inlineStyle ] = styleq(styles.root, { opacity });
```

The `styleq` function efficiently merges deeply nested arrays of both extracted and inline style objects.

* Compiled styles must set the `$$css` property to `true` for production. And may be a string for development.
* Any style object without the `$$css` property is treated as an **inline style**.
* Compiled styles must be static for best performance.
* Compiled style object keys do not need to match CSS property names; any string is allowed.
* Compiled style object values must be an **HTML class string**.

```js
/* Generated output */

const styles = {
  root: {
    // Needed by the runtime
    $$css: true,
    // Atomic CSS classes
    display: 'display-flex-class',
    alignItems: 'alignItems-center-class'
  },
  other: {
    // String values for $$css are concatenated and can be used for dev debugging.
    // Compilers are encouraged to provide file and line info.
    $$css: 'path/to/file:10',
    // Atomic CSS classes
    display: 'display-flex-class',
    alignItems: 'alignItems-center-class'
  },
};

const [ className, inlineStyle, dataStyleSrc ] = styleq(styles.root, props.style);
```

### styleq.factory(options) => styleq

A factory for creating custom merging functions, tailored to the design of specific compilers.

```js
const compilerStyleq = styleq.factory(options);
```

Options are used to configure the merging function.

```js
type Options = {
  // control memoization
  disableCache: boolean = false;
  // control className/style merge strategy
  disableMix: boolean = false;
  // transform individual styles at runtime before merging
  transform: ?(style) => compiledStyle;
}
```

#### `disableCache`

**Memoization is enabled by default**. This option can be used to disable it. Memoization relies on a tree of WeakMaps keyed on static compiled styles. This allows the runtime to efficiently store chunks of merged styles, making re-computation very cheap. However, checking the WeakMap for memoized data when there is none significantly adds to the cost of initially computing the result. Therefore, if initial computations need to be as fast as possible (e.g., your use case involves few repeat merges), memoization should be disabled.

```js
const styleqNoCache = styleq.factory({ disableCache: true });
```

#### `disableMix`

**Inline styles are merged together with static styles by default**, but can be merged independently if preferred. Both static and inline styles can be passed to `styleq` for merging. By default, the properties defined by static and inline styles are merged together. The performance of this option is still excellent, but merging with inline styles often means memoization cannot be used as effectively. In certain circumstances, this merging strategy can result in better performance, as the deduplication of styles can reduce the number of CSS rules applied to the element (which improves browser layout times).

If mixing is diabled, the static and inline styles will be treated as values for different attributes: either `className` OR `style` respectively. If an inline style sets a property that is later set by a static style, *both* the static class name and dynamic style property will be set. In practice this means that inline style declarations override those of static styles, whatever their position in the styles array passed to `styleq`. Therefore, memoization of class name merges is not changed by inline styles, and so provides the best general performance.

```js
const styleqNoMix = styleq.factory({ disableMix: true });
```

#### `transform`

**Styles can be transformed before merging** by using the `transform` function. The runtime loop is extremely performance sensitive as class name merges can happen 1000s of times during a screen render, whether on the server or client. The `transform` function is used to change style objects before styleQ merges them. For example, if a compiler needs runtime information before selecting a compiled style.

```js
// compiler/useStyleq
import { styleq } from 'styleq';
import { localizeExtractedStyle } from './localizeExtractedStyle';
import { useLocaleContext } from './useLocaleContext'
import { useMemo } from 'react';

export function useStyleq(styles) {
  // Runtime context provides subtree writing direction
  const { direction } = useLocaleContext();
  const isRTL = direction === 'rtl';
  // Create a custom styleq for localization transform
  const styleqWithPolyfills = useMemo(
    () => styleq.factory({
      transform(style) {
        // Memoize results in the transform
        return localizeExtractedStyle(style, isRTL);
      }
    }),
    [ isRTL ]
  );
  const styleProps = styleqWithPolyfills(styles);
  // Add vendor prefixes to inline styles
  if (styleProps[1]) {
    styleProps[1] = prefixAll(styleProps[1]);
  }
  return styleProps;
}
```

WARNING: Transforming compiled styles to support runtime dynamism is possible without negatively effecting performance, however, transforms must be done carefully to avoid creating merge operations that cannot be efficiently memoized. `WeakMap` is recommended for memoizing the result of transforms, so that static objects are passed to styleq.

## Notes for compiler authors

CSS compilers implementing different styling models can all target styleQ to deliver excellent runtime performance. styleQ can be used at build time and runtime (for server and client) to generate `className` and `style` values.

Examples of how various compiler features and designs can supported with styleQ are discussed below.

* [Supporting zero-conflict styles](#supporting-zero-conflict-styles)
* [Supporting arbitrary selectors](#supporting-arbitrary-selectors)
* [Supporting high-performance layouts](#supporting-high-performance-layouts)
* [Supporting high-performance inline styles](#supporting-high-performance-inline-styles)
* [Supporting themes](#supporting-themes)
* [Polyfilling logical properties and values](#polyfilling-logical-properties-and-values)
* [Implementing utility styles](#implementing-utility-styles)

### Supporting zero-conflict styles

Zero-conflict styles provide developers with guarantees that component style is encapsulated and not implicitly altered by styles defined by other components. A compiler designed around zero-conflict styles will generally output "atomic CSS" and produce smaller CSS style sheets that avoid all specificity and source order conflicts.

Typically, a zero-conflict design involves excluding support for descendant selectors (i.e., any selector that targets an element other than the element receiving the class name). And shortform properties are either disallowed, restricted, or automatically expanded to longform properties. If pseudo-classes (e.g., `:focus`) are supported, the compiler must guarantee the order of precedence between pseudo-classes in the CSS style sheet (e.g., `:focus` rules appear before `:active` rules). If Media Queries are supported, they too must be carefully ordered.

Input:

```js
import * as compiler from 'compiler';

const styles = compiler.create({
  root: {
    margin: 10,
    opacity: 0.7,
    ':focus': {
      opacity: 0.8
    },
    ':active': {
      opacity: 1.0
    }
  }
});
```

Output:

```js
insertOrExtract('.margin-left-10 { margin-left:10px; }', 0);
insertOrExtract('.margin-top-10 { margin-top:10px; }', 0);
insertOrExtract('.margin-right-10 { margin-right:10px; }', 0);
insertOrExtract('.margin-bottom-10 { margin-bottom:10px; }', 0);
insertOrExtract('.opacity-07 { opacity:0.7; }', 0);
// Pseudo-class insertion order is after class selector rules
insertOrExtract('.focus-opacity-08:focus { opacity:0.8; }', 1.0);
insertOrExtract('.active-opacity-1:active { opacity:1; }', 1.1);

const styles = {
  root: {
    $$css: true,
    marginLeft: 'margin-left-10',
    marginTop: 'margin-top-10',
    marginRight: 'margin-right-10',
    marginBottom: 'margin-bottom-10',
    opacity: 'opacity-07',
    __focus$opacity: 'focus-opacity-08',
    __active$opacity: 'active-opacity-1'
  }
};
```

### Supporting arbitrary selectors

The runtime can be used by compilers that support arbitrary selectors, e.g., by concatenating (hashing, etc.) the selector string and property to create a unique key for that selector-property combination. (Note that supporting arbitrary CSS selectors trades flexibility for zero-conflict styles.)

Input:

```js
import * as compiler from 'compiler';

const styles = compiler.create({
  root: {
    ':focus a[data-prop]': {
      opacity: 1
    }
  }
});
```

Output:

```js
insertOrExtract('.xjrodmsp-opacity-1:focus a[data-prop] { opacity:1.0; }');

const styles = {
  root: {
    $$css: true,
    '__xjrodmsp-opacity-1': 'xjrodmsp-opacity-1'
  }
};
```

### Supporting high-performance layouts

Atomic CSS has tradeoffs. Once an element has many HTML class names each pointing to different CSS rules, browser layout times slow down. In some cases, compilers may choose to flatten multiple declarations into "traditional" CSS. For example, a component library may optimize the "reset" styles for its core components by flattening those styles, and then inserting those rules into the CSS style sheet before all the atomic CSS. That way atomic CSS will always override the reset rules, and the layout performance of the core components will be significantly improved.

Input:

```jsx
import { createResetStyle } from 'compiler';

function View(props) {
  return (
    <div {...props} css={reset, props.css} />
  );
}

const reset = createResetStyle({
  display: 'flex',
  alignItems: 'stretch',
  flexDirection: 'row',
  ...
});
```

Output:

```jsx
import { styleq } from 'compiler/styleq';

// Compiler inserts Reset CSS rules before Atomic CSS rules.
insertOrExtract('.reset-<hash> { display:flex; align-items:stretch; flex-direction:row', 0);

function View(props) {
  const [ className, inlineStyle ] = styleq(reset, props.css);
  return (
    <div {...props} className={className} style={inlineStyle} />
  );
}

const reset = {
  $$css: true,
  // Compiler decides that only one reset is allowed per element.
  // Each reset rule created is set to the '__reset' key.
  __reset: 'reset-<hash>',
};
```

### Supporting high-performance inline styles

A compiler may provide a single API for defining static and dynamic values, and  maximize the number of compiled styles by replacing dynamic values with unique CSS custom properties that are then set by inline styles. This compiler design decouples static and inline property merges, and makes the best use of runtime memoization.

Input:

```jsx
// @jsx createElement
import { createElement } from 'compiler';

function Fade(props) {
  return (
    <div
      {...props}
      css={{
        // static value
        backgroundColor: 'blue',
        // dynamic value
        opacity: props.opacity,
        ...props.css
      }}
    />
  );
}
```

Output:

```jsx
// Custom styleq with mixing disabled
import { customStyleq } from 'compiler/customStyleq';

// The opacity value is a unique CSS custom property
insertOrExtract('.backgroundColor-blue { background-color:blue; }');
insertOrExtract('.opacity-var-xyz { opacity:var(--opacity-xyz); }');

// A compiled style is generated, including the 'opacity' property
const compiledStyle = {
  $$css: true,
  backgroundColor: 'backgroundColor-blue',
  opacity: 'opacity-var-xyz'
};

function Fade(props) {
  const [ className, style ] = customStyleq(
    // The dynamic value is set to the custom property.
    // With static/dynamic mixing disabled, the position of the inline style
    // is irrelevant. However, with mixing enabled, the best performance is
    // achieved by placing inline styles earlier in the queue.
    { '--opacity-xyz': props.opacity },
    compiledStyle,
    props.css
  );

  return (
    <div
      {...props}
      className={className}
      style={style}
    />
  );
}
```


### Supporting themes

Compilers implementing themes via CSS custom properties should avoid creating atomic CSS rules for each theme property. As mentioned above, this can slow down browser layout and flattening theme styles into a single rule is preferred. Theme classes can be deduplicated by using the same key for all themes in the generated style object.

Input:

```js
import * as compiler from 'compiler';

const [themeVars, themeStyle] = compiler.createDefaultTheme({
  color: {
    primary: '#fff',
    secondary: '#f5d90a'
    ...
  },
  space: {},
  size: {}
});

const className = compiler.merge(themeStyle, props.style);
```

Output:

```js
import { styleq } from 'compiler/styleq';

insertOrExtract(
  ':root, .theme-default { --theme-default-color-primary:#fff; --theme-default-color-secondary:#f5d90a; }'
);

const themeVars = {
  color: {
    primary: 'var(--theme-default-color-primary)',
    secondary: 'var(--theme-default-color-secondary)'
    ...
  }
};

const themeStyle = {
  $$css: true,
  __theme: 'theme-default'
};

const [ className ] = styleq(themeStyle, props.style);
```

### Polyfilling features at runtime

A compiler might want to provide polyfills or other runtime transforms, e.g., [CSS logical properties and values](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties). Using the `transform` option is one way to implement this kind of functionality.

Input:

```js
import { StyleSheet } from 'compiler';

function Box() {
  return <div style={styles.root} />
}

const styles = StyleSheet.create({
  root: {
    float: 'inline-start',
  }
});
```

Output:

```js
// See the 'useStyleq' example in the API docs above
import { useStyleq } from 'compiler/useStyleq';

insertOrExtract('.float-left { float:left; }');
insertOrExtract('.float-right { float:right; }');

function Box() {
  const [ className ] = useStyleq(styles.view, styles.root);
  return <div className={className} />
}

const styles = {
  root: {
    $$css: true,
    // Compiler defines a custom key to mark this style object
    // for processessing by the localized transform.
    $$css$localize: true,
    // [ LTR, RTL ]
    float: [ 'float-left', 'float-right' ]
  }
}
```

In this case, `useStyleq` is a function defined by the compiler which transforms `$$css` styles into the correct class name for a given writing direction. Take care to memoize the transform so that the same result is always used in merges. For example:

```js
const cache = new WeakMap();
const markerProp = '$$css$localize';

/**
 * The compiler polyfills logical properties and values, generating a class
 * name for both writing directions. The style objects are annotated by
 * the compiler as needing this runtime transform. The results are memoized.
 *
 * { '$$css$localize': true, float: [ 'float-left', 'float-right' ] }
 * => { float: 'float-left' }
 */

function compileStyle(style, isRTL) {
  // Create a new compiled style for styleq
  const compiledStyle = {};
  for (const prop in style) {
    if (prop !== markerProp) {
      const value = style[prop];
      if (Array.isArray(value)) {
        compiledStyle[prop] = isRTL ? value[1] : value[0];
      } else {
        compiledStyle[prop] = value;
      }
    }
  }
  return compiledStyle;
}
export function localizeStyle(style, isRTL) {
  if (style[markerProp] != null) {
    const compiledStyleIndex = isRTL ? 1 : 0;
    // Check the cache in case we've already seen this object
    if (cache.has(style)) {
      const cachedStyles = cache.get(style);
      let compiledStyle = cachedStyles[compiledStyleIndex];
      if (compiledStyle == null) {
        // Update the missing cache entry
        compiledStyle = compileStyle(style, isRTL);
        cachedStyles[compiledStyleIndex] = compiledStyle;
        cache.set(style, cachedStyles);
      }
      return compiledStyle;
    }

    // Create a new compiled style for styleq
    const compiledStyle = compileStyle(style, isRTL);
    const cachedStyles = new Array(2);
    cachedStyles[compiledStyleIndex] = compiledStyle;
    cache.set(style, cachedStyles);
    return compiledStyle;
  }
  return style;
}
```

### Implementing utility styles

Compilers that produce "utility" CSS rules can use styleQ to dedupe utilities across categories, i.e., higher-level styling abstractions such as "size", "spacing", "color scheme", etc. The keys of extracted styles can match the utility categories.

Input:

```js
import { oocss } from 'compiler';

const View = (props) => (
  // This compiler targets strings for named "utilities"
  <div {...props} className={oocss('cs-1 p-1 s-1', props.css)} />
);

const StyledView = (props) => (
  <View {...props} css={oocss('cs-2 p-2')} />
);
```

Output:

```js
import { styleq } from 'styleq';

insertOrExtract('.cs-1 { --primary-color:#000; --secondary-color:#eee }', 2);
insertOrExtract('.cs-2 { --primary-color:#fff; --secondary-color:#333 }', 2);
insertOrExtract('.p-1 { padding:10px }', 0);
insertOrExtract('.p-2 { padding:20px }', 0);
insertOrExtract('.s-1 { height:100px; width:100px }', 1);

// Each utility class is categorized. For example, only a single 'colorScheme'
// rule will be applied to each element.
const oocss1 = {
  $$css: true,
  __cs: 'cs-1',
  __p: 'p-1',
  __s: 's-1'
};

const View = (props) => (
  <div {...props} className={styleq(oocss1, props.css)} />
);

const oocss2 = {
  $$css: true,
  __cs: 'cs-2',
  __p: 'p-2'
}

const StyledView = (props) => (
  <View {...props} css={oocss2} />
);
```

## License

styleq is [MIT licensed](./LICENSE).
