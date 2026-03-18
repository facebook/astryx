/** @type {import('../../core/src/docs-types').ReferenceTranslationDoc} */

export const docsDense = {
  description: 'XDSTheme provider, custom themes, light/dark, component overrides',
  sections: [
    { title: 'Quick Start', content: [null] },
    { title: 'Themes', content: [null, { type: 'prose', text: 'xds theme --list to see project themes' }] },
    { title: 'Props', content: [null] },
    { title: 'Custom Theme', content: [{ type: 'prose', text: 'CLI wizard or manual. only override token groups that differ.' }, null, null, { type: 'prose', text: 'token groups: colors/spacing/size/radius/shadow/transition/typography/textSize/lineHeight/fontWeight' }, { type: 'list', items: ['no variable refs in createTheme (static analysis)', 'no spread in createTheme'] }] },
    { title: 'Light/Dark', content: [{ type: 'prose', text: 'light-dark() in token values. mode=system follows OS.' }, null, null] },
    { title: 'Nesting', content: [{ type: 'prose', text: 'wrap sections in separate <XDSTheme> providers' }, null] },
    { title: 'Page Background', content: [{ type: 'prose', text: 'XDSTheme is display:contents. apply bg to wrapper.' }, null] },
    { title: 'Component Overrides', content: [{ type: 'prose', text: 'themes override component styles via components field + module augmentation' }, null, null, { type: 'prose', text: 'xds --detail compact component <Name> for themeable slots' }] },
    { title: 'useXDSTheme', content: [null, { type: 'prose', text: 'read-only. manage state at app level.' }] },
  ],
};
