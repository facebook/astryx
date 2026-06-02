// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSLightbox.tsx
 * @input Uses React, native dialog, StyleX, XDSIconButton, theme tokens
 * @output Exports XDSLightbox component, XDSLightboxProps, XDSLightboxMedia
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Lightbox/Lightbox.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Lightbox/XDSLightbox.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Lightbox/index.ts (exports if types change)
 * - /apps/storybook/stories/Lightbox.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Lightbox/ (showcase blocks)
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars, typeScaleVars} from '../theme/tokens.stylex';
import {XDSIcon} from '../Icon';
import {XDSIconButton} from '../IconButton';
import {useScrollLock} from '../hooks/useScrollLock';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {xdsClassName, mergeProps, mergeRefs} from '../utils';
import type {XDSBaseProps} from '../XDSBaseProps';

/**
 * Media type for lightbox items.
 */
export type XDSLightboxMediaType = 'image' | 'video';

/**
 * Describes a single media item in a lightbox.
 */
export interface XDSLightboxMedia {
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
  type?: XDSLightboxMediaType;
}

export interface XDSLightboxProps extends XDSBaseProps<HTMLDialogElement> {
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
  media: XDSLightboxMedia | XDSLightboxMedia[];
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
   * Enable zoom on double-click (images only).
   * When zoomed, drag to pan.
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
    border: 'none',
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
  },
  imageWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    cursor: 'default',
    userSelect: 'none',
    minHeight: 0,
  },
  imageWrapperZoomable: {
    cursor: {
      default: 'zoom-in',
      '@media (hover: hover)': 'zoom-in',
    },
  },
  imageWrapperZoomed: {
    cursor: 'grab',
  },
  imageWrapperDragging: {
    cursor: 'grabbing',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    pointerEvents: 'none',
    transitionProperty: 'transform',
    transitionDuration: {
      default: '200ms',
      '@media (prefers-reduced-motion: reduce)': '0ms',
    },
    transitionTimingFunction: 'ease-out',
  },
  imageDragging: {
    transitionProperty: 'none',
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
    right: spacingVars['--spacing-3'],
    zIndex: 1,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 1,
  },
  navPrev: {
    left: spacingVars['--spacing-3'],
  },
  navNext: {
    right: spacingVars['--spacing-3'],
  },
  counter: {
    position: 'absolute',
    top: spacingVars['--spacing-3'],
    left: spacingVars['--spacing-3'],
    color: colorVars['--color-on-dark'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    zIndex: 1,
  },
  controlButton: {
    color: colorVars['--color-on-dark'],
  },
});

const dynamicStyles = stylex.create({
  imageTransform: (transform: string) => ({
    transform,
  }),
});

/**
 * A fullscreen overlay for viewing images at full resolution.
 *
 * Supports single image and gallery modes. In gallery mode, provides
 * prev/next navigation via buttons and arrow keys. Optionally supports
 * zoom (double-click to toggle 2x) and pan (drag when zoomed).
 *
 * Uses the native `<dialog>` element with `showModal()` for focus
 * trapping and top-layer placement. Dismiss via Escape, close button,
 * or backdrop click.
 *
 * @example
 * ```
 * <XDSLightbox
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   media={{src: "/photo.jpg", alt: "A photo"}}
 * />
 * <XDSLightbox
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   media={photos}
 * />
 * <XDSLightbox
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 *   media={photos}
 *   index={currentIndex}
 *   onIndexChange={setCurrentIndex}
 * />
 * ```
 */
export function XDSLightbox({
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
}: XDSLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
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

  // Zoom/pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({x: 0, y: 0});
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({x: 0, y: 0, panX: 0, panY: 0});

  // Resolve current media item
  const mediaArray = Array.isArray(media) ? media : [media];
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

  // Reset zoom on image change
  useEffect(() => {
    // Reset image view state when the active media item changes.
    // eslint-disable-next-line @eslint-react/set-state-in-effect
    setZoom(1);
    // eslint-disable-next-line @eslint-react/set-state-in-effect
    setPan({x: 0, y: 0});
  }, [index, currentItem?.src]);

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

  // Escape key
  const handleCancel = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      handleClose();
    },
    [handleClose],
  );

  // Backdrop click
  const handleBackdropClick = useCallback(
    (e: ReactMouseEvent<HTMLDialogElement>) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose],
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

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    },
    [goToPrev, goToNext],
  );

  // Zoom: double-click toggles 1x ↔ 2x
  const handleDoubleClick = useCallback(() => {
    if (!hasZoom) {
      return;
    }
    if (zoom === 1) {
      setZoom(2);
      setPan({x: 0, y: 0});
    } else {
      setZoom(1);
      setPan({x: 0, y: 0});
    }
  }, [hasZoom, zoom]);

  // Pan: mouse drag when zoomed
  const handlePointerDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (zoom <= 1 || !hasZoom) {
        return;
      }
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
    },
    [zoom, hasZoom, pan],
  );

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({
        x: dragStartRef.current.panX + dx,
        y: dragStartRef.current.panY + dy,
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  const isZoomed = zoom > 1;
  const imageTransform =
    zoom === 1
      ? null
      : `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`;

  if (!currentItem) {
    return null;
  }

  return (
    <dialog
      ref={mergeRefs(ref, dialogRef)}
      onCancel={handleCancel}
      onClick={e => {
        handleBackdropClick(e);
        onClickProp?.(e);
      }}
      onKeyDown={e => {
        handleKeyDown(e);
        onKeyDownProp?.(e);
      }}
      aria-label={currentItem.alt || 'Media viewer'}
      {...mergeProps(
        xdsClassName('lightbox'),
        stylex.props(styles.dialog, xstyle),
        className,
        style,
      )}
      {...props}>
      <div {...stylex.props(styles.container)}>
        {/* Close button */}
        <div {...stylex.props(styles.closeButton)}>
          <XDSIconButton
            icon={<XDSIcon icon="close" size="sm" color="inherit" />}
            label="Close"
            variant="ghost"
            onClick={handleClose}
            xstyle={styles.controlButton}
          />
        </div>

        {/* Gallery nav: prev */}
        {isGallery && canPrev && (
          <div {...stylex.props(styles.navButton, styles.navPrev)}>
            <XDSIconButton
              icon={<XDSIcon icon="chevronLeft" size="sm" color="inherit" />}
              label="Previous"
              variant="ghost"
              onClick={goToPrev}
              xstyle={styles.controlButton}
            />
          </div>
        )}

        {/* Media + caption group (centered together) */}
        <div {...stylex.props(styles.mediaGroup)}>
          <div
            ref={imageWrapperRef}
            {...stylex.props(
              styles.imageWrapper,
              !isVideo && hasZoom && !isZoomed && styles.imageWrapperZoomable,
              !isVideo && isZoomed && styles.imageWrapperZoomed,
              !isVideo && isDragging && styles.imageWrapperDragging,
            )}
            onDoubleClick={isVideo ? undefined : handleDoubleClick}
            onPointerDown={isVideo ? undefined : handlePointerDown}>
            {isVideo ? (
              <video
                src={currentItem.src}
                aria-label={currentItem.alt}
                controls
                autoPlay={hasAutoPlay}
                {...stylex.props(styles.video)}
              />
            ) : (
              <img
                src={currentItem.src}
                alt={currentItem.alt}
                draggable={false}
                {...stylex.props(
                  styles.image,
                  isDragging && styles.imageDragging,
                  imageTransform != null &&
                    dynamicStyles.imageTransform(imageTransform),
                )}
              />
            )}
          </div>

          {currentItem.caption && (
            <div {...stylex.props(styles.caption)}>{currentItem.caption}</div>
          )}
        </div>

        {/* Gallery nav: next */}
        {isGallery && canNext && (
          <div {...stylex.props(styles.navButton, styles.navNext)}>
            <XDSIconButton
              icon={<XDSIcon icon="chevronRight" size="sm" color="inherit" />}
              label="Next"
              variant="ghost"
              onClick={goToNext}
              xstyle={styles.controlButton}
            />
          </div>
        )}

        {/* Gallery counter */}
        {isGallery && mediaArray.length > 1 && (
          <div {...stylex.props(styles.counter)}>
            {index + 1} / {mediaArray.length}
          </div>
        )}
      </div>
    </dialog>
  );
}

XDSLightbox.displayName = 'XDSLightbox';
