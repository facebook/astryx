// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useLayer',
  displayName: 'useLayer',
  group: 'Utilities',
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
  params: [
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
      name: 'lightDismiss',
      type: 'boolean',
      description:
        'Whether clicking outside should dismiss the layer using native popover light-dismiss behavior.',
      default: 'false',
    },
  ],
  returns: [
    {
      name: 'ref',
      type: 'RefCallback<HTMLElement> | undefined',
      description: 'Trigger ref for context mode. Undefined in fixed mode.',
    },
    {
      name: 'anchorId',
      type: 'string',
      description: 'CSS anchor name for context mode positioning.',
    },
    {
      name: 'show',
      type: '() => void',
      description: 'Imperatively show the layer.',
    },
    {
      name: 'hide',
      type: '() => void',
      description: 'Imperatively hide the layer.',
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description: 'Whether the layer is currently open.',
    },
    {
      name: 'id',
      type: 'string',
      description: 'Unique ID for aria-describedby or other ARIA relationships.',
    },
    {
      name: 'render',
      type: '(children: ReactNode, props: ContextRenderProps | FixedRenderProps) => ReactNode',
      description:
        'Render function for the popover element. Pass placement/alignment in context mode or x/y in fixed mode. Placement/alignment are logical: start/end resolve against the trigger\'s computed direction at open time, so RTL contexts mirror automatically. Pass `positioning: "custom"` in context mode to author position styles yourself via `style` (e.g. explicit anchor() insets or an anchor-size() cover): the hook keeps the popover behavior and position-anchor wiring but derives no position styles — including the automatic RTL mirroring, which becomes your responsibility. In context mode, pass `as: "span"` to render an inline-safe layer (e.g. inside a paragraph). The layer renders inline in the React tree; the Popover API promotes it to the top layer when shown, so it escapes ancestor clipping and stacking without a portal.',
    },
  ],
  usage: {
    description:
      'Core positioning hook for rendering overlay content using CSS Anchor Positioning and the Popover API. Use it as the foundation for custom popovers, hover cards, tooltips, and fixed-position layers when higher-level components are not enough.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use context mode for anchor-positioned overlays relative to a trigger element, and fixed mode for manually positioned overlays at specific coordinates.',
      },
      {
        guidance: true,
        description:
          'Build on higher-level components like Popover, HoverCard, and Tooltip for common overlay patterns.',
      },
      {
        guidance: true,
        description:
          'Rely on the Popover API top layer to escape ancestor clipping and stacking: render the layer inline (no portal) so it inherits the trigger\'s theme cascade and keeps a natural focus order. Use `as: "span"` when the layer must be valid inside inline contexts like a paragraph.',
      },
      {
        guidance: false,
        description:
          'Implement ARIA patterns directly in a Layer unless you also own the full accessibility behavior.',
      },
    ],
  },
  relatedComponents: ['LayerProvider', 'Popover', 'HoverCard', 'Tooltip'],
  relatedHooks: ['usePopover', 'useHoverCard', 'useTooltip'],
  importPath: '@astryxdesign/core/Layer',
  category: 'interaction',
};

/** @type {import('../docs-types').HookTranslationDoc} */
export const docsDense = {
  description:
    'Core positioning hook for overlay content via CSS Anchor Positioning + Popover API. Foundation for custom popovers, hover cards, tooltips, fixed-position layers.',
  paramDescriptions: {
    mode: 'positioning strategy: context = CSS anchor relative to trigger; fixed = explicit x/y coords',
    onShow: 'fires when layer becomes visible.',
    onHide: 'fires when layer hides.',
    lightDismiss: 'whether native outside-click light-dismiss is enabled.',
  },
  returnDescriptions: {
    ref: 'trigger ref for context mode; undefined in fixed mode.',
    anchorId: 'CSS anchor name.',
    show: 'show layer.',
    hide: 'hide layer.',
    isOpen: 'whether layer is open.',
    id: 'unique ARIA id.',
    render: 'renders popover element; pass placement/alignment or x/y. Placement/alignment logical: start/end resolve against trigger computed direction at open (RTL mirrors). `positioning: "custom"` (context mode) = author position styles yourself via `style`; keeps popover behavior + position-anchor wiring, derives nothing (incl. RTL mirroring — yours). Context mode accepts `as: "span"` for inline-safe layers. Renders inline; the Popover API top layer escapes clipping/stacking without a portal.',
  },
  usage: {
    description:
      'Core positioning hook for overlay content via CSS Anchor Positioning + Popover API. Foundation for custom popovers, hover cards, tooltips, fixed-position layers.',
    bestPractices: [
      {
        guidance: true,
        description: 'Use context mode for trigger-anchored overlays; fixed mode for explicit coordinates.',
      },
      {
        guidance: true,
        description: 'Build on Popover/HoverCard/Tooltip for common overlay patterns.',
      },
      {
        guidance: true,
        description:
          'Rely on the Popover API top layer to escape clipping/stacking: render inline (no portal) to inherit the trigger theme cascade and natural focus order. Use `as: "span"` when the layer must be valid in inline contexts like a paragraph.',
      },
      {
        guidance: false,
        description:
          'Implement ARIA directly in Layer unless you own full accessibility behavior.',
      },
    ],
  },
};
