/** @type {import('../../core/src/docs-types').ReferenceTranslationDoc} */

export const docsDense = {
  description: 'design rules + anti-patterns',
  sections: [
    { title: 'Rules', content: [{ type: 'list', items: ['use XDS components', 'StyleX for styling', 'semantic tokens only', 'CSS vars for colors', 'controlled form inputs'] }] },
    { title: 'xstyle prop', content: [{ type: 'prose', text: 'xstyle accepts inline obj, stylex.create, or CSS class string.' }, null, null, null, { type: 'list', items: ['1-2 props: inline', '3+ props: stylex.create', 'pseudo-classes: stylex.create required', ':hover needs @media (hover: hover)'] }] },
    { title: 'Anti-Patterns', content: [{ type: 'list', items: ['no inline styles on raw elements', 'no hardcoded colors', 'no hardcoded spacing', 'read docs before inventing props'] }] },
    { title: 'StyleX', content: [null] },
    { title: 'Token Quick Ref', content: [{ type: 'prose', text: 'see xds docs tokens' }, null] },
  ],
};
