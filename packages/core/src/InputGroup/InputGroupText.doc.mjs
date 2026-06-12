// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'InputGroupText',
  subComponentOf: 'InputGroup',
  displayName: 'Input Group Text',
  isHiddenFromOverview: true,
  description: 'A prefix or suffix text element rendered inside XDSInputGroup. Displays text or icons.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Text or icon content.',
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for customization.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'CSS class name(s).',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description: 'Inline styles.',
    },
  ],
};

export const docsDense = {
  name: 'InputGroupText',
  isHiddenFromOverview: true,
  displayName: 'Input Group Text',
  description: 'prefix/suffix text/icon element',
  propDescriptions: {
    children: 'text or icon content',
    xstyle: 'StyleX styles',
    className: 'CSS class name(s)',
    style: 'inline styles',
  },
};
