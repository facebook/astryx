// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'OverlayRegion',
  subComponentOf: 'Overlay',
  displayName: 'Overlay Region',
  isHiddenFromOverview: true,
  description:
    'Places one piece of content over a fill Overlay, such as a caption box, a corner badge, or a tag. Render several for several spots on one image. Render it directly in Overlay content: a positioned wrapper between the region and the overlay (such as an AspectRatio) becomes its reference box. It positions only; moving it is the caller’s code.',
  props: [
    {
      name: 'position',
      type: "'fill' | 'top' | 'bottom' | 'center' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | {x: number; y: number; width?: number; height?: number}",
      description:
        'Where the region sits. Presets: fill, top, and bottom mean what they mean on Overlay; center and the corners hold content-sized boxes, and start/end corners flip in right-to-left. Open placement: x and y are the region’s top-left corner as 0–1 fractions of the media, measured from its top-left in every direction; width and height (0–1) extend right and down, and a sized box stays inside the media. Without a size the region fits its content. Inside a top or bottom Overlay a region is not placed and warns in development.',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Content placed at the position. The region adds no role, name, or focus stop; its content keeps its own semantics.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for the region. Placement comes from position; overriding inset or size properties replaces it.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'CSS class name(s) appended to the region element.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description: 'Inline styles applied to the region element.',
    },
    {
      name: 'ref',
      type: 'Ref<HTMLDivElement>',
      description: 'Ref forwarded to the region element.',
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  name: 'OverlayRegion',
  displayName: 'Overlay Region',
  description:
    'one item at a preset or fractional spot on a fill Overlay; positions only, caller moves it',
  propDescriptions: {
    position:
      'preset fill/top/bottom/center/top-start/top-end/bottom-start/bottom-end (corners flip in RTL) or {x, y, width?, height?}: top-left corner in 0–1 fractions, physical, sized box kept inside; strip Overlay = not placed + dev warning',
    children: 'content at the position; region adds no role or focus',
    xstyle: 'StyleX styles; inset/size overrides replace placement',
    className: 'additional region class names',
    style: 'inline region styles',
    ref: 'forwarded region div ref',
  },
};
