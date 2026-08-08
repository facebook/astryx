// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Image.tsx
 * @input Uses React, StyleX, core AspectRatio/Skeleton/Lightbox components,
 *   and Astryx core theme tokens/utilities
 * @output Exports Image component, ImageProps, ImageFit, ImageRadius types
 * @position Lab implementation (RFC facebook/astryx#4094); consumed by
 *   packages/lab/src/index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Image/Image.doc.mjs (props table, features, notes)
 * - /packages/lab/src/Image/Image.test.tsx (tests for new/changed behavior)
 * - /packages/lab/src/Image/index.ts (exports if types change)
 * - /apps/storybook/stories/Image.stories.tsx (examples)
 */

import type {ReactNode} from 'react';
import {useCallback, useEffect, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, radiusVars} from '@astryxdesign/core/theme/tokens.stylex';
import type {BaseProps} from '@astryxdesign/core';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {Lightbox} from '@astryxdesign/core/Lightbox';
import {mergeProps, mergeRefs, themeProps} from '@astryxdesign/core/utils';
import type {SizeValue} from '@astryxdesign/core/utils';

const styles = stylex.create({
  base: {
    '--_image-radius': radiusVars['--radius-none'],
    position: 'relative',
    display: 'block',
    borderRadius: 'var(--_image-radius)',
    overflow: 'clip',
    minWidth: 0,
    // The preview trigger's own UA focus ring is fully clipped by this
    // element's overflow — draw the ring here, on the un-clipped frame,
    // like Thumbnail and ClickableCard do for clipped media tiles.
    outline: {
      default: null,
      ':has(:focus-visible)': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':has(:focus-visible)': '2px',
    },
  },
  capped: (maxWidth: SizeValue) => ({
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    marginInline: 'auto',
  }),
  img: {
    display: 'block',
  },
  imgFill: {
    width: '100%',
    height: '100%',
  },
  imgCover: {
    objectFit: 'cover',
  },
  imgContain: {
    objectFit: 'contain',
  },
  imgIntrinsic: {
    maxWidth: '100%',
    height: 'auto',
  },
  skeletonOverlay: {
    position: 'absolute',
    top: 0,
    insetInlineStart: 0,
  },
  trigger: {
    display: 'block',
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    cursor: 'zoom-in',
  },
  triggerFill: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: colorVars['--color-skeleton'],
    color: colorVars['--color-text-secondary'],
  },
  placeholderIntrinsic: {
    aspectRatio: '3 / 2',
    height: 'auto',
  },
});

/**
 * Radius role applied via the private themable var, mirroring the
 * --_card-radius pattern used across core containers.
 */
const radiusStyles = stylex.create({
  none: {},
  inner: {
    '--_image-radius': radiusVars['--radius-inner'],
  },
  element: {
    '--_image-radius': radiusVars['--radius-element'],
  },
  container: {
    '--_image-radius': radiusVars['--radius-container'],
  },
  full: {
    '--_image-radius': radiusVars['--radius-full'],
  },
});

/** How the image fills its ratio box; only applies when `ratio` is set. */
export type ImageFit = 'cover' | 'contain';

/** Corner radius token role applied to the image frame. */
export type ImageRadius = 'none' | 'inner' | 'element' | 'container' | 'full';

export interface ImageProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Image source URL.
   */
  src: string;
  /**
   * Alt text describing the image. Required; pass an empty string for
   * purely decorative images so the error placeholder stays silent too.
   */
  alt: string;
  /**
   * Width/height ratio for the image box (e.g. 16/9). When set, the image
   * is laid out inside an AspectRatio container and fills it per `fit`.
   * When omitted, the image renders at its intrinsic size, capped by
   * `maxWidth`.
   */
  ratio?: number;
  /**
   * How the image fills its ratio box: 'cover' fills and crops, 'contain'
   * letterboxes. Only applies when `ratio` is set.
   * @default 'cover'
   */
  fit?: ImageFit;
  /**
   * Corner radius token role applied to the image frame: 'inner' for
   * corners nested inside padded containers, 'element' for control-scale
   * tiles, 'container' for card/panel-scale surfaces, 'full' for pills
   * and circles.
   * @default 'none'
   */
  radius?: ImageRadius;
  /**
   * Caps the rendered width (number = px, string = CSS value) and centers
   * the image horizontally. Pairs with intrinsic (ratio-less) layout for
   * logos and figures.
   */
  maxWidth?: SizeValue;
  /**
   * Replacement source attempted when `src` fails to load. A value equal
   * to `src`, or an empty string, is treated as absent.
   */
  fallbackSrc?: string;
  /**
   * Custom content rendered when every source has failed. Defaults to a
   * neutral placeholder that exposes `alt` via role="img".
   */
  fallback?: ReactNode;
  /**
   * Native image loading strategy.
   * @default 'lazy'
   */
  loading?: 'lazy' | 'eager';
  /**
   * Wraps the image in a button that opens a fullscreen Lightbox preview.
   * @default false
   */
  hasPreview?: boolean;
  /**
   * Caption shown below the image inside the Lightbox preview.
   */
  previewCaption?: ReactNode;
  /**
   * Accessible name for the preview trigger button. When omitted, the
   * trigger is named by the image's `alt`; decorative images (`alt=""`)
   * fall back to `'View larger image'` so the button is never nameless.
   */
  previewLabel?: string;
}

/**
 * A content image with the three behaviors every real image needs: a
 * skeleton while it loads, a graceful fallback chain when it fails
 * (`fallbackSrc`, then `fallback`, then a neutral placeholder), and an
 * optional click-to-zoom Lightbox preview.
 *
 * With `ratio` the image fills an AspectRatio box per `fit`; without it
 * the image keeps its intrinsic size, capped and centered by `maxWidth`.
 *
 * Styles use Astryx theme tokens via StyleX.
 * Wrap your app in `<Theme>` to apply a theme.
 *
 * @example
 * ```
 * <Image src="/hero.jpg" alt="Product hero" ratio={16 / 9} radius="container" />
 * <Image
 *   src="/photo.jpg"
 *   alt="Team"
 *   ratio={4 / 3}
 *   fallbackSrc="/placeholder.jpg"
 *   hasPreview
 * />
 * <Image src="/logo.png" alt="Acme" maxWidth={240} />
 * ```
 */
export function Image({
  src,
  alt,
  ratio,
  fit = 'cover',
  radius = 'none',
  maxWidth,
  fallbackSrc,
  fallback,
  loading = 'lazy',
  hasPreview = false,
  previewCaption,
  previewLabel,
  xstyle,
  className,
  style,
  ref,
  ...props
}: ImageProps) {
  // Track the exact src that failed (rather than a boolean) so a changed
  // src/fallbackSrc gets a fresh load attempt instead of the stale error.
  const [erroredSrc, setErroredSrc] = useState<string | undefined>(undefined);
  const [erroredFallbackSrc, setErroredFallbackSrc] = useState<
    string | undefined
  >(undefined);
  // Loading is keyed to the src that finished, so swapping sources (or
  // falling back) re-enters the loading state on its own.
  const [loadedSrc, setLoadedSrc] = useState<string | undefined>(undefined);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // A fallback identical to the failing src can never rescue it — and the
  // unchanged <img src> fires no fresh error event, wedging the loading
  // state. An empty string is not a source. Treat both as absent.
  const effectiveFallbackSrc =
    fallbackSrc === src || fallbackSrc === '' ? undefined : fallbackSrc;

  // Error state belongs to the chain that produced it: a new src starts a
  // new chain (reset both legs), a new fallbackSrc re-arms the fallback
  // leg. Without this, cycling back to a previously-failed source or
  // failing a later chain would reuse stale errors and skip real attempts.
  const [prevSrc, setPrevSrc] = useState(src);
  if (prevSrc !== src) {
    setPrevSrc(src);
    setErroredSrc(undefined);
    setErroredFallbackSrc(undefined);
  }
  const [prevFallbackSrc, setPrevFallbackSrc] = useState(effectiveFallbackSrc);
  if (prevFallbackSrc !== effectiveFallbackSrc) {
    setPrevFallbackSrc(effectiveFallbackSrc);
    setErroredFallbackSrc(undefined);
  }

  const showImage = erroredSrc !== src;
  const showFallbackImage =
    !showImage &&
    effectiveFallbackSrc != null &&
    erroredFallbackSrc !== effectiveFallbackSrc;
  const activeSrc = showImage
    ? src
    : showFallbackImage
      ? effectiveFallbackSrc
      : undefined;

  // Loading is per-attempt: whenever the rendered source changes (new src,
  // fallback swap, cycling back), the browser refetches — an earlier load
  // of the same URL is no cache guarantee. The cached-settle ref check,
  // not stale state, is what ends the state instantly for cached images.
  const [prevActiveSrc, setPrevActiveSrc] = useState(activeSrc);
  if (prevActiveSrc !== activeSrc) {
    setPrevActiveSrc(activeSrc);
    if (loadedSrc != null) {
      setLoadedSrc(undefined);
    }
  }
  const isLoading = activeSrc != null && loadedSrc !== activeSrc;

  const rootRef = useRef<HTMLDivElement | null>(null);

  // The preview only exists while there is a source to preview. When its
  // subtree unmounts mid-open (source failure, hasPreview flip) the
  // Lightbox can never report the close: the stale open state would make a
  // later remount call showModal() with zero user interaction, and the
  // removed dialog drops keyboard focus to <body>. Reset the state and
  // re-anchor focus on the frame instead of trusting the unmounted Lightbox.
  const isPreviewForceClosed =
    isPreviewOpen && (!hasPreview || activeSrc == null);
  useEffect(() => {
    if (isPreviewForceClosed) {
      setIsPreviewOpen(false);
      rootRef.current?.focus();
    }
  }, [isPreviewForceClosed]);

  // An image that was already cached is complete before React attaches
  // onLoad, so the event never fires — settle it from the ref instead.
  // The check is deferred one microtask: setting img.src restarts the
  // request in a microtask, so a synchronous read at ref-attach time can
  // still see the PREVIOUS image's settled state.
  const handleImgRef = useCallback(
    (node: HTMLImageElement | null) => {
      if (node == null || activeSrc == null) {
        return;
      }
      queueMicrotask(() => {
        if (
          !node.isConnected ||
          node.getAttribute('src') !== activeSrc ||
          !node.complete
        ) {
          return;
        }
        if (node.naturalWidth > 0) {
          setLoadedSrc(activeSrc);
        } else if (showImage) {
          // Completely-failed cached state — onError may never fire (the
          // failure predates hydration), so route it into the error chain.
          setErroredSrc(src);
        } else {
          setErroredFallbackSrc(effectiveFallbackSrc);
        }
      });
    },
    [activeSrc, src, effectiveFallbackSrc, showImage],
  );

  const isDecorative = alt === '';

  const imgElement =
    activeSrc != null ? (
      <img
        ref={handleImgRef}
        src={activeSrc}
        alt={alt}
        loading={loading}
        data-fit={ratio != null ? fit : undefined}
        onLoad={() => setLoadedSrc(activeSrc)}
        onError={() => {
          if (showImage) {
            setErroredSrc(src);
          } else {
            setErroredFallbackSrc(effectiveFallbackSrc);
          }
        }}
        {...stylex.props(
          styles.img,
          ratio != null ? styles.imgFill : styles.imgIntrinsic,
          ratio != null &&
            (fit === 'contain' ? styles.imgContain : styles.imgCover),
        )}
      />
    ) : null;

  const media =
    activeSrc != null ? (
      hasPreview ? (
        <button
          type="button"
          aria-haspopup="dialog"
          // An explicit previewLabel always names the trigger; otherwise the
          // img's alt does — except for decorative images (alt=""), which
          // would leave the button nameless, so the default label steps in.
          // `||` (not ??) so previewLabel="" can never reopen that hole.
          aria-label={
            isDecorative
              ? previewLabel || 'View larger image'
              : previewLabel || undefined
          }
          onClick={() => setIsPreviewOpen(true)}
          {...stylex.props(
            styles.trigger,
            ratio != null && styles.triggerFill,
          )}>
          {imgElement}
        </button>
      ) : (
        imgElement
      )
    ) : (
      (fallback ?? (
        <div
          data-astryx-image-placeholder=""
          role={isDecorative ? undefined : 'img'}
          aria-label={isDecorative ? undefined : alt}
          aria-hidden={isDecorative || undefined}
          {...stylex.props(
            styles.placeholder,
            ratio == null && styles.placeholderIntrinsic,
          )}>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width={32}
            height={32}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="10" r="1.5" />
            <path d="M5 17l4.5-4 3.5 2.5 3-2 3 2.5" />
          </svg>
        </div>
      ))
    );

  return (
    <>
      <div
        ref={mergeRefs(ref, rootRef)}
        // Programmatically focusable (not tab-reachable) so focus has a
        // component-owned anchor when a force-closed preview unmounts.
        tabIndex={hasPreview ? -1 : undefined}
        aria-busy={isLoading || undefined}
        {...mergeProps(
          themeProps('image', {radius}),
          stylex.props(
            styles.base,
            radiusStyles[radius],
            maxWidth != null && styles.capped(maxWidth),
            xstyle,
          ),
          className,
          style,
        )}
        {...props}>
        {ratio != null ? (
          <AspectRatio ratio={ratio}>
            {media}
            {isLoading ? (
              // radius="none": the frame already rounds via --_image-radius +
              // overflow clip, so the skeleton must not add its own corners.
              <Skeleton radius="none" xstyle={styles.skeletonOverlay} />
            ) : null}
          </AspectRatio>
        ) : (
          media
        )}
      </div>
      {/* Sibling of the frame, not a child: the dialog's content must not
          sit inside the aria-busy loading region. showModal() renders it
          in the top layer regardless of DOM position. */}
      {hasPreview && activeSrc != null ? (
        <Lightbox
          isOpen={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          media={{src: activeSrc, alt, caption: previewCaption}}
        />
      ) : null}
    </>
  );
}

Image.displayName = 'Image';
