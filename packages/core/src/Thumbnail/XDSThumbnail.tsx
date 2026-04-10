'use client';

/**
 * @file XDSThumbnail.tsx
 * @input Uses React, stylex, XDSAspectRatio, XDSIcon
 * @output Exports XDSThumbnail component, XDSThumbnailProps
 * @position Core implementation; consumed by index.ts
 *
 * Square preview card for file attachments. Shows an image thumbnail or
 * fallback icon with an overlaid remove button and optional caption.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Thumbnail/Thumbnail.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Thumbnail/XDSThumbnail.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Thumbnail/index.ts (exports if types change)
 * - /apps/storybook/stories/Thumbnail.stories.tsx (storybook stories)
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
import type {XDSIconName} from '../Icon/globalIconRegistry';
import type {XDSBaseProps} from '../XDSBaseProps';
import {xdsClassName, mergeProps} from '../utils';

export interface XDSThumbnailProps extends XDSBaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Image source for the thumbnail preview.
   * When not provided or on error, falls back to `fallbackIcon`.
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
   * Icon displayed when no `src` is provided or the image fails to load.
   * @default 'info'
   */
  fallbackIcon?: XDSIconName;
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
  fallback: {
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
// Component
// =============================================================================

/**
 * A square thumbnail preview for file attachments.
 *
 * Displays an image preview when `src` is provided, falling back to an icon
 * for non-image files. An overlaid remove button appears when `onRemove` is
 * set. Clicking the thumbnail (when `onClick` is set) typically opens a
 * lightbox or detail view.
 *
 * @example
 * ```
 * <XDSThumbnail src="/photo.jpg" alt="Vacation photo" onRemove={() => {}} />
 * <XDSThumbnail fallbackIcon="document" label="report.pdf" />
 * <XDSThumbnail src="/preview.png" alt="Preview" onClick={() => {}} caption="2.4 MB" />
 * ```
 */
export function XDSThumbnail({
  src,
  alt,
  label,
  onRemove,
  onClick,
  fallbackIcon = 'info',
  caption,
  isDisabled = false,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
  ...props
}: XDSThumbnailProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = src != null && !imageError;
  const isInteractive = onClick != null && !isDisabled;

  const imageContent = showImage ? (
    <img
      src={src}
      alt={alt ?? ''}
      onError={() => setImageError(true)}
      {...stylex.props(styles.image)}
    />
  ) : (
    <div {...stylex.props(styles.fallback)}>
      <XDSIcon icon={fallbackIcon} size="lg" color="inherit" />
    </div>
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
        {/* Inset border sits on top of image for visual containment */}
        <div {...stylex.props(styles.insetBorder)} />
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
