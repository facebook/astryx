// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'Overlay',
  displayName: 'Overlay',
  group: 'Overlay',
  category: 'Overlay',

  keywords: ['overlay', 'scrim', 'media', 'hover', 'focus', 'image', 'card'],

  usage: {
    description:
      'Overlay layers action or supporting content over media, cards, video, or other bounded surfaces with an optional scrim and reveal behavior.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use overlays for short, contextual actions or labels that belong directly to the underlying media or surface.',
      },
      {
        guidance: true,
        description:
          'Keep overlay content compact so it remains legible over the scrim and does not obscure important visual information.',
      },
      {
        guidance: true,
        description:
          'Use OverlayRegion for several pieces of content on one surface, such as captions, a corner badge, or a tag: a preset place, or open placement in fractions of the media. Keep the Overlay at position="fill" and make the media fill it so the fractions line up.',
      },
      {
        guidance: false,
        description:
          'Do not use Overlay for floating content anchored outside the surface. Use Popover, Tooltip, or Dialog for those patterns.',
      },
    ],
    anatomy: [
      {
        name: 'Base content',
        required: false,
        description:
          'The media, card, or bounded surface that the overlay sits on top of.',
      },
      {
        name: 'Scrim',
        required: false,
        description:
          'Optional dark or light overlay background that improves content contrast.',
      },
      {
        name: 'Overlay content',
        required: true,
        description:
          'Actions, labels, or supporting content rendered above the base surface.',
      },
      {
        name: 'Region',
        required: false,
        description:
          'An OverlayRegion inside fill overlay content, at a preset place or at fractional coordinates of the surface.',
      },
    ],
  },

  components: [{name: 'OverlayRegion'}],

  examples: [
    {
      label: 'Badge and caption on one image',
      code: `
<Overlay
  scrim={false}
  content={
    <>
      <OverlayRegion position="top-start">
        <Badge label="New" />
      </OverlayRegion>
      <OverlayRegion position="bottom">
        <Text type="body" weight="bold">On the first try</Text>
      </OverlayRegion>
    </>
  }>
  <AspectRatio ratio={4 / 3}>
    <img src="photo.jpg" alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </AspectRatio>
</Overlay>
`,
    },
    {
      label: 'Movable caption over an image',
      code: `
// Open placement puts the caption's top-left corner at fractions of the image,
// so a box reported by a server (left, top, width, height) passes straight in.
// Moving it is the callsite's code: a drag, a click on the image, or the arrow
// keys become new fractions, measured against the Overlay ref.
function CaptionEditor() {
  const surfaceRef = useRef(null);
  const size = {width: 0.8, height: 0.16};
  const [corner, setCorner] = useState({x: 0.1, y: 0.04});
  const [drag, setDrag] = useState(null);
  // Keep the whole box on the image.
  const moveTo = (x, y) =>
    setCorner({
      x: Math.min(Math.max(x, 0), 1 - size.width),
      y: Math.min(Math.max(y, 0), 1 - size.height),
    });
  const steps = {
    ArrowLeft: [-0.02, 0],
    ArrowRight: [0.02, 0],
    ArrowUp: [0, -0.02],
    ArrowDown: [0, 0.02],
  };

  // A click on the image centers the caption there: a way to move it without
  // dragging. Clicks on the caption itself are its own.
  const placeAtClick = event => {
    const rect = surfaceRef.current?.getBoundingClientRect();
    if (rect && !event.target.closest('button')) {
      moveTo(
        (event.clientX - rect.left) / rect.width - size.width / 2,
        (event.clientY - rect.top) / rect.height - size.height / 2,
      );
    }
  };

  return (
    <div onClick={placeAtClick} style={{width: 'fit-content'}}>
    <Overlay
      ref={surfaceRef}
      scrim={false}
      style={{width: 360}}
      content={
        <OverlayRegion position={{...corner, ...size}}>
          <button
            type="button"
            aria-label="Move caption. Drag, or use the arrow keys."
            style={{width: '100%', height: '100%', cursor: 'move', touchAction: 'none'}}
            onKeyDown={event => {
              const step = steps[event.key];
              if (step) {
                event.preventDefault();
                moveTo(corner.x + step[0], corner.y + step[1]);
              }
            }}
            onPointerDown={event => {
              event.currentTarget.setPointerCapture(event.pointerId);
              setDrag({px: event.clientX, py: event.clientY, ...corner});
            }}
            onPointerMove={event => {
              const rect = surfaceRef.current?.getBoundingClientRect();
              if (drag && rect) {
                moveTo(
                  drag.x + (event.clientX - drag.px) / rect.width,
                  drag.y + (event.clientY - drag.py) / rect.height,
                );
              }
            }}
            onPointerUp={() => setDrag(null)}
            onPointerCancel={() => setDrag(null)}>
            Caption
          </button>
        </OverlayRegion>
      }>
      <AspectRatio ratio={4 / 3}>
        <img src="photo.jpg" alt="Preview" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AspectRatio>
    </Overlay>
    </div>
  );
}
`,
    },
  ],

  playground: {
    defaults: {
      content: {
        __element: 'Button',
        props: {label: 'Quick view', variant: 'secondary', size: 'sm'},
      },
      children: [
        {
          __element: 'AspectRatio',
          props: {
            ratio: 1.7777777777777777,
            style: {
              width: 320,
              borderRadius: 12,
              overflow: 'clip',
            },
          },
          children: {
            __element: 'div',
            props: {
              style: {
                width: '100%',
                height: '100%',
                background:
                  'linear-gradient(135deg, #172554 0%, #2563eb 55%, #67e8f9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
              },
            },
            children: 'Media preview',
          },
        },
      ],
    },
  },

  props: [
    {
      name: 'content',
      type: 'ReactNode',
      description: 'Content rendered inside the overlay scrim.',
      required: true,
      slotElements: [
        {
          __element: 'Button',
          props: {label: 'Quick view', variant: 'secondary', size: 'sm'},
        },
        {
          __element: 'Text',
          props: {type: 'body', weight: 'bold'},
          children: 'Overlay content',
        },
      ],
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Base content such as an image, video, card, or media surface that the overlay sits on top of.',
      slotElements: [
        {
          __element: 'AspectRatio',
          props: {ratio: 1.7777777777777777, style: {width: 320}},
          children: {
            __element: 'div',
            props: {
              style: {
                width: '100%',
                height: '100%',
                background:
                  'linear-gradient(135deg, #172554 0%, #2563eb 55%, #67e8f9 100%)',
              },
            },
          },
        },
      ],
    },
    {
      name: 'showOn',
      type: "'hover' | 'always' | 'focus' | 'hover-or-focus'",
      description:
        'Visibility trigger. Hover mode also reveals on focus for keyboard accessibility; hover-or-focus is an alias for hover.',
      default: "'always'",
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description:
        'Controlled visibility override. When set, this takes precedence over showOn and touch toggle behavior.',
    },
    {
      name: 'scrim',
      type: "'dark' | 'light' | false",
      description:
        'Scrim background mode. Set to false to render overlay content without a scrim background.',
      default: "'dark'",
    },
    {
      name: 'position',
      type: "'fill' | 'bottom' | 'top'",
      description: 'Where the scrim appears within the base surface.',
      default: "'fill'",
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end'",
      description: 'Alignment of the overlay content within the scrim.',
      default: "'end'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'CSS class name(s) appended to the root element. Prefer xstyle for styling when possible.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Inline styles applied to the root element. Prefer xstyle for design-system styling.',
    },
    {
      name: 'ref',
      type: 'Ref<HTMLDivElement>',
      description: 'Ref forwarded to the overlay root element.',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-overlay'},
      {className: 'astryx-overlay-scrim', visualProps: ['position']},
    ],
  },
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'layered content over media/card surfaces with scrim + hover/focus/controlled reveal',
  usage: {
    description:
      'Overlay layers compact actions or supporting content over media, cards, or bounded surfaces with optional dark/light scrim and hover/focus/controlled reveal.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use for short contextual actions/labels tied to the underlying surface.',
      },
      {
        guidance: true,
        description: 'Keep content compact and legible over the scrim.',
      },
      {
        guidance: true,
        description:
          'Use OverlayRegion for content at a preset or fractional spot on media; fill Overlay only.',
      },
      {
        guidance: false,
        description:
          'Do not use for floating anchored surfaces; use Popover, Tooltip, or Dialog.',
      },
    ],
  },
  propDescriptions: {
    content: 'overlay content inside scrim; required',
    children: 'base media/card/surface beneath overlay',
    showOn: 'visibility trigger; hover also focus-visible; default always',
    isOpen: 'controlled visibility override',
    scrim: 'dark/light scrim or false for no scrim; default dark',
    position: 'scrim placement: fill, bottom strip, or top strip',
    align: 'content alignment inside scrim',
    xstyle: 'StyleX layout styles; must be stylex.create() value',
    className: 'additional root class names',
    style: 'inline root styles; prefer xstyle',
    ref: 'forwarded root div ref',
  },
};
