// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceTranslationDoc} */

export const docsDense = {
  description: 'core design principles + rules for the design system',
  sections: [
    { section: 'Design Philosophy', title: 'Philosophy', blocks: [{ id: 'core-ideas', items: ['components over primitives', 'semantic tokens over hardcoded values', 'theme-agnostic code', 'open internals'] }] },
    { section: 'Rules', title: 'Rules', blocks: [{ id: 'rules', items: ['use components', 'frame-first layout: shell + region budgets before content (astryx docs layout)', 'dense data = rows (Table, List/Item) not Cards; Card = widgets/galleries/settings groups', 'StyleX or Tailwind for styling', 'semantic tokens only', 'CSS vars for colors', 'controlled form inputs', 'useLinkComponent() for navigation'] }] },
    { section: 'Styling Approach', title: 'Styling', blocks: [{ id: 'overview', text: 'xstyle prop for component overrides. StyleX or Tailwind for layout. See astryx docs styling.' }] },
    { section: 'Anti-Patterns', title: 'Anti-Patterns', blocks: [{ id: 'donts', items: ['no inline styles on raw elements', 'no hardcoded colors — use tokens or Tailwind semantic classes', 'no hardcoded spacing', 'no hardcoded <a> — use useLinkComponent()', 'no Card-wrapped list items — frame first, rows for dense data (astryx docs layout)', 'no decorative Badge — StatusDot/Token for status', 'read docs before inventing props'] }] },
    { section: 'Design Tokens', title: 'Tokens', blocks: [{ id: 'tokens-intro', text: 'run npx astryx docs tokens for full reference' }] },
  ],
};
