// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../../../../core/src/docs-types').TemplateDoc} */
export const doc = {
  type: 'block',
  exampleFor: 'MobileNavToggle',
  name: 'MobileNavToggle — Basic',
  displayName: 'MobileNavToggle — Basic',
  description:
    'A hamburger button that opens and closes a MobileNav drawer. It reads open state from the AppShell mobile context, which AppShell provides automatically.',
  isReady: true,
  aspectRatio: 16 / 9,
  componentsUsed: [
    'MobileNav',
    'MobileNavToggle',
    'AppShell',
    'SideNavItem',
    'SideNavSection',
    'Layout',
    'Text',
  ],
};
