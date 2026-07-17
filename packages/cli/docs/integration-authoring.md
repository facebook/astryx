# Authoring an Astryx Integration

> **Status:** working notes. This should eventually move to the public wiki
> alongside the rest of the integration-authoring guidance; it lives here for
> now so it ships and is versioned with the CLI.

An **Integration** is an npm package that contributes components, templates, and/or
codemods to a consumer's design-system workflow. Consumers install the 3rd party
package, add a line to their astryx.config file:

```js
import {createConfig} from '@astryxdesign/cli/config';

export default createConfig({
  integrations: ['@acme/astryx-widgets'],
  ...
});
```

Then the integration's components and templates will be surfaced alongside Astryx
components in the Astryx CLI.

```sh
astryx component AcmeCarousel --props
astryx component --list --package @acme/astryx-widgets
```

## The Integration File

In order to register your package as an Astryx Integration, create an
`astryx.integration.{ts,mjs,js}` file as a sibling to your `package.json`. This file
tells Astryx where to find your components, templates, codemods, etc.

```js
// astryx.integration.{ts,mjs,js}
import {createIntegration} from '@astryxdesign/cli/integration';

export default createIntegration({
  components: './components',
  templates: './templates',
  codemods: './codemods',
  issuesUrl: 'https://github.com/acme/widgets/issues',
});
```

## Components

Your components themselves may be exported from your library as you see fit (consumers
will still import them from your package) but Astryx CLI will look for a .doc.{ts,mjs,js}
file with the same stem e.g. `AcmeCarousel.tsx` and `AcmeCarousel.doc.ts`.

```js
// AcmeCarousel.doc.ts
import {createComponentDoc} from '@astryxdesign/cli/doc';

export default createComponentDoc({
  name: 'AcmeCarousel',
  description: '...',
  ...
});
```

## Templates

Templates are typically not exported from the package directly, but instead accessed
via the Astryx CLI. Consumers can look through your templates and materialize them
into their apps.

You define a template with the `createPageTemplate` (for full pages) or `createBlockTemplate`
(for smaller chunks). e.g. `AcmeLandingPage.tsx`, `AcmeLandingPage.template.ts`

```js
// AcmeLandingPage.template.ts
import {createPageTemplate} from '@astryxdesign/cli/template';

export default createPageTemplate({
  ...
});
```

Note that, since the CLI needs access to the template source code, you need to make sure
that it is included in your published package. This will also allow us to render previews
of templates in the future by bundling your template into a doc site build.

Typically, this is done via the package.json `exports` key.

```jsonc
{
  "exports": {
    // ...
    "./templates/*.tsx": "./templates/*.tsx",
  },
}
```

In order to verify that it's working, you can test importing the template component like this:

```ts
import('@acme/astryx-widgets/templates/AcmeLandingPage.tsx');
```

Import **with the `.tsx` extension** — an extensionless specifier won't resolve
under `moduleResolution: bundler`. The extensionful `"./templates/*.tsx"` export
above is what lets that import type-check without consumers enabling
`allowImportingTsExtensions`.
