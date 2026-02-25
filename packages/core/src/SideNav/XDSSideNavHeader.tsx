/**
 * @file XDSSideNavHeader.tsx
 * @input Uses React forwardRef, useRef, useCallback, ReactNode, StyleX, useXDSPopover
 * @output Exports XDSSideNavHeader component and XDSSideNavHeaderProps
 * @position Core implementation; used inside XDSSideNav header slot
 *
 * Product/suite/account header with smart interaction boundary logic.
 * Composes useXDSPopover internally when menu prop is provided.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SideNav/README.md
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
      backgroundColor: colorVars['--color-hover-overlay'],
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
  supertitle: {
    fontSize: textSizeVars['--text-xsm'],
    lineHeight: lineHeightVars['--leading-snug'],
    color: colorVars['--color-text-secondary'],
    textDecoration: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  title: {
    fontSize: textSizeVars['--text-base'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: lineHeightVars['--leading-snug'],
    color: colorVars['--color-text-primary'],
    textDecoration: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  subtitle: {
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
    width: 16,
    height: 16,
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

export interface XDSSideNavHeaderProps {
  /**
   * Product/app icon.
   */
  icon?: ReactNode;
  /**
   * Product/app name.
   */
  title: string;
  /**
   * Link for the title (e.g., product home).
   */
  titleHref?: string;
  /**
   * Text above the title (e.g., suite name).
   */
  supertitle?: string;
  /**
   * Link for the supertitle (e.g., suite home).
   */
  supertitleHref?: string;
  /**
   * Text below the title (e.g., account context).
   */
  subtitle?: string;
  /**
   * Link for the subtitle.
   */
  subtitleHref?: string;
  /**
   * Menu content shown in a popover. When provided, the header composes
   * useXDSPopover internally and shows a dropdown chevron. The trigger
   * boundary is determined automatically:
   * - No hrefs → whole header is the trigger
   * - With hrefs → links are independent, chevron/remaining area is the trigger
   */
  menu?: ReactNode;
  /**
   * StyleX overrides.
   */
  xstyle?: StyleXStyles;
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
 * Product/suite/account header for XDSSideNav.
 *
 * Supports smart interaction boundary logic:
 * - No hrefs + menu → whole header is the popover trigger
 * - titleHref only, no menu → whole header is one link
 * - titleHref + supertitleHref, no menu → each is an independent link
 * - menu + hrefs → links are independent, chevron/remaining area is the trigger
 *
 * The chevron indicator is automatically shown when `menu` is provided.
 *
 * @example
 * ```tsx
 * // Single product
 * <XDSSideNavHeader icon={<AppIcon />} title="My App" titleHref="/" />
 *
 * // Suite with menu
 * <XDSSideNavHeader
 *   icon={<SuiteIcon />}
 *   supertitle="Suite Name"
 *   supertitleHref="/suite"
 *   title="Product Name"
 *   titleHref="/product"
 *   menu={<ProductSwitcher />}
 * />
 *
 * // Account context with menu
 * <XDSSideNavHeader
 *   icon={<AppIcon />}
 *   title="Product Name"
 *   subtitle="Business Account"
 *   menu={<AccountSwitcher />}
 * />
 * ```
 */
export const XDSSideNavHeader = forwardRef<
  HTMLDivElement,
  XDSSideNavHeaderProps
>(function XDSSideNavHeader(
  {
    icon,
    title,
    titleHref,
    supertitle,
    supertitleHref,
    subtitle,
    subtitleHref,
    menu,
    xstyle,
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
  const hasAnyHref = !!(titleHref || supertitleHref || subtitleHref);

  // Determine interaction mode
  const isWholeHeaderTrigger = !!menu && !hasAnyHref;
  const isWholeHeaderLink =
    !!titleHref && !menu && !supertitleHref && !subtitleHref;

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
      {supertitle &&
        (hasAnyHref && supertitleHref && menu ? (
          <XDSLink
            label={supertitle}
            href={supertitleHref}
            color="secondary"
            size="xsm">
            {supertitle}
          </XDSLink>
        ) : (
          <span {...stylex.props(styles.supertitle)}>{supertitle}</span>
        ))}
      {hasAnyHref && titleHref && menu ? (
        <XDSLink
          label={title}
          href={titleHref}
          color="primary"
          weight="semibold">
          {title}
        </XDSLink>
      ) : (
        <span {...stylex.props(styles.title)}>{title}</span>
      )}
      {subtitle &&
        (hasAnyHref && subtitleHref && menu ? (
          <XDSLink
            label={subtitle}
            href={subtitleHref}
            color="secondary"
            size="xsm">
            {subtitle}
          </XDSLink>
        ) : (
          <span {...stylex.props(styles.subtitle)}>{subtitle}</span>
        ))}
    </span>
  );

  const chevronElement = showChevron && (
    <span {...stylex.props(styles.chevron)}>
      <ChevronDownIcon />
    </span>
  );

  // Whole header is a link (no menu, single titleHref)
  if (isWholeHeaderLink) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={titleHref}
        data-testid={testId}
        {...stylex.props(
          styles.root,
          styles.interactive,
          styles.interactiveInset,
          xstyle,
        )}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {icon && <span {...stylex.props(styles.icon)}>{icon}</span>}
        {renderTextContent()}
        {chevronElement}
      </a>
    );
  }

  // Whole header is the popover trigger (menu, no hrefs)
  if (isWholeHeaderTrigger) {
    return (
      <>
        <button
          ref={setRef as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={handleToggle}
          data-testid={testId}
          {...popover.triggerProps}
          {...stylex.props(
            styles.root,
            styles.interactive,
            styles.interactiveInset,
            xstyle,
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
  // Popover anchors to the full header div, not the chevron, so it
  // appears in the same position as the no-links case.
  if (menu && hasAnyHref) {
    return (
      <>
        <div
          ref={setRef}
          data-testid={testId}
          {...stylex.props(styles.root, xstyle)}>
          {icon &&
            (titleHref ? (
              <a href={titleHref} {...stylex.props(styles.icon)}>
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

  // Static header with independent links (no menu)
  if (hasAnyHref && !isWholeHeaderLink) {
    return (
      <div
        ref={ref}
        data-testid={testId}
        {...stylex.props(styles.root, xstyle)}
        {...props}>
        {icon &&
          (titleHref ? (
            <a href={titleHref} {...stylex.props(styles.icon)}>
              {icon}
            </a>
          ) : (
            <span {...stylex.props(styles.icon)}>{icon}</span>
          ))}
        <span {...stylex.props(styles.textContainer)}>
          {supertitle &&
            (supertitleHref ? (
              <XDSLink
                label={supertitle}
                href={supertitleHref}
                color="secondary"
                size="xsm">
                {supertitle}
              </XDSLink>
            ) : (
              <span {...stylex.props(styles.supertitle)}>{supertitle}</span>
            ))}
          {titleHref ? (
            <XDSLink
              label={title}
              href={titleHref}
              color="primary"
              weight="semibold">
              {title}
            </XDSLink>
          ) : (
            <span {...stylex.props(styles.title)}>{title}</span>
          )}
          {subtitle &&
            (subtitleHref ? (
              <XDSLink
                label={subtitle}
                href={subtitleHref}
                color="secondary"
                size="xsm">
                {subtitle}
              </XDSLink>
            ) : (
              <span {...stylex.props(styles.subtitle)}>{subtitle}</span>
            ))}
        </span>
        {chevronElement}
      </div>
    );
  }

  // Default: static header, no links, no menu
  return (
    <div
      ref={ref}
      data-testid={testId}
      {...stylex.props(styles.root, xstyle)}
      {...props}>
      {icon && <span {...stylex.props(styles.icon)}>{icon}</span>}
      {renderTextContent()}
      {chevronElement}
    </div>
  );
});

XDSSideNavHeader.displayName = 'XDSSideNavHeader';
