// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Avatar.tsx
 * @input Uses React, HTMLAttributes, ReactNode, useState; useTooltip
 *   (Tooltip hook) for the optional name-on-hover tooltip; useTranslator (i18n)
 * @output Exports Avatar component, AvatarProps, AvatarSize types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Avatar/Avatar.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Avatar/index.ts (exports if types change)
 * - /apps/storybook/stories/Avatar.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/Avatar/ (showcase blocks)
 *
 * Last synced props: alt, fallbackSrc, name, size, src, status, href, as, target, rel, onClick
 */

import {isValidElement, useMemo, useState, type ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  typographyVars,
  fontWeightVars,
  radiusVars,
} from '../theme/tokens.stylex';
import {AvatarSizeContext} from './AvatarSizeContext';
import {useAvatarGroup} from '../AvatarGroup/AvatarGroupContext';
import {mergeProps, mergeRefs} from '../utils';
import {themeProps} from '../utils/themeProps';
import {firstCharacter} from '../utils/characters';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {useTooltip} from '../Tooltip/useTooltip';
import {useDevWarning} from '../hooks/useDevWarning';
import {useLinkComponent} from '../Link/useLinkComponent';
import type {LinkComponentType} from '../Link/types';
import {useTranslator} from '../i18n';

/**
 * The offset ratio for positioning elements on a circle's edge at 45°.
 *
 * For a square with side length S containing an inscribed circle of diameter S,
 * a diagonal line from corner to corner intersects the circle at:
 *   x = S/2 × (1 ± 1/√2)
 *
 * The distance from the corner to this intersection point (along each axis) is:
 *   S/2 × (1 - 1/√2) ≈ 0.146S
 *
 * This constant represents that ratio: (1 - 1/√2) / 2 ≈ 0.146
 */
const CIRCLE_EDGE_OFFSET_RATIO = (1 - 1 / Math.SQRT2) / 2;

/**
 * The ratio of font size to avatar size for initials.
 *
 * At 40%, two-letter initials fit comfortably within the circle with adequate
 * padding. This ratio provides good legibility across all avatar sizes:
 *   - 24px avatar → 9.6px font
 *   - 48px avatar → 19.2px font
 *   - 128px avatar → 51.2px font
 */
const INITIALS_FONT_SIZE_RATIO = 0.4;

/**
 * Named size options.
 *
 * Avatar uses the same abbreviated scale as Icon (`xsm`/`sm`/`md`/`lg`/`xl`),
 * but the values are larger because avatars align with media rather than
 * glyphs. The tiers follow the standard avatar size scale.
 */
type AvatarNamedSize = 'xsm' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Numeric size options (in pixels)
 */
type AvatarNumericSize =
  16 | 20 | 24 | 32 | 36 | 40 | 48 | 60 | 64 | 72 | 96 | 128 | 144 | 180;

/**
 * Avatar size - can be a named size or a specific pixel value
 */
export type AvatarSize = AvatarNamedSize | AvatarNumericSize;

/**
 * Resolves named sizes to their numeric pixel values
 */
export function resolveSize(size: AvatarSize): number {
  if (typeof size === 'number') {
    return size;
  }
  switch (size) {
    case 'xsm':
      return 20;
    case 'sm':
      return 24;
    case 'md':
      return 36;
    case 'lg':
      return 48;
    case 'xl':
      return 128;
  }
}

/**
 * Base styles for the avatar
 * Uses a wrapper/content structure so status isn't clipped by overflow:hidden
 */
const styles = stylex.create({
  wrapper: {
    position: 'relative',
    display: 'inline-flex',
    flexShrink: 0,
    // The wrapper carries the avatar's box as well as its radius, so a theme
    // rule on the `.astryx-avatar` target reaches both: the size the `size`
    // visual prop selects on is set here, and the content below fills it.
    borderRadius: radiusVars['--radius-full'],
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    borderRadius: radiusVars['--radius-full'],
    overflow: 'hidden',
    userSelect: 'none',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  fallback: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    // Fallback surface (initials + default icon). Background, text color,
    // weight, and per-size font size are all themed directly via the stable
    // `.astryx-avatar-fallback` class target (font size through its size
    // variant, `.astryx-avatar-fallback.<size>`), so the defaults here are
    // plain values with no internal-var seam. See Avatar.doc.mjs theming.
    backgroundColor: colorVars['--color-neutral'],
    color: `light-dark(${colorVars['--color-text-secondary']}, ${colorVars['--color-text-primary']})`,
    fontFamily: typographyVars['--font-family-body'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    textTransform: 'uppercase',
  },
  status: {
    position: 'absolute',
  },
  // Visible focus ring for the name-tooltip tab stop, matching the repo-wide
  // focus-visible outline treatment (see Timestamp, Token, Thumbnail). Only
  // applied when a tooltip is active so keyboard users can reveal it.
  // Reset the intrinsic styling of the interactive element (<a>/<button>) so it
  // is a transparent, correctly-sized wrapper around the avatar visuals. The
  // element carries the focus-visible accent ring for keyboard users.
  interactive: {
    appearance: 'none',
    padding: 0,
    margin: 0,
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    textDecoration: 'none',
    cursor: 'pointer',
    // Match the avatar's circular shape so the focus ring hugs it.
    borderRadius: radiusVars['--radius-full'],
  },
});

/**
 * Dynamic styles that depend on the avatar size
 */
const dynamicStyles = stylex.create({
  size: (size: number) => ({
    width: size,
    height: size,
  }),
  // Initials font size defaults to the proportional `size × ratio` scale. It's
  // a StyleX dynamic style, so the value lands via a class (not an inline
  // property) — a theme's `.astryx-avatar-fallback.<size>` rule in the theme
  // layer overrides it per size tier, no internal var needed.
  fontSize: (size: number) => ({
    fontSize: `${size * INITIALS_FONT_SIZE_RATIO}px`,
  }),
  statusPosition: (size: number) => ({
    bottom: size * CIRCLE_EDGE_OFFSET_RATIO,
    insetInlineEnd: size * CIRCLE_EDGE_OFFSET_RATIO,
    // `insetInlineEnd` anchors to the right edge in LTR / left in RTL, so the
    // outward push must mirror too: +X in LTR, −X in RTL (Y is unaffected).
    transform: {
      default: 'translate(50%, 50%)',
      ':is([dir="rtl"] *)': 'translate(-50%, 50%)',
    },
  }),
});

const BORDER_WIDTH = 2;

const groupStyles = stylex.create({
  ring: {
    borderRadius: radiusVars['--radius-full'],
    borderWidth: BORDER_WIDTH,
    borderStyle: 'solid',
    borderColor: colorVars['--color-background-surface'],
    backgroundColor: colorVars['--color-background-surface'],
    boxSizing: 'content-box',
  },
  overlap: {
    marginInlineStart: {
      default: null,
      ':not(:first-child)': 'var(--_avatar-group-overlap)',
    },
  },
});

const groupDynamicStyles = stylex.create({
  overlap: (offset: number) => ({
    '--_avatar-group-overlap': `${offset}px`,
  }),
});

export interface AvatarProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * The alt text shown on hover and made accessible to screen readers.
   * Falls back to `name` if not provided.
   */
  alt?: string;
  /**
   * testid for tests.
   */
  'data-testid'?: string;
  /**
   * Fallback image source when primary `src` fails to load.
   * If this also fails, shows initials derived from `name`.
   */
  fallbackSrc?: string;
  /**
   * The user's name. Used for:
   * - Generating initials when no image is available
   * - Default alt text if `alt` is not provided
   */
  name?: string;
  /**
   * The size of the avatar. A named size (`xsm` 20px, `sm` 24px, `md` 36px,
   * `lg` 48px, `xl` 128px) or a specific pixel value.
   *
   * Inside an `AvatarGroup` the group's `size` wins: a group sizes its members
   * uniformly, so this prop is ignored there.
   * @default 'md'
   */
  size?: AvatarSize;
  /**
   * The primary image source for the avatar.
   */
  src?: string;
  /**
   * Content displayed in the corner of the avatar.
   * Typically used for status indicators or badges.
   *
   * When the element carries a string `label` prop (as `AvatarStatusDot`
   * does), the label is composed into the avatar's accessible name
   * (e.g. "Jane Doe, Online") so assistive tech can reach the status —
   * the `role="img"` root prunes descendant semantics (WCAG 4.1.2).
   */
  status?: ReactNode;
  /**
   * Tooltip shown on hover (and keyboard focus).
   * - omitted / `true`: show the avatar's `name`
   * - a string: show that text instead
   * - `false`: no tooltip
   *
   * The avatar owns this tooltip. It is NOT auto-disabled when wrapped in your
   * own Tooltip/HoverCard — set `tooltip={false}` if you provide your own
   * overlay. No tooltip is shown if `tooltip` is `true`/omitted and there is
   * no (non-whitespace) `name`.
   * @default true
   */
  tooltip?: string | boolean;
  /**
   * When provided, the avatar becomes an interactive link (`<a>` or custom
   * link component) pointing at `href`. Follows the same element-swap rules as
   * Button: `href` renders a link, otherwise `onClick` renders a
   * `<button type="button">`, otherwise the avatar stays a static (non-focusable)
   * element. An interactive avatar requires a meaningful accessible name via
   * `alt` or `name`.
   */
  href?: string;
  /**
   * Custom link component to use when `href` is provided. Overrides the
   * provider-level default set by LinkProvider. Useful for Next.js `<Link>` or
   * other router-aware components. Only applies when `href` is provided.
   */
  as?: LinkComponentType;
  /**
   * HTML target attribute for the link. Only applies when `href` is provided.
   */
  target?: string;
  /**
   * HTML rel attribute for the link. Only applies when `href` is provided.
   */
  rel?: string;
  /**
   * Click handler. When provided without `href`, renders the avatar as a
   * focusable `<button type="button">`. An interactive avatar requires a
   * meaningful accessible name via `alt` or `name`.
   */
  onClick?: React.MouseEventHandler<HTMLElement>;
}

/**
 * Generates initials from a name string.
 * Takes the first letter of the first two words.
 * @example
 * ```
 * getInitials('John Doe')
 * getInitials('Alice')
 * ```
 */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 0) {
    return '';
  }
  if (words.length === 1) {
    return firstCharacter(words[0]).toUpperCase();
  }
  return (
    firstCharacter(words[0]) + firstCharacter(words[words.length - 1])
  ).toUpperCase();
}

/**
 * Reads the accessible status label off the `status` element, when it
 * exposes one. `AvatarStatusDot`'s `label` prop is the canonical source,
 * but any custom status element with a string `label` prop participates.
 *
 * The avatar root is `role="img"`, which prunes ALL descendant semantics
 * from the accessibility tree — a label inside the status subtree is never
 * announced on its own. Composing it into the avatar's own accessible name
 * is the only way the status reaches assistive tech (WCAG 4.1.2).
 */
function getStatusLabel(status: ReactNode): string | undefined {
  if (!isValidElement(status)) {
    return undefined;
  }
  const {label} = status.props as {label?: unknown};
  return typeof label === 'string' && label !== '' ? label : undefined;
}

/**
 * Default person icon SVG for when no image or name is provided
 */
function DefaultIcon({size}: {size: number}) {
  return (
    <svg
      width={size * 0.6}
      height={size * 0.6}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

/**
 * Avatar component for displaying user profile pictures.
 *
 * Displays an image when available, falling back to initials derived from
 * the name prop, or a generic person icon if neither is provided.
 *
 * @example
 * ```
 * <Avatar src="/user.jpg" name="John Doe" />
 * <Avatar name="Jane Smith" size="xl" />
 * <Avatar src="/user.jpg" status={<AvatarStatusDot variant="success" label="Online" />} />
 * <Avatar name="jsmith" tooltip="Jane Smith, Staff Engineer" />
 * <Avatar name="Jane" tooltip={false} />
 * <Avatar src="/user.jpg" name="John Doe" href="/users/john" />
 * <Avatar src="/user.jpg" name="John Doe" onClick={() => openProfile()} />
 * ```
 */
export function Avatar({
  alt,
  'data-testid': testId,
  fallbackSrc,
  name,
  size = 'md',
  src,
  status,
  tooltip = true,
  href,
  as,
  target,
  rel,
  onClick,
  xstyle,
  className,
  style,
  ref,
  ...props
}: AvatarProps) {
  // Track the exact src that failed (rather than a boolean) so a changed
  // src/fallbackSrc gets a fresh load attempt instead of the stale error.
  const [erroredSrc, setErroredSrc] = useState<string | undefined>(undefined);
  const [erroredFallbackSrc, setErroredFallbackSrc] = useState<
    string | undefined
  >(undefined);

  const showImage = src && erroredSrc !== src;
  const showFallbackImage =
    !showImage && fallbackSrc && erroredFallbackSrc !== fallbackSrc;
  // A whitespace-only string carries no identity. Without this it produces no
  // initials (getInitials trims to nothing) and no default icon (a space is
  // truthy), leaving an empty plate behind a blank accessible name.
  const meaningfulName = name?.trim() ? name : undefined;
  const meaningfulAlt = alt?.trim() ? alt : undefined;
  const showInitials = !showImage && !showFallbackImage && meaningfulName;
  const showIcon = !showImage && !showFallbackImage && !meaningfulName;

  // A meaningful accessible name comes from `alt`/`name`, composed with the
  // status element's `label` when one is present ("Jane Doe, Online") — the
  // `role="img"` root prunes descendant semantics, so surfacing the label in
  // the avatar's own name is the only way assistive tech can reach the
  // status (WCAG 4.1.2). A labelled status alone is also meaningful. With
  // neither a name nor a labelled status, the avatar is decorative — expose
  // it as `presentation`/`aria-hidden` rather than announcing a meaningless
  // generic "Avatar" (obs-9).
  const t = useTranslator();
  const nameLabel = meaningfulAlt || meaningfulName;
  const statusLabel = getStatusLabel(status);
  const accessibleName =
    nameLabel && statusLabel
      ? t('@astryx.avatar.nameWithStatus', {
          name: nameLabel,
          status: statusLabel,
        })
      : nameLabel || statusLabel;
  const isDecorative = !accessibleName;
  const avatarGroup = useAvatarGroup();
  const resolvedSize = avatarGroup?.size ?? size;
  const numericSize = useMemo(() => resolveSize(resolvedSize), [resolvedSize]);

  // Resolve the tooltip content:
  // - `false`            → no tooltip
  // - a string           → that string
  // - `true` / omitted   → the `name` (a whitespace-only name yields nothing)
  // Note: the *visible* tooltip prefers `name` (not `alt`); the *accessible
  // name* on the root still uses `alt || name` above, independent of this.
  const tooltipContent =
    tooltip === false
      ? undefined
      : typeof tooltip === 'string'
        ? tooltip
        : meaningfulName;
  const trimmedTooltip = tooltipContent?.trim();
  const showTooltip = trimmedTooltip != null && trimmedTooltip !== '';
  // Whether the tooltip text is a consumer-authored override (a custom string)
  // rather than the default name. A custom description is worth wiring to
  // `aria-describedby` (it adds information, matching Button); the default name
  // tooltip is visual-only — its text duplicates the root `aria-label`, so
  // describing it too would double-announce the same name (OQ-4).
  const isCustomTooltip = typeof tooltip === 'string';

  // Own the name tooltip via the Tooltip hook (the Button pattern), which
  // returns `describedBy` as a value we choose whether to apply — the only way
  // to satisfy the per-case aria-describedby rule (default name: none; custom
  // string: describe) without editing Tooltip. `focusTrigger: 'auto'` shows the
  // tooltip on keyboard focus once the root is focusable (natively for the
  // interactive <a>/<button>, or via an explicit tab stop on the static div).
  const tooltipHook = useTooltip({
    placement: 'above',
    isEnabled: showTooltip,
  });
  // The tooltip ref attaches to whichever root element renders (static or
  // interactive), so the tooltip works for link/button avatars too.
  const rootRef = mergeRefs(ref, showTooltip ? tooltipHook.ref : undefined);
  const describedByProp =
    showTooltip && isCustomTooltip
      ? {
          'aria-describedby':
            [props['aria-describedby'], tooltipHook.describedBy]
              .filter(Boolean)
              .join(' ') || undefined,
        }
      : null;

  // Element-swap trichotomy, copied from Button: `href` renders a link,
  // otherwise `onClick` renders a `<button>`, otherwise today's static element
  // is unchanged (the non-breaking default).
  const renderAsLink = href != null;
  const renderAsButton = !renderAsLink && onClick != null;
  const isInteractive = renderAsLink || renderAsButton;
  const LinkComponent = useLinkComponent(as);

  // An interactive control with no accessible name is an unacceptable control
  // name. `useDevWarning` is the shared guardrail: it warns once per mount
  // rather than on every render, and compiles out of production builds.
  useDevWarning(
    'Avatar',
    'an interactive avatar (with `href` or `onClick`) needs a meaningful ' +
      'accessible name. Pass `alt` or `name`.',
    isInteractive && !accessibleName,
  );

  // The inner visuals are identical across the static and interactive variants.
  const visualContent = (
    <>
      <div {...stylex.props(styles.content)}>
        {showImage && (
          <img
            src={src}
            alt=""
            onError={() => setErroredSrc(src)}
            {...stylex.props(styles.image)}
          />
        )}
        {showFallbackImage && (
          <img
            src={fallbackSrc}
            alt=""
            onError={() => setErroredFallbackSrc(fallbackSrc)}
            {...stylex.props(styles.image)}
          />
        )}
        {showInitials && (
          <div
            {...mergeProps(
              themeProps('avatar-fallback', {size: resolvedSize}),
              stylex.props(
                styles.fallback,
                dynamicStyles.fontSize(numericSize),
              ),
            )}>
            {getInitials(meaningfulName)}
          </div>
        )}
        {showIcon && (
          <div
            {...mergeProps(
              themeProps('avatar-fallback', {size: resolvedSize}),
              stylex.props(styles.fallback),
            )}>
            <DefaultIcon size={numericSize} />
          </div>
        )}
      </div>
      {status && (
        <div
          {...stylex.props(
            styles.status,
            dynamicStyles.statusPosition(numericSize),
          )}>
          {status}
        </div>
      )}
    </>
  );

  // Shared StyleX + theme props for the root element in every variant. The
  // group ring/overlap, the interactive focus-visible ring, and the
  // tooltip tab-stop focus ring all live here so the interactive
  // `<a>`/`<button>` and the static `<div>` carry the exact same box.
  const rootStylexProps = mergeProps(
    themeProps('avatar', {size: resolvedSize}),
    focusOutlineProps.focusVisible(
      styles.wrapper,
      dynamicStyles.size(numericSize),
      isInteractive && styles.interactive,
      avatarGroup && groupStyles.ring,
      avatarGroup && groupStyles.overlap,
      avatarGroup && groupDynamicStyles.overlap(-avatarGroup.overlap),
      xstyle,
    ),
    className,
    style,
  );

  let rootElement: ReactNode;

  // `props` is typed for the default `<div>` root (its event handlers are
  // HTMLDivElement-typed). The interactive branches render an `<a>`/`<button>`,
  // so the passthrough props are re-typed to the generic element here — the
  // avatar's own handlers (onClick) are declared on HTMLElement and stay typed.
  const interactivePassthrough = props as React.HTMLAttributes<HTMLElement>;

  if (renderAsLink) {
    // The rendered link carries the `data-avatar-item` marker so AvatarGroup's
    // roving focus (which selects on `[data-avatar-item]`, not a tag/role) picks
    // it up while ignoring nested buttons in a custom status/badge slot.
    rootElement = (
      <LinkComponent
        {...interactivePassthrough}
        {...describedByProp}
        ref={rootRef as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        aria-label={accessibleName}
        data-avatar-item=""
        data-testid={testId}
        onClick={onClick}
        {...rootStylexProps}>
        {visualContent}
      </LinkComponent>
    );
  } else if (renderAsButton) {
    rootElement = (
      <button
        {...interactivePassthrough}
        {...describedByProp}
        ref={rootRef}
        type="button"
        aria-label={accessibleName}
        data-avatar-item=""
        data-testid={testId}
        onClick={onClick}
        {...rootStylexProps}>
        {visualContent}
      </button>
    );
  } else {
    rootElement = (
      <div
        {...props}
        ref={rootRef}
        role={isDecorative ? 'presentation' : 'img'}
        aria-label={isDecorative ? undefined : accessibleName}
        aria-hidden={isDecorative || undefined}
        // The root is a div[role="img"], not natively focusable. When a name
        // tooltip is active, add a tab stop so keyboard users can reveal it
        // (WCAG 1.4.13 / 2.1.1) — matching Timestamp/Button. Suppressed inside
        // an AvatarGroup, which owns a single roving tab stop for its members.
        tabIndex={showTooltip && !avatarGroup ? 0 : undefined}
        data-testid={testId}
        {...describedByProp}
        {...rootStylexProps}>
        {visualContent}
      </div>
    );
  }

  const avatarElement = (
    <AvatarSizeContext value={numericSize}>{rootElement}</AvatarSizeContext>
  );

  // Always return the same structure so the avatar keeps its position in the
  // React tree regardless of the tooltip flag — toggling it must not remount
  // the avatar subtree (and lose image-load state). The tooltip is a sibling
  // (no wrapper DOM); the hook's ref is already on the root via `rootRef`.
  return (
    <>
      {avatarElement}
      {showTooltip ? tooltipHook.renderTooltip(trimmedTooltip) : null}
    </>
  );
}

Avatar.displayName = 'Avatar';
