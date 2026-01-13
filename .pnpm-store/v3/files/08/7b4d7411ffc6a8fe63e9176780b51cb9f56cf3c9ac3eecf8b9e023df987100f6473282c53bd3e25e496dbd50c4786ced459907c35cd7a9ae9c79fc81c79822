# babel-plugin-syntax-hermes-parser

Hermes parser plugin for [Babel](https://babeljs.io/). This plugin switches Babel to use `hermes-parser` instead of the `@babel/parser`. Since Hermes parser uses C++ compiled to WASM it is significantly faster and provides full syntax support for Flow.

## Install

Using npm:

```sh
npm install --save-dev babel-plugin-syntax-hermes-parser
```

or using yarn:

```sh
yarn add babel-plugin-syntax-hermes-parser --dev
```

# Usage

The plugin can be enabled via:

```
// babel.config.json
{
  "plugins": ["babel-plugin-syntax-hermes-parser"]
}
```

If parser options need to be provide you can do so via the `parserOpts` config:

```
// babel.config.json
{
  "plugins": ["babel-plugin-syntax-hermes-parser"],
  "parserOpts": {
    "allowReturnOutsideFunction": true
  }
}
```
