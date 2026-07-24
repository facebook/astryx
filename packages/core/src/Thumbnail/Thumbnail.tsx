// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Thumbnail.tsx
 * @input Uses React, stylex, Button, Skeleton, Spinner, MediaTheme, useImageMode
 * @output Exports Thumbnail component, ThumbnailProps
 * @position Core implementation; consumed by index.ts
 *
 * Square preview card for image attachments. Shows a skeleton shimmer while
 * the image loads, the image on success, or a placeholder on failure.
 * Uses useImageMode (APCA) to detect image luminance so the overlaid
 * remove button always has sufficient contrast.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Thumbnail/Thumbnail.doc.mjs
 * - /packages/core/src/Thumbnail/Thumbnail.test.tsx
 * - /packages/core/src/Thumbnail/index.ts
 * - /apps/storybook/stories/Thumbnail.stories.tsx
 * - /packages/cli/templates/blocks/components/Thumbnail/ (showcase blocks)
 */

import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  radiusVars,
  spacingVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import {Button} from '../Button';
import {Icon} from '../Icon';
import {Skeleton} from '../Skeleton';
import {Spinner} from '../Spinner';
import {Tooltip} from '../Tooltip/Tooltip';
import {MediaTheme} from '../theme/MediaTheme';
import {useImageMode} from '../hooks/useImageMode';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';
import {thumbnailScope} from './thumbnail.markers.stylex';

/** Sample the region behind the remove button (20px button, 4px inset, in 64px container). */
const BUTTON_REGION = {x: 0.5, y: 0.06, width: 0.44, height: 0.44};

export interface ThumbnailProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Image source for the thumbnail preview.
   * Shows a skeleton while loading, the image on success, or a placeholder on error.
   */
  src?: string;
  /**
   * Alt text for the image. Required for accessibility when `src` is provided.
   */
  alt?: string;
  /**
   * Accessible label for the thumbnail (e.g. file name).
   * Not rendered visually — shown in a tooltip on hover, exposed as the
   * accessible name of the thumbnail group, and used as the accessible
   * name for the remove button.
   */
  label?: string;
  /**
   * Callback when the remove button is clicked.
   * When provided, an overlaid close button appears in the top-right corner.
   */
  onRemove?: (e: React.MouseEvent) => void;
  /**
   * Click handler for opening a lightbox or detail view.
   * When provided, the thumbnail renders as interactive.
   */
  onClick?: (e: React.MouseEvent) => void;
  /**
   * Content rendered below the thumbnail image area.
   * Use for metadata like file size, duration, or status.
   */
  /**
   * Whether the thumbnail is in a loading state.
   * Shows a skeleton shimmer regardless of `src`. Use while uploading
   * or processing before an image URL is available.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Whether the thumbnail is in a disabled state.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * When the remove button is visible.
   * - `'always'` — the button is always shown (the default).
   * - `'hover'` — the button is revealed on hover, and on keyboard focus so
   *   it stays reachable. On touch devices (no hover) it stays visible.
   *
   * Only has an effect when `onRemove` is set.
   * @default 'always'
   */
  showRemoveOn?: 'always' | 'hover';
  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'column',
    width: 64,
    flexShrink: 0,
    isolation: 'isolate',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1',
    borderRadius: radiusVars['--radius-element'],
    overflow: 'hidden',
    backgroundColor: colorVars['--color-neutral'],
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  insetBorder: {
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    boxShadow: `inset 0 0 0 1px ${colorVars['--color-border']}`,
    pointerEvents: 'none',
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    color: colorVars['--color-icon-secondary'],
  },
  interactive: {
    cursor: 'pointer',
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    opacity: {
      default: 1,
      ':hover': {
        '@media (hover: hover)': 0.85,
      },
      ':active': 0.75,
    },
    outline: {
      default: null,
      ':has(:focus-visible)': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':has(:focus-visible)': '2px',
    },
  },
  interactiveButton: {
    all: 'unset',
    cursor: 'pointer',
    display: 'block',
    width: '100%',
    height: '100%',
    borderRadius: radiusVars['--radius-element'],
    overflow: 'hidden',
  },

  removeSlot: {
    position: 'absolute',
    top: spacingVars['--spacing-1'],
    right: spacingVars['--spacing-1'],
    zIndex: 1,
    lineHeight: 0,
  },
  removeButtonOverrides: {
    '--_button-radius': `calc(${radiusVars['--radius-element']} - ${spacingVars['--spacing-1']})`,
    height: 20,
    minWidth: 20,
  },
  disabled: {
    opacity: 0.5,
    pointerEvents: 'none' as const,
  },
  uploadOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colorVars['--color-overlay'],
    borderRadius: 'inherit',
    zIndex: 1,
    lineHeight: 0,
  },
  // showRemoveOn="hover": the remove button is hidden at rest and revealed
  // when the thumbnail is hovered or when focus enters it (keyboard). Only
  // opacity is animated — the button stays mounted and focusable so tabbing
  // to it triggers the :focus-within reveal. Touch devices have no hover, so
  // the button stays visible there.
  removeOnHover: {
    opacity: {
      default: 0,
      [stylex.when.ancestor(':hover', thumbnailScope)]: {
        '@media (hover: hover)': 1,
      },
      [stylex.when.ancestor(':focus-within', thumbnailScope)]: 1,
      '@media (hover: none) and (pointer: coarse)': 1,
    },
    transitionProperty: 'opacity',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
});

// =============================================================================
// Placeholder icon — a simple image silhouette
// =============================================================================

function ImagePlaceholder() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true">
      <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2M8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-5.5z" />
    </svg>
  );
}

// =============================================================================
// Component
// =============================================================================

/**
 * A square thumbnail preview for image attachments.
 *
 * Shows a skeleton shimmer while the image loads, the image on success, or
 * a placeholder icon on failure / when no src is provided. An overlaid
 * remove button appears when `onRemove` is set.
 *
 * Uses `useImageMode` (APCA) to detect image luminance and `MediaTheme`
 * to ensure the remove button always has sufficient contrast against the image.
 *
 * @example
 * ```
 * <Thumbnail src="/photo.jpg" alt="Vacation photo" onRemove={() => {}} />
 * <Thumbnail src="/preview.png" alt="Preview" onClick={() => {}} label="preview.png" />
 * ```
 */
export function Thumbnail({
  src,
  alt,
  label,
  onRemove,
  onClick,
  isLoading = false,
  isDisabled = false,
  showRemoveOn = 'always',
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
  ...props
}: ThumbnailProps) {
  const t = useTranslator();
  const imageMode = useImageMode(src, {region: BUTTON_REGION, fallback: null});

  const hasSrc = src != null;
  const showSkeleton = isLoading && !hasSrc;
  const showImage = hasSrc && !showSkeleton;
  const showUploadOverlay = isLoading && hasSrc;
  const showPlaceholder = !isLoading && !hasSrc;
  const isInteractive = onClick != null && !isDisabled && !isLoading;
  const hasRemove = onRemove != null && !isDisabled;
  const isHoverReveal = hasRemove && showRemoveOn === 'hover';
  const accessibleName =
    label && alt ? `${label} — ${alt}` : (label ?? alt ?? 'thumbnail');

  const imageContent = (
    <>
      {showImage && (
        <img src={src} alt={alt ?? ''} {...stylex.props(styles.image)} />
      )}
      {showSkeleton && <Skeleton radius={2} />}
      {showPlaceholder && (
        <div {...stylex.props(styles.placeholder)}>
          <ImagePlaceholder />
        </div>
      )}
    </>
  );

  const removeButtonEl = hasRemove ? (
    <div
      {...stylex.props(
        styles.removeSlot,
        isHoverReveal && styles.removeOnHover,
      )}>
      <Button
        icon={<Icon icon="close" size="xsm" />}
        label={t('@astryx.thumbnail.remove', {accessibleName})}
        variant="secondary"
        size="sm"
        isIconOnly
        onClick={e => {
          e.stopPropagation();
          onRemove(e);
        }}
        xstyle={styles.removeButtonOverrides}
      />
    </div>
  ) : null;

  const thumbnail = (
    <div
      ref={ref}
      data-testid={testId}
      role="group"
      aria-label={accessibleName}
      {...mergeProps(
        themeProps('thumbnail'),
        stylex.props(styles.root, isDisabled && styles.disabled, xstyle),
        className,
        style,
      )}
      {...props}>
      <div
        {...stylex.props(
          styles.imageContainer,
          isHoverReveal && thumbnailScope,
          isInteractive && styles.interactive,
        )}>
        {isInteractive ? (
          <button
            type="button"
            onClick={onClick}
            aria-label={t('@astryx.thumbnail.open', {accessibleName})}
            {...stylex.props(styles.interactiveButton)}>
            {imageContent}
          </button>
        ) : (
          imageContent
        )}
        {showImage && <div {...stylex.props(styles.insetBorder)} />}
        {showUploadOverlay && (
          <div {...stylex.props(styles.uploadOverlay)}>
            <Spinner size="sm" shade="onMedia" />
          </div>
        )}
        {removeButtonEl != null && imageMode != null ? (
          <MediaTheme mode={imageMode}>{removeButtonEl}</MediaTheme>
        ) : (
          removeButtonEl
        )}
      </div>
    </div>
  );

  if (label != null) {
    return <Tooltip content={label}>{thumbnail}</Tooltip>;
  }

  return thumbnail;
}

Thumbnail.displayName = 'Thumbnail';
