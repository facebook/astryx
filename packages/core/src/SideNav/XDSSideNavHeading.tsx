/**
 * @file XDSSideNavHeading.tsx
 * @input Uses React forwardRef, useRef, useCallback, ReactNode, StyleX, useXDSPopover
 * @output Exports XDSSideNavHeading component and XDSSideNavHeadingProps
 * @position Core implementation; used inside XDSSideNav header slot
 *
 * Product/suite/account heading with smart interaction boundary logic.
 * Composes useXDSPopover internally when menu prop is provided.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SideNav/SideNav.doc.mjs
 * - /packages/core/src/SideNav/XDSSideNav.test.tsx
 * - /packages/core/src/SideNav/index.ts
 * - /apps/storybook/stories/SideNav.stories.tsx
 */

'use client';

import {forwardRef, useCallback, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
  radiusVars,
} from '../theme/tokens.stylex';
// TODO(#264): Lazy-load useXDSPopover so the popover/layer bundle is not
// eagerly imported when `menu` is not provided. See XDSText for an example
// of lazy loading layer resources.
import {useXDSPopover} from '../Layer/useXDSPopover';
import {XDSLink} from '../Link';
import {xdsClassName, mergeProps} from '../utils';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    paddingBlock: spacingVars['--spacing-3'],
    boxSizing: 'border-box',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'default',
  },
  interactive: {
    cursor: 'pointer',
    borderRadius: radiusVars['--radius-element'],
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    textAlign: 'start',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: colorVars['--color-hover-overlay'],
      },
    },
  },
  interactiveInset: {
    marginInline: spacingVars['--spacing-1'],
    marginBlock: spacingVars['--spacing-1'],
  },
  icon: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: spacingVars['--spacing-8'],
    height: spacingVars['--spacing-8'],
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },
  superheading: {
    fontSize: textSizeVars['--text-xsm'],
    lineHeight: lineHeightVars['--leading-snug'],
    color: colorVars['--color-text-secondary'],
    textDecoration: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  heading: {
    fontSize: textSizeVars['--text-base'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: lineHeightVars['--leading-snug'],
    color: colorVars['--color-text-primary'],
    textDecoration: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  subheading: {
    fontSize: textSizeVars['--text-xsm'],
    lineHeight: lineHeightVars['--leading-snug'],
    color: colorVars['--color-text-secondary'],
    textDecoration: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chevron: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: spacingVars['--spacing-4'],
    height: spacingVars['--spacing-4'],
    color: colorVars['--color-icon-secondary'],
  },
  popoverContent: {
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-surface'],
    boxShadow: `0 4px 12px ${colorVars['--color-shadow-elevation']}`,
    overflow: 'hidden',
  },
  popover: {
    minWidth: 'anchor-size(width)',
    marginBlockStart: spacingVars['--spacing-1'],
  },
});

// =============================================================================
// Types
// =============================================================================

export interface XDSSideNavHeadingProps {
  /**
   * Product/app icon.
   */
  icon?: ReactNode;
  /**
   * Product/app name.
   */
  heading: string;
  /**
   * Link for the heading (e.g., product home).
   */
  headingHref?: string;
  /**
   * Text above the heading (e.g., suite name).
   */
  superheading?: string;
  /**
   * Link for the superheading (e.g., suite home).
   */
  superheadingHref?: string;
  /**
   * Text below the heading (e.g., account context).
   */
  subheading?: string;
  /**
   * Link for the subheading.
   */
  subheadingHref?: string;
  /**
   * Menu content shown in a popover. When provided, the header composes
   * useXDSPopover internally and shows a dropdown chevron. The trigger
   * boundary is determined automatically:
   * - No hrefs → whole header is the trigger
   * - With hrefs → links are independent, chevron/remaining area is the trigger
   */
  menu?: ReactNode;
  /**
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   *
   * @example
   * ```
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <Component xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;
  /**
   * CSS class name(s) appended to the root element.
   * If you're using StyleX, prefer `xstyle` for optimal style deduplication.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element. Spread after StyleX
   * inline styles, so these values take priority.
   */
  style?: React.CSSProperties;
  /**
   * Test ID for the root element.
   */
  'data-testid'?: string;
}

// =============================================================================
// Chevron SVG
// =============================================================================

function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true">
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// =============================================================================
// Component
// =============================================================================

/**
 * Product/suite/account heading for XDSSideNav.
 *
 * Supports smart interaction boundary logic:
 * - No hrefs + menu → whole heading is the popover trigger
 * - headingHref only, no menu → whole heading is one link
 * - headingHref + superheadingHref, no menu → each is an independent link
 * - menu + hrefs → links are independent, chevron/remaining area is the trigger
 *
 * The chevron indicator is automatically shown when `menu` is provided.
 *
 * @example
 * ```
 * <XDSSideNavHeading icon={<AppIcon />} heading="My App" headingHref="/" />
 * <XDSSideNavHeading
 *   icon={<SuiteIcon />}
 *   superheading="Suite Name"
 *   superheadingHref="/suite"
 *   heading="Product Name"
 *   headingHref="/product"
 *   menu={<ProductSwitcher />}
 * />
 * <XDSSideNavHeading
 *   icon={<AppIcon />}
 *   heading="Product Name"
 *   subheading="Business Account"
 *   menu={<AccountSwitcher />}
 * />
 * ```
 */
export const XDSSideNavHeading = forwardRef<
  HTMLDivElement,
  XDSSideNavHeadingProps
>(function XDSSideNavHeading(
  {
    icon,
    heading,
    headingHref,
    superheading,
    superheadingHref,
    subheading,
    subheadingHref,
    menu,
    xstyle,
    className,
    style,
    'data-testid': testId,
    ...props
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);

  const popover = useXDSPopover({
    dialogLabel: 'Navigation menu',
  });

  const showChevron = !!menu;
  const hasAnyHref = !!(headingHref || superheadingHref || subheadingHref);

  // Determine interaction mode
  const isWholeHeadingTrigger = !!menu && !hasAnyHref;
  const isWholeHeadingLink =
    !!headingHref && !menu && !superheadingHref && !subheadingHref;

  const handleToggle = useCallback(() => {
    popover.toggle();
  }, [popover]);

  // Combine refs — always anchor popover to the full header element
  // so the popover appears in the same position regardless of whether
  // links are present (mixed mode) or not (whole-header trigger mode).
  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      (rootRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }
      if (menu) {
        popover.triggerRef(el);
      }
    },
    [ref, popover, menu],
  );

  // Render text content
  const renderTextContent = () => (
    <span {...stylex.props(styles.textContainer)}>
      {superheading &&
        (hasAnyHref && superheadingHref && menu ? (
          <XDSLink
            label={superheading}
            href={superheadingHref}
            color="secondary"
            size="xsm">
            {superheading}
          </XDSLink>
        ) : (
          <span {...stylex.props(styles.superheading)}>{superheading}</span>
        ))}
      {hasAnyHref && headingHref && menu ? (
        <XDSLink
          label={heading}
          href={headingHref}
          color="primary"
          weight="semibold">
          {heading}
        </XDSLink>
      ) : (
        <span {...stylex.props(styles.heading)}>{heading}</span>
      )}
      {subheading &&
        (hasAnyHref && subheadingHref && menu ? (
          <XDSLink
            label={subheading}
            href={subheadingHref}
            color="secondary"
            size="xsm">
            {subheading}
          </XDSLink>
        ) : (
          <span {...stylex.props(styles.subheading)}>{subheading}</span>
        ))}
    </span>
  );

  const chevronElement = showChevron && (
    <span {...stylex.props(styles.chevron)}>
      <ChevronDownIcon />
    </span>
  );

  // Whole heading is a link (no menu, single headingHref)
  if (isWholeHeadingLink) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={headingHref}
        data-testid={testId}
        {...mergeProps(
          xdsClassName('side-nav-heading'),
          stylex.props(
            styles.root,
            styles.interactive,
            styles.interactiveInset,
            xstyle,
          ),
          className,
          style,
        )}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {icon && <span {...stylex.props(styles.icon)}>{icon}</span>}
        {renderTextContent()}
        {chevronElement}
      </a>
    );
  }

  // Whole header is the popover trigger (menu, no hrefs)
  if (isWholeHeadingTrigger) {
    return (
      <>
        <button
          ref={setRef as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={handleToggle}
          data-testid={testId}
          {...popover.triggerProps}
          {...mergeProps(
            xdsClassName('side-nav-heading'),
            stylex.props(
              styles.root,
              styles.interactive,
              styles.interactiveInset,
              xstyle,
            ),
            className,
            style,
          )}>
          {icon && <span {...stylex.props(styles.icon)}>{icon}</span>}
          {renderTextContent()}
          {chevronElement}
        </button>
        {popover.render(
          <div {...stylex.props(styles.popoverContent)}>{menu}</div>,
          {placement: 'below', alignment: 'start', xstyle: styles.popover},
        )}
      </>
    );
  }

  // Mixed mode: independent links + chevron trigger for menu
  // Popover anchors to the full heading div, not the chevron, so it
  // appears in the same position as the no-links case.
  if (menu && hasAnyHref) {
    return (
      <>
        <div
          ref={setRef}
          data-testid={testId}
          {...mergeProps(
            xdsClassName('side-nav-heading'),
            stylex.props(styles.root, xstyle),
            className,
            style,
          )}>
          {icon &&
            (headingHref ? (
              <a href={headingHref} {...stylex.props(styles.icon)}>
                {icon}
              </a>
            ) : (
              <span {...stylex.props(styles.icon)}>{icon}</span>
            ))}
          {renderTextContent()}
          {showChevron && (
            <button
              type="button"
              onClick={handleToggle}
              aria-label="Open menu"
              {...popover.triggerProps}
              {...stylex.props(styles.chevron, styles.interactive)}>
              <ChevronDownIcon />
            </button>
          )}
        </div>
        {popover.render(
          <div {...stylex.props(styles.popoverContent)}>{menu}</div>,
          {placement: 'below', alignment: 'start', xstyle: styles.popover},
        )}
      </>
    );
  }

  // Static heading with independent links (no menu)
  if (hasAnyHref && !isWholeHeadingLink) {
    return (
      <div
        ref={ref}
        data-testid={testId}
        {...mergeProps(
          xdsClassName('side-nav-heading'),
          stylex.props(styles.root, xstyle),
          className,
          style,
        )}
        {...props}>
        {icon &&
          (headingHref ? (
            <a href={headingHref} {...stylex.props(styles.icon)}>
              {icon}
            </a>
          ) : (
            <span {...stylex.props(styles.icon)}>{icon}</span>
          ))}
        <span {...stylex.props(styles.textContainer)}>
          {superheading &&
            (superheadingHref ? (
              <XDSLink
                label={superheading}
                href={superheadingHref}
                color="secondary"
                size="xsm">
                {superheading}
              </XDSLink>
            ) : (
              <span {...stylex.props(styles.superheading)}>{superheading}</span>
            ))}
          {headingHref ? (
            <XDSLink
              label={heading}
              href={headingHref}
              color="primary"
              weight="semibold">
              {heading}
            </XDSLink>
          ) : (
            <span {...stylex.props(styles.heading)}>{heading}</span>
          )}
          {subheading &&
            (subheadingHref ? (
              <XDSLink
                label={subheading}
                href={subheadingHref}
                color="secondary"
                size="xsm">
                {subheading}
              </XDSLink>
            ) : (
              <span {...stylex.props(styles.subheading)}>{subheading}</span>
            ))}
        </span>
        {chevronElement}
      </div>
    );
  }

  // Default: static heading, no links, no menu
  return (
    <div
      ref={ref}
      data-testid={testId}
      {...mergeProps(
        xdsClassName('side-nav-heading'),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
      {...props}>
      {icon && <span {...stylex.props(styles.icon)}>{icon}</span>}
      {renderTextContent()}
      {chevronElement}
    </div>
  );
});

XDSSideNavHeading.displayName = 'XDSSideNavHeading';
