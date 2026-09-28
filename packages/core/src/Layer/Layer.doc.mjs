// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export const docs = {
  name: 'Layer',
  displayName: 'Layer',
  group: 'Utilities',
  category: 'Utility',
  keywords: [
    'layer',
    'overlay',
    'popover',
    'positioning',
    'anchor',
    'floating',
    'dropdown',
    'popper',
    'popup',
    'portal',
  ],
  theming: {
    // Layer paints no surface of its own, so it renders no theme target; the
    // vars below are app-level properties every viewport-fitted layer reads.
    targets: [],
    // App-level custom properties every viewport-fitted layer (Popover,
    // DropdownMenu and its submenus) reads through
    // Layer/layerViewportInset.stylex.ts. Set once, usually on :root.
    vars: [
      {
        name: '--astryx-layer-inset-block-end',
        description:
          'Extra viewport inset at the block-end (bottom) edge, added to the spacing-4 + safe-area gutter every layer fits against. Set it once on :root to the height of a persistent bar floating over the bottom of the viewport (a phone navigation bar, a docked toolbar) so layers end above the bar instead of underneath it.',
        default: '0px',
      },
      {
        name: '--astryx-layer-inset-block-start',
        description:
          'Extra viewport inset at the block-start (top) edge, for a bar floating over the top of the viewport.',
        default: '0px',
      },
      {
        name: '--astryx-layer-inset-inline-start',
        description:
          'Extra viewport inset at the inline-start edge, for a rail floating over that side of the viewport.',
        default: '0px',
      },
      {
        name: '--astryx-layer-inset-inline-end',
        description:
          'Extra viewport inset at the inline-end edge, for a rail floating over that side of the viewport.',
        default: '0px',
      },
    ],
  },
  usage: {
    description:
      'Layer utilities provide the app-level provider used by overlay systems. Use LayerProvider at the app root for toast/layer configuration; use higher-level Popover, HoverCard, or Tooltip APIs for most overlay UI. Rendered layer content, not the provider’s application subtree, uses theme body text defaults and exits ancestor surface/group membership. Establish intentional groups and complete required providers inside each layer.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use LayerProvider once near the app root when you need shared toast/layer configuration.',
      },
      {
        guidance: true,
        description:
          'Declare a persistent bar floating over the viewport once, on :root, through --astryx-layer-inset-block-end (or the matching edge property): every Popover and DropdownMenu then fits above the bar. The bar contributes no layout height, so without the inset a correctly fitted layer still ends underneath it.',
      },
      {
        guidance: true,
        description:
          'Build on higher-level components like Popover, HoverCard, and Tooltip for common overlay patterns.',
      },
      {
        guidance: false,
        description:
          'Add nested LayerProvider instances: nested providers are ignored and add unnecessary tree depth.',
      },
    ],
  },
  components: [
    {
      name: 'LayerProvider',
      displayName: 'Layer Provider',
      description:
        'App-level provider for layer systems such as toast viewports and imperative modals. Nested providers pass through.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Application subtree that can use the shared layer context.',
          required: true,
        },
        {
          name: 'toast',
          type: 'LayerToastConfig',
          description:
            'Toast viewport configuration. Controls position, maxVisible, and inset for toasts shown through useToast.',
        },
      ],
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  usage: {
    description:
      'App-level provider for overlay systems. Use LayerProvider at app root for toast/layer config; use Popover/HoverCard/Tooltip for most overlay UI. Layer content uses theme body defaults and exits ancestor surface/group membership; establish intentional groups and complete required providers inside it. The application subtree is unchanged.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use LayerProvider once near app root for shared toast/layer config.',
      },
      {
        guidance: true,
        description:
          'Use Popover/HoverCard/Tooltip for common overlay patterns.',
      },
      {
        guidance: false,
        description: 'Add nested LayerProvider instances.',
      },
    ],
  },
  components: [
    {
      name: 'LayerProvider',
      description: 'App-level provider for toast/layer systems.',
      propDescriptions: {
        children: 'application subtree using shared layer context',
        toast: 'toast viewport config: position, maxVisible, inset',
      },
    },
  ],
};
