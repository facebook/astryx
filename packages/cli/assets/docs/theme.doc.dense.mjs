// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceTranslationDoc} */

export const docsDense = {
  description:
    'Theme provider, custom themes, theme build (prod/SSR), light/dark, component overrides',
  sections: [
    {
      section: 'Wrap your app in a theme',
      title: 'Wrap your app',
      content: [
        null,
        null,
        null,
        null,
        {
          type: 'prose',
          text: '`theme add` generates the app module with built theme + CSS + optional font CSS. import themes/defaultThemeSlug once. use/remove regenerate it. extend built themes to customize; eject only to fork source.',
        },
      ],
    },
    {
      section: 'Migrating Earlier Theme Copies',
      title: 'Migrate Earlier Copies',
      content: [
        {
          type: 'prose',
          text: 'earlier `theme add` copies stay app source. upgrade writes only their missing unmaintained descriptor.',
        },
        null,
        {
          type: 'prose',
          text: 'before upgrade, theme commands skip them; list and doctor name them. old copy scripts move to `theme eject`; app-use scripts keep `theme add`.',
        },
        {
          type: 'prose',
          text: '`ASTRYX_THEME` is ignored. use `theme use <slug>` with a generated module; without one, released package.json#astryx.theme still works.',
        },
      ],
    },
    {
      section: 'Available Themes',
      title: 'Themes',
      content: [
        null,
        null,
        {
          type: 'prose',
          text: 'published: neutral (start here), butter, chocolate, gothic (dark-only), matcha, stone, y2k. install @astryxdesign/theme-{name}, then `theme add <name>`. package exports: /built + theme.css + fonts.css.',
        },
      ],
    },
    {
      section: 'Theme Props',
      title: 'Props',
      content: [
        {
          type: 'prose',
          text: "<Theme> props: theme (required), mode ('system' default, or 'light'/'dark'), children. every prop: astryx component Theme.",
        },
      ],
    },
    {
      section: 'Custom themes',
      title: 'Custom Theme',
      content: [
        {
          type: 'prose',
          text: 'extend an imported built theme for ordinary customization. build + add local results. `theme eject` is only for an independent source fork. only override values that differ.',
        },
        null,
        {
          type: 'prose',
          text: '`astryx theme template` writes theme.template.ts: every defineTheme field + token families + override syntax, annotated, with the CLI command that prints each reference.',
        },
      ],
    },
    {
      section: 'defineTheme',
      title: 'defineTheme',
      content: [
        {
          type: 'prose',
          text: 'scale configs (color, typography, radius, motion) + explicit token overrides + component overrides. color derives full palette from accent via HCT; accent = hex or [light, dark] tuple (per-scheme palettes). tokens overrides win token-by-token; --color-on-accent stays baked from color.accent, so prefer a tuple accent over overriding --color-accent. localTokens accepts any valid CSS custom-property name; prefixes do not establish ownership.',
        },
        null,
        null,
      ],
    },
    {
      section: 'Theme Adaptations',
      title: 'Adaptations',
      content: [
        {
          type: 'prose',
          text: 'adaptations = ordered {when,value} rules over width/pointer/contrast/motion. condition fields AND. rules can write typography/color/radius/motion/tokens/localTokens/components.',
        },
        null,
        null,
        {
          type: 'prose',
          text: 'widthBreakpoints fixed sm|md|lg|xl|2xl defaults 640|768|1024|1280|1536; map alone emits no CSS. width.from inclusive, width.below exclusive. order + validation: see Adaptation Rules.',
        },
      ],
    },
    {
      section: 'Adaptation order and validation',
      title: 'Adaptation Rules',
      content: [
        {
          type: 'prose',
          text: 'root first, then matching rules in authored order (later writes win), then onDark/onLight on the same leaf.',
        },
        {
          type: 'prose',
          text: 'extends inherits breakpoints + ordered rules, appends child rules, re-resolves against child axes. an empty child rule is a no-op, not a removal.',
        },
        {
          type: 'prose',
          text: 'local names belong on root. Component writes validate exactly like root components (same targets/axes/domains); only difference: a rule cannot be the sole enroller of a custom value (type augmentation is unconditional) — declare it on root, then restyle. Built-ins need no root declaration. Co-matching token/localToken writes are validated together; any reachable var() cycle fails.',
        },
        {
          type: 'prose',
          text: 'CSS-only (media queries, no resize listener); use built themes for SSR first paint.',
        },
      ],
    },
    {
      section: 'Component Style Overrides',
      title: 'Component Overrides',
      content: [
        {
          type: 'prose',
          text: 'components field uses semantic component keys + style keys (base, variant:value, stateName), not raw selectors. for external CSS, prefer data-* selectors ({@link generic:styling}). write standard CSS (borderRadius, padding) — pipeline expands to internal vars. public vars (--button-focus-offset etc) set directly. private vars (--_*) cannot be set — use CSS properties. run `astryx theme targets [Name]` to enumerate every themeable key (--json for lint), `astryx component <Name>` for one component.',
        },
        null,
        null,
        null,
        null,
      ],
    },
    {
      section: 'Custom Variants',
      title: 'Custom Variants',
      content: [
        {
          type: 'prose',
          text: 'any unknown prop:value in components becomes a new variant. astryx theme build generates TS augmentations. works on any extensible prop axis (variant, status, etc).',
        },
        null,
        null,
        null,
        null,
      ],
    },
    {
      section: 'Build a theme',
      title: 'Build for Production',
      content: [
        {
          type: 'prose',
          text: 'astryx theme build compiles defineTheme to static CSS. outputs .css + .js (__built:true) + .d.ts.',
        },
      ],
    },
    {
      section: 'Built themes with an icon registry',
      title: 'Icon Registry',
      content: [
        {
          type: 'prose',
          text: 'current build detects named imports used by icons:. registry module is not compiled. inline/local registries accepted by defineTheme are omitted from built output; move them to a separate module and import by name.',
        },
        null,
        {
          type: 'prose',
          text: '--out dist/theme.css --icons-specifier ./icons.mjs requires dist/icons.mjs. skipping its compilation can leave theme build successful but breaks loading and bundling. flag changes the import; it does not create/verify the file. keep react + icon library external.',
        },
        {
          type: 'prose',
          text: 'without --icons-specifier, source import is copied unchanged. default flow without --out: bundlers can resolve ./icons to neighboring icons.tsx; Node ESM fails with ERR_MODULE_NOT_FOUND. moving output changes relative import resolution.',
        },
      ],
    },
    {
      section: 'Building a Theme Family',
      title: 'Family Build',
      content: [
        {
          type: 'prose',
          text: 'theme build --family <base> <descendants...> --family-key <key> emits one keyed .css + .js + .d.ts beside the root; key must differ from every member name. load CSS once; import ESM separately; switch by theme identity only. all members download eagerly. --check compares the trio. use standalone build for one theme.',
        },
        null,
        null,
      ],
    },
    {
      section: 'Runtime vs Built Themes',
      title: 'Runtime vs Built',
      content: [
        {
          type: 'prose',
          text: 'apps use built themes. generated module pairs each built object with production CSS and optional font CSS. package themes keep owner updates; local themes are app-owned. never hand-edit the module.',
        },
        null,
        null,
        null,
      ],
    },
    {
      section: 'Dark mode',
      title: 'Dark mode',
      content: [
        {
          type: 'prose',
          text: 'light-dark() in token values via [light, dark] tuples. mode=system follows OS.',
        },
        null,
        null,
      ],
    },
    {
      section: 'Nested themes',
      title: 'Nesting',
      content: [
        {type: 'prose', text: 'wrap sections in separate <Theme> providers'},
        null,
      ],
    },
    {
      section: 'useTheme Hook',
      title: 'useTheme',
      content: [
        null,
        null,
        {
          type: 'prose',
          text: 'read-only. ordinary styling: CSS vars, StyleX tokens, xstyle, className. to change theme/mode, manage state at app level and pass it to <Theme>.',
        },
      ],
    },
  ],
};
