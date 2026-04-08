/** @type {import('../../core/src/docs-types').ReferenceTranslationDoc} */

export const docsDense = {
  description: 'XDSTheme provider, custom themes, light/dark, component overrides',
  sections: [
    { title: 'Quick Start', content: [null] },
    { title: 'Themes', content: [null, { type: 'prose', text: 'xds theme --list to see project themes' }] },
    { title: 'Props', content: [null] },
    { title: 'Custom Theme', content: [{ type: 'prose', text: 'CLI wizard or manual. only override token groups that differ.' }, null, null, { type: 'prose', text: 'token groups: colors/spacing/size/radius/shadow/transition/typography/textSize/lineHeight/fontWeight' }, { type: 'list', items: ['no variable refs in createTheme (static analysis)', 'no spread in createTheme'] }] },
    { title: 'defineTheme', content: [{ type: 'prose', text: 'higher-level API. supports scale configs (typography, radius, motion) + explicit token overrides + component overrides.' }, null, null] },
    { title: 'Build for Production', content: [{ type: 'prose', text: 'npx xds build-theme compiles defineTheme to static CSS. outputs .css + .js (__built:true) + .d.ts. import CSS alongside JS module.' }, null, null, null, null, null] },
    { title: 'Runtime vs Built', content: [{ type: 'prose', text: 'runtime: useInsertionEffect injects styles client-side. built: static CSS present on first paint. USE BUILT FOR SSR — component overrides (heading scale, text styles) flash on hydration with runtime themes.' }, null, null, null, null] },
    { title: 'Light/Dark', content: [{ type: 'prose', text: 'light-dark() in token values. mode=system follows OS.' }, null, null] },
    { title: 'Nesting', content: [{ type: 'prose', text: 'wrap sections in separate <XDSTheme> providers' }, null] },
    { title: 'Page Background', content: [{ type: 'prose', text: 'XDSTheme is display:contents. apply bg to wrapper.' }, null] },
    { title: 'Component Overrides', content: [{ type: 'prose', text: 'themes override component styles via components field + module augmentation' }, null, null, { type: 'prose', text: 'xds --detail compact component <Name> for themeable slots' }] },
    { title: 'useXDSTheme', content: [null, { type: 'prose', text: 'read-only. manage state at app level.' }] },
  ],
};
