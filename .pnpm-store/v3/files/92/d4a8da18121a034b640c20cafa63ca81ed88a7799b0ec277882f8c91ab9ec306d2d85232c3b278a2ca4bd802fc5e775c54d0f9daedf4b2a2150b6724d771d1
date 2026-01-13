# esbuild-plugin-babel

[Babel](https://github.com/babel/babel) plugin for [esbuild](https://github.com/evanw/esbuild).

<br>

First, check if [esbuild supports](https://esbuild.github.io/content-types/) the transform you need _(it's faster)_.  
If not, you can add the Babel plugin you need with this plugin.

<br>

### Install

```zsh
npm install esbuild-plugin-babel --save-dev
```

<br>

### Use

`esbuild.config.js`

```js
import esbuild from 'esbuild';
import babel from 'esbuild-plugin-babel';

esbuild
    .build({
        entryPoints: ['index.js'],
        bundle: true,
        outfile: 'main.js',
        plugins: [babel()]
    })
    .catch(() => process.exit(1));
```

`package.json`

```json
{
    "type": "module",
    "scripts": {
        "start": "node esbuild.config.js"
    }
}
```

<br>

### Configure

`esbuild.config.js`

```js
babel({
    filter: /.*/,
    namespace: '',
    config: {} // babel config here or in babel.config.json
});
```

[`babel.config.json`](https://babeljs.io/docs/en/configuration)

```json
{
    "sourceMaps": "inline",
    "presets": [...],
    "plugins": [...]
}
```

<br>

### Check

[esbuild-plugin-pipe](https://github.com/nativew/esbuild-plugin-pipe) &nbsp; → &nbsp; Pipe esbuild plugins output.

[esbuild-plugin-postcss-literal](https://github.com/nativew/esbuild-plugin-postcss-literal) &nbsp; → &nbsp; PostCSS tagged template literals plugin for esbuild.

<br>
