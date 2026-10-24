// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Lightbox.tsx
 * @input Uses React, native dialog, StyleX, IconButton, theme tokens, layerTextReset, layerStructureReset,
 *   isRtlElement (gallery arrow keys follow the rendered direction), useZoomStage (pinch, double
 *   tap and pan on the gesture recognizers, moved by the compositor animator), usePager (a gallery
 *   pages like Photos: a UIKit paging scroll view with Photos' 40 pt gap), and the compositor
 *   animator for Photos' drag to dismiss (the backdrop and the controls' layers fade with the drag)
 * @output Exports Lightbox component, LightboxProps, LightboxMedia
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Lightbox/Lightbox.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Lightbox/Lightbox.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Lightbox/useZoomStage.ts (zoom and pan driver)
 * - /packages/core/src/Lightbox/__tests__/LightboxZoom.interaction.browser.spec.ts (touch zoom proofs)
 * - /packages/core/src/Lightbox/__tests__/LightboxPaging.interaction.browser.spec.ts (gallery paging proofs)
 * - /packages/core/src/Lightbox/index.ts (exports if types change)
 * - /packages/core/src/Layer/useLayerDismissal.ts (dismissal stack)
 * - /apps/storybook/stories/Lightbox.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/Lightbox/ (showcase blocks)
 */

import {
  useCallback,
  useEffect,
  useMemo,
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
import {overlayPaddingReset} from '../Layout/padding.stylex';
import {LayerDepthProvider} from '../Layer/LayerDepthContext';
import {useLayerDismissal} from '../Layer/useLayerDismissal';
import {useTranslator} from '../i18n';

import {useMergedRefs} from '../hooks/useMergedRefs';
import {isRtlElement} from '../hooks/isRtlElement';
import {usePager} from '../hooks/usePager';
import {animatorFor, type Animator} from '../motion/animator';
import {zoomMedia} from '../motion/uikit/zoomMedia';
import {useZoomStage} from './useZoomStage';
import {dismissBackdropAlpha, dismissChromeAlpha} from './zoomStage';
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
   * Callback when the gallery index changes via prev/next navigation.
   */
  onIndexChange?: (index: number) => void;
  /**
   * Enable zoom (images only): pinch, double-tap or double-click to zoom in
   * at that point, or Enter/Space/`+`/`-` via keyboard. When zoomed, drag
   * or use arrow keys to pan.
   * @default false
   */
  hasZoom?: boolean;
  /**
   * Whether video should autoplay when the lightbox opens.
   * @default false
   */
  hasAutoPlay?: boolean;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  dialog: {
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100vh',
    maxWidth: 'none',
    maxHeight: 'none',
    margin: 0,
    padding: 0,
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    outline: 'none',
    '::backdrop': {
      backgroundColor: colorVars['--color-overlay'],
      backdropFilter: 'blur(2px)',
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
  },
  mediaGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    // On a touch screen the photo's stage fills the viewer, as a photo
    // viewer's zooming scroll view does: a zoomed photo uses the whole
    // screen and a pinch can start anywhere around it.
    alignSelf: {default: null, '@media (pointer: coarse)': 'stretch'},
    flexGrow: {default: null, '@media (pointer: coarse)': 1},
    minHeight: {default: null, '@media (pointer: coarse)': 0},
  },
  imageWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    cursor: 'default',
    userSelect: 'none',
    minHeight: 0,
    alignSelf: {default: null, '@media (pointer: coarse)': 'stretch'},
    flexGrow: {default: null, '@media (pointer: coarse)': 1},
    flexShrink: {default: null, '@media (pointer: coarse)': 1},
    flexBasis: {default: null, '@media (pointer: coarse)': 0},
  },
  // The stage's own pinch, pan and double tap take every touch on it. Only
  // the stage: the controls and caption leave pinch-zoom to the page. In a
  // gallery this goes on the track: the pager's pan manages the stage's own
  // `touch-action`.
  imageWrapperZoomTarget: {
    touchAction: 'none',
  },
  // A photo without zoom leaves pinch-zoom to the page but takes one-finger
  // drags: a drag down dismisses it.
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
  track: {
    position: 'absolute',
    inset: 0,
  },
  // One page per item, the stage's size, at index × (width + gap). Each on
  // its own layer: through a busy main thread Mobile Safari moves the track
  // but cannot paint what it had not painted, so a page that slides in must
  // be painted whole before it moves.
  page: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    willChange: 'transform',
  },
  // A page's photo box: the zoom stage of the current page. Its caption sits
  // below it, so the viewer's size never changes with the item.
  pageMedia: {
    alignSelf: 'stretch',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minHeight: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
    pointerEvents: 'auto',
  },
  // The controls sit in layers over the viewer that pass clicks through. A
  // drag to dismiss fades the layers, which carry no transition of their own
  // (a Button's opacity transition would trail the finger).
  chromeLayer: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
});

const pageStyles = stylex.create({
  position: (index: number) => ({
    insetInlineStart: `calc(${index} * (100% + ${zoomMedia.viewer.pageGap}px))`,
  }),
});

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
 * zoom like a photo viewer on iOS: pinch about the fingers (with the give
 * past the limits and the eased return), double-tap or double-click to zoom
 * in at that point and back, Enter/Space on the image or `+`/`-` from the
 * keyboard; and pan (drag, with momentum and the rubber band at the edges, or
 * arrow keys when zoomed; arrows navigate the gallery when not zoomed).
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
  const mergedDialogRef = useMergedRefs(ref, dialogRef);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  // A gallery's zoom stage: the current page's photo box.
  const pageMediaRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<Element | null>(null);

  // Index state (controlled + uncontrolled)
  const isControlled = controlledIndex !== undefined;
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const index = isControlled ? controlledIndex : uncontrolledIndex;

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
  // cursor. The zoom and pan themselves live outside React (useZoomStage).
  const [isZoomed, setIsZoomed] = useState(false);

  // Resolve current media item
  const mediaArray = useMemo(
    () => (Array.isArray(media) ? media : [media]),
    [media],
  );
  const isGallery = mediaArray.length > 1;
  const currentItem =
    mediaArray.length > 0
      ? mediaArray[Math.min(index, mediaArray.length - 1)]
      : null;
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
    const item = mediaArray[Math.min(index, mediaArray.length - 1)];
    const position = {index: index + 1, total: mediaArray.length};
    announce(
      item?.alt
        ? t('@astryx.lightbox.mediaPosition', {alt: item.alt, ...position})
        : t('@astryx.lightbox.imagePosition', position),
    );
  }, [index, isOpen, announce, mediaArray, t]);

  // Open/close dialog
  useIsomorphicLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      triggerElementRef.current = document.activeElement;
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
      if (triggerElementRef.current instanceof HTMLElement) {
        triggerElementRef.current.focus();
      }
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const {shouldDismissOnCloseRequest} = useLayerDismissal({
    isActive: isOpen,
    onDismiss: handleClose,
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
  const handleBackdropClick = useCallback(
    (e: ReactMouseEvent<HTMLDialogElement>) => {
      if (didDragRef.current) {
        didDragRef.current = false;
        return;
      }
      if (e.target === e.currentTarget || e.target === containerRef.current) {
        handleClose();
        return;
      }
      // A gallery's stage fills the viewer: a click on it beside the media is
      // a backdrop click too. With zoom on, the stage's own tap handles it
      // (after the double-tap interval).
      const target = e.target as Element;
      if (
        isGallery &&
        !(hasZoom && !isVideo) &&
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

  // Gallery navigation
  const goToPrev = useCallback(() => {
    if (canPrev) {
      setIndex(index - 1);
    }
  }, [canPrev, index, setIndex]);

  const goToNext = useCallback(() => {
    if (canNext) {
      setIndex(index + 1);
    }
  }, [canNext, index, setIndex]);

  // Zoom: pinch, double tap or double-click, Enter/Space on the image, or
  // +/- keys. Zoom changes are silent to assistive tech (only the transform
  // changes), so mirror them in the polite live region, including a hint that
  // arrow keys pan while zoomed. A tap on the dark area around the photo
  // closes, as a click on the backdrop does.
  const isZoomTarget = hasZoom && !isVideo;
  // The backdrop and the controls carry a dismissal's fade.
  const fadedRef = useRef(false);

  // Drag to dismiss, as in Photos: the backdrop and, faster, the controls
  // and the neighbouring photos fade with the drag's travel; a dismissal
  // fades them out on its spring and closes once the photo has left.
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

  const stage = useZoomStage({
    stageRef: isGallery ? pageMediaRef : imageWrapperRef,
    surfaceRef: isGallery ? trackRef : imageWrapperRef,
    isEnabled: isOpen && isZoomTarget,
    itemKey: viewedItem,
    onZoomedChange: next => {
      setIsZoomed(next);
      announce(
        next ? t('@astryx.lightbox.zoomedIn') : t('@astryx.lightbox.zoomedOut'),
      );
    },
    onTapOutside: handleClose,
    onDragStart: () => {
      didDragRef.current = true;
    },
    dismiss: {
      isEnabled: isOpen && !isVideo,
      onDrag: travel => {
        fadedRef.current = true;
        const {backdrop, chrome} = dismissFades();
        backdrop?.set({opacity: dismissBackdropAlpha(travel)});
        const opacity = dismissChromeAlpha(travel);
        for (const animator of chrome) {
          animator.set({opacity});
        }
      },
      onRelease: dismisses => {
        const {backdrop, chrome} = dismissFades();
        const spring = dismisses
          ? zoomMedia.dismiss.dismissSizeSpring
          : zoomMedia.dismiss.cancelSizeSpring;
        const opacity = dismisses ? 0 : 1;
        for (const animator of backdrop == null
          ? chrome
          : [backdrop, ...chrome]) {
          animator.animate({opacity}, {spring}, {reducedMotion: 'keep'});
        }
      },
      onDismissed: handleClose,
    },
  });

  // Opening again after a dismissal: the photo, the backdrop and the
  // controls are back. Only then: a write promotes the layers, and their
  // release later would repaint mid-gesture.
  const stageForOpenRef = useRef(stage);
  stageForOpenRef.current = stage;
  useIsomorphicLayoutEffect(() => {
    if (!isOpen) {
      return;
    }
    stageForOpenRef.current.reset();
    if (!fadedRef.current) {
      return;
    }
    fadedRef.current = false;
    const {backdrop, chrome} = dismissFades();
    for (const animator of backdrop == null ? chrome : [backdrop, ...chrome]) {
      animator.set({opacity: 1});
    }
  }, [isOpen, dismissFades]);

  // A gallery pages like Photos: a drag or flick moves between items on a
  // UIKit paging scroll view's release (one page at most, Photos' 40 pt
  // gap); the buttons and keys move there on `setContentOffset(animated:)`.
  // A zoomed photo keeps the drag until its edge, then the pager takes the
  // next one; the photo left behind returns to the fitted size once the
  // pager rests (Photos does).
  usePager({
    viewportRef: imageWrapperRef,
    trackRef,
    count: mediaArray.length,
    gap: zoomMedia.viewer.pageGap,
    index,
    isPanEnabled: isOpen && isGallery,
    panOptions: {
      allowedPointerTypes: ['touch', 'pen'],
      maximumNumberOfTouches: 1,
    },
    shouldBeginPan: direction => !stage.isZoomed() || stage.isAtEdge(direction),
    onIndexChange: (next, reason) => {
      if (reason === 'drag') {
        setIndex(next);
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
    [isZoomTarget, stage, goToPrev, goToNext],
  );

  // Enter/Space on the focused image wrapper (role="button") toggles zoom.
  const handleImageKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        stage.toggle();
      }
    },
    [stage],
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

  return (
    <dialog
      ref={mergedDialogRef}
      onCancel={handleCancel}
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
        <LayerContentBoundary>
          <div ref={containerRef} {...stylex.props(styles.container)}>
            <div data-lightbox-chrome="" {...stylex.props(styles.chromeLayer)}>
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
                  !isZoomTarget &&
                    !isVideo &&
                    !isGallery &&
                    styles.imageWrapperDismissTarget,
                  isZoomTarget && focusOutlineStyles.focusVisible,
                  isZoomTarget && !isZoomed && styles.imageWrapperZoomable,
                  isZoomTarget && isZoomed && styles.imageWrapperZoomed,
                )}
                onKeyDown={isZoomTarget ? handleImageKeyDown : undefined}
                onPointerDown={() => {
                  didDragRef.current = false;
                }}>
                {isGallery ? (
                  <div
                    ref={trackRef}
                    {...stylex.props(
                      styles.track,
                      isZoomTarget && styles.imageWrapperZoomTarget,
                      !isZoomTarget &&
                        !isVideo &&
                        styles.imageWrapperDismissTarget,
                    )}>
                    {pageIndexes.map(i => (
                      <div
                        key={i}
                        data-lightbox-page=""
                        data-current={i === index ? '' : undefined}
                        {...stylex.props(styles.page, pageStyles.position(i))}>
                        <div
                          ref={i === index ? pageMediaRef : undefined}
                          data-lightbox-page-media=""
                          {...stylex.props(styles.pageMedia)}>
                          {renderMedia(mediaArray[i], i === index)}
                        </div>
                        {mediaArray[i].caption && (
                          <div
                            data-lightbox-caption=""
                            {...stylex.props(styles.caption)}>
                            {mediaArray[i].caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  renderMedia(currentItem, true)
                )}
              </div>

              {!isGallery && currentItem.caption && (
                <div data-lightbox-caption="" {...stylex.props(styles.caption)}>
                  {currentItem.caption}
                </div>
              )}
            </div>

            <div data-lightbox-chrome="" {...stylex.props(styles.chromeLayer)}>
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
      </LayerDepthProvider>
    </dialog>
  );
}

Lightbox.displayName = 'Lightbox';
