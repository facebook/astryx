// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Lightbox.tsx
 * @input Uses React, native dialog, StyleX, IconButton, theme tokens, layerTextReset, layerStructureReset,
 *   isRtlElement (gallery arrow keys follow the rendered direction), useZoomCore (the zoom
 *   stage for every pointer: keys, a mouse double-click and drag) and useZoomStage (its touch
 *   layer: pinch, double tap and pan on the gesture recognizers), moved by the compositor
 *   animator, usePager (a gallery pages like Photos: a UIKit paging scroll view with Photos'
 *   40 pt gap), and the compositor animator for Photos' drag to dismiss (the
 *   backdrop and the controls' layers fade with the drag), zoomFromSource (UIKit's
 *   zoom transition between a source, `experimental.sourceFor`, and the photo), zoomStage's chrome
 *   curves (a tap on the photo hides the controls, as Photos' chrome), pinch-close
 *   fades (a pinch in from the fitted size closes the viewer), holdInput (the Layer
 *   module's input hold: a touch opening holds taps and drags until it ends,
 *   spec:AST-094 FR35) and openerActivation (the click that opened a viewer, recorded by
 *   one document listener every closed touch viewer shares)
 * @output Exports Lightbox component, LightboxProps, LightboxExperimentalOptions, LightboxMedia
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Lightbox/Lightbox.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Lightbox/Lightbox.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Lightbox/useZoomCore.ts (the zoom stage for every pointer)
 * - /packages/core/src/Lightbox/useZoomStage.ts (the touch layer)
 * - /packages/core/src/Lightbox/__tests__/LightboxZoom.interaction.browser.spec.ts (touch zoom proofs)
 * - /packages/core/src/Lightbox/__tests__/LightboxPaging.interaction.browser.spec.ts (gallery paging proofs)
 * - /packages/core/src/Lightbox/__tests__/LightboxDismiss.interaction.browser.spec.ts (drag to dismiss proofs)
 * - /packages/core/src/Lightbox/__tests__/LightboxZoomTransition.interaction.browser.spec.ts (zoom transition proofs)
 * - /packages/core/src/Lightbox/__tests__/LightboxChrome.interaction.browser.spec.ts (controls hidden by a tap)
 * - /packages/core/src/Lightbox/__tests__/LightboxPinchClose.interaction.browser.spec.ts (pinch to close)
 * - /packages/core/src/Lightbox/zoomFromSource.ts (the transition driver)
 * - /packages/core/src/Lightbox/index.ts (exports if types change)
 * - /packages/core/src/Layer/useLayerDismissal.ts (dismissal stack)
 * - /apps/storybook/stories/Lightbox.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/Lightbox/ (showcase blocks)
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars, typeScaleVars} from '../theme/tokens.stylex';
import {Icon} from '../Icon';
import {IconButton} from '../IconButton';
import {useAnnounce} from '../hooks/useAnnounce';
import {useScrollLock} from '../hooks/useScrollLock';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {mergeProps, rtlStyles} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {focusOutlineStyles} from '../utils/focusOutline.stylex';
import {layerTextReset} from '../Layer/layerTextReset.stylex';
import {layerStructureReset} from '../Layer/layerStructureReset.stylex';
import {LayerContentBoundary} from '../Layer/layerScopedContext';
import {ModalAnnounceProvider} from '../hooks/ModalAnnounceProvider';
import {overlayPaddingReset} from '../Layout/padding.stylex';
import {LayerDepthProvider} from '../Layer/LayerDepthContext';
import {holdInput} from '../Layer/inputHold';
import {takeOpenerActivation, useOpenerActivation} from './openerActivation';
import {useLayerDismissal} from '../Layer/useLayerDismissal';
import {useTranslator} from '../i18n';

import {useMergedRefs} from '../hooks/useMergedRefs';
import {isRtlElement} from '../hooks/isRtlElement';
import {useZoomCore} from './useZoomCore';
import {usePager, type Pager} from '../hooks/usePager';
import {UIKIT_TAP} from '../motion/uikit/gestures';
import {zoomMedia} from '../motion/uikit/zoomMedia';
import {useZoomStage, type ZoomStage} from './useZoomStage';
import {lightboxScope} from './lightbox.markers.stylex';
import {useTouchPresentation} from '../utils/touchPresentation';
import {animatorFor, type Animator} from '../motion/animator';
import {liftCopy, type LiftedCopy} from '../liftFromTrigger/liftFromTrigger';
import {sourceBoxOf, openingFadeStart, zoomFromSource} from './zoomFromSource';
import {
  chromeBackgroundCurve,
  chromeFadeCurve,
  dismissBackdropAlpha,
  dismissChromeAlpha,
  pinchCloseBackdropAlpha,
  pinchCloseChromeAlpha,
} from './zoomStage';
/**
 * Media type for lightbox items.
 */
export type LightboxMediaType = 'image' | 'video';

/**
 * Describes a single media item in a lightbox.
 */
export interface LightboxMedia {
  /** Media source URL */
  src: string;
  /** Alt text for accessibility (used as aria-label for video) */
  alt: string;
  /** Optional caption displayed below the media */
  caption?: ReactNode;
  /**
   * Media type. Zoom/pan is disabled for video.
   * @default 'image'
   */
  type?: LightboxMediaType;
}

/**
 * Lightbox's experimental options (`experimental`): anything here may change or
 * be removed in a patch release.
 */
export interface LightboxExperimentalOptions {
  /**
   * The element an item opens from and closes into, usually its thumbnail, or
   * null for an item with none on screen.
   */
  sourceFor?: (index: number) => HTMLElement | null;
}

export interface LightboxProps extends BaseProps<HTMLDialogElement> {
  /** Ref forwarded to the root dialog element */
  ref?: React.Ref<HTMLDialogElement>;
  /**
   * Whether the lightbox is open.
   */
  isOpen: boolean;
  /**
   * Callback when the lightbox open state changes.
   * Called with `false` on Escape, backdrop click, or close button.
   */
  onOpenChange: (isOpen: boolean) => void;
  /**
   * Media to display. Pass a single object for one item, or an array
   * for gallery mode with prev/next navigation.
   */
  media: LightboxMedia | LightboxMedia[];
  /**
   * Current index in gallery mode (when `media` is an array).
   * When provided, puts the component in controlled mode.
   */
  index?: number;
  /**
   * Initial index in gallery mode for uncontrolled usage.
   * @default 0
   */
  defaultIndex?: number;
  /**
   * Callback when the gallery index changes: the previous and next buttons,
   * the arrow keys or a swipe.
   */
  onIndexChange?: (index: number) => void;
  /**
   * Enable zoom (images only): under a coarse primary pointer (a touch
   * screen), pinch or double-tap to zoom in at that point; a double-click
   * or Enter/Space/`+`/`-` zooms 2× about the centre. When zoomed, drag or
   * use arrow keys to pan.
   * @default false
   */
  hasZoom?: boolean;
  /**
   * Whether video should autoplay when the lightbox opens.
   * @default false
   */
  hasAutoPlay?: boolean;
  /**
   * Experimental options: anything in this object may change or be removed in
   * a patch release. `sourceFor` returns the element an item opens from and
   * closes into, usually its thumbnail: on a touch screen the photo zooms out
   * of it on open and back into it on close (UIKit's zoom transition), and a
   * photo dragged down lands in it. It returns null for an item with none on
   * screen. Without it, on a touch screen the element that opened the viewer
   * is the opened item's source when it shows a picture. Omitting
   * `experimental` keeps the stable viewer, which opens and closes plainly.
   * @experimental
   */
  experimental?: LightboxExperimentalOptions;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  dialog: {
    position: 'fixed',
    inset: 0,
    width: '100vw',
    // The dynamic viewport: the height a mobile browser shows. Its 100vh is
    // the large viewport, measured with the toolbars retracted, so a viewer
    // that tall runs under Safari's bottom toolbar and hides the caption.
    height: stylex.firstThatWorks('100dvh', '100vh'),
    maxWidth: 'none',
    maxHeight: 'none',
    margin: 0,
    padding: 0,
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    outline: 'none',
    // The backdrop dims and blurs the page as on main: the theme's overlay
    // colour over a 2 px blur. While it fades (a drag to dismiss and its
    // release) the blur comes off, through the dialog's
    // --_lightbox-backdrop-filter: on a 2-core limit a full-viewport blur
    // repainted every frame of the fade drops frames.
    '::backdrop': {
      backgroundColor: colorVars['--color-overlay'],
      backdropFilter: 'var(--_lightbox-backdrop-filter, blur(2px))',
    },
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    position: 'relative',
    // The black the viewer turns as a tap hides the controls, as Photos'
    // background does: under the photo (and a source's picture), over the
    // backdrop. The colour that reads on light surfaces is black in every
    // theme; a theme that retints it retints this. The container's own
    // pseudo-element, no element of its own (architecture:layer-runtime INV7).
    '::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      zIndex: -1,
      backgroundColor: colorVars['--color-on-light'],
      opacity: 0,
      pointerEvents: 'none',
    },
  },
  mediaGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '100%',
    maxHeight: '100%',
    // ZOOM_DISMISSING_ATTRIBUTE on the stage inside: a photo dragged to
    // dismiss draws outside the box that hugs it.
    overflow: {default: 'hidden', ':has([data-zoom-dismissing])': 'visible'},
  },
  // On a touch screen (the shared touch resolver, useTouchPresentation) a
  // zoomable photo's stage fills the viewer, as a photo viewer's zooming
  // scroll view does: a zoomed photo uses the whole screen and a pinch can
  // start anywhere around it. Only for a zoom target: around any other item
  // a tap on the dark area still closes the viewer.
  mediaGroupZoom: {
    alignSelf: 'stretch',
    flexGrow: 1,
    minHeight: 0,
  },
  imageWrapperFill: {
    alignSelf: 'stretch',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  imageWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // ZOOM_DISMISSING_ATTRIBUTE: a photo dragged to dismiss draws outside it.
    overflow: {default: 'hidden', ':is([data-zoom-dismissing])': 'visible'},
    cursor: 'default',
    userSelect: 'none',
    minHeight: 0,
  },
  // Under the touch layer, the stage's own pinch, pan and double tap take
  // every touch on it. Only the stage: the controls and caption leave
  // pinch-zoom to the page. On a touch screen it fills the viewer
  // (mediaGroupZoom, imageWrapperFill). Where the primary pointer is fine no
  // recognizer runs, so the browser keeps the touches (spec:AST-094 FR19).
  imageWrapperZoomTarget: {
    touchAction: 'none',
  },
  // In a gallery the stage's touches go to the track instead, under the
  // touch layer only (as imageWrapperZoomTarget): the pager's pan manages
  // the stage's own `touch-action`.
  trackZoomTarget: {
    touchAction: 'none',
  },
  // Under the touch layer, a photo without zoom leaves pinch-zoom to the page
  // but takes one-finger drags: a drag down dismisses it.
  imageWrapperDismissTarget: {
    touchAction: 'pinch-zoom',
  },
  // A gallery's stage is the pager's viewport: it fills the viewer on every
  // presentation, so its pages have a size of their own.
  mediaGroupGallery: {
    alignSelf: 'stretch',
    flexGrow: 1,
    minHeight: 0,
  },
  imageWrapperGallery: {
    alignSelf: 'stretch',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    position: 'relative',
  },
  // Two rows, the photo's and the caption's, that every page shares
  // (subgrid): the caption row is as tall as the gallery's tallest caption
  // (the current page lays out, unseen, those no rendered page shows), so
  // every photo centres on the same box, with or without a caption, the next
  // photo slides in level with the current one, and paging never resizes it.
  track: {
    position: 'absolute',
    inset: 0,
    display: 'grid',
    gridTemplateColumns: '100%',
    gridTemplateRows: 'minmax(0, 1fr) auto',
  },
  // One page per item, the stage's size, at index × (width + gap) (stacked
  // in the track's one column, offset by its relative inset). Each on its
  // own layer: through a busy main thread Mobile Safari moves the track but
  // cannot paint what it had not painted, so a page that slides in must be
  // painted whole before it moves.
  page: {
    position: 'relative',
    gridColumn: '1',
    gridRow: '1 / span 2',
    display: 'grid',
    gridTemplateColumns: '100%',
    gridTemplateRows: 'subgrid',
    minHeight: 0,
    willChange: 'transform',
  },
  // A page's photo box: the zoom stage of the current page, in the photo
  // row. Its caption sits in the caption row below it, so the viewer's size
  // never changes with the item.
  pageMedia: {
    gridRow: '1',
    minHeight: 0,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pageCaption: {
    gridRow: '2',
    justifySelf: 'center',
  },
  // The current page's caption row when it also lays out, unseen, the
  // captions no rendered page shows (`unrenderedCaptions`): one grid cell
  // holds its own caption and those, so the row is the tallest of them.
  pageCaptionRow: {
    gridRow: '2',
    display: 'grid',
    justifyItems: 'center',
    minWidth: 0,
  },
  captionStacked: {
    gridArea: '1 / 1',
  },
  captionSizer: {
    display: 'grid',
    justifyItems: 'center',
    justifySelf: 'stretch',
    visibility: 'hidden',
    pointerEvents: 'none',
  },
  imageWrapperZoomable: {
    cursor: {
      default: 'zoom-in',
      '@media (hover: hover)': 'zoom-in',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
  },
  imageWrapperZoomed: {
    cursor: {
      default: 'grab',
      // ZOOM_DRAGGING_ATTRIBUTE, set by the stage while a drag moves the photo.
      ':is([data-zoom-dragging])': 'grabbing',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    pointerEvents: 'none',
    // The zoom stage scales the photo about its top-left corner and moves it
    // with the individual `scale` and `translate` properties.
    transformOrigin: '0 0',
  },
  video: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    outline: 'none',
  },
  caption: {
    color: colorVars['--color-on-dark'],
    fontSize: typeScaleVars['--text-large-size'],
    lineHeight: typeScaleVars['--text-large-leading'],
    textAlign: 'center',
    paddingBlockStart: spacingVars['--spacing-2'],
    paddingBlockEnd: 0,
    paddingInline: spacingVars['--spacing-3'],
    maxWidth: '600px',
    flexShrink: 0,
  },
  closeButton: {
    position: 'absolute',
    top: spacingVars['--spacing-3'],
    insetInlineEnd: spacingVars['--spacing-3'],
    zIndex: 1,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    // The individual `translate` property, not `transform`: this style now
    // lands on the Button root, and a `transform` here replaces the Button's
    // own transform rules — measured: the `scale(0.98)` press feedback stops
    // firing. `translate` composes with them, reproducing exactly what the
    // removed wrapper element did (wrapper translated, button scaled).
    translate: '0 -50%',
    zIndex: 1,
  },
  navPrev: {
    insetInlineStart: spacingVars['--spacing-3'],
  },
  navNext: {
    insetInlineEnd: spacingVars['--spacing-3'],
  },
  counter: {
    position: 'absolute',
    top: spacingVars['--spacing-3'],
    insetInlineStart: spacingVars['--spacing-3'],
    color: colorVars['--color-on-dark'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    zIndex: 1,
  },
  controlButton: {
    color: colorVars['--color-on-dark'],
    // Hidden by a tap on the photo, they take no taps: one where a control
    // was reaches the viewer (and shows them again).
    pointerEvents: {
      default: 'auto',
      [stylex.when.ancestor('[data-chrome-hidden]', lightboxScope)]: 'none',
    },
  },
  // The controls sit in layers over the viewer that pass clicks through. A
  // drag to dismiss fades the layers, which carry no transition of their own
  // (a Button's opacity transition would trail the finger).
  // Above the stage: while a fade writes their opacity they are stacking
  // contexts of their own, which a gallery's positioned pages (later in tree
  // order) would otherwise cover, taking the taps meant for the controls.
  chromeLayer: {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },
});

const pageStyles = stylex.create({
  position: (index: number) => ({
    insetInlineStart: `calc(${index} * (100% + ${zoomMedia.viewer.pageGap}px))`,
  }),
});

/** A control layer or a caption: what a tap on the photo hides. */
function isChromeElement(element: HTMLElement | null): boolean {
  return (
    element?.matches('[data-lightbox-chrome], [data-lightbox-caption]') === true
  );
}

/**
 * How long an opening waits for its photo to decode before it zooms (ms):
 * the photo stays hidden meanwhile, and opens plainly past it.
 */
const OPEN_DECODE_WAIT_MS = 300;

/**
 * Pan distance (px) per arrow-key press while zoomed. Offsets move the
 * viewport in the arrow's direction — pressing ArrowRight reveals content to
 * the right, so the image itself shifts left (negative x), matching how
 * scrolling and pointer-drag panning feel.
 */
const KEYBOARD_PAN_STEP = 50;
const KEYBOARD_PAN_OFFSETS: Record<string, [number, number]> = {
  ArrowLeft: [KEYBOARD_PAN_STEP, 0],
  ArrowRight: [-KEYBOARD_PAN_STEP, 0],
  ArrowUp: [0, KEYBOARD_PAN_STEP],
  ArrowDown: [0, -KEYBOARD_PAN_STEP],
};

/**
 * A fullscreen overlay for viewing images at full resolution.
 *
 * Supports single image and gallery modes. In gallery mode, provides
 * prev/next navigation via buttons and arrow keys; the arrow keys follow
 * the writing direction (in RTL, ArrowLeft goes to the next item, like the
 * Next button on the left). Optionally supports
 * zoom like a photo viewer: under a finger, pinch about the fingers (with the
 * give past the limits and the eased return); double-tap or double-click to
 * zoom in at that point and back, Enter/Space on the image or `+`/`-` from
 * the keyboard; and pan (drag, under a finger with momentum and the rubber
 * band at the edges, or arrow keys when zoomed; arrows navigate the gallery
 * when not zoomed).
 *
 * Uses the native `<dialog>` element with `showModal()` for focus
 * trapping and top-layer placement. Dismiss via Escape, close button,
 * or backdrop click.
 *
 * @example
 * ```
 * <Lightbox
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   media={{src: "/photo.jpg", alt: "A photo"}}
 * />
 * <Lightbox
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   media={photos}
 * />
 * <Lightbox
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   media={photos}
 *   index={currentIndex}
 *   onIndexChange={setCurrentIndex}
 * />
 * ```
 */
export function Lightbox({
  isOpen,
  onOpenChange,
  media,
  index: controlledIndex,
  defaultIndex = 0,
  onIndexChange,
  hasZoom = false,
  hasAutoPlay = false,
  experimental,
  xstyle,
  className,
  style,
  ref,
  onClick: onClickProp,
  onKeyDown: onKeyDownProp,
  ...props
}: LightboxProps) {
  const t = useTranslator();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  // A gallery's zoom stage: the current page's photo box.
  const pageMediaRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<Element | null>(null);
  /** The item the viewer opened on (the opener is its source). */
  const openedIndexRef = useRef<number | null>(null);
  /** The element whose activation opened the viewer (its source fallback). */
  const openerRef = useRef<Element | null>(null);
  /**
   * A dismissed photo landed in its thumbnail: the picture over it, and the
   * hold that keeps the thumbnail hidden under it.
   */
  const landedRef = useRef<LiftedCopy | null>(null);
  /** Lets go of a landed photo: the thumbnail shows again. */
  const restoreLanded = useCallback(() => {
    const landed = landedRef.current;
    if (landed != null) {
      landedRef.current = null;
      landed.drop();
    }
  }, []);

  // Index state (controlled + uncontrolled)
  const isControlled = controlledIndex !== undefined;
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const requestedIndex = isControlled ? controlledIndex : uncontrolledIndex;

  const setIndex = useCallback(
    (value: number) => {
      if (!isControlled) {
        setUncontrolledIndex(value);
      }
      onIndexChange?.(value);
    },
    [isControlled, onIndexChange, setUncontrolledIndex],
  );

  // Whether the photo is zoomed: a discrete state for aria-pressed and the
  // cursor. The zoom and pan themselves live outside React (useZoomCore,
  // useZoomStage).
  const [isZoomed, setIsZoomed] = useState(false);

  // Resolve current media item
  const mediaArray = useMemo(
    () => (Array.isArray(media) ? media : [media]),
    [media],
  );
  const isGallery = mediaArray.length > 1;
  // The item shown, current in every respect (its page, the counter, the
  // pager, the announcement): an index past either end shows the nearest
  // item. A NaN index stays NaN (the viewed-item check below).
  const index = Math.max(0, Math.min(requestedIndex, mediaArray.length - 1));
  const currentItem = mediaArray.length > 0 ? mediaArray[index] : null;
  const currentType = currentItem?.type ?? 'image';
  const isVideo = currentType === 'video';
  const canPrev = isGallery && index > 0;
  const canNext = isGallery && index < mediaArray.length - 1;

  // Scroll lock
  useScrollLock(isOpen);

  // A new media item starts unzoomed. Adjusted during render, so the new item
  // never paints as zoomed; the stage resets the photo before it paints.
  const currentSrc = currentItem?.src;
  const [viewedItem, setViewedItem] = useState({index, src: currentSrc});
  // Object.is, matching the dependency comparison of the effect this replaces:
  // a controlled index of NaN must not re-render forever.
  if (
    !Object.is(viewedItem.index, index) ||
    !Object.is(viewedItem.src, currentSrc)
  ) {
    setViewedItem({index, src: currentSrc});
    setIsZoomed(false);
  }

  // Announce gallery navigation to screen readers. Moving between images only
  // updates the visual counter, which is silent to assistive tech, so mirror
  // each change in a polite live region ("<alt>, 3 of 12", or "Image 3 of 12"
  // when the image has no alt). Announce only when the image changes during an
  // already-open session — not on mount, not when opening (even at a new
  // index, since the dialog's aria-label already names the current image), and
  // not on close.
  const announce = useAnnounce();
  const prevIndexRef = useRef(index);
  const wasOpenRef = useRef(isOpen);
  useEffect(() => {
    const indexChanged = prevIndexRef.current !== index;
    const wasOpen = wasOpenRef.current;
    prevIndexRef.current = index;
    wasOpenRef.current = isOpen;
    if (!indexChanged || !isOpen || !wasOpen) {
      return;
    }
    const item = mediaArray[index];
    const position = {index: index + 1, total: mediaArray.length};
    announce(
      item?.alt
        ? t('@astryx.lightbox.mediaPosition', {alt: item.alt, ...position})
        : t('@astryx.lightbox.imagePosition', position),
    );
  }, [index, isOpen, announce, mediaArray, t]);

  // A video left on another page stops: the pager keeps the neighbours
  // mounted, and a playing one would go on, with its sound, off screen.
  useEffect(() => {
    const container = containerRef.current;
    if (container == null) {
      return;
    }
    for (const video of container.querySelectorAll<HTMLVideoElement>(
      '[data-lightbox-page]:not([data-current]) video',
    )) {
      if (!video.paused) {
        video.pause();
      }
    }
  }, [index]);

  // A closed viewer is not closed again: while a closing photo lands, Close,
  // a backdrop click and a platform cancel do nothing.
  const handleClose = useCallback(() => {
    if (isOpen) {
      onOpenChange(false);
    }
  }, [isOpen, onOpenChange]);

  // An item's source: the caller's, or for the opened item the element that
  // opened the viewer when it shows a picture (a thumbnail, or a button or
  // link around one); a text button opens and closes plainly. Both are
  // experimental: without `experimental` no item has a source, so the
  // viewer keeps its stable opening and closing (spec:AST-017 FR21).
  const isExperimental = experimental != null;
  const sourceFor = experimental?.sourceFor;
  const sourceElementFor = useCallback(
    (i: number): HTMLElement | null => {
      if (sourceFor != null) {
        return sourceFor(i);
      }
      if (!isExperimental) {
        return null;
      }
      const opener = openerRef.current;
      return i === openedIndexRef.current &&
        opener instanceof HTMLElement &&
        opener !== opener.ownerDocument.body &&
        (opener instanceof HTMLImageElement ||
          opener.querySelector('img') != null)
        ? opener
        : null;
    },
    [isExperimental, sourceFor],
  );

  // The viewer stays presented while its dialog is open, also while a closing
  // photo zooms back into its source: it stays in the dismissal stack and
  // swallows an Escape (so the press cannot reach the layer behind it) until
  // the photo lands and the dialog closes, as BottomSheet does through its
  // exit. Latched when the viewer opens; cleared by the dialog's close event.
  const [isPresented, setIsPresented] = useState(isOpen);
  // Latched during render when the viewer opens, as `viewedItem` is.
  if (isOpen && !isPresented) {
    setIsPresented(true);
  }
  const {shouldDismissOnCloseRequest} = useLayerDismissal({
    isActive: isOpen || isPresented,
    escapeBehavior: isOpen ? 'close' : 'block',
    onDismiss: handleClose,
    // The dialog's document is this layer's: rendered into an iframe or a
    // Picture-in-Picture window, it ranks with the layers opened inside it.
    getContainer: () => dialogRef.current,
    isPresent: () => dialogRef.current?.open ?? false,
  });

  // The native `cancel` event is the browser's own close-watcher firing: an
  // Android back gesture, or a close request the stack never saw a press for.
  // Escape presses the stack owns never arrive here — it preventDefault()s
  // those, which suppresses the close watcher.
  //
  // Always preventDefault so the browser cannot close a controlled <dialog>
  // behind React's back, then answer with the stack's own rules: top-most
  // only, and never while an IME composition is in progress.
  const handleCancel = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      if (!shouldDismissOnCloseRequest()) {
        return;
      }
      handleClose();
    },
    [handleClose, shouldDismissOnCloseRequest],
  );

  // Backdrop click. The layout container fills the whole transparent dialog,
  // so clicks on the visual backdrop (the dark area around the media) land on
  // the container, never on the dialog element itself — treat both as the
  // backdrop. A pan drag that ends over the backdrop still fires a click on
  // the common ancestor; ignore it so releasing a drag doesn't dismiss (the
  // flag is cleared when the next press lands on the photo).
  const didDragRef = useRef(false);
  // Where the last press on the stage landed: a mouse drag released beside
  // the photo still fires a click there, which is no click (UIKit's tap
  // movement limit).
  // And on which photo: a tap the stage recognizes after the double-tap
  // interval belongs to the photo it landed on.
  const pressRef = useRef<{x: number; y: number; index: number} | null>(null);
  // With the controls hidden, a click or tap where the stage does not take
  // it (a video page, the dark area beside a photo the stage only hugs)
  // brings them back instead of closing the viewer unseen.
  const showHiddenChromeRef = useRef<() => boolean>(() => false);
  const handleBackdropClick = useCallback(
    (e: ReactMouseEvent<HTMLDialogElement>) => {
      if (didDragRef.current) {
        didDragRef.current = false;
        return;
      }
      if (showHiddenChromeRef.current()) {
        return;
      }
      if (e.target === e.currentTarget || e.target === containerRef.current) {
        handleClose();
        return;
      }
      // A gallery's stage fills the viewer: a click on it beside the media is
      // a backdrop click too. With zoom on, the stage's own tap handles it
      // for every pointer, after the double-tap interval (spec:AST-094 FR43).
      const target = e.target as Element;
      const stageTaps = hasZoom && !isVideo;
      const press = pressRef.current;
      const dragged =
        hasZoom &&
        !isVideo &&
        press != null &&
        Math.hypot(e.clientX - press.x, e.clientY - press.y) >
          UIKIT_TAP.allowableMovement.value;
      // A click on the photo itself is the photo's, zoom or not (a
      // double-click zooms it): the photo takes no pointer events, so the
      // click lands on its box.
      const onPhoto = [
        ...e.currentTarget.querySelectorAll('[data-current] img'),
      ].some(media => {
        const r = media.getBoundingClientRect();
        // A photo with no size yet (still loading) is not under the click.
        return (
          r.width > 0 &&
          r.height > 0 &&
          e.clientX >= r.left &&
          e.clientX <= r.right &&
          e.clientY >= r.top &&
          e.clientY <= r.bottom
        );
      });
      if (
        isGallery &&
        !stageTaps &&
        !dragged &&
        !onPhoto &&
        (target === imageWrapperRef.current ||
          target === trackRef.current ||
          target.hasAttribute('data-lightbox-page') ||
          target.hasAttribute('data-lightbox-page-media'))
      ) {
        handleClose();
      }
    },
    [handleClose, hasZoom, isGallery, isVideo],
  );

  // Zoom: pinch, double tap or double-click, Enter/Space on the image, or
  // +/- keys. Zoom changes are silent to assistive tech (only the transform
  // changes), so mirror them in the polite live region, including a hint that
  // arrow keys pan while zoomed. A tap on the dark area around the photo
  // closes, as a click on the backdrop does.
  const isZoomTarget = hasZoom && !isVideo;
  // What a dismissal or a transition faded (the backdrop, the controls,
  // captions, neighbouring pages): exactly those go back to rest when the
  // viewer next opens or closes, or stays open after a dismissal its caller
  // kept. A page faded as a neighbour may be the current one by then.
  const fadedRef = useRef(new Set<Animator>());
  const markFaded = (animators: ReadonlyArray<Animator>) => {
    for (const animator of animators) {
      fadedRef.current.add(animator);
    }
  };
  const restoreFaded = (): boolean => {
    const faded = fadedRef.current;
    if (faded.size === 0) {
      return false;
    }
    for (const animator of faded) {
      // The black layer rests where the controls' state puts it (restChrome).
      if (animator.element?.hasAttribute('data-lightbox-blackout') !== true) {
        animator.set({opacity: 1});
      }
    }
    faded.clear();
    return true;
  };
  // The photo was dismissed: the viewer closes without zooming.
  const dismissedRef = useRef(false);
  // A dismissed photo still leaving or landing: the close waits for it.
  const dismissLandingRef = useRef<{
    landing: Promise<void>;
    resolve: () => void;
  } | null>(null);
  // Set when a dismissal has asked the caller to close; the next render
  // (one more is asked for) reads the caller's answer.
  const dismissalAnsweredRef = useRef(false);
  const [, renderAfterDismissal] = useReducer((n: number) => n + 1, 0);

  // Photos hides its controls (the chrome) for a tap on the photo and as a
  // zoom by touch passes the fitted size, and shows them for the next tap and
  // as the photo returns to it. The background turns black with them and
  // stays black while the photo is zoomed, when a tap toggles only the
  // controls. Both run on Photos' measured curves (zoomMedia.chrome). The
  // controls read the state from an attribute on the container, so a toggle
  // in the middle of a gesture renders nothing.
  const chromeHiddenRef = useRef(false);
  const immersiveRef = useRef(false);
  /** The last input: a pointer type, or 'keyboard'. */
  const lastInputRef = useRef<string>('mouse');
  const chromeElements = useCallback((): HTMLElement[] => {
    const container = containerRef.current;
    return container == null
      ? []
      : [
          ...container.querySelectorAll<HTMLElement>(
            '[data-lightbox-chrome], [data-lightbox-caption]',
          ),
        ];
  }, []);
  const blackoutAnimator = useCallback((): Animator | null => {
    const container = containerRef.current;
    return container == null
      ? null
      : animatorFor(container, {
          pseudoElement: '::before',
          initial: {opacity: 0},
        });
  }, []);
  const setChrome = useCallback(
    ({hidden, immersive}: {hidden: boolean; immersive: boolean}) => {
      if (chromeHiddenRef.current !== hidden) {
        chromeHiddenRef.current = hidden;
        containerRef.current?.toggleAttribute('data-chrome-hidden', hidden);
        for (const element of chromeElements()) {
          const animator = animatorFor(element);
          animator.play({
            opacity: chromeFadeCurve(animator.get('opacity'), hidden),
          });
        }
      }
      if (immersiveRef.current !== immersive) {
        immersiveRef.current = immersive;
        const blackout = blackoutAnimator();
        blackout?.play({
          opacity: chromeBackgroundCurve(blackout.get('opacity'), immersive),
        });
      }
    },
    [blackoutAnimator, chromeElements],
  );
  /** The controls and the background as an opened viewer has them. */
  const restChrome = useCallback(() => {
    if (!chromeHiddenRef.current && !immersiveRef.current) {
      return;
    }
    chromeHiddenRef.current = false;
    immersiveRef.current = false;
    containerRef.current?.removeAttribute('data-chrome-hidden');
    blackoutAnimator()?.set({opacity: 0});
    for (const element of chromeElements()) {
      animatorFor(element).set({opacity: 1});
    }
  }, [blackoutAnimator, chromeElements]);
  // Which input came last decides whether a zoom hides the controls (only
  // touch does, as Photos); a keyboard focus on a hidden control shows them.
  // Attached with the dialog node itself (a callback ref): a viewer whose
  // first render had no item mounts its dialog later. They listen for every
  // pointer, on the dialog itself (spec:AST-094 FR24, FR43).
  const inputListenersRef = useRef<(() => void) | null>(null);
  const attachInputListeners = useCallback(
    (dialog: HTMLDialogElement | null) => {
      inputListenersRef.current?.();
      inputListenersRef.current = null;
      if (dialog == null) {
        return;
      }
      const onPointerDown = (event: PointerEvent) => {
        lastInputRef.current = event.pointerType;
      };
      const onKeyDown = () => {
        lastInputRef.current = 'keyboard';
      };
      const onFocusIn = (event: FocusEvent) => {
        const target = event.target instanceof Element ? event.target : null;
        if (
          chromeHiddenRef.current &&
          lastInputRef.current === 'keyboard' &&
          target?.closest('[data-lightbox-chrome]') != null
        ) {
          setChrome({hidden: false, immersive: immersiveRef.current});
        }
      };
      // With the controls hidden, a tap where a gallery's caption sits
      // brings them back, as a tap beside the photo does (`onTapOutside`):
      // the caption sits below the photo's box, out of the stage's reach.
      // The tap's click never comes (the gesture layer takes the touch's
      // default), so the press itself decides: down and up on a caption
      // within a tap's movement.
      let captionPress: {id: number; x: number; y: number} | null = null;
      const onCaptionPress = (event: PointerEvent) => {
        const target = event.target instanceof Element ? event.target : null;
        captionPress =
          chromeHiddenRef.current &&
          target?.closest('[data-lightbox-caption]') != null
            ? {id: event.pointerId, x: event.clientX, y: event.clientY}
            : null;
      };
      const onCaptionLift = (event: PointerEvent) => {
        const press = captionPress;
        captionPress = null;
        if (
          press == null ||
          press.id !== event.pointerId ||
          !chromeHiddenRef.current ||
          Math.hypot(event.clientX - press.x, event.clientY - press.y) >
            UIKIT_TAP.allowableMovement.value
        ) {
          return;
        }
        setChrome({
          hidden: false,
          immersive: stageApiRef.current?.isZoomed() === true,
        });
      };
      dialog.addEventListener('pointerdown', onPointerDown, true);
      dialog.addEventListener('keydown', onKeyDown, true);
      dialog.addEventListener('focusin', onFocusIn);
      dialog.addEventListener('pointerdown', onCaptionPress, true);
      dialog.addEventListener('pointerup', onCaptionLift, true);
      inputListenersRef.current = () => {
        dialog.removeEventListener('pointerdown', onPointerDown, true);
        dialog.removeEventListener('keydown', onKeyDown, true);
        dialog.removeEventListener('focusin', onFocusIn);
        dialog.removeEventListener('pointerdown', onCaptionPress, true);
        dialog.removeEventListener('pointerup', onCaptionLift, true);
      };
    },
    [setChrome],
  );
  const mergedDialogRef = useMergedRefs(ref, dialogRef, attachInputListeners);

  // An item that is not a zoom target (a video) has no stage to tap: the
  // controls a photo hid come back when the viewer shows it.
  useIsomorphicLayoutEffect(() => {
    if (!isZoomTarget && (chromeHiddenRef.current || immersiveRef.current)) {
      setChrome({hidden: false, immersive: false});
    }
  }, [isZoomTarget, viewedItem, setChrome]);

  // Paging with the controls hidden: the next photo's caption arrives
  // hidden too, before it paints.
  useIsomorphicLayoutEffect(() => {
    if (!chromeHiddenRef.current) {
      return;
    }
    for (const element of chromeElements()) {
      const animator = animatorFor(element);
      // Without Web Animations the animator writes styles and nothing runs
      // (the motion system's own reading, animatedLayout's movedByApp).
      const fading =
        typeof element.getAnimations === 'function' &&
        element.getAnimations().length > 0;
      if (animator.get('opacity') !== 0 && !fading) {
        animator.set({opacity: 0});
      }
    }
  });

  // Drag to dismiss, as in Photos: the backdrop and, faster, the controls
  // and the neighbouring photos fade with the drag's travel; a dismissal
  // fades them out on its spring and closes once the photo has left.
  // The backdrop's blur comes off while the backdrop moves and back once it
  // rests (the dialog's style, '::backdrop'). Each move counts: a release's
  // end restores it only if nothing has moved the backdrop since.
  const backdropMovesRef = useRef(0);
  const setBackdropMoving = useCallback((moving: boolean) => {
    const dialog = dialogRef.current;
    if (moving) {
      dialog?.style.setProperty('--_lightbox-backdrop-filter', 'none');
    } else {
      dialog?.style.removeProperty('--_lightbox-backdrop-filter');
    }
  }, []);

  const dismissFades = useCallback((): {
    backdrop: Animator | null;
    chrome: Animator[];
  } => {
    const dialog = dialogRef.current;
    const container = containerRef.current;
    if (dialog == null || container == null) {
      return {backdrop: null, chrome: []};
    }
    const chrome: HTMLElement[] = [];
    for (const element of container.querySelectorAll<HTMLElement>(
      '[data-lightbox-chrome], [data-lightbox-page]:not([data-current]), [data-lightbox-caption]',
    )) {
      if (
        element.parentElement?.closest(
          '[data-lightbox-page]:not([data-current])',
        ) == null
      ) {
        chrome.push(element);
      }
    }
    return {
      backdrop: animatorFor(dialog, {pseudoElement: '::backdrop'}),
      chrome: chrome.map(element => animatorFor(element)),
    };
  }, []);

  // The stage, for callbacks that run before this render returns it.
  const stageApiRef = useRef<ZoomStage | null>(null);
  // A dismissal in progress (a drag down or a pinch in): the backdrop, the
  // black behind the photo when it shows, and the controls and neighbouring
  // photos (hidden controls stay hidden).
  const fadeForDismissal = (backdropAlpha: number, chromeAlpha: number) => {
    const {backdrop, chrome} = dismissFades();
    markFaded(backdrop == null ? chrome : [backdrop, ...chrome]);
    // The backdrop fades without its blur while a drag or a pinch moves it.
    backdropMovesRef.current += 1;
    setBackdropMoving(true);
    backdrop?.set({opacity: backdropAlpha});
    const hidden = chromeHiddenRef.current;
    for (const animator of chrome) {
      animator.set({
        opacity: hidden && isChromeElement(animator.element) ? 0 : chromeAlpha,
      });
    }
    if (immersiveRef.current) {
      blackoutAnimator()?.set({opacity: backdropAlpha});
    }
  };
  // The zoom stage: the keyboard's zoom and pan, and the gestures of every
  // pointer, a mouse, a pen and a finger alike (spec:AST-094 FR43), whose
  // pinch (a ctrl-wheel's too) and pan (a wheel's too) give past their
  // limits and bounce back. The touch presentation, which the zoom
  // transition, the opener record and the gallery's buttons and arrow keys
  // read, is the shared touch resolver's.
  const {isTouch} = useTouchPresentation();
  // The opener is the element the viewer was opened from: a click or tap on
  // it (which a plain image, or a button in Safari, does not focus), else
  // the focused element. Only the touch presentation reads it, inside
  // `experimental`, through one listener every closed touch viewer shares
  // (spec:AST-094 FR24).
  useOpenerActivation(!isOpen && isTouch && isExperimental);
  const onDragStart = () => {
    didDragRef.current = true;
  };
  const zoom = useZoomCore({
    stageRef: isGallery ? pageMediaRef : imageWrapperRef,
    surfaceRef: isGallery ? trackRef : imageWrapperRef,
    isEnabled: isOpen && isZoomTarget,
    itemKey: viewedItem,
    onZoomedChange: next => {
      setIsZoomed(next);
      if (dialogRef.current?.open === true && isOpen) {
        announce(
          next
            ? t('@astryx.lightbox.zoomedIn')
            : t('@astryx.lightbox.zoomedOut'),
        );
        // Photos hides the controls as a gesture zooms, a mouse's, a pen's
        // or a finger's alike (spec:AST-094 FR43); a zoom from the keyboard
        // leaves them, so the keys that zoomed can reach them.
        if (lastInputRef.current !== 'keyboard') {
          setChrome({hidden: next, immersive: next});
        }
      }
    },
  });
  const stage = useZoomStage(zoom, {
    stageRef: isGallery ? pageMediaRef : imageWrapperRef,
    surfaceRef: isGallery ? trackRef : imageWrapperRef,
    isEnabled: isOpen && isZoomTarget,
    itemKey: viewedItem,
    onPinchZoomed: next => {
      // Photos hides them as the pinch passes the fitted size, not at the
      // lift; the return shows them once the photo is back at it.
      if (next) {
        setChrome({hidden: true, immersive: true});
      }
    },
    onTapPhoto: () => {
      // A page change before the tap was recognized calls it off: the next
      // photo keeps its controls.
      if (pressRef.current != null && pressRef.current.index !== index) {
        return;
      }
      const hidden = !chromeHiddenRef.current;
      // Zoomed, a tap toggles only the controls: the black stays.
      setChrome({
        hidden,
        immersive: stageApiRef.current?.isZoomed() === true ? true : hidden,
      });
    },
    // With the controls hidden, a tap beside the photo brings them back
    // (Photos' tap on the background) rather than closing unseen.
    onTapOutside: () => {
      if (pressRef.current != null && pressRef.current.index !== index) {
        return;
      }
      if (chromeHiddenRef.current) {
        setChrome({
          hidden: false,
          immersive: stageApiRef.current?.isZoomed() === true,
        });
      } else {
        handleClose();
      }
    },
    onDragStart,
    dismiss: {
      // Every pointer's, like the zoom's (spec:AST-094 FR43); a video keeps
      // its own controls' drags.
      isEnabled: isOpen && !isVideo,
      onDrag: travel => {
        fadeForDismissal(
          dismissBackdropAlpha(travel),
          dismissChromeAlpha(travel),
        );
      },
      // Photos' pinch to close fades them by the pinch's scale instead,
      // under any finger (one touch model).
      onPinch: isTouch
        ? scale => {
            fadeForDismissal(
              pinchCloseBackdropAlpha(scale),
              pinchCloseChromeAlpha(scale),
            );
          }
        : undefined,
      target: () => sourceBoxOf(sourceElementFor(index)),
      onRelease: (dismisses, touch) => {
        if (dismisses) {
          dismissedRef.current = true;
          let resolve = () => {};
          const landing = new Promise<void>(done => {
            resolve = done;
          });
          dismissLandingRef.current = {landing, resolve};
          // A photo shrinking into its thumbnail lands on the thumbnail's
          // picture, which fades in over it while the cell stays hidden.
          const source = sourceElementFor(index);
          const box = sourceBoxOf(source);
          const container = containerRef.current;
          const lifted =
            source != null && box != null && container != null
              ? liftCopy(source, {
                  host: container,
                  src: currentItem?.src ?? '',
                  attribute: 'data-lightbox-portal',
                })
              : null;
          if (lifted != null) {
            // Under the photo, as the transition's copy (zoomFromSource).
            lifted.element.style.zIndex = '-1';
            const portalAnimator = animatorFor(lifted.element);
            portalAnimator.set({opacity: 0});
            portalAnimator.animate(
              {opacity: 1},
              {spring: zoomMedia.dismiss.dismissSizeSpring},
              {touchRelease: touch},
            );
            restoreLanded();
            landedRef.current = lifted;
          }
        }
        const {backdrop, chrome} = dismissFades();
        markFaded(backdrop == null ? chrome : [backdrop, ...chrome]);
        const spring = dismisses
          ? zoomMedia.dismiss.dismissSizeSpring
          : zoomMedia.dismiss.cancelSizeSpring;
        // A cancel brings hidden controls back as Photos does, on their own
        // fade; the black stays.
        const returning = !dismisses && chromeHiddenRef.current;
        if (returning) {
          chromeHiddenRef.current = false;
          containerRef.current?.removeAttribute('data-chrome-hidden');
        }
        const opacity = dismisses ? 0 : 1;
        const move = (backdropMovesRef.current += 1);
        setBackdropMoving(true);
        const backdropMotion = backdrop?.animate(
          {opacity},
          {spring},
          {touchRelease: touch},
        );
        for (const animator of chrome) {
          if (returning && isChromeElement(animator.element)) {
            animator.play(
              {opacity: chromeFadeCurve(animator.get('opacity'), false)},
              {touchRelease: touch},
            );
          } else {
            animator.animate({opacity}, {spring}, {touchRelease: touch});
          }
        }
        if (immersiveRef.current) {
          blackoutAnimator()?.animate(
            {opacity},
            {spring},
            {touchRelease: touch},
          );
        }
        // Back at rest: the blur returns, unless the backdrop moved again.
        void backdropMotion?.finished.then(() => {
          if (!dismisses && backdropMovesRef.current === move) {
            setBackdropMoving(false);
          }
        });
        if (dismisses) {
          // The release decides the close and reports it from here, the
          // handler that caused it (architecture:react-component-runtime
          // INV2); the viewer stays until the photo has left or landed. A
          // caller may keep it open (the close is its call): the render after
          // its answer brings the photo, the backdrop and the controls back.
          handleClose();
          dismissalAnsweredRef.current = true;
          renderAfterDismissal();
        }
      },
      onDismissed: () => {
        // The photo has left or landed: the close it reported can end.
        dismissLandingRef.current?.resolve();
      },
    },
  });
  stageApiRef.current = stage;
  showHiddenChromeRef.current = () => {
    if (!chromeHiddenRef.current) {
      return false;
    }
    setChrome({hidden: false, immersive: stage.isZoomed()});
    return true;
  };

  // Open and close the dialog. Under the touch layer, with a source
  // (`experimental.sourceFor`, or inside `experimental` the element that
  // opened the viewer for the opened item),
  // the photo zooms out of it on open and back into the current item's on
  // close (UIKit's zoom transition); the dialog stays open, the page inert,
  // until the photo has landed. Where the primary pointer is fine the viewer
  // opens and closes at once, as it always has (spec:AST-017 FR59). Opening again after a dismissal or a transition puts the photo,
  // the backdrop and the controls back first. Only then: a write promotes
  // the layers, and their release later would repaint mid-gesture.
  const transitionRef = useRef({
    stage,
    dismissFades,
    restChrome,
    blackoutAnimator,
    setBackdropMoving,
    sourceElementFor,
    index,
    src: currentItem?.src ?? '',
    isImage: !isVideo,
    isTouch,
  });
  transitionRef.current = {
    stage,
    dismissFades,
    restChrome,
    blackoutAnimator,
    setBackdropMoving,
    sourceElementFor,
    index,
    src: currentItem?.src ?? '',
    isImage: !isVideo,
    isTouch,
  };
  const closeTokenRef = useRef(0);
  const openTokenRef = useRef(0);
  const openTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Ends the touch entrance's input hold (spec:AST-094 FR35) while one runs.
  const endEntranceRef = useRef<(() => void) | null>(null);
  // Aborts the transition in flight: its thumbnail shows again and its
  // portal goes (an unmount mid-transition).
  const transitionAbortRef = useRef<AbortController | null>(null);
  // The gallery's pager, for the opening (it is created further down).
  const pagerRef = useRef<Pager | null>(null);
  // Unmounted (a caller may render the viewer only while it is open): the
  // timers and continuations stop, and a thumbnail a landed photo or a
  // transition hid shows again.
  useEffect(
    () => () => {
      openTokenRef.current += 1;
      closeTokenRef.current += 1;
      clearTimeout(openTimerRef.current);
      endEntranceRef.current?.();
      transitionAbortRef.current?.abort();
      restoreLanded();
    },
    [restoreLanded],
  );
  // The dialog renders only with an item, so a viewer opened before its
  // first item arrives opens when that item does.
  const hasItem = currentItem != null;
  useIsomorphicLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (dialog == null || !hasItem) {
      return;
    }
    const now = transitionRef.current;
    // What fades with the transition: the backdrop and what shows over it
    // (hidden controls stay hidden; the black, when shown, goes with the
    // backdrop).
    const fadesNow = () => {
      const {backdrop, chrome} = now.dismissFades();
      const hidden = chromeHiddenRef.current;
      const fades = chrome.filter(
        animator => !(hidden && isChromeElement(animator.element)),
      );
      if (backdrop != null) {
        fades.unshift(backdrop);
      }
      const blackout = immersiveRef.current ? now.blackoutAnimator() : null;
      if (blackout != null) {
        fades.push(blackout);
      }
      return fades;
    };
    const restFades = () => {
      const {backdrop, chrome} = now.dismissFades();
      for (const animator of backdrop == null
        ? chrome
        : [backdrop, ...chrome]) {
        animator.set({opacity: 1});
      }
      now.restChrome();
    };
    // The transition starting now takes over from the one in flight, which
    // is let go once the new one has read where the photo shows (a close
    // turns an opening around from its progress).
    const transition = () => {
      const previous = transitionAbortRef.current;
      const controller = new AbortController();
      transitionAbortRef.current = controller;
      return {
        signal: controller.signal,
        release: () => previous?.abort(),
      };
    };
    if (isOpen) {
      // A close still landing is called off: the viewer stays.
      closeTokenRef.current += 1;
      dismissedRef.current = false;
      dismissLandingRef.current = null;
      restoreLanded();
      if (restoreFaded()) {
        now.stage.rest();
        restFades();
      }
      // At rest: the backdrop's blur is back (setBackdropMoving).
      backdropMovesRef.current += 1;
      now.setBackdropMoving(false);
      if (dialog.open) {
        return;
      }
      triggerElementRef.current = document.activeElement;
      const activation = takeOpenerActivation();
      // A click opened it (within this task's events): its target, or the
      // button or link around it, is the opener.
      openerRef.current =
        activation != null &&
        activation.target.isConnected &&
        Date.now() - activation.time < 1000
          ? (activation.target.closest('button, a') ?? activation.target)
          : document.activeElement;
      openedIndexRef.current = now.index;
      dialog.showModal();
      // Opened on another page: the pager is there at once, unanimated (its
      // own sync, an Effect, would slide there during the opening). It lands
      // the track at the shown viewer's width before the first frame.
      const pagerNow = pagerRef.current;
      if (pagerNow != null && pagerNow.index !== now.index) {
        pagerNow.goTo(now.index, {animated: false, reason: 'controlled'});
      }
      const source =
        now.isImage && now.isTouch ? now.sourceElementFor(now.index) : null;
      const container = containerRef.current;
      // The current page's photo in a gallery, else the one photo: queried in
      // that order, as the media group holds every page of a gallery.
      const img =
        container?.querySelector<HTMLImageElement>('[data-current] img') ??
        container?.querySelector<HTMLImageElement>(
          ':scope > [data-lightbox-media] img',
        );
      if (source != null && container != null && img != null) {
        // Under a finger, a tap or a drag that lands while the viewer
        // enters is held until the opening ends, as UIKit delivers no touch
        // while a presentation runs (spec:AST-094 FR35): the Layer module's
        // hold, which leaves keys and assistive technology live.
        endEntranceRef.current?.();
        let endEntrance = () => {};
        const entering = new Promise<void>(resolve => {
          endEntrance = resolve;
        });
        endEntranceRef.current = endEntrance;
        holdInput(dialog, {until: entering, scope: 'viewport'});
        const token = ++openTokenRef.current;
        const start = () => {
          if (openTokenRef.current !== token) {
            return;
          }
          openTokenRef.current += 1;
          clearTimeout(openTimerRef.current);
          img.style.opacity = '';
          // The opened page may not rest in the viewport yet (the pager lands
          // it before the first frame): the opening aims where it will rest.
          const page = img.closest<HTMLElement>('[data-lightbox-page]');
          const viewport = imageWrapperRef.current;
          const offset =
            page != null && viewport != null
              ? viewport.getBoundingClientRect().left -
                page.getBoundingClientRect().left
              : 0;
          const fades = fadesNow();
          const next = transition();
          const opening = zoomFromSource({
            kind: 'open',
            source,
            container,
            stage: now.stage,
            fades,
            src: now.src,
            signal: next.signal,
            offset,
          });
          next.release();
          if (opening != null) {
            markFaded(fades);
            // The backdrop fades without its blur until the photo lands.
            const move = (backdropMovesRef.current += 1);
            now.setBackdropMoving(true);
            const landed = () => {
              if (backdropMovesRef.current === move) {
                now.setBackdropMoving(false);
              }
              endEntrance();
            };
            void opening.then(landed, landed);
          } else {
            // No zoom after all: what waited at its first value comes back.
            restoreFaded();
            endEntrance();
          }
        };
        if (img.complete && img.naturalWidth > 0 && img.offsetWidth > 0) {
          start();
        } else {
          // Not decoded, or not laid out yet (a page the opening mounts has
          // no size until its picture applies, even from the cache): the
          // photo stays hidden (the thumbnail shows) until it can zoom, at
          // most a moment.
          img.style.opacity = '0';
          // Meanwhile the backdrop and the controls wait at the opening's
          // first value, so the dim never shows at full before it fades in.
          const waiting = fadesNow();
          markFaded(waiting);
          const first = openingFadeStart(container);
          for (const animator of waiting) {
            animator.set({opacity: first});
          }
          if (typeof img.decode === 'function') {
            img.decode().then(start, start);
          }
          openTimerRef.current = setTimeout(start, OPEN_DECODE_WAIT_MS);
        }
      }
      return;
    }
    // A zoom-in still waiting for its photo is called off, and so is the
    // entrance's hold: a close (an Escape mid-opening) ends the entrance.
    openTokenRef.current += 1;
    clearTimeout(openTimerRef.current);
    endEntranceRef.current?.();
    endEntranceRef.current = null;
    if (!dialog.open) {
      return;
    }
    const finish = () => {
      restoreLanded();
      dismissedRef.current = false;
      dismissLandingRef.current = null;
      dialog.close();
      if (restoreFaded()) {
        now.stage.rest();
        restFades();
      }
      now.restChrome();
      if (triggerElementRef.current instanceof HTMLElement) {
        triggerElementRef.current.focus();
      }
    };
    // A dismissed photo still leaving or landing: the viewer closes once it
    // has (the release reported the close).
    const landing = dismissedRef.current
      ? dismissLandingRef.current?.landing
      : undefined;
    if (landing != null) {
      const token = ++closeTokenRef.current;
      void landing.then(() => {
        if (closeTokenRef.current === token) {
          finish();
        }
      });
      return;
    }
    const container = containerRef.current;
    const source =
      !dismissedRef.current && now.isImage && now.isTouch
        ? now.sourceElementFor(now.index)
        : null;
    const fades = fadesNow();
    const next = transition();
    const closing =
      source != null && container != null
        ? zoomFromSource({
            kind: 'close',
            source,
            container,
            stage: now.stage,
            fades,
            src: now.src,
            signal: next.signal,
          })
        : null;
    next.release();
    if (closing == null) {
      finish();
      return;
    }
    markFaded(fades);
    // The backdrop fades without its blur while the photo returns.
    backdropMovesRef.current += 1;
    now.setBackdropMoving(true);
    const token = ++closeTokenRef.current;
    void closing.then(() => {
      if (closeTokenRef.current === token) {
        finish();
      }
    });
  }, [isOpen, hasItem]);
  useIsomorphicLayoutEffect(() => {
    if (!dismissalAnsweredRef.current) {
      return;
    }
    dismissalAnsweredRef.current = false;
    if (isOpen) {
      // Kept open: the landing is called off.
      dismissedRef.current = false;
      dismissLandingRef.current = null;
      restoreLanded();
      stage.rest();
      restoreFaded();
      restChrome();
      backdropMovesRef.current += 1;
      setBackdropMoving(false);
    }
  });

  // A gallery pages like Photos: a drag or flick moves between items on a
  // UIKit paging scroll view's release (one page at most, Photos' 40 pt
  // gap); the buttons and keys move there on `setContentOffset(animated:)`.
  // A zoomed photo keeps the drag until its edge, then the pager takes the
  // next one; the photo left behind returns to the fitted size once the
  // pager rests (Photos does).
  // A controlled parent can keep its index after a swipe (refuse it): the
  // pager goes back to the photo the parent shows. A swipe's report renders
  // once more so that check runs after the parent has answered.
  const swipeReportRef = useRef<number | null>(null);
  const [, renderAfterSwipe] = useReducer((n: number) => n + 1, 0);
  const pager = usePager({
    viewportRef: imageWrapperRef,
    trackRef,
    count: mediaArray.length,
    gap: zoomMedia.viewer.pageGap,
    index,
    isPanEnabled: isOpen && isGallery,
    // Every pointer pages, a mouse's drag and a trackpad's scroll included
    // (spec:AST-094 FR43).
    panOptions: {
      allowedPointerTypes: ['touch', 'pen', 'mouse'],
      maximumNumberOfTouches: 1,
    },
    shouldBeginPan: direction => !stage.isZoomed() || stage.isAtEdge(direction),
    onIndexChange: (next, reason) => {
      if (reason === 'drag') {
        setIndex(next);
        if (isControlled) {
          swipeReportRef.current = next;
          renderAfterSwipe();
        }
      }
    },
    onSettle: () => {
      for (const img of trackRef.current?.querySelectorAll<HTMLElement>(
        '[data-lightbox-page]:not([data-current]) img',
      ) ?? []) {
        img.style.translate = '';
        img.style.scale = '';
      }
    },
  });
  pagerRef.current = pager;

  useEffect(() => {
    const reported = swipeReportRef.current;
    swipeReportRef.current = null;
    if (reported != null && index !== reported && pager.index !== index) {
      pager.goTo(index, {reason: 'controlled'});
    }
  });

  // Gallery navigation. Under a finger the pager slides to the new page (a
  // paging scroll view's setContentOffset). Where the primary pointer is
  // fine, the buttons and the arrow keys show the new item at once, as they
  // always have (spec:AST-017 FR59): the pager moves there first, so the
  // controlled sync finds nothing to animate, and it returns to `index` if
  // the owner refuses the change. While a closing photo lands, nothing pages
  // the closed viewer.
  const showIndex = useCallback(
    (next: number) => {
      if (!isTouch) {
        pager.goTo(next, {animated: false});
      }
      setIndex(next);
    },
    [isTouch, pager, setIndex],
  );

  const goToPrev = useCallback(() => {
    if (isOpen && canPrev) {
      showIndex(index - 1);
    }
  }, [isOpen, canPrev, index, showIndex]);

  const goToNext = useCallback(() => {
    if (isOpen && canNext) {
      showIndex(index + 1);
    }
  }, [isOpen, canNext, index, showIndex]);

  // Keyboard navigation. While zoomed, arrows pan the image (matching common
  // lightbox conventions); when not zoomed they navigate the gallery.
  //
  // Gallery arrows follow the rendered direction, resolved at keydown: in RTL
  // the Next button sits on the left, so ArrowLeft goes to the next item and
  // ArrowRight to the previous one. Panning stays physical in both directions:
  // the image itself is not mirrored, so ArrowRight still reveals what is to
  // its right.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // While a closing photo lands, keys neither page nor zoom it.
      if (!isOpen) {
        return;
      }
      if (isZoomTarget) {
        if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          stage.zoomIn();
          return;
        }
        if (e.key === '-') {
          e.preventDefault();
          stage.zoomOut();
          return;
        }
        if (stage.isZoomed() && KEYBOARD_PAN_OFFSETS[e.key] !== undefined) {
          e.preventDefault();
          const [dx, dy] = KEYBOARD_PAN_OFFSETS[e.key];
          stage.panBy(dx, dy);
          return;
        }
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const towardEnd =
          (e.key === 'ArrowRight') !== isRtlElement(dialogRef.current);
        if (towardEnd) {
          goToNext();
        } else {
          goToPrev();
        }
      }
    },
    [isOpen, isZoomTarget, stage, goToPrev, goToNext],
  );

  // Enter/Space on the focused image wrapper (role="button") toggles zoom.
  const handleImageKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isOpen && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        stage.toggle();
      }
    },
    [isOpen, stage],
  );

  if (!currentItem) {
    return null;
  }

  const renderMedia = (
    {src, alt, type: kind = 'image'}: LightboxMedia,
    isCurrent: boolean,
  ) =>
    kind === 'video' ? (
      <video
        src={src}
        aria-label={alt}
        controls
        autoPlay={isCurrent && hasAutoPlay}
        preload={isCurrent ? 'auto' : 'metadata'}
        {...stylex.props(styles.video)}
      />
    ) : (
      <img
        ref={isCurrent ? stage.contentRef : undefined}
        src={src}
        alt={isCurrent ? alt : ''}
        aria-hidden={isCurrent ? undefined : true}
        draggable={false}
        {...stylex.props(styles.image)}
      />
    );
  // The current item and its neighbours; the pager shows one at rest.
  const pageIndexes = isGallery
    ? [index - 1, index, index + 1].filter(i => i >= 0 && i < mediaArray.length)
    : [];
  // The captions no rendered page shows: the current page lays them out,
  // unseen, in the caption row, so the row stays as tall as the gallery's
  // tallest caption whichever pages are rendered, and paging never resizes
  // the photo row.
  const unrenderedCaptions = isGallery
    ? mediaArray.flatMap((item, i) =>
        item.caption && !pageIndexes.includes(i) ? [i] : [],
      )
    : [];

  return (
    <dialog
      ref={mergedDialogRef}
      onCancel={handleCancel}
      onClose={() => {
        // A close that a reopen overtook (the event is queued) leaves the
        // viewer presented.
        if (dialogRef.current?.open !== true) {
          setIsPresented(false);
        }
      }}
      onClick={e => {
        handleBackdropClick(e);
        onClickProp?.(e);
      }}
      onKeyDown={e => {
        handleKeyDown(e);
        onKeyDownProp?.(e);
      }}
      aria-label={currentItem.alt || t('@astryx.lightbox.mediaViewer')}
      {...mergeProps(
        themeProps('lightbox'),
        stylex.props(
          layerTextReset.reset,
          layerStructureReset.reset,
          styles.dialog,
          overlayPaddingReset.reset,
          xstyle,
        ),
        className,
        style,
      )}
      {...props}>
      <LayerDepthProvider>
        <ModalAnnounceProvider dialogRef={dialogRef} isOpen={isOpen}>
          <LayerContentBoundary>
            <div
              ref={containerRef}
              {...stylex.props(styles.container, lightboxScope)}>
              <div
                data-lightbox-chrome=""
                {...stylex.props(styles.chromeLayer)}>
                {/* Close button */}
                <IconButton
                  icon={<Icon icon="close" size="sm" color="inherit" />}
                  label={t('@astryx.lightbox.close')}
                  variant="ghost"
                  onClick={handleClose}
                  xstyle={[styles.closeButton, styles.controlButton]}
                />

                {/* Gallery nav: prev — stays mounted and is disabled at the start of
            the range so pressing/arrowing to the boundary doesn't unmount the
            focused control and drop focus to <body>. */}
                {isGallery && (
                  <IconButton
                    icon={
                      <Icon
                        icon="chevronLeft"
                        size="sm"
                        color="inherit"
                        xstyle={rtlStyles.mirror}
                      />
                    }
                    label={t('@astryx.lightbox.previous')}
                    variant="ghost"
                    isDisabled={!canPrev}
                    onClick={goToPrev}
                    xstyle={[
                      styles.navButton,
                      styles.navPrev,
                      styles.controlButton,
                    ]}
                  />
                )}
              </div>

              {/* Media + caption group (centered together) */}
              <div
                data-lightbox-media=""
                {...stylex.props(
                  styles.mediaGroup,
                  isZoomTarget && !isGallery && styles.mediaGroupZoom,
                  isGallery && styles.mediaGroupGallery,
                )}>
                <div
                  ref={imageWrapperRef}
                  // The wrapper is a keyboard-operable zoom toggle when zoom is
                  // enabled: Enter/Space toggles, aria-pressed reflects state.
                  role={isZoomTarget ? 'button' : undefined}
                  tabIndex={isZoomTarget ? 0 : undefined}
                  aria-pressed={isZoomTarget ? isZoomed : undefined}
                  aria-label={
                    isZoomTarget ? t('@astryx.lightbox.zoom') : undefined
                  }
                  {...stylex.props(
                    styles.imageWrapper,
                    isGallery && styles.imageWrapperGallery,
                    isZoomTarget && !isGallery && styles.imageWrapperZoomTarget,
                    isZoomTarget && !isGallery && styles.imageWrapperFill,
                    !isZoomTarget &&
                      !isVideo &&
                      !isGallery &&
                      styles.imageWrapperDismissTarget,
                    isZoomTarget && focusOutlineStyles.focusVisible,
                    isZoomTarget && !isZoomed && styles.imageWrapperZoomable,
                    isZoomTarget && isZoomed && styles.imageWrapperZoomed,
                  )}
                  onKeyDown={isZoomTarget ? handleImageKeyDown : undefined}
                  onPointerDown={e => {
                    didDragRef.current = false;
                    pressRef.current = {x: e.clientX, y: e.clientY, index};
                  }}>
                  {isGallery ? (
                    <div
                      ref={trackRef}
                      {...stylex.props(
                        styles.track,
                        isZoomTarget && styles.trackZoomTarget,
                        !isZoomTarget &&
                          !isVideo &&
                          styles.imageWrapperDismissTarget,
                      )}>
                      {pageIndexes.map(i => (
                        <div
                          key={i}
                          data-lightbox-page=""
                          data-current={i === index ? '' : undefined}
                          // Only the current page is on screen at rest: the
                          // others stay out of the tab order and the
                          // accessibility tree.
                          inert={i !== index ? true : undefined}
                          aria-hidden={i !== index ? true : undefined}
                          {...stylex.props(
                            styles.page,
                            pageStyles.position(i),
                          )}>
                          <div
                            ref={i === index ? pageMediaRef : undefined}
                            data-lightbox-page-media=""
                            {...stylex.props(styles.pageMedia)}>
                            {renderMedia(mediaArray[i], i === index)}
                          </div>
                          {i === index && unrenderedCaptions.length > 0 ? (
                            <div {...stylex.props(styles.pageCaptionRow)}>
                              {mediaArray[i].caption && (
                                <div
                                  data-lightbox-caption=""
                                  {...stylex.props(
                                    styles.caption,
                                    styles.captionStacked,
                                  )}>
                                  {mediaArray[i].caption}
                                </div>
                              )}
                              <div
                                aria-hidden
                                inert
                                {...stylex.props(
                                  styles.captionStacked,
                                  styles.captionSizer,
                                )}>
                                {unrenderedCaptions.map(j => (
                                  <div
                                    key={j}
                                    {...stylex.props(
                                      styles.caption,
                                      styles.captionStacked,
                                    )}>
                                    {mediaArray[j].caption}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            mediaArray[i].caption && (
                              <div
                                data-lightbox-caption=""
                                {...stylex.props(
                                  styles.caption,
                                  styles.pageCaption,
                                )}>
                                {mediaArray[i].caption}
                              </div>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    renderMedia(currentItem, true)
                  )}
                </div>

                {!isGallery && currentItem.caption && (
                  <div
                    data-lightbox-caption=""
                    {...stylex.props(styles.caption)}>
                    {currentItem.caption}
                  </div>
                )}
              </div>

              <div
                data-lightbox-chrome=""
                {...stylex.props(styles.chromeLayer)}>
                {/* Gallery nav: next — see "prev" above; stays mounted and disabled at
            the end of the range instead of unmounting. */}
                {isGallery && (
                  <IconButton
                    icon={
                      <Icon
                        icon="chevronRight"
                        size="sm"
                        color="inherit"
                        xstyle={rtlStyles.mirror}
                      />
                    }
                    label={t('@astryx.lightbox.next')}
                    variant="ghost"
                    isDisabled={!canNext}
                    onClick={goToNext}
                    xstyle={[
                      styles.navButton,
                      styles.navNext,
                      styles.controlButton,
                    ]}
                  />
                )}

                {/* Gallery counter */}
                {isGallery && mediaArray.length > 1 && (
                  <div {...stylex.props(styles.counter)}>
                    {index + 1} / {mediaArray.length}
                  </div>
                )}
              </div>
            </div>
          </LayerContentBoundary>
        </ModalAnnounceProvider>
      </LayerDepthProvider>
    </dialog>
  );
}

Lightbox.displayName = 'Lightbox';
