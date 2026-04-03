'use client';

/**
 * @file XDSSideNavHeading.tsx
 * @input Uses React, useRef, useCallback, ReactNode, StyleX, useXDSPopover, useTruncation
 * @output Exports XDSSideNavHeading component and XDSSideNavHeadingProps
 * @position Core implementation; used inside XDSSideNav header slot
 *
 * Product/suite/account heading with smart interaction boundary logic.
 * Composes useXDSPopover internally when menu prop is provided.
 * Detects text truncation and shows tooltip on hover for overflowing text.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SideNav/SideNav.doc.mjs
 * - /packages/core/src/SideNav/XDSSideNav.test.tsx
 * - /packages/core/src/SideNav/index.ts
 * - /apps/storybook/stories/SideNav.stories.tsx
 */

import {lazy, Suspense, useCallback, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  fontWeightVars,
  radiusVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
// TODO(#264): Lazy-load useXDSPopover so the popover/layer bundle is not
// eagerly imported when `menu` is not provided. See XDSText for an example
// of lazy loading layer resources.
import {useXDSPopover} from '../Popover/useXDSPopover';
import {XDSLink} from '../Link';
import {getIcon} from '../Icon/globalIconRegistry';
import {XDSTooltip} from '../Tooltip';
import {useTruncation} from '../Text/useTruncation';
import {navItemStyles} from '../NavItem/navItemStyles.stylex';
import {useXDSSideNavCollapse} from './XDSSideNavCollapseContext';
import {xdsClassName, mergeProps} from '../utils';

const LazyXDSTooltip = lazy(() =>
  import('../Tooltip/XDSTooltip').then(mod => ({default: mod.XDSTooltip})),
);

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-2'],
    boxSizing: 'border-box',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'default',
    overflow: 'hidden',
    minWidth: 0,
  },
  rootCollapsed: {
    justifyContent: 'center',
    paddingInline: spacingVars['--spacing-0-5'],
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
        backgroundColor: colorVars['--color-overlay-hover'],
      },
    },
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
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
    textDecoration: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  heading: {
    fontSize: typeScaleVars['--text-large-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: typeScaleVars['--text-large-leading'],
    color: colorVars['--color-text-primary'],
    textDecoration: 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // When super/sub headings are present, scale down the app name
  headingCompact: {
    fontSize: typeScaleVars['--text-label-size'],
  },
  subheading: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
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
    minWidth: spacingVars['--spacing-7'],
    minHeight: spacingVars['--spacing-7'],
    color: colorVars['--color-icon-secondary'],
  },
  headerEndContent: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  popoverContent: {
    padding: spacingVars['--spacing-1'],
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
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
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
   * Content rendered at the trailing edge of the heading row.
   * Useful for badges, status indicators, or compact action buttons.
   * Not part of the popover trigger or heading link — purely decorative/interactive.
   * Hidden when the sidebar is collapsed.
   */
  headerEndContent?: ReactNode;
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
export function XDSSideNavHeading({
  icon,
  heading,
  headingHref,
  superheading,
  superheadingHref,
  subheading,
  subheadingHref,
  menu,
  headerEndContent,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
  ...props
}: XDSSideNavHeadingProps) {
  const {isCollapsed} = useXDSSideNavCollapse();
  const rootRef = useRef<HTMLDivElement>(null);
  const collapsedItemRef = useRef<HTMLElement>(null);

  // Truncation detection for heading text elements
  const headingTruncation = useTruncation({maxLines: 1});
  const superheadingTruncation = useTruncation({maxLines: 1});
  const subheadingTruncation = useTruncation({maxLines: 1});

  // Refs for tooltip anchors
  const headingSpanRef = useRef<HTMLSpanElement>(null);
  const superheadingSpanRef = useRef<HTMLSpanElement>(null);
  const subheadingSpanRef = useRef<HTMLSpanElement>(null);

  // Merged ref callbacks for truncation + tooltip anchor
  const mergedHeadingRef = useCallback(
    (el: HTMLSpanElement | null) => {
      headingTruncation.ref(el);
      (
        headingSpanRef as React.MutableRefObject<HTMLSpanElement | null>
      ).current = el;
    },
    [headingTruncation.ref],
  );
  const mergedSuperheadingRef = useCallback(
    (el: HTMLSpanElement | null) => {
      superheadingTruncation.ref(el);
      (
        superheadingSpanRef as React.MutableRefObject<HTMLSpanElement | null>
      ).current = el;
    },
    [superheadingTruncation.ref],
  );
  const mergedSubheadingRef = useCallback(
    (el: HTMLSpanElement | null) => {
      subheadingTruncation.ref(el);
      (
        subheadingSpanRef as React.MutableRefObject<HTMLSpanElement | null>
      ).current = el;
    },
    [subheadingTruncation.ref],
  );

  const popover = useXDSPopover({
    dialogLabel: 'Navigation menu',
  });

  const handleToggle = useCallback(() => {
    popover.toggle();
  }, [popover]);

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

  // In collapsed mode: hide if no icon, show icon-only if has icon
  if (isCollapsed && !icon) {
    return null;
  }
  if (isCollapsed && icon) {
    const collapsedIcon = <span {...stylex.props(styles.icon)}>{icon}</span>;

    const collapsedSetRef = (el: HTMLElement | null) => {
      (collapsedItemRef as React.MutableRefObject<HTMLElement | null>).current =
        el;
      if (typeof ref === 'function') {
        ref(el as HTMLDivElement | null);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current =
          el as HTMLDivElement | null;
      }
    };

    let collapsedElement: ReactNode;

    if (headingHref) {
      collapsedElement = (
        <a
          ref={collapsedSetRef as React.Ref<HTMLAnchorElement>}
          href={headingHref}
          aria-label={heading}
          data-testid={testId}
          {...mergeProps(
            xdsClassName('side-nav-heading'),
            stylex.props(navItemStyles.item, styles.rootCollapsed, xstyle),
            className,
            style,
          )}>
          {collapsedIcon}
        </a>
      );
    } else {
      collapsedElement = (
        <div
          ref={collapsedSetRef}
          data-testid={testId}
          {...mergeProps(
            xdsClassName('side-nav-heading'),
            stylex.props(styles.root, styles.rootCollapsed, xstyle),
            className,
            style,
          )}
          {...props}>
          {collapsedIcon}
        </div>
      );
    }

    return (
      <>
        {collapsedElement}
        <XDSTooltip
          content={heading}
          placement="end"
          anchorRef={collapsedItemRef}
        />
      </>
    );
  }

  const showChevron = !!menu;
  const hasAnyHref = !!(headingHref || superheadingHref || subheadingHref);
  const hasCompactHeading = !!(superheading || subheading);

  // Determine interaction mode
  const isWholeHeadingTrigger = !!menu && !hasAnyHref;
  const isWholeHeadingLink =
    !!headingHref && !menu && !superheadingHref && !subheadingHref;

  // Render truncation tooltips for text spans (only in expanded mode)
  const renderTruncationTooltips = () => (
    <>
      {superheadingTruncation.isTruncated && (
        <Suspense fallback={null}>
          <LazyXDSTooltip
            content={superheading!}
            anchorRef={superheadingSpanRef}
          />
        </Suspense>
      )}
      {headingTruncation.isTruncated && (
        <Suspense fallback={null}>
          <LazyXDSTooltip content={heading} anchorRef={headingSpanRef} />
        </Suspense>
      )}
      {subheadingTruncation.isTruncated && (
        <Suspense fallback={null}>
          <LazyXDSTooltip content={subheading!} anchorRef={subheadingSpanRef} />
        </Suspense>
      )}
    </>
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
          <span
            ref={mergedSuperheadingRef}
            {...stylex.props(styles.superheading)}>
            {superheading}
          </span>
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
        <span
          ref={mergedHeadingRef}
          {...stylex.props(
            styles.heading,
            hasCompactHeading && styles.headingCompact,
          )}>
          {heading}
        </span>
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
          <span ref={mergedSubheadingRef} {...stylex.props(styles.subheading)}>
            {subheading}
          </span>
        ))}
    </span>
  );

  const chevronElement = showChevron && (
    <span {...stylex.props(styles.chevron)}>{getIcon('chevronDown')}</span>
  );

  const headerEndContentElement = headerEndContent && (
    <span {...stylex.props(styles.headerEndContent)}>{headerEndContent}</span>
  );

  // Whole heading is a link (no menu, single headingHref)
  if (isWholeHeadingLink) {
    // When headerEndContent is provided, render it outside the link
    if (headerEndContent) {
      return (
        <>
          <div
            ref={ref}
            data-testid={testId}
            {...mergeProps(
              xdsClassName('side-nav-heading'),
              stylex.props(styles.root, styles.interactive, xstyle),
              className,
              style,
            )}>
            <a
              href={headingHref}
              {...stylex.props(styles.root, styles.interactive)}
              style={{padding: 0, gap: 'inherit'}}
              {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
              {icon && <span {...stylex.props(styles.icon)}>{icon}</span>}
              {renderTextContent()}
            </a>
            {headerEndContentElement}
            {chevronElement}
          </div>
          {renderTruncationTooltips()}
        </>
      );
    }
    return (
      <>
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={headingHref}
          data-testid={testId}
          {...mergeProps(
            xdsClassName('side-nav-heading'),
            stylex.props(styles.root, styles.interactive, xstyle),
            className,
            style,
          )}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
          {icon && <span {...stylex.props(styles.icon)}>{icon}</span>}
          {renderTextContent()}
          {chevronElement}
        </a>
        {renderTruncationTooltips()}
      </>
    );
  }

  // Whole header is the popover trigger (menu, no hrefs)
  if (isWholeHeadingTrigger) {
    // When headerEndContent is provided, render it outside the button trigger
    if (headerEndContent) {
      return (
        <>
          <div
            data-testid={testId}
            {...mergeProps(
              xdsClassName('side-nav-heading'),
              stylex.props(styles.root, xstyle),
              className,
              style,
            )}>
            <button
              ref={setRef as React.Ref<HTMLButtonElement>}
              type="button"
              onClick={handleToggle}
              {...popover.triggerProps}
              {...stylex.props(styles.root, styles.interactive)}
              style={{padding: 0, gap: 'inherit'}}>
              {icon && <span {...stylex.props(styles.icon)}>{icon}</span>}
              {renderTextContent()}
              {chevronElement}
            </button>
            {headerEndContentElement}
          </div>
          {renderTruncationTooltips()}
          {popover.render(
            <div {...stylex.props(styles.popoverContent)}>{menu}</div>,
            {placement: 'below', alignment: 'start', xstyle: styles.popover},
          )}
        </>
      );
    }
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
            stylex.props(styles.root, styles.interactive, xstyle),
            className,
            style,
          )}>
          {icon && <span {...stylex.props(styles.icon)}>{icon}</span>}
          {renderTextContent()}
          {chevronElement}
        </button>
        {renderTruncationTooltips()}
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
          {headerEndContentElement}
          {showChevron && (
            <button
              type="button"
              onClick={handleToggle}
              aria-label="Open menu"
              {...popover.triggerProps}
              {...stylex.props(styles.chevron, styles.interactive)}>
              {getIcon('chevronDown')}
            </button>
          )}
        </div>
        {renderTruncationTooltips()}
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
      <>
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
                <span
                  ref={mergedSuperheadingRef}
                  {...stylex.props(styles.superheading)}>
                  {superheading}
                </span>
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
              <span
                ref={mergedHeadingRef}
                {...stylex.props(
                  styles.heading,
                  hasCompactHeading && styles.headingCompact,
                )}>
                {heading}
              </span>
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
                <span
                  ref={mergedSubheadingRef}
                  {...stylex.props(styles.subheading)}>
                  {subheading}
                </span>
              ))}
          </span>
          {headerEndContentElement}
          {chevronElement}
        </div>
        {renderTruncationTooltips()}
      </>
    );
  }

  // Default: static heading, no links, no menu
  return (
    <>
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
        {headerEndContentElement}
        {chevronElement}
      </div>
      {renderTruncationTooltips()}
    </>
  );
}

XDSSideNavHeading.displayName = 'XDSSideNavHeading';
