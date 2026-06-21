# @xds/build

# 0.0.15

#### Fixes

- **Unprefix migration alignment** — Build output and Vite plugin updated for the XDS-prefix migration (bare names canonical, `XDS*` compat aliases) so generated CSS stays in sync with `@xds/core` (#2941).

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @czarandy
- @ejhammond
- @josephfarina

---

# 0.0.14

_First public release_ — `@xds/build` is now published to the npm registry.

#### New Features

- **Streamlined `xdsStylex()` Vite API** — Simplified configuration for Vite projects (#2227)
- **Build step for Vite plugin** — Proper dist output for the Vite integration (#2205)

#### Internal

- **Migrated to pnpm** (#2197)
- **Bumped esbuild** from 0.24.2 to 0.28.0 (#2246)
