// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs layout/responsive`: decide what each region does as
 * width changes.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  type: 'generic',
  name: 'responsive',
  title: 'Responsive',
  placement: {parent: 'namespace:layout', slot: 'guides', order: 50},
  category: 'guide',
  description:
    'Decide what each region does as width changes: divide, reveal, resize, or swap.',
  keywords: [
    'responsive',
    'breakpoints',
    'useMediaQuery',
    'mobileNav',
    'MobileNav',
    'Dialog',
    'BottomSheet',
    'contentWidth',
    'contract',
  ],

  sections: [
    {
      id: 'breakpoints',
      title: 'Breakpoints',
      content: [
        {
          type: 'prose',
          text: 'Decide what each region does as width changes. Write the responsive contract down for every region before you call the layout done.',
        },
        {
          type: 'list',
          style: 'do',
          items: [
            'Write the contract down for every region before you call the layout done',
            'Decide per region whether it is revealed, resized, or swapped at each width',
            'Drop a region rather than let it compete for width it does not have',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Hold three regions at a width where none of them has usable space',
            'Shrink every region uniformly instead of swapping or dropping one',
            'Wire a breakpoint in CSS that the contract comment never mentions',
          ],
        },
      ],
    },
    {
      id: 'responsive-contract',
      title: 'Responsive contract',
      content: [
        {
          type: 'prose',
          text: 'Lock what each region does as width changes, and pair every line of the contract with the prop or hook that enforces it.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Divide: how many regions survive at each width',
            'Reveal: which regions earn their width only when there is room, and open on demand below that',
            'Resize: content flexes while fixed regions hold their budgets, and text stays capped by contentWidth so line length holds',
            'Swap: navigation becomes MobileNav at the AppShell mobileNav breakpoint; the side panel becomes a Dialog or BottomSheet, driven by useMediaQuery',
          ],
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Contract wired to props',
          code: `// Recommended thresholds: 3 regions above 1024, 2 from 768,
// 1 below. Text reads best at 40–60 characters per line.
//   >1024  SideNav 256 | content | side panel 380
//   <=1024 panel moves to a Dialog     (useMediaQuery)
//   <=768  nav collapses to MobileNav   (mobileNav "md")
const isNarrow = useMediaQuery('(max-width: 1024px)');

<AppShell sideNav={<SideNav />} mobileNav={{breakpoint: 'md'}}>
  <Layout
    content={<LayoutContent>{/* rows */}</LayoutContent>}
    end={isNarrow ? undefined : <LayoutPanel width={380} hasDivider />}
  />
</AppShell>`,
        },
        {
          type: 'prose',
          text: 'Verify: every contract line names a mechanism, so the comment cannot drift from the behavior.',
        },
      ],
    },
  ],
};
