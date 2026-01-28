# /packages/core

Core UI components library for the XDS design system (`@xds/core`).

<!-- SYNC: When files in this directory change, update this document. -->

| Directory/File   | Role   | Purpose                                |
| ---------------- | ------ | -------------------------------------- |
| `src/`           | Source | Component source code                  |
| `docs/`          | Docs   | Documentation including AI skill doc   |
| `package.json`   | Config | Package configuration and dependencies |
| `tsconfig.json`  | Config | TypeScript compiler configuration      |
| `tsup.config.ts` | Build  | Bundle configuration using tsup        |

## Key Exports

### Components

- **Typography**: `XDSText`, `XDSHeading`, `XDSFontWrapper`
- **Inputs**: `XDSButton`, `XDSTextInput`, `XDSTextArea`, `XDSCheckboxInput`
- **Layout**: `XDSHStack`, `XDSVStack`, `XDSCard`, `XDSSection`
- **Feedback**: `XDSTooltip`, `XDSHoverCard`

### Theme

- `Theme` — Provider component that sets CSS custom properties
- `defaultTheme`, `neutralTheme` — Pre-built themes
- `useTheme` — Hook to access current theme

### Stylesheets

- `@xds/core/typography.css` — Base typography styles for native HTML elements (h1-h6, p, lists, blockquotes, code, etc.). Uses CSS custom properties from the theme.

## Usage

See the [Getting Started guide](/README.md#getting-started) in the root README.
