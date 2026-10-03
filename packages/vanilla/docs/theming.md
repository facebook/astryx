# Theming Vanilla Astryx

Vanilla Astryx supports every shipped Astryx theme, light and dark modes, and custom themes made from CSS custom-property overrides. Load the Vanilla stylesheet first, then one or more theme stylesheets, then place custom overrides after them in the `astryx-theme` layer.

## Shipped themes

| Theme     | Package                         | Typography                       |
| --------- | ------------------------------- | -------------------------------- |
| Neutral   | `@astryxdesign/theme-neutral`   | Figtree                          |
| Butter    | `@astryxdesign/theme-butter`    | Outfit and Sarina                |
| Y2K       | `@astryxdesign/theme-y2k`       | Poppins and Crimson Text         |
| Stone     | `@astryxdesign/theme-stone`     | Figtree and Montserrat           |
| Matcha    | `@astryxdesign/theme-matcha`    | DM Sans and Playwrite US Trad    |
| Chocolate | `@astryxdesign/theme-chocolate` | Albert Sans and Fraunces         |
| Gothic    | `@astryxdesign/theme-gothic`    | Fustat and Manufacturing Consent |

Gothic is intentionally dark-only. Its light and dark mode settings use the same dark palette.

Load each theme you want to offer. The demo loads all seven so changing the root attribute does not require another request:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@astryxdesign/theme-neutral@0.6.5/dist/theme.css" />
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@astryxdesign/theme-butter@0.6.5/dist/theme.css" />
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@astryxdesign/theme-y2k@0.6.5/dist/theme.css" />
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@astryxdesign/theme-stone@0.6.5/dist/theme.css" />
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@astryxdesign/theme-matcha@0.6.5/dist/theme.css" />
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@astryxdesign/theme-chocolate@0.6.5/dist/theme.css" />
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@astryxdesign/theme-gothic@0.6.5/dist/theme.css" />
```

Set the theme and mode on the document root:

```html
<html lang="en" data-astryx-theme="matcha" data-theme="dark"></html>
```

## Theme switcher and dark-mode toggle

The Vanilla JavaScript bundle recognizes these data attributes:

- `data-ax-theme-switch` on a `<select>` whose values are theme slugs;
- `data-ax-mode-switch` on a `<select>` whose values are `light` and `dark`;
- `data-ax-theme-toggle` on a button that cycles shipped themes;
- `data-ax-mode-toggle` on a button that toggles light and dark.

Selections are stored as `astryx-vanilla-theme` and `astryx-vanilla-mode` in `localStorage` and restored on reload. Storage failures are ignored, so the controls still work in sandboxed and local-file contexts. Query parameters named `theme` and `mode` take precedence in the included templates and are remembered for later pages.

```html
<label class="ax-selector">
  <span class="ax-selector__label">Theme</span>
  <span class="ax-selector__control">
    <select class="ax-selector__select" data-ax-theme-switch>
      <option value="neutral">Neutral</option>
      <option value="butter">Butter</option>
      <option value="y2k">Y2K</option>
      <option value="stone">Stone</option>
      <option value="matcha">Matcha</option>
      <option value="chocolate">Chocolate</option>
      <option value="gothic">Gothic</option>
    </select>
    <span class="ax-selector__indicator" aria-hidden="true"></span>
  </span>
</label>
<button
  class="ax-button ax-button--secondary"
  type="button"
  data-ax-mode-toggle>
  Toggle light or dark mode
</button>
```

The same copyable variants are available from a checkout with:

```sh
node packages/cli/clients/cli/bin/astryx.mjs component Selector --html
```

## Custom brand theme

A custom theme is a named `data-astryx-theme` scope with token overrides. Keep the override in the `astryx-theme` layer and place it after shipped theme stylesheets. Components continue to use semantic tokens; do not restyle their classes individually. The literal colors below are documented token-definition values; templates and component styles should only consume the semantic tokens.

```html
<style>
  @layer astryx-theme {
    [data-astryx-theme='brand'] {
      --color-accent: light-dark(#6d28d9, #a78bfa);
      --color-accent-muted: light-dark(#ede9fe, #2e1a47);
      --color-on-accent: light-dark(#ffffff, #1f1235);
      --color-text-accent: light-dark(#5b21b6, #c4b5fd);
      --color-icon-accent: light-dark(#5b21b6, #c4b5fd);
      --color-background-body: light-dark(#f5f3ff, #171126);
      --focus-outline-color: var(--color-accent);
    }
  }
</style>
```

Activate it on the whole page or one subtree:

```html
<section data-astryx-theme="brand">
  <button class="ax-button ax-button--primary" type="button">
    Brand action
  </button>
  <span class="ax-badge ax-badge--info">Brand badge</span>
  <a class="ax-link" href="#brand-details">Brand link</a>
</section>
```

The button and badge use `--color-accent`, the link uses `--color-text-accent`, and the page wash uses `--color-background-body`. Add other semantic token overrides only when the brand needs them; the base theme supplies the rest.
