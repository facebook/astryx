# XDS

XDS is a design system for building internal tools and products.

## Component Docs

Look up any component's full API — props, types, best practices, and theming:

```bash
node node_modules/@xds/core/docs.mjs Button        # full docs for a component
node node_modules/@xds/core/docs.mjs --list         # list all components
node node_modules/@xds/core/docs.mjs --list --brief  # brief summaries
```

## XDS CLI

For richer documentation including templates, scaffolding, and tooling utilities, install the XDS CLI:

```bash
npx xds component Button           # full docs + related templates
npx xds template --list             # browse page and block templates
npx xds template Dashboard --skeleton  # scaffold a template
npx xds docs                        # principles and tokens reference
```

## Resources

- [Component Storybook](https://facebookexperimental.github.io/xds/)
- [GitHub Repository](https://github.com/facebookexperimental/xds)
