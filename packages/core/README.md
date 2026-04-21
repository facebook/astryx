# XDS

XDS is a design system for building internal tools and products.

## Component Docs

Look up any component's full API — props, types, best practices, and theming:

```bash
node node_modules/@xds/core/docs.mjs Button        # full docs for a component
node node_modules/@xds/core/docs.mjs --list         # list all components
node node_modules/@xds/core/docs.mjs --list --brief  # brief summaries
```

## Page Layouts

Building a full page? Start with a template rather than composing from scratch.
Templates show how to combine `XDSAppShell`, `XDSLayout`, `XDSTopNav`, and `XDSSideNav`
into common page patterns (dashboards, settings, forms, detail pages).

Requires `@xds/cli` (`npm install -D @xds/cli`):

```bash
npx xds template --list              # browse all page and block templates
npx xds template dashboard           # emit full page source
npx xds template settings --skeleton # layout skeleton with spatial annotations
```

## XDS CLI

The CLI (`@xds/cli`) provides additional tooling beyond templates:

```bash
npx xds --help                      # full listing of CLI capabilities
npx xds component Button           # full docs + related block templates
npx xds docs                        # principles, tokens, theming, and styling reference
```

## Resources

- [Component Storybook](https://facebookexperimental.github.io/xds/)
- [GitHub Repository](https://github.com/facebookexperimental/xds)
