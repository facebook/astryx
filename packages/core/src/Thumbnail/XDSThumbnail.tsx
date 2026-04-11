'use client';

/**
 * @file XDSThumbnail.tsx
 * @input Uses React, stylex, XDSSkeleton, XDSSpinner, XDSIcon, XDSMediaTheme, useImageMode
 * @output Exports XDSThumbnail component, XDSThumbnailProps
 * @position Core implementation; consumed by index.ts
 *
 * Square preview card for image attachments. Shows a skeleton shimmer while
 * the image loads, the image on success, or a placeholder on failure.
 * Uses useImageMode to detect image luminance so the overlaid remove button
 * always has sufficient contrast.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Thumbnail/Thumbnail.doc.mjs
 * - /packages/core/src/Thumbnail/XDSThumbnail.test.tsx
 * - /packages/core/src/Thumbnail/index.ts
 * - /apps/storybook/stories/Thumbnail.stories.tsx
 */

import {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  radiusVars,
  spacingVars,
  shadowVars,
  durationVars,
  easeVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {XDSIcon} from '../Icon';
import {XDSSkeleton} from '../Skeleton';
import {XDSSpinner} from '../Spinner';
import {XDSMediaTheme} from '../theme/XDSMediaTheme';
import {useImageMode} from '../hooks/useImageMode';
import type {XDSBaseProps} from '../XDSBaseProps';
import {xdsClassName, mergeProps} from '../utils';

/** Sample the top-right corner where the remove button sits. */
const BUTTON_REGION = {x: 0.6, y: 0, width: 0.4, height: 0.4};

export interface XDSThumbnailProps extends XDSBaseProps<HTMLDivElement> {
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
   * Text label displayed below the image (e.g. file name).
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
  caption?: ReactNode;
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
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '1',
    borderRadius: radiusVars['--radius-container'],
    overflow: 'hidden',
    backgroundColor: colorVars['--color-neutral'],
    boxShadow: shadowVars['--shadow-low'],
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
  },
  interactiveButton: {
    all: 'unset',
    cursor: 'pointer',
    display: 'block',
    width: '100%',
    height: '100%',
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
    borderRadius: radiusVars['--radius-container'],
    overflow: 'hidden',
  },
  removeButton: {
    all: 'unset',
    position: 'absolute',
    top: spacingVars['--spacing-1'],
    right: spacingVars['--spacing-1'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-overlay-hover'],
    color: colorVars['--color-text-primary'],
    cursor: 'pointer',
    zIndex: 1,
    transitionProperty: 'color, background-color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    outline: {
      default: null,
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    '::after': {
      content: '""',
      position: 'absolute',
      inset: '-6px',
    },
  },
  label: {
    marginTop: spacingVars['--spacing-1'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  caption: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-disabled'],
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
 * Uses `useImageMode` to detect image luminance and `XDSMediaTheme` to
 * ensure the remove button always has sufficient contrast against the image.
 *
 * @example
 * ```
 * <XDSThumbnail src="/photo.jpg" alt="Vacation photo" onRemove={() => {}} />
 * <XDSThumbnail label="report.pdf" />
 * <XDSThumbnail src="/preview.png" alt="Preview" onClick={() => {}} caption="2.4 MB" />
 * ```
 */
export function XDSThumbnail({
  src,
  alt,
  label,
  onRemove,
  onClick,
  caption,
  isLoading = false,
  isDisabled = false,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
  ...props
}: XDSThumbnailProps) {
  const imageMode = useImageMode(src, {region: BUTTON_REGION, fallback: null});

  const hasSrc = src != null;
  const showSkeleton = isLoading && !hasSrc;
  const showImage = hasSrc && !showSkeleton;
  const showUploadOverlay = isLoading && hasSrc;
  const showPlaceholder = !isLoading && !hasSrc;
  const isInteractive = onClick != null && !isDisabled && !isLoading;

  const imageContent = (
    <>
      {showImage && (
        <img
          src={src}
          alt={alt ?? ''}
          {...stylex.props(styles.image)}
        />
      )}
      {showSkeleton && (
        <XDSSkeleton radius={2} />
      )}
      {showPlaceholder && (
        <div {...stylex.props(styles.placeholder)}>
          <ImagePlaceholder />
        </div>
      )}
    </>
  );

  const removeButtonEl =
    onRemove != null && !isDisabled ? (
      <button
        type="button"
        aria-label={`Remove ${label ?? alt ?? 'thumbnail'}`}
        onClick={e => {
          e.stopPropagation();
          onRemove(e);
        }}
        {...stylex.props(styles.removeButton)}>
        <XDSIcon icon="close" size="xsm" color="inherit" />
      </button>
    ) : null;

  return (
    <div
      ref={ref}
      data-testid={testId}
      {...mergeProps(
        xdsClassName('thumbnail'),
        stylex.props(
          styles.root,
          isDisabled && styles.disabled,
          xstyle,
        ),
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
            aria-label={alt ?? label ?? 'Open thumbnail'}
            {...stylex.props(styles.interactiveButton)}>
            {imageContent}
          </button>
        ) : (
          imageContent
        )}
        {showImage && <div {...stylex.props(styles.insetBorder)} />}
        {showUploadOverlay && (
          <div {...stylex.props(styles.uploadOverlay)}>
            <XDSSpinner size="sm" shade="onMedia" />
          </div>
        )}
        {removeButtonEl != null && imageMode != null ? (
          <XDSMediaTheme mode={imageMode}>
            {removeButtonEl}
          </XDSMediaTheme>
        ) : (
          removeButtonEl
        )}
      </div>
      {label != null && <div {...stylex.props(styles.label)}>{label}</div>}
      {caption != null && <div {...stylex.props(styles.caption)}>{caption}</div>}
    </div>
  );
}

XDSThumbnail.displayName = 'XDSThumbnail';
