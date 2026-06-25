// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SideNavHeading.tsx
 * @input Uses React, useRef, useCallback, ReactNode, StyleX, usePopover
 * @output Exports SideNavHeading component and SideNavHeadingProps
 * @position Core implementation; used inside SideNav header slot
 *
 * Product/suite/account heading with smart interaction boundary logic.
 * Composes usePopover internally when menu prop is provided.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SideNav/SideNav.doc.mjs
 * - /packages/core/src/SideNav/SideNav.test.tsx
 * - /packages/core/src/SideNav/index.ts
 * - /apps/storybook/stories/SideNav.stories.tsx
 * - /packages/cli/templates/blocks/components/SideNav/ (showcase blocks)
 */

import {useMemo, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  fontWeightVars,
  radiusVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
// TODO(#264): Lazy-load usePopover so the popover/layer bundle is not
// eagerly imported when `menu` is not provided. See Text for an example
// of lazy loading layer resources.
import {usePopover} from '../Popover/usePopover';
import {Link} from '../Link';
import {getIcon} from '../Icon/globalIconRegistry';
import {Tooltip} from '../Tooltip';
import {navItemStyles} from '../NavItem/navItemStyles.stylex';
import {useSideNavCollapse} from './SideNavCollapseContext';
import {useLinkComponent} from '../Link/useLinkComponent';
import type {LinkComponentType} from '../Link/types';
import {mergeProps, mergeRefs} from '../utils';
import type {BaseProps} from '../BaseProps';
import {useMenuHover} from '../hooks/useMenuHover';
import {NavHeadingCloseContext} from '../NavMenu/NavMenuContext';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    minHeight: spacingVars['--spacing-8'],
    paddingInlineStart: {
      default: spacingVars['--spacing-2'],
      ':has(.astryx-navicon)': 0,
    },
    paddingInlineEnd: spacingVars['--spacing-2'],
    paddingBlock: 0,
    boxSizing: 'border-box',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'default',
  },
  rootCollapsed: {
    justifyContent: 'center',
    paddingInline: 0,
  },
  interactive: {
    cursor: 'pointer',
    borderRadius: radiusVars['--radius-element'],
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: fontWeightVars['--font-weight-normal'],
    textAlign: 'start',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: colorVars['--color-overlay-hover'],
      },
    },
  },
  // Menu trigger: like interactive but no hover background.
  // Only cursor:pointer signals interactivity; the popover provides context.
  menuTrigger: {
    cursor: 'pointer',
    borderRadius: radiusVars['--radius-element'],
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: fontWeightVars['--font-weight-normal'],
    textAlign: 'start',
  },
  interactiveCollapsed: {
    backgroundColor: {
      default: 'transparent',
      ':hover': {
        '@media (hover: hover)': 'transparent',
      },
    },
  },
  icon: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  // When super/sub headings are present, keep same size but allow compact layout
  headingCompact: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
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
  headingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  headingLink: {
    textDecoration: 'none',
    color: 'inherit',
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
    marginInlineStart: 'auto',
  },
  popoverContent: {
    padding: spacingVars['--spacing-1'],
    overflow: 'hidden',
  },
  // Static heading replica inside the popover — matches inline heading layout.
  // Clickable to close the popover.
  popoverHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    width: '100%',
    border: 'none',
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    color: 'inherit',
    textAlign: 'start',
    minHeight: spacingVars['--spacing-8'],
    paddingInlineStart: {
      default: spacingVars['--spacing-2'],
      ':has(.astryx-navicon)': 0,
    },
    paddingInlineEnd: spacingVars['--spacing-2'],
    paddingBlock: 0,
    marginBlockStart: spacingVars['--spacing-1'],
    marginBlockEnd: spacingVars['--spacing-2'],
    marginInline: spacingVars['--spacing-1'],
    cursor: 'pointer',
  },
  // Chevron inside the popover heading — same as chevron but rotated up
  popoverChevron: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: spacingVars['--spacing-7'],
    minHeight: spacingVars['--spacing-7'],
    color: colorVars['--color-icon-secondary'],
    transform: 'rotate(180deg)',
  },
  popover: {
    minWidth: 'anchor-size(width)',
    marginBlockStart: spacingVars['--spacing-1'],
  },
  // Overlap variant: popover covers the trigger so heading appears "in place".
  // Add 4px padding inside, then widen and shift to compensate so the
  // heading text inside the popover still aligns with the inline heading.
  popoverOverlap: {
    minWidth: 'calc(anchor-size(width) + 16px)',
    marginBlockStart: 'calc(-1 * anchor-size(height) - 8px)',
    marginInlineStart: '-8px',
  },
});

// =============================================================================
// Types
// =============================================================================

export interface SideNavHeadingProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Product/app icon.
   */
  icon?: ReactNode;
  /**
   * Custom component to render instead of `<a>`.
   * Overrides the provider-level default set by LinkProvider.
   * Must accept href, className, style, and children props.
   */
  as?: LinkComponentType;
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
   * Content rendered at the trailing edge of the heading row.
   * Hidden in collapsed mode.
   */
  headerEndContent?: ReactNode;
  /**
   * Menu content shown in a popover. When provided, the header composes
   * usePopover internally and shows a dropdown chevron. The trigger
   * boundary is determined automatically:
   * - No hrefs → whole header is the trigger
   * - With hrefs → links are independent, chevron/remaining area is the trigger
   */
  menu?: ReactNode;
}

// =============================================================================

// =============================================================================
// Component
// =============================================================================

/**
 * Product/suite/account heading for SideNav.
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
 * <SideNavHeading icon={<AppIcon />} heading="My App" headingHref="/" />
 * <SideNavHeading
 *   icon={<SuiteIcon />}
 *   superheading="Suite Name"
 *   superheadingHref="/suite"
 *   heading="Product Name"
 *   headingHref="/product"
 *   menu={<ProductSwitcher />}
 * />
 * <SideNavHeading
 *   icon={<AppIcon />}
 *   heading="Product Name"
 *   subheading="Business Account"
 *   menu={<AccountSwitcher />}
 * />
 * ```
 */
export function SideNavHeading({
  as,
  icon,
  heading,
  headingHref,
  superheading,
  superheadingHref,
  subheading,
  subheadingHref,
  headerEndContent,
  menu,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
  ...props
}: SideNavHeadingProps) {
  const LinkComponent = useLinkComponent(as);
  const {isCollapsed} = useSideNavCollapse();
  const rootRef = useRef<HTMLDivElement>(null);
  const collapsedItemRef = useRef<HTMLElement>(null);

  const popover = usePopover({
    dialogLabel: 'Navigation menu',
    hasCloseButton: false,
  });

  const closeMenuCtx = useMemo(
    () => ({closeMenu: popover.hide}),
    [popover.hide],
  );

  const {triggerProps, contentProps, menuRef, setTriggerEl} =
    useMenuHover<HTMLDivElement>({
      show: popover.show,
      hide: popover.hide,
      isOpen: popover.isOpen,
      isEnabled: !!menu,
      showDelay: 0,
    });

  const setRef = mergeRefs<HTMLDivElement>(
    rootRef,
    setTriggerEl,
    ref,
    menu ? popover.triggerRef : undefined,
  );

  // In collapsed mode: hide if no icon, show icon-only if has icon
  if (isCollapsed && !icon) {
    return null;
  }
  if (isCollapsed && icon) {
    const collapsedIcon = <span {...stylex.props(styles.icon)}>{icon}</span>;

    const collapsedSetRef = mergeRefs<HTMLElement>(collapsedItemRef, ref);

    let collapsedElement: ReactNode;

    if (headingHref) {
      collapsedElement = (
        <LinkComponent
          ref={collapsedSetRef as React.Ref<HTMLAnchorElement>}
          href={headingHref}
          aria-label={heading}
          data-testid={testId}
          {...mergeProps(
            themeProps('side-nav-heading'),
            stylex.props(navItemStyles.item, styles.rootCollapsed, xstyle),
            className,
            style,
          )}>
          {collapsedIcon}
        </LinkComponent>
      );
    } else if (menu) {
      collapsedElement = (
        <>
          <button
            ref={collapsedSetRef}
            type="button"
            aria-label={heading}
            data-testid={testId}
            {...popover.triggerProps}
            {...triggerProps}
            {...mergeProps(
              themeProps('side-nav-heading'),
              stylex.props(
                navItemStyles.item,
                styles.rootCollapsed,
                styles.menuTrigger,
                xstyle,
              ),
              className,
              style,
            )}>
            {collapsedIcon}
          </button>
          {popover.render(
            <div
              ref={menuRef}
              role="menu"
              {...stylex.props(styles.popoverContent)}
              {...contentProps}>
              <button
                type="button"
                {...stylex.props(styles.popoverHeading)}
                onClick={triggerProps.onClick}>
                {icon && <span {...stylex.props(styles.icon)}>{icon}</span>}
                <span {...stylex.props(styles.textContainer)}>
                  {superheading && (
                    <span {...stylex.props(styles.superheading)}>
                      {superheading}
                    </span>
                  )}
                  <span {...stylex.props(styles.headingRow)}>
                    <span
                      {...stylex.props(
                        styles.heading,
                        !!(superheading || subheading) && styles.headingCompact,
                      )}>
                      {heading}
                    </span>
                    <span {...stylex.props(styles.popoverChevron)}>
                      {getIcon('chevronDown')}
                    </span>
                  </span>
                  {subheading && (
                    <span {...stylex.props(styles.subheading)}>
                      {subheading}
                    </span>
                  )}
                </span>
              </button>
              <NavHeadingCloseContext value={closeMenuCtx}>
                {menu}
              </NavHeadingCloseContext>
            </div>,
            {placement: 'below', alignment: 'start', xstyle: styles.popover},
          )}
        </>
      );
    } else {
      collapsedElement = (
        <div
          ref={collapsedSetRef}
          data-testid={testId}
          {...mergeProps(
            themeProps('side-nav-heading'),
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
        <Tooltip
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

  // Render text content with optional inline chevron
  const renderTextContent = (inlineChevron?: ReactNode) => (
    <span {...stylex.props(styles.textContainer)}>
      {superheading &&
        (hasAnyHref && superheadingHref && menu ? (
          <Link href={superheadingHref} color="secondary" size="xsm">
            {superheading}
          </Link>
        ) : (
          <span {...stylex.props(styles.superheading)}>{superheading}</span>
        ))}
      <span {...stylex.props(styles.headingRow)}>
        {hasAnyHref && headingHref && menu ? (
          <LinkComponent
            href={headingHref}
            {...stylex.props(styles.heading, styles.headingLink)}>
            {heading}
          </LinkComponent>
        ) : (
          <span {...stylex.props(styles.heading)}>{heading}</span>
        )}
        {inlineChevron}
      </span>
      {subheading &&
        (hasAnyHref && subheadingHref && menu ? (
          <Link href={subheadingHref} color="secondary" size="xsm">
            {subheading}
          </Link>
        ) : (
          <span {...stylex.props(styles.subheading)}>{subheading}</span>
        ))}
    </span>
  );

  const chevronElement = showChevron && (
    <span {...stylex.props(styles.chevron)}>{getIcon('chevronDown')}</span>
  );

  const headerEndContentElement = headerEndContent && (
    <span {...stylex.props(styles.headerEndContent)}>{headerEndContent}</span>
  );

  // Shared popover heading content — uses renderTextContent for consistent
  // sizing, with flipped chevron inline after the title. Always static (no links).
  const popoverHeadingContent = (
    <button
      type="button"
      {...stylex.props(styles.popoverHeading)}
      onClick={triggerProps.onClick}>
      {icon && <span {...stylex.props(styles.icon)}>{icon}</span>}
      {renderTextContent(
        <span {...stylex.props(styles.popoverChevron)}>
          {getIcon('chevronDown')}
        </span>,
      )}
    </button>
  );

  // Whole heading is a link (no menu, single headingHref)
  if (isWholeHeadingLink && headingHref) {
    return (
      <LinkComponent
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={headingHref}
        data-testid={testId}
        {...mergeProps(
          themeProps('side-nav-heading'),
          stylex.props(styles.root, styles.menuTrigger, xstyle),
          className,
          style,
        )}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {icon && <span {...stylex.props(styles.icon)}>{icon}</span>}
        {renderTextContent()}
        {headerEndContentElement}
        {chevronElement}
      </LinkComponent>
    );
  }

  // Whole header is the popover trigger (menu, no hrefs)
  if (isWholeHeadingTrigger) {
    return (
      <>
        <div
          ref={setRef}
          data-testid={testId}
          {...triggerProps}
          {...mergeProps(
            themeProps('side-nav-heading'),
            stylex.props(styles.root, styles.menuTrigger, xstyle),
            className,
            style,
          )}>
          {icon && <span {...stylex.props(styles.icon)}>{icon}</span>}
          {renderTextContent(
            <button
              type="button"
              aria-label="Open menu"
              onClick={e => {
                e.stopPropagation();
                triggerProps.onClick();
              }}
              {...popover.triggerProps}
              {...stylex.props(styles.chevron, styles.interactive)}>
              {getIcon('chevronDown')}
            </button>,
          )}
          {headerEndContentElement}
        </div>
        {popover.render(
          <div
            ref={menuRef}
            role="menu"
            {...stylex.props(styles.popoverContent)}
            {...contentProps}>
            {popoverHeadingContent}
            {menu}
          </div>,
          {
            placement: 'below',
            alignment: 'start',
            xstyle: styles.popoverOverlap,
          },
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
          {...triggerProps}
          {...mergeProps(
            themeProps('side-nav-heading'),
            stylex.props(styles.root, xstyle),
            className,
            style,
          )}>
          {icon &&
            (headingHref ? (
              <LinkComponent href={headingHref} {...stylex.props(styles.icon)}>
                {icon}
              </LinkComponent>
            ) : (
              <span {...stylex.props(styles.icon)}>{icon}</span>
            ))}
          {renderTextContent(
            showChevron ? (
              <button
                type="button"
                aria-label="Open menu"
                onClick={e => {
                  e.stopPropagation();
                  triggerProps.onClick();
                }}
                {...popover.triggerProps}
                {...stylex.props(styles.chevron, styles.interactive)}>
                {getIcon('chevronDown')}
              </button>
            ) : undefined,
          )}
          {headerEndContentElement}
        </div>
        {popover.render(
          <div
            ref={menuRef}
            role="menu"
            {...stylex.props(styles.popoverContent)}
            {...contentProps}>
            {popoverHeadingContent}
            {menu}
          </div>,
          {
            placement: 'below',
            alignment: 'start',
            xstyle: styles.popoverOverlap,
          },
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
          themeProps('side-nav-heading'),
          stylex.props(styles.root, xstyle),
          className,
          style,
        )}
        {...props}>
        {icon &&
          (headingHref ? (
            <LinkComponent href={headingHref} {...stylex.props(styles.icon)}>
              {icon}
            </LinkComponent>
          ) : (
            <span {...stylex.props(styles.icon)}>{icon}</span>
          ))}
        <span {...stylex.props(styles.textContainer)}>
          {superheading &&
            (superheadingHref ? (
              <Link href={superheadingHref} color="secondary" size="xsm">
                {superheading}
              </Link>
            ) : (
              <span {...stylex.props(styles.superheading)}>{superheading}</span>
            ))}
          {headingHref ? (
            <Link href={headingHref} color="primary" weight="semibold">
              {heading}
            </Link>
          ) : (
            <span
              {...stylex.props(
                styles.heading,
                hasCompactHeading && styles.headingCompact,
              )}>
              {heading}
            </span>
          )}
          {subheading &&
            (subheadingHref ? (
              <Link href={subheadingHref} color="secondary" size="xsm">
                {subheading}
              </Link>
            ) : (
              <span {...stylex.props(styles.subheading)}>{subheading}</span>
            ))}
        </span>
        {headerEndContentElement}
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
        themeProps('side-nav-heading'),
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
  );
}

SideNavHeading.displayName = 'SideNavHeading';
