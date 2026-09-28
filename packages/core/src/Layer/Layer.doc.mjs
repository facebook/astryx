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
  usage: {
    description:
      'Layer utilities provide the app-level provider used by overlay systems. Use LayerProvider at the app root for toast/layer configuration; use higher-level Popover, HoverCard, or Tooltip APIs for most overlay UI. Rendered layer content, not the provider’s application subtree, uses theme body text defaults and exits ancestor surface/group membership. Establish intentional groups and complete required providers inside each layer. Layer also owns the per-edge viewport inset every fitted layer reads: the app-level custom properties --astryx-layer-inset-block-end, --astryx-layer-inset-block-start, --astryx-layer-inset-inline-start and --astryx-layer-inset-inline-end (each 0px unless set, usually once on :root), added to the spacing-4 + safe-area gutter Popover and DropdownMenu keep from that viewport edge. They are declared by the app, not by a theme, so they are not theme-target vars.',
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
