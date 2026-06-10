// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'useXDSLayer',
  displayName: 'useXDSLayer',
  group: 'Utilities',
  keywords: ["layer","overlay","popover","positioning","anchor","floating","dropdown","popper","popup","portal"],
  props: [
    {
      name: 'mode',
      type: "'context' | 'fixed'",
      description:
        'Positioning strategy: context uses CSS anchor positioning relative to a trigger ref; fixed uses explicit x/y coordinates.',
      required: true,
    },
    {
      name: 'onShow',
      type: '() => void',
      description: 'Callback fired when the layer becomes visible.',
    },
    {
      name: 'onHide',
      type: '() => void',
      description: 'Callback fired when the layer is hidden.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value — not an inline style object like style={{}}.',
    },
  ],
  usage: {
    description:
      'Layer is a core positioning hook for rendering overlay content using CSS Anchor Positioning and the Popover API. Use it as the foundation for building popovers, hover cards, and tooltips without React portals.',
    bestPractices: [
      { guidance: true, description: 'Use context mode for anchor-positioned overlays relative to a trigger element, and fixed mode for manually positioned overlays at specific coordinates.' },
      { guidance: true, description: 'Build on higher-level components like Popover, HoverCard, and Tooltip instead of using Layer directly for common overlay patterns.' },
      { guidance: false, description: 'Implement ARIA patterns directly in a Layer — leave accessibility semantics to the higher-level components that build on it.' },
    ],
  },
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Core positioning hook rendering overlay content via CSS Anchor Positioning + Popover API. Foundation for popovers/hover cards/tooltips w/o React portals.',
  usage: {
    description:
      'Layer is core positioning hook for overlay content via CSS Anchor Positioning + Popover API. Use as foundation for popovers, hover cards, tooltips w/o React portals.',
    bestPractices: [
      { guidance: true, description: 'Use context mode for anchor-positioned overlays relative to trigger element; fixed mode for manually positioned overlays at specific coordinates.' },
      { guidance: true, description: 'Build on higher-level components (Popover, HoverCard, Tooltip) instead of using Layer directly for common overlay patterns.' },
      { guidance: false, description: 'Implement ARIA patterns directly in Layer — leave accessibility semantics to higher-level components that build on it.' },
    ],
  },
  propDescriptions: {
    mode: 'positioning strategy: context = CSS anchor positioning relative to trigger ref; fixed = explicit x/y coords **(required)**',
    onShow: 'fires when layer becomes visible',
    onHide: 'fires when layer hidden',
  },
};
