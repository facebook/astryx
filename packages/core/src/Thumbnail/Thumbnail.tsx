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
  shadowVars,
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
   * Not rendered visually — shown in a tooltip on hover and used
   * as accessible name for the remove button.
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
    transitionProperty: 'opacity, box-shadow',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    boxShadow: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)': shadowVars['--shadow-med'],
      },
    },
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

  removeButtonOverrides: {
    position: 'absolute',
    top: spacingVars['--spacing-1'],
    right: spacingVars['--spacing-1'],
    zIndex: 1,
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
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
  ...props
}: ThumbnailProps) {
  const imageMode = useImageMode(src, {region: BUTTON_REGION, fallback: null});

  const hasSrc = src != null;
  const showSkeleton = isLoading && !hasSrc;
  const showImage = hasSrc && !showSkeleton;
  const showUploadOverlay = isLoading && hasSrc;
  const showPlaceholder = !isLoading && !hasSrc;
  const isInteractive = onClick != null && !isDisabled && !isLoading;
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

  const removeButtonEl =
    onRemove != null && !isDisabled ? (
      <Button
        icon={<Icon icon="close" size="xsm" />}
        label={`Remove ${accessibleName}`}
        variant="secondary"
        size="sm"
        isIconOnly
        onClick={e => {
          e.stopPropagation();
          onRemove(e);
        }}
        xstyle={styles.removeButtonOverrides}
      />
    ) : null;

  const thumbnail = (
    <div
      ref={ref}
      data-testid={testId}
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
          isInteractive && styles.interactive,
        )}>
        {isInteractive ? (
          <button
            type="button"
            onClick={onClick}
            aria-label={`Open ${accessibleName}`}
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
