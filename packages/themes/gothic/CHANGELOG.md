# @xds/theme-gothic

# 0.4.7

---

# 0.4.6

---

# 0.4.5

---

# 0.4.4

---

# 0.4.3

#### Fixes

- The `/built` entry now loads under Node ESM and externalized SSR (Vite `--ssr`, Remix / React Router v7): it imports `./icons.mjs` instead of the extensionless `./icons` Node cannot resolve.

#### Contributors

Thanks to everyone who contributed to this release:

- @AKnassa

---

# 0.4.2

#### Fixes

- `--radius-none` no longer overrides to `0.125rem`. `--radius-none` and `--radius-full` are documented as always fixed (never scaled by a theme), matching `@astryxdesign/core`'s own defaults — each of these themes' radius group bumps swept `--radius-none` along with it by mistake, the same bug fixed for `theme-neutral` in #4856. Anything opting out of rounding via `--radius-none` under these themes now renders with a true `0px` radius again, instead of a silent 2px.

#### Contributors

Thanks to everyone who contributed to this release:

- @is-jain

---

# 0.4.1

---

# 0.4.0

---

# 0.3.0

---

# 0.2.0

---

# 0.1.9

---

# 0.1.8

---

# 0.1.7

---

# 0.1.6

---

# 0.1.5

---

# 0.1.4

---

# 0.1.3

---

# 0.1.2

---

# 0.1.1

---

# 0.1.0

---

# 0.0.15

#### Changes

- Theme polish — color-token and type-scale refinements for visual consistency with the other themes. (#2856)
- Tracks `@xds/core@0.0.15` (bare-name migration + data-attribute selector surface).
