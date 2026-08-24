# @xds/theme-y2k

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

#### New Features

- Rework Y2K dark-mode surfaces to a cool "night periwinkle" indigo palette
  Dark mode now echoes the light theme's periwinkle body instead of warm cream-derived browns: body `#0e0f1a`, surface/card `#16182b`, popover/muted `#1f2238`, with cool off-white text (`#EDEFFC`). Light mode and all categorical pop colors are unchanged.

#### Contributors

Thanks to everyone who contributed to this release:

- @rubyycheung

---

# 0.0.15

#### Changes

- Theme polish — color-token and type-scale refinements for visual consistency with the other themes. (#2856)
- Tracks `@xds/core@0.0.15` (bare-name migration + data-attribute selector surface).
