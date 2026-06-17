// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */
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
      'Layer utilities provide the app-level provider used by overlay systems. Use XDSLayerProvider at the app root for toast/layer configuration; use higher-level Popover, HoverCard, or Tooltip APIs for most overlay UI.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use XDSLayerProvider once near the app root when you need shared toast/layer configuration.',
      },
      {
        guidance: true,
        description:
          'Build on higher-level components like Popover, HoverCard, and Tooltip for common overlay patterns.',
      },
      {
        guidance: false,
        description:
          'Add nested XDSLayerProvider instances: nested providers are ignored and add unnecessary tree depth.',
      },
    ],
  },
  components: [
    {
      name: 'XDSLayerProvider',
      displayName: 'Layer Provider',
      description:
        'App-level provider for layer systems such as toast viewports and imperative modals. Nested providers pass through.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Application subtree that can use the shared layer context.',
          required: true,
        },
        {
          name: 'toast',
          type: 'LayerToastConfig',
          description:
            'Toast viewport configuration. Controls position, maxVisible, and inset for toasts shown through useXDSToast.',
        },
      ],
    },
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  usage: {
    description:
      'App-level provider for overlay systems. Use XDSLayerProvider at app root for toast/layer config; use Popover/HoverCard/Tooltip for most overlay UI.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use XDSLayerProvider once near app root for shared toast/layer config.',
      },
      {
        guidance: true,
        description: 'Use Popover/HoverCard/Tooltip for common overlay patterns.',
      },
      {
        guidance: false,
        description: 'Add nested XDSLayerProvider instances.',
      },
    ],
  },
  components: [
    {
      name: 'XDSLayerProvider',
      description: 'App-level provider for toast/layer systems.',
      propDescriptions: {
        children: 'application subtree using shared layer context **(required)**',
        toast: 'toast viewport config: position, maxVisible, inset',
      },
    },
  ],
};
