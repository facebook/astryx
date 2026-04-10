'use client';

/**
 * @file XDSThumbnail.tsx
 * @input Uses React, stylex, XDSSkeleton, XDSIcon
 * @output Exports XDSThumbnail component, XDSThumbnailProps
 * @position Core implementation; consumed by index.ts
 *
 * Square preview card for image attachments. Shows a skeleton shimmer while
 * the image loads, the image on success, or a placeholder on failure.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Thumbnail/Thumbnail.doc.mjs
 * - /packages/core/src/Thumbnail/XDSThumbnail.test.tsx
 * - /packages/core/src/Thumbnail/index.ts
 * - /apps/storybook/stories/Thumbnail.stories.tsx
 */

import {useState, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  radiusVars,
  spacingVars,
  durationVars,
  easeVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {XDSIcon} from '../Icon';
import {XDSSkeleton} from '../Skeleton';
import type {XDSBaseProps} from '../XDSBaseProps';
import {xdsClassName, mergeProps} from '../utils';

export interface XDSThumbnailProps extends XDSBaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Image source for the thumbnail preview.
   * Shows a spinner while loading, the image on success, or a placeholder on error.
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
    width: 80,
    flexShrink: 0,
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
    borderRadius: radiusVars['--radius-element'],
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
    backgroundColor: colorVars['--color-overlay'],
    color: colorVars['--color-text-primary'],
    cursor: 'pointer',
    zIndex: 1,
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
  isDisabled = false,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
  ...props
}: XDSThumbnailProps) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const hasSrc = src != null;
  const showSpinner = hasSrc && !loaded && !errored;
  const showImage = hasSrc && loaded && !errored;
  const showPlaceholder = !hasSrc || errored;
  const isInteractive = onClick != null && !isDisabled;

  const imageContent = (
    <>
      {hasSrc && (
        <img
          src={src}
          alt={alt ?? ''}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          {...stylex.props(styles.image)}
          style={showImage ? undefined : {display: 'none'}}
        />
      )}
      {showSpinner && (
        <XDSSkeleton radius={2} />
      )}
      {showPlaceholder && (
        <div {...stylex.props(styles.placeholder)}>
          <ImagePlaceholder />
        </div>
      )}
    </>
  );

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
        {onRemove != null && !isDisabled && (
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
        )}
      </div>
      {label != null && <div {...stylex.props(styles.label)}>{label}</div>}
      {caption != null && <div {...stylex.props(styles.caption)}>{caption}</div>}
    </div>
  );
}

XDSThumbnail.displayName = 'XDSThumbnail';
