# @astryxdesign/richtext

# 0.7.5

#### New Features

- `RichTextEditor` and `RichTextView` take `codeLanguages`, the same list of CodeBlock language values that `Markdown` takes. A fence named by a listed value is coloured with that value and labelled with its name, so reading and editing match.

- Status colours now have a role for each surface, and Info is a new status. For each of info, success, warning, and error: `--color-<status>` is the strong fill and `--color-on-<status>` is content on it, at 4.5:1 or more; `--color-<status>-muted` is the pale fill, with `--color-on-<status>-muted` content; and `--color-text-<status>` is readable status text on the page and cards, with `--color-icon-<status>` and `--color-border-<status>` (status icons and borders) defaulting to it. `--color-info`, `--color-on-info`, `--color-info-muted`, and the other Info roles are new and independent of the accent. Tailwind gains `bg-info`, `bg-info-muted`, `text-on-<status>`, `text-on-<status>-muted`, and `text-status-<status>` (the status text role). Introduced in [#7657](https://github.com/facebook/astryx/pull/7657).

  `--color-success`, `--color-warning`, and `--color-error` and `bg-<status>` keep their meaning as the strong fills. Tailwind now projects each status by paint property: `text-`, `decoration-`, `placeholder-`, and `caret-<status>` read the status text role, and `border-`, `divide-`, `outline-`, and `ring-<status>` read the status border role, so status text and lines are readable on the page; `bg-`, `accent-`, `fill-`, `stroke-<status>`, shadow colours, and gradients keep the strong fill. for example, Core's light `text-warning` is now `#753F07` instead of `#E9AF08`, and `text-success` is `#09441F` instead of `#0D8626`. To keep the fill colour on text, use `text-[var(--color-warning)]`.

  What changes on screen:

  - Core's dark Error content (`--color-on-error`) is now `#0A1317` instead of white, so text on dark-mode error fills reaches 4.5:1. Core's Info Badge uses `--color-info` (`#0064E0`) instead of the accent; in dark mode the accent was `#2694FE`.
  - Icon `color="info|success|warning|error"`, Stepper status glyphs, and Chat tool-call status icons use the icon roles, which are the readable text colours. For example, Core's success icon is now `#09441F` (light) instead of `#0D8626`.
  - Input and FileInput status borders use the border roles. Core's light warning border is now `#753F07` instead of `#E9AF08`. Butter's light success and warning input rims are now mid-ramp stops that reach 3:1.
  - Banner paints its built-in title, description, icon, and controls with the on-muted roles, and fills Info with `--color-info-muted`.
  - Status fills keep a visible boundary in forced-colors mode.
  - Chocolate and Matcha's `--color-on-success` and `--color-on-error` are now a dark ink instead of white, and Stone's `--color-on-success`, `--color-on-warning` and `--color-on-error` are white in light mode and near-black in dark mode instead of the status hue, so content on those fills reaches 4.5:1.
  - Neutral's `--color-success`, `--color-warning`, and `--color-error` are now its status fills, the colours its Badges already showed: success `#00490B` to `#198100` (dark `#A4D6A3` to `#64AF4C`), warning `#4B3900` to `#FFCE2F` (dark `#F8D36A` to `#FFCE2F`), and error `#76000C` to `#C9303A` (dark `#FFC4BE` to `#FF705D`); `--color-info` is `#0074E2` (dark `#6D9CFE`). Its Badges, StatusDots, progress fills, and Stepper badges look the same, and its `text-<status>` utilities read its status text roles.
  - Neutral drops its own status overrides and uses the standard roles: the accent variants of ProgressBar, StatusDot, and Stepper now paint Neutral's accent instead of blue, and Banner and the pale destructive Button use the standard overlays. Neutral no longer defines its proposed and undocumented local tokens; use the standard roles instead: `--astryx-theme-neutral-color-status-fill-success`, `-status-fill-warning`, and `-status-fill-error` → `--color-success`, `--color-warning`, `--color-error`; `-status-muted-accent` → `--color-info-muted`; `-on-tint-neutral` → `--color-neutral`; `-on-tint-overlay-hover`, `-on-tint-overlay-pressed`, `-destructive-overlay-hover`, and `-destructive-overlay-pressed` → `--color-overlay-hover` and `--color-overlay-pressed`. `--astryx-theme-neutral-color-status-fill-accent` keeps its value for Neutral extensions but is deprecated and no longer used by Neutral.
  - Every first-party theme sets a blue `--color-info`; Chocolate and Matcha Info Badges move from the accent to that blue (Butter keeps its own Info Badge colours).

  Custom themes get the content and text roles they don't set: theme generation derives `--color-on-<status>` (light or dark content, whichever contrasts more), readable status text, and on-muted content from the theme's status fills. To keep a component's previous colour, set the matching role in your theme; for example, set `--color-icon-success` to your old `--color-success` value.

#### Fixes

- Published type declarations use fully specified relative imports, so projects compiled with `moduleResolution: NodeNext` resolve them (#7702)

- In `RichTextEditor` and `RichTextView`, a code block that names no language now leaves room for its corner Copy button. A long line wraps before the button instead of running under it. The block is as tall as the same fence in `Markdown`, so switching between reading and editing no longer moves the content below it.

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @harjothkhara
- @rubyycheung

---

# 0.7.4

---

# 0.7.3

---

# 0.7.2

#### New Features

- Tables draw a line on every cell edge, not only between rows, on both `Markdown` and the RichText surfaces, and the grid closes at the table's rim. A reader following one row across never needed vertical lines, but someone editing a table has to aim at a cell and judge where a selection stops, and the empty 3×3 a toolbar insert produces was three horizontal rules with no sign it had three columns. The line is the same `--color-border` already used between rows, the rim merges with it into one rule rather than doubling at the edge, and both surfaces move together — the read and edit renderings match block for block, more closely than before.

#### Documentation

- The `RichTextEditor` docs now list `isOptional`, `isRequired`, `labelTooltip` and `namespace`, four props the editor already accepted, so `astryx component RichTextEditor` and the docsite props table show the Required/Optional indicator, `aria-required`, the label tooltip and the Lexical namespace.

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang
- @potatowagon

---

# 0.7.1

#### New Features

- `@astryxdesign/richtext` is now a stable package, released together with `@astryxdesign/core` at the same version. Install it without the `@canary` tag: `npm install @astryxdesign/richtext`. It provides `RichTextEditor`, `RichTextView`, `RichTextEditorToolbar`, `RichTextEditorAutoLinkPlugin`, the headless Markdown serializers (also at `@astryxdesign/richtext/markdown`), and Markdown plugin support through `createRichTextExtension`. `RichTextView` and core `Markdown` render the same document the same way, and Markdown that is imported and exported without edits comes back byte for byte. `lexical` and the `@lexical/*` packages remain optional peer dependencies. (#7224)

#### Fixes

- `@astryxdesign/richtext` (and the Lab and Charts packages) now declare their stylesheet as a side effect, so a bundler that removes side-effect-free imports keeps `import '@astryxdesign/richtext/richtext.css'` instead of dropping it and leaving the editor unstyled. JavaScript modules stay tree-shakable. (#7586)
- `astryx.css`, `reset.css`, and every other package stylesheet (`richtext.css`, `lab.css`, `charts.css`) now open with `@layer reset, astryx-base, astryx-theme;`, the same line theme stylesheets carry. The Astryx layer order holds whichever Astryx stylesheet loads first: loading `reset.css` after `astryx.css` no longer lets the reset override component styles, and theme overrides keep winning. Setups that already declare the order on their own first line are unchanged. (#7585)

#### Documentation

- The `@astryxdesign/richtext` README shows the full stylesheet setup: Core's `reset.css` and `astryx.css`, your theme's CSS, and `richtext.css`. It says the package ships prebuilt CSS, so you never compile its source, and that `richtext.css` sits in `@layer astryx-base`, so theme overrides win once `reset.css` (or the layer-order line) loads first. (#7582)

#### Contributors

Thanks to everyone who contributed to this release:

- @cixzhang

---

# 0.1.9
