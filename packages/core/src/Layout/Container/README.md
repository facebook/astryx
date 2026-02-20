# /packages/core/src/Layout/Container

Layout container primitive and re-exports.

<!-- SYNC: When files in this directory change, update this document. -->

## Overview

This folder contains:

- **container.stylex** — CSS variable utility for container padding
- **index.ts** — Re-exports XDSCard (from `Card/`) and XDSSection (from `Section/`) for backward compatibility with `@xds/core/Layout` imports

XDSCard and XDSSection have moved to their own top-level modules:

```tsx
import {XDSCard} from '@xds/core/Card';
import {XDSSection} from '@xds/core/Section';
```

## Files

| File               | Role    | Purpose                                         |
| ------------------ | ------- | ----------------------------------------------- |
| `index.ts`         | Entry   | Re-exports Card and Section for backward compat |
| `container.stylex` | Utility | CSS variable utility for container padding      |
| `README.md`        | Docs    | This documentation                              |
