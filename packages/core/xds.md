# XDS

XDS is a design system for building internal tools and products.

## Getting Started

Use the XDS CLI for component docs, scaffolding, and tooling:

```bash
npx xds component --list          # browse all components by category
npx xds component Button          # full docs for a component
npx xds --detail brief component --list  # brief summaries of all components
npx xds docs                      # principles and tokens reference
```

### For AI-assisted development

Run `xds init --features agents` in your project to install the XDS component catalog into your AGENTS.md:

```bash
npx xds init --features agents
```

This adds an auto-generated component index that AI coding agents use to discover and correctly use XDS components. Re-run after updating XDS to keep the index current.

### Resources

- [Component Storybook](https://facebookexperimental.github.io/xds/)
- [GitHub Repository](https://github.com/facebookexperimental/xds)
