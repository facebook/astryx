// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */
export const docs = {
  name: 'illustrations',
  title: 'Illustrations',
  category: 'foundations',
  description:
    'Illustration guidelines for empty states, onboarding flows, and feature highlights.',

  sections: [
    {
      title: 'When to Use',
      category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'Consistent illustration usage reinforces brand identity and helps users understand context at a glance. Use illustrations in these contexts:',
        },
        {
          type: 'table',
          headers: ['Context', 'Examples'],
          rows: [
            ['Empty states', 'No data, first-time experience, search with no results'],
            ['Onboarding', 'Welcome screens, feature introduction, setup wizards'],
            ['Feature highlights', 'New feature announcements, upgrade prompts'],
            ['Error states', 'Permission denied, not found, service unavailable'],
          ],
        },
      ],
    },
    {
      title: 'Guidelines',
      category: 'foundations',
      content: [
        {
          type: 'list',
          style: 'do',
          items: [
            'Keep illustrations consistent in style across the product.',
            'Use simple, flat illustrations that work in both light and dark mode.',
            'Size illustrations proportionally to the container, typically 120\u2013240px.',
            'Center illustrations with supporting text below.',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Mix illustration styles from different sources.',
            'Use illustrations as decoration without purpose.',
          ],
        },
      ],
    },
    {
      title: 'Placement',
      category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'Center illustrations inside XDSCenter with supporting text stacked below. Typical illustration sizes range from 120px for inline empty states to 240px for full-page onboarding screens. Always pair the illustration with a heading and optional body text to explain what the user should do next.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Empty state with illustration',
          code: `<XDSCenter>
  <XDSStack direction="vertical" gap={3} hAlign="center">
    <img
      src="/illustrations/empty-search.svg"
      alt="No results"
      style={{ width: 200, height: 200 }}
    />
    <XDSHeading level={3}>No results found</XDSHeading>
    <XDSText type="body" color="secondary">
      Try adjusting your search or filters to find what you\u2019re
      looking for.
    </XDSText>
  </XDSStack>
</XDSCenter>`,
        },
      ],
    },
  ],
};
