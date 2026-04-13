# Create XDS Component

Create a new XDS component following the established protocols.

## Component Name

$ARGUMENTS

## Instructions

Follow the full component lifecycle documented on the XDS wiki:

- **Lifecycle Overview**: https://github.com/facebookexperimental/xds/wiki/Component-Lifecycle
- **Specification Protocol**: https://github.com/facebookexperimental/xds/wiki/Component-Specification-Protocol
- **Build Protocol**: https://github.com/facebookexperimental/xds/wiki/Component-Build-Protocol

### Quick reference

- Read the spec thoroughly — it's the contract
- Study sibling components in the same family for patterns
- Create files in `packages/core/src/{ComponentName}/`:
  - `XDS{ComponentName}.tsx` — main component
  - `XDS{ComponentName}.test.tsx` — unit tests
  - `{ComponentName}.doc.mjs` — typed docs (ComponentDoc)
  - `index.ts` — public exports
- Create `apps/storybook/stories/{ComponentName}.stories.tsx`
- Wire up: add to `packages/core/src/index.ts`
- Run `node scripts/sync-exports.js` to update package.json exports
- Run `yarn build && yarn test && yarn lint`

### Key conventions

- **API Conventions**: https://github.com/facebookexperimental/xds/wiki/API-Conventions
- **Theming**: Use `xdsClassName()` for theme targets — see https://github.com/facebookexperimental/xds/wiki/Theming-Infrastructure
- **Compose, don't rebuild** — use existing XDS components (XDSField, XDSIcon, etc.)
- **displayName** — always set it
- **:hover guards** — all `:hover` in `@media (hover: hover)`
- **Spacing/elevation tokens** — never raw px or boxShadow strings
