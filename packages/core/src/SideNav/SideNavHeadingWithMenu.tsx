// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useMemo, useRef, type ReactNode, lazy, Suspense} from 'react';
import * as stylex from '@stylexjs/stylex';
import {usePopover} from '../Popover/usePopover';
import {Link} from '../Link';
import {getIcon} from '../Icon/globalIconRegistry';
import {navItemStyles} from '../NavItem/navItemStyles.stylex';
import {useSideNavCollapse} from './SideNavCollapseContext';
import {useLinkComponent} from '../Link/useLinkComponent';
import {mergeProps, mergeRefs} from '../utils';
import {useMenuHover} from '../hooks/useMenuHover';
import {NavHeadingCloseContext} from '../NavMenu/NavMenuContext';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';
import {styles} from './SideNavHeading.stylex';
import type {SideNavHeadingProps} from './SideNavHeading';

const LazyTooltip = lazy(async () =>
  import('../Tooltip/Tooltip').then(mod => ({default: mod.Tooltip})),
);

export default function SideNavHeadingWithMenu({
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
  const t = useTranslator();
  const LinkComponent = useLinkComponent(as);
  const {isCollapsed} = useSideNavCollapse();
  const rootRef = useRef<HTMLDivElement>(null);
  const collapsedItemRef = useRef<HTMLElement>(null);

  const popover = usePopover({
    dialogLabel: t('@astryx.sideNav.heading.dialogLabel'),
    role: 'none',
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

  if (isCollapsed && !icon) {
    return null;
  }

  if (isCollapsed && icon) {
    const collapsedIcon = <span {...stylex.props(styles.icon)}>{icon}</span>;
    const collapsedSetRef = mergeRefs<HTMLElement>(collapsedItemRef, ref);

    const collapsedElement = (
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
                  <span {...stylex.props(styles.subheading)}>{subheading}</span>
                )}
              </span>
            </button>
            <div role="menu" aria-label={heading}>
              <NavHeadingCloseContext value={closeMenuCtx}>
                {menu}
              </NavHeadingCloseContext>
            </div>
          </div>,
          {placement: 'below', alignment: 'start', xstyle: styles.popover},
        )}
      </>
    );

    return (
      <>
        {collapsedElement}
        <Suspense fallback={null}>
          <LazyTooltip
            content={heading}
            placement="end"
            anchorRef={collapsedItemRef}
          />
        </Suspense>
      </>
    );
  }

  const showChevron = !!menu;
  const hasAnyHref = !!(headingHref || superheadingHref || subheadingHref);
  const isWholeHeadingTrigger = !!menu && !hasAnyHref;

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

  const headerEndContentElement = headerEndContent && (
    <span {...stylex.props(styles.headerEndContent)}>{headerEndContent}</span>
  );

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
              aria-label={t('@astryx.sideNav.heading.openMenu')}
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
            {...stylex.props(styles.popoverContent)}
            {...contentProps}>
            {popoverHeadingContent}
            <div role="menu" aria-label={heading}>
              {menu}
            </div>
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
            <LinkComponent
              href={headingHref}
              aria-label={heading}
              {...stylex.props(styles.icon)}>
              {icon}
            </LinkComponent>
          ) : (
            <span {...stylex.props(styles.icon)}>{icon}</span>
          ))}
        {renderTextContent(
          showChevron ? (
            <button
              type="button"
              aria-label={t('@astryx.sideNav.heading.openMenu')}
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
          {...stylex.props(styles.popoverContent)}
          {...contentProps}>
          {popoverHeadingContent}
          <div role="menu" aria-label={heading}>
            {menu}
          </div>
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

SideNavHeadingWithMenu.displayName = 'SideNavHeadingWithMenu';
