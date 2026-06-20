// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceTranslationDoc} */

export const docsDense = {
  description: 'XDSTheme provider, custom themes, light/dark, component overrides',
  sections: [
    { title: 'Quick Start', content: [null, null, { type: 'prose', text: 'default import = runtime injection. /built import = pre-compiled CSS (pair with theme.css).' }] },
    { title: 'Themes', content: [null, { type: 'prose', text: '@xds/theme-{name} = source (runtime). @xds/theme-{name}/built = optimized (+ theme.css).' }] },
    { title: 'Props', content: [null] },
    { title: 'Custom Theme', content: [{ type: 'prose', text: 'CLI wizard or manual defineTheme. only override tokens that differ.' }, null] },
    { title: 'defineTheme', content: [{ type: 'prose', text: 'scale configs (color, typography, radius, motion) + explicit token overrides + component overrides. color derives full palette from accent hex via HCT.' }, null, null] },
    { title: 'Component Overrides', content: [{ type: 'prose', text: 'components field uses semantic component keys + style keys (base, variant:value, stateName), not raw selectors. for external CSS, prefer data-* selectors from `astryx docs styling`. write standard CSS (borderRadius, padding) — pipeline expands to internal vars. public vars (--button-press-scale etc) set directly. private vars (--_*) cannot be set — use CSS properties. run `npx astryx component <Name>` for details.' }, null, null, null, null] },
    { title: 'Custom Variants', content: [{ type: 'prose', text: 'any unknown prop:value in components becomes a new variant. astryx theme build generates TS augmentations. works on any extensible prop axis (variant, status, etc).' }, null, null, null, null] },
    { title: 'Build for Production', content: [{ type: 'prose', text: 'npx astryx theme build compiles defineTheme to static CSS. outputs .css + .js (__built:true) + .d.ts.' }, null, null, null, null] },
    { title: 'Runtime vs Built', content: [{ type: 'prose', text: 'runtime: useInsertionEffect injects styles client-side. built: static CSS on first paint. USE /built + theme.css FOR SSR.' }, null, null, null] },
    { title: 'Light/Dark', content: [{ type: 'prose', text: 'light-dark() in token values via [light, dark] tuples. mode=system follows OS.' }, null, null] },
    { title: 'Nesting', content: [{ type: 'prose', text: 'wrap sections in separate <XDSTheme> providers' }, null] },
    { title: 'useXDSTheme', content: [null, { type: 'prose', text: 'read-only. manage state at app level.' }] },
  ],
};
