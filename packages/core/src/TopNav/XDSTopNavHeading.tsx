// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSTopNavHeading.tsx
 * @input Uses React, useRef, useCallback, ReactNode, StyleX, useXDSPopover
 * @output Exports XDSTopNavHeading component and XDSTopNavHeadingProps
 * @position Companion component for XDSTopNav heading slot
 *
 * Product/suite/account heading with smart interaction boundary logic.
 * Mirrors XDSSideNavHeading features: superheading, subheading, menu popover,
 * chevron indicator, and independent link boundaries.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/XDSTopNav.test.tsx
 * - /packages/core/src/TopNav/index.ts
 * - /apps/storybook/stories/TopNav.stories.tsx
 * - /packages/cli/templates/blocks/components/TopNav/ (showcase blocks)
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
import {useXDSPopover} from '../Popover/useXDSPopover';
import {XDSLink} from '../Link';
import {getIcon} from '../Icon/globalIconRegistry';
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
    color: colorVars['--color-text-primary'],
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
    fontWeight: fontWeightVars['--font-weight-normal'],
    textAlign: 'start',
    ':hover': {
      '@media (hover: hover)': {
        backgroundColor: colorVars['--color-overlay-hover'],
      },
    },
  },
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
  logo: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
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
  popoverOverlap: {
    minWidth: 'calc(anchor-size(width) + 16px)',
    marginBlockStart: 'calc(-1 * anchor-size(height) - 8px)',
    marginInlineStart: '-8px',
  },
});

// =============================================================================
// Types
// =============================================================================

export interface XDSTopNavHeadingProps extends XDSBaseProps<HTMLElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
  /**
   * Logo element to display before the heading.
   * Can be an image, XDSNavIcon, or any ReactNode.
   */
  logo?: ReactNode;
  /**
   * Product/app name.
   */
  heading?: string;
  /**
   * Link for the heading (e.g., product home).
   * Alias: `href` (for backward compatibility).
   */
  headingHref?: string;
  /**
   * @deprecated Use `headingHref` instead.
   * URL to navigate to when the heading is clicked.
   */
  href?: string;
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
  /**
   * Custom component to render instead of `<a>`.
   * Overrides the provider-level default set by XDSLinkProvider.
   * Must accept href, className, style, and children props.
   */
  as?: XDSLinkComponentType;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Product/suite/account heading for XDSTopNav.
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
 * <XDSTopNavHeading logo={<XDSNavIcon icon={<HomeIcon />} />} heading="My App" headingHref="/" />
 * <XDSTopNavHeading
 *   logo={<XDSNavIcon icon={<SuiteIcon />} />}
 *   superheading="Suite Name"
 *   superheadingHref="/suite"
 *   heading="Product Name"
 *   headingHref="/product"
 *   menu={<ProductSwitcher />}
 * />
 * ```
 */
export function XDSTopNavHeading({
  as,
  logo,
  heading,
  headingHref: headingHrefProp,
  href,
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
}: XDSTopNavHeadingProps) {
  const LinkComponent = useXDSLinkComponent(as);
  // Support both headingHref and legacy href
  const headingHref = headingHrefProp ?? href;

  const rootRef = useRef<HTMLElement>(null);

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

  const setRef = mergeRefs<HTMLElement>(
    rootRef,
    setTriggerEl as React.Ref<HTMLElement>,
    ref,
    menu ? (popover.triggerRef as React.Ref<HTMLElement>) : undefined,
  );

  const showChevron = !!menu;
  const hasAnyHref = !!(headingHref || superheadingHref || subheadingHref);

  // Determine interaction mode
  const isWholeHeadingTrigger = !!menu && !hasAnyHref;
  const isWholeHeadingLink =
    !!headingHref && !menu && !superheadingHref && !subheadingHref;

  // Render text content with optional inline chevron
  const renderTextContent = (inlineChevron?: ReactNode) => (
    <span {...stylex.props(styles.textContainer)}>
      {superheading &&
        (hasAnyHref && superheadingHref && menu ? (
          <XDSLink
            href={superheadingHref}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            color="secondary"
            size="xsm">
            {superheading}
          </XDSLink>
        ) : (
          <span {...stylex.props(styles.superheading)}>{superheading}</span>
        ))}
      <span {...stylex.props(styles.headingRow)}>
        {hasAnyHref && headingHref && menu ? (
          <LinkComponent
            href={headingHref}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
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
          <XDSLink
            href={subheadingHref}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
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
      {logo && <span {...stylex.props(styles.logo)}>{logo}</span>}
      {renderTextContent(
        <span {...stylex.props(styles.popoverChevron)}>
          {getIcon('chevronDown')}
        </span>,
      )}
    </button>
  );

  // Simple: no heading text, just logo (backward compat for logo-only usage)
  if (!heading && !menu) {
    const Element = headingHref ? LinkComponent : 'div';
    return (
      <Element
        ref={ref as React.Ref<HTMLAnchorElement & HTMLDivElement>}
        href={headingHref}
        data-testid={testId}
        {...mergeProps(
          xdsClassName('top-nav-heading'),
          stylex.props(
            styles.root,
            !!headingHref && styles.menuTrigger,
            xstyle,
          ),
          className,
          style,
        )}
        {...props}>
        {logo && <span {...stylex.props(styles.logo)}>{logo}</span>}
      </Element>
    );
  }

  // Whole heading is a link (no menu, single headingHref)
  if (isWholeHeadingLink && headingHref) {
    return (
      <LinkComponent
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={headingHref}
        data-testid={testId}
        {...mergeProps(
          xdsClassName('top-nav-heading'),
          stylex.props(styles.root, styles.menuTrigger, xstyle),
          className,
          style,
        )}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {logo && <span {...stylex.props(styles.logo)}>{logo}</span>}
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
            xdsClassName('top-nav-heading'),
            stylex.props(styles.root, styles.menuTrigger, xstyle),
            className,
            style,
          )}>
          {logo && <span {...stylex.props(styles.logo)}>{logo}</span>}
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
            <XDSNavHeadingCloseContext value={closeMenuCtx}>
              {menu}
            </XDSNavHeadingCloseContext>
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
  if (menu && hasAnyHref) {
    return (
      <>
        <div
          ref={setRef}
          data-testid={testId}
          {...triggerProps}
          {...mergeProps(
            xdsClassName('top-nav-heading'),
            stylex.props(styles.root, xstyle),
            className,
            style,
          )}>
          {logo &&
            (headingHref ? (
              <LinkComponent
                href={headingHref}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                {...stylex.props(styles.logo)}>
                {logo}
              </LinkComponent>
            ) : (
              <span {...stylex.props(styles.logo)}>{logo}</span>
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
            <XDSNavHeadingCloseContext value={closeMenuCtx}>
              {menu}
            </XDSNavHeadingCloseContext>
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
        ref={ref as React.Ref<HTMLDivElement>}
        data-testid={testId}
        {...mergeProps(
          xdsClassName('top-nav-heading'),
          stylex.props(styles.root, xstyle),
          className,
          style,
        )}
        {...props}>
        {logo &&
          (headingHref ? (
            <LinkComponent href={headingHref} {...stylex.props(styles.logo)}>
              {logo}
            </LinkComponent>
          ) : (
            <span {...stylex.props(styles.logo)}>{logo}</span>
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
            <span {...stylex.props(styles.heading)}>{heading}</span>
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
      ref={ref as React.Ref<HTMLDivElement>}
      data-testid={testId}
      {...mergeProps(
        xdsClassName('top-nav-heading'),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
      {...props}>
      {logo && <span {...stylex.props(styles.logo)}>{logo}</span>}
      {renderTextContent()}
      {headerEndContentElement}
      {chevronElement}
    </div>
  );
}

XDSTopNavHeading.displayName = 'XDSTopNavHeading';
