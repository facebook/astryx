// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceTranslationDoc} */

export const docsDense = {
  description: 'Theme provider, custom themes, light/dark, component overrides',
  sections: [
    { section: 'Quick Start', title: 'Quick Start', content: [null, null, null, null, { type: 'prose', text: 'default import = runtime injection. /built import = pre-compiled CSS (pair with theme.css).' }] },
    { section: 'Available Themes', title: 'Themes', content: [null, null, { type: 'prose', text: 'published: neutral (start here), butter, chocolate, gothic (dark-only), matcha, stone, y2k. @astryxdesign/theme-{name} = source (runtime). @astryxdesign/theme-{name}/built = optimized (+ theme.css).' }] },
    { section: 'Theme Props', title: 'Props', content: [null] },
    { section: 'Creating a Custom Theme', title: 'Custom Theme', content: [{ type: 'prose', text: 'CLI wizard or manual defineTheme. only override tokens that differ.' }, null] },
    { section: 'defineTheme', title: 'defineTheme', content: [{ type: 'prose', text: 'scale configs (color, typography, radius, motion) + explicit token overrides + component overrides. color derives full palette from accent hex via HCT.' }, null, null] },
    { section: 'Component Style Overrides', title: 'Component Overrides', content: [{ type: 'prose', text: 'components field uses semantic component keys + style keys (base, variant:value, stateName), not raw selectors. for external CSS, prefer data-* selectors from `astryx docs styling`. write standard CSS (borderRadius, padding) — pipeline expands to internal vars. public vars (--button-press-scale etc) set directly. private vars (--_*) cannot be set — use CSS properties. run `npx astryx component <Name>` for details.' }, null, null, null, null] },
    { section: 'Custom Variants', title: 'Custom Variants', content: [{ type: 'prose', text: 'any unknown prop:value in components becomes a new variant. astryx theme build generates TS augmentations. works on any extensible prop axis (variant, status, etc).' }, null, null, null, null] },
    { section: 'Building Themes for Production', title: 'Build for Production', content: [{ type: 'prose', text: 'npx astryx theme build compiles defineTheme to static CSS. outputs .css + .js (__built:true) + .d.ts.' }, null, null, null, null] },
    { section: 'Runtime vs Built Themes', title: 'Runtime vs Built', content: [{ type: 'prose', text: 'runtime: useInsertionEffect injects styles client-side. built: static CSS on first paint. USE /built + theme.css FOR SSR.' }, null, null, null] },
    { section: 'Light/Dark Mode', title: 'Light/Dark', content: [{ type: 'prose', text: 'light-dark() in token values via [light, dark] tuples. mode=system follows OS.' }, null, null] },
    { section: 'Nesting Themes', title: 'Nesting', content: [{ type: 'prose', text: 'wrap sections in separate <Theme> providers' }, null] },
    { section: 'useTheme Hook', title: 'useTheme', content: [null, { type: 'prose', text: 'read-only. manage state at app level.' }] },
  ],
};
