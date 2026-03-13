# XDS

XDS is a design system for building internal tools and products.

## Getting Started

Use the XDS CLI for component docs, scaffolding, and tooling:

```bash
npx xds component list                # browse all components by category
npx xds component metadata Button     # description, features, notes for a component
npx xds component props Button        # props table
npx xds component list --detail summary  # brief summary of all components
npx xds docs                          # principles and tokens reference
```

### For AI-assisted development

Run `xds agent-docs` in your project to install the XDS component catalog into your AGENTS.md:

```bash
npx xds agent-docs
```

This adds an auto-generated component index that AI coding agents use to discover and correctly use XDS components. Re-run after updating XDS to keep the index current.

### Resources

- [Component Storybook](https://facebookexperimental.github.io/xds/)
- [GitHub Repository](https://github.com/facebookexperimental/xds)
