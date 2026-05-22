// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSSideNavHeading.tsx
 * @input Uses React, useRef, useCallback, ReactNode, StyleX, useXDSPopover
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
// TODO(#264): Lazy-load useXDSPopover so the popover/layer bundle is not
// eagerly imported when `menu` is not provided. See XDSText for an example
// of lazy loading layer resources.
import {useXDSPopover} from '../Popover/useXDSPopover';
import {XDSLink} from '../Link';
import {getIcon} from '../Icon/globalIconRegistry';
import {XDSTooltip} from '../Tooltip';
import {navItemStyles} from '../NavItem/navItemStyles.stylex';
import {useXDSSideNavCollapse} from './XDSSideNavCollapseContext';
import {useXDSLinkComponent} from '../Link/useXDSLinkComponent';
import type {XDSLinkComponentType} from '../Link/types';
import {xdsClassName, mergeProps, mergeRefs} from '../utils';
import type {XDSBaseProps} from '../XDSBaseProps';
import {useXDSMenuHover} from '../hooks/useXDSMenuHover';
import {XDSNavHeadingCloseContext} from '../NavMenu/XDSNavMenuContext';

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
      ':has(.xds-navicon)': 0,
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
      ':has(.xds-navicon)': 0,
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

export interface XDSSideNavHeadingProps extends XDSBaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Product/app icon.
   */
  icon?: ReactNode;
  /**
   * Custom component to render instead of `<a>`.
   * Overrides the provider-level default set by XDSLinkProvider.
   * Must accept href, className, style, and children props.
   */
  as?: XDSLinkComponentType;
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
   * useXDSPopover internally and shows a dropdown chevron. The trigger
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
}: XDSSideNavHeadingProps) {
  const LinkComponent = useXDSLinkComponent(as);
  const {isCollapsed} = useXDSSideNavCollapse();
  const rootRef = useRef<HTMLDivElement>(null);
  const collapsedItemRef = useRef<HTMLElement>(null);

  const popover = useXDSPopover({
    dialogLabel: 'Navigation menu',
    hasCloseButton: false,
  });

  const closeMenuCtx = useMemo(
    () => ({closeMenu: popover.hide}),
    [popover.hide],
  );

  const {triggerProps, contentProps, menuRef, setTriggerEl} =
    useXDSMenuHover<HTMLDivElement>({
      show: popover.show,
      hide: popover.hide,
      isOpen: popover.isOpen,
      isEnabled: !!menu,
      showDelay: 0,
    });

  const setRef = mergeRefs<HTMLDivElement>(
    rootRef,
    setTriggerEl as React.Ref<HTMLDivElement>,
    ref,
    menu ? (popover.triggerRef as React.Ref<HTMLDivElement>) : undefined,
  );

  // In collapsed mode: hide if no icon, show icon-only if has icon
  if (isCollapsed && !icon) {
    return null;
  }
  if (isCollapsed && icon) {
    const collapsedIcon = <span {...stylex.props(styles.icon)}>{icon}</span>;

    const collapsedSetRef = mergeRefs<HTMLElement>(
      collapsedItemRef,
      ref as React.Ref<HTMLElement>,
    );

    let collapsedElement: ReactNode;

    if (headingHref) {
      collapsedElement = (
        <LinkComponent
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
        </LinkComponent>
      );
    } else if (menu) {
      collapsedElement = (
        <>
          <button
            ref={collapsedSetRef as React.Ref<HTMLButtonElement>}
            type="button"
            aria-label={heading}
            data-testid={testId}
            {...popover.triggerProps}
            {...triggerProps}
            {...mergeProps(
              xdsClassName('side-nav-heading'),
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
              <XDSNavHeadingCloseContext value={closeMenuCtx}>
                {menu}
              </XDSNavHeadingCloseContext>
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

  // Render text content with optional inline chevron
  const renderTextContent = (inlineChevron?: ReactNode) => (
    <span {...stylex.props(styles.textContainer)}>
      {superheading &&
        (hasAnyHref && superheadingHref && menu ? (
          <XDSLink href={superheadingHref} color="secondary" size="xsm">
            {superheading}
          </XDSLink>
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
          <XDSLink href={subheadingHref} color="secondary" size="xsm">
            {subheading}
          </XDSLink>
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
          xdsClassName('side-nav-heading'),
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
            xdsClassName('side-nav-heading'),
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
            xdsClassName('side-nav-heading'),
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
          xdsClassName('side-nav-heading'),
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
              <XDSLink href={superheadingHref} color="secondary" size="xsm">
                {superheading}
              </XDSLink>
            ) : (
              <span {...stylex.props(styles.superheading)}>{superheading}</span>
            ))}
          {headingHref ? (
            <XDSLink href={headingHref} color="primary" weight="semibold">
              {heading}
            </XDSLink>
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
              <XDSLink href={subheadingHref} color="secondary" size="xsm">
                {subheading}
              </XDSLink>
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
  );
}

XDSSideNavHeading.displayName = 'XDSSideNavHeading';
