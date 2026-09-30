// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Link} from '../Link';
import {Tooltip} from '../Tooltip';
import {navItemStyles} from '../NavItem/navItemStyles.stylex';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {useSideNavCollapse} from './SideNavCollapseContext';
import {useLinkComponent} from '../Link/useLinkComponent';
import {mergeProps} from '../utils';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {themeProps} from '../utils/themeProps';
import {styles} from './SideNavHeading.stylex';
import type {SideNavHeadingProps} from './SideNavHeading';

export function SideNavHeadingStatic({
  as,
  icon,
  heading,
  headingHref,
  superheading,
  superheadingHref,
  subheading,
  subheadingHref,
  headerEndContent,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ref,
  ...props
}: Omit<SideNavHeadingProps, 'menu'>) {
  const LinkComponent = useLinkComponent(as);
  const {isCollapsed} = useSideNavCollapse();
  const collapsedItemRef = useRef<HTMLElement>(null);
  const collapsedSetRef = useMergedRefs<HTMLElement>(collapsedItemRef, ref);

  if (isCollapsed && !icon) {
    return null;
  }
  if (isCollapsed && icon) {
    const collapsedIcon = <span {...stylex.props(styles.icon)}>{icon}</span>;

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
            focusOutlineProps.focusVisible(
              navItemStyles.item,
              interactionOverlayStyles.backgroundColor,
              styles.rootCollapsed,
              xstyle,
            ),
            className,
            style,
          )}>
          {collapsedIcon}
        </LinkComponent>
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
        <Tooltip content={heading} placement="end" anchorRef={collapsedItemRef} />
      </>
    );
  }

  const hasAnyHref = !!(headingHref || superheadingHref || subheadingHref);
  const hasCompactHeading = !!(superheading || subheading);
  const isWholeHeadingLink =
    !!headingHref && !superheadingHref && !subheadingHref;

  const renderTextContent = () => (
    <span {...stylex.props(styles.textContainer)}>
      {superheading && (
        <span {...stylex.props(styles.superheading)}>{superheading}</span>
      )}
      <span {...stylex.props(styles.headingRow)}>
        <span {...stylex.props(styles.heading)}>{heading}</span>
      </span>
      {subheading && (
        <span {...stylex.props(styles.subheading)}>{subheading}</span>
      )}
    </span>
  );

  const headerEndContentElement = headerEndContent && (
    <span {...stylex.props(styles.headerEndContent)}>{headerEndContent}</span>
  );

  if (isWholeHeadingLink && headingHref) {
    return (
      <LinkComponent
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={headingHref}
        data-testid={testId}
        {...mergeProps(
          themeProps('side-nav-heading'),
          focusOutlineProps.focusVisible(styles.root, styles.menuTrigger, xstyle),
          className,
          style,
        )}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {icon && <span {...stylex.props(styles.icon)}>{icon}</span>}
        {renderTextContent()}
        {headerEndContentElement}
      </LinkComponent>
    );
  }

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
            <LinkComponent
              href={headingHref}
              aria-label={heading}
              {...focusOutlineProps.focusVisible(styles.icon)}>
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
      </div>
    );
  }

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
    </div>
  );
}

SideNavHeadingStatic.displayName = 'SideNavHeadingStatic';
