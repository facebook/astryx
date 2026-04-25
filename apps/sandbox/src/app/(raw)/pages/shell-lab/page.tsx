'use client';

import {useState, useCallback} from 'react';
import * as stylex from '@stylexjs/stylex';

import {XDSAppShell} from '@xds/core/AppShell';
import type {XDSMobileNavConfig} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
  XDSSideNavCollapseButton,
} from '@xds/core/SideNav';
import {
  XDSTopNav,
  XDSTopNavHeading,
  XDSTopNavItem,
  XDSTopNavMenu,
  XDSTopNavMegaMenu,
  XDSTopNavMegaMenuItem,
  XDSTopNavMegaMenuFeaturedCard,
} from '@xds/core/TopNav';
import {XDSMobileNav, XDSMobileNavToggle} from '@xds/core/MobileNav';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSSelector} from '@xds/core/Selector';
import {XDSCard} from '@xds/core/Card';
import {XDSDivider} from '@xds/core/Divider';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSNavIcon} from '@xds/core/NavIcon';
import {XDSBanner} from '@xds/core/Banner';
import {XDSList, XDSListItem} from '@xds/core/List';
import {XDSNavMenuItem} from '@xds/core/NavMenu';
import {useXDSResizable} from '@xds/core/Resizable';

// =============================================================================
// Configuration types
// =============================================================================

// Simple icon components for shell lab demo
const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const MessagesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
  </svg>
);
const ProjectsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
  </svg>
);
const DocsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    {...props}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

/**
 * A React component that renders null. Simulates the Next.js parallel route
 * pattern where a slot (e.g. @sidebar/default.tsx) returns null — the slot
 * still receives a React element, but it produces no DOM output.
 */
function EmptySlot() {
  return null;
}

interface ShellConfig {
  variant: 'wash' | 'surface' | 'section' | 'elevated';
  height: 'fill' | 'auto';
  sideNavBreakpoint: 'sm' | 'md' | 'lg' | 'none';
  sideNavMode: 'show' | 'hide' | 'empty-component';
  topNavMode: 'show' | 'hide' | 'empty-component';
  showBanner: boolean;
  showFooter: boolean;
  showFooterIcons: boolean;
  showTopContent: boolean;
  sideNavHeadingStyle: 'none' | 'simple' | 'link' | 'menu' | 'full';
  showSuperheading: boolean;
  showSubheading: boolean;
  headingIconStyle: 'navicon' | 'icon' | 'none';
  showNestedItems: boolean;
  isCollapsible: boolean;
  isResizable: boolean;
  collapseToggleLocation: 'sidenav' | 'topnav';
  mobileNavMode: 'auto' | 'customContent' | 'customToggle' | 'disabled';
  mobileNavSide: 'auto' | 'start' | 'end';
  topNavAlignment: 'none' | 'start' | 'center' | 'end';
  topNavStyle: 'items' | 'menus' | 'mega';
  showTopNavHeading: boolean;
  topNavHeadingStyle: 'none' | 'simple' | 'link' | 'menu' | 'full';
  topNavHeadingIconStyle: 'navicon' | 'icon' | 'none';
  showTopNavSuperheading: boolean;
  showTopNavSubheading: boolean;
}

const DEFAULT_CONFIG: ShellConfig = {
  variant: 'section',
  height: 'fill',
  sideNavBreakpoint: 'md',
  sideNavMode: 'show',
  topNavMode: 'show',
  showBanner: false,
  showFooter: false,
  showFooterIcons: true,
  showTopContent: true,
  sideNavHeadingStyle: 'link',
  showSuperheading: false,
  showSubheading: false,
  headingIconStyle: 'navicon',
  showNestedItems: true,
  isCollapsible: true,
  isResizable: false,
  collapseToggleLocation: 'sidenav',
  mobileNavMode: 'auto',
  mobileNavSide: 'auto',
  topNavAlignment: 'start',
  topNavStyle: 'items',
  showTopNavHeading: true,
  topNavHeadingStyle: 'link',
  topNavHeadingIconStyle: 'navicon',
  showTopNavSuperheading: false,
  showTopNavSubheading: false,
};

// =============================================================================
// Configuration Panel
// =============================================================================

function ConfigPanel({
  config,
  onChange,
}: {
  config: ShellConfig;
  onChange: (update: Partial<ShellConfig>) => void;
}) {
  return (
    <XDSCard>
      <XDSVStack gap={5} xstyle={styles.padding4}>
        <XDSHeading level={3}>Shell Configuration</XDSHeading>

        {/* AppShell */}
        <XDSVStack gap={3}>
          <XDSText type="label" weight="bold">
            AppShell
          </XDSText>
          <SelectorRow
            label="Variant"
            value={config.variant}
            onChange={v => onChange({variant: v as ShellConfig['variant']})}
            options={[
              {value: 'section', label: 'Section'},
              {value: 'wash', label: 'Wash'},
              {value: 'surface', label: 'Surface'},
              {value: 'elevated', label: 'Elevated'},
            ]}
          />
          <SelectorRow
            label="Height"
            value={config.height}
            onChange={v => onChange({height: v as 'fill' | 'auto'})}
            options={[
              {value: 'fill', label: 'Fill'},
              {value: 'auto', label: 'Auto'},
            ]}
          />
          <ToggleRow
            label="Banner"
            value={config.showBanner}
            onChange={v => onChange({showBanner: v})}
          />
        </XDSVStack>

        <XDSDivider />

        {/* SideNav */}
        <XDSVStack gap={3}>
          <XDSText type="label" weight="bold">
            SideNav
          </XDSText>
          <SelectorRow
            label="Mode"
            value={config.sideNavMode}
            onChange={v =>
              onChange({
                sideNavMode: v as ShellConfig['sideNavMode'],
              })
            }
            options={[
              {value: 'show', label: 'Show'},
              {value: 'hide', label: 'Hide'},
              {value: 'empty-component', label: 'Empty Component'},
            ]}
          />
          <SelectorRow
            label="Heading"
            value={config.sideNavHeadingStyle}
            onChange={v =>
              onChange({
                sideNavHeadingStyle: v as ShellConfig['sideNavHeadingStyle'],
              })
            }
            options={[
              {value: 'none', label: 'None'},
              {value: 'simple', label: 'Simple'},
              {value: 'link', label: 'Link'},
              {value: 'menu', label: 'Menu'},
              {value: 'full', label: 'Full'},
            ]}
          />
          <SelectorRow
            label="Icon"
            value={config.headingIconStyle}
            onChange={v =>
              onChange({
                headingIconStyle: v as ShellConfig['headingIconStyle'],
              })
            }
            options={[
              {value: 'navicon', label: 'NavIcon'},
              {value: 'icon', label: 'Icon (24px)'},
              {value: 'none', label: 'None'},
            ]}
          />
          <ToggleRow
            label="Superheading"
            value={config.showSuperheading}
            onChange={v => onChange({showSuperheading: v})}
          />
          <ToggleRow
            label="Subheading"
            value={config.showSubheading}
            onChange={v => onChange({showSubheading: v})}
          />
          <ToggleRow
            label="Top Content"
            value={config.showTopContent}
            onChange={v => onChange({showTopContent: v})}
          />
          <ToggleRow
            label="Nested Items"
            value={config.showNestedItems}
            onChange={v => onChange({showNestedItems: v})}
          />
          <ToggleRow
            label="Footer"
            value={config.showFooter}
            onChange={v => onChange({showFooter: v})}
          />
          <ToggleRow
            label="Footer Icons"
            value={config.showFooterIcons}
            onChange={v => onChange({showFooterIcons: v})}
          />
          <ToggleRow
            label="Collapsible"
            value={config.isCollapsible}
            onChange={v => onChange({isCollapsible: v})}
          />
          {config.isCollapsible && (
            <SelectorRow
              label="Toggle Location"
              value={config.collapseToggleLocation}
              onChange={v =>
                onChange({collapseToggleLocation: v as 'sidenav' | 'topnav'})
              }
              options={[
                {value: 'sidenav', label: 'SideNav'},
                {value: 'topnav', label: 'TopNav'},
              ]}
            />
          )}
          <ToggleRow
            label="Resizable"
            value={config.isResizable}
            onChange={v => onChange({isResizable: v})}
          />
        </XDSVStack>

        <XDSDivider />

        {/* TopNav */}
        <XDSVStack gap={3}>
          <XDSText type="label" weight="bold">
            TopNav
          </XDSText>
          <SelectorRow
            label="Mode"
            value={config.topNavMode}
            onChange={v =>
              onChange({
                topNavMode: v as ShellConfig['topNavMode'],
              })
            }
            options={[
              {value: 'show', label: 'Show'},
              {value: 'hide', label: 'Hide'},
              {value: 'empty-component', label: 'Empty Component'},
            ]}
          />
          <ToggleRow
            label="Heading"
            value={config.showTopNavHeading}
            onChange={v => onChange({showTopNavHeading: v})}
          />
          {config.showTopNavHeading && (
            <>
              <SelectorRow
                label="Heading Style"
                value={config.topNavHeadingStyle}
                onChange={v =>
                  onChange({
                    topNavHeadingStyle: v as ShellConfig['topNavHeadingStyle'],
                  })
                }
                options={[
                  {value: 'none', label: 'None'},
                  {value: 'simple', label: 'Simple'},
                  {value: 'link', label: 'Link'},
                  {value: 'menu', label: 'Menu'},
                  {value: 'full', label: 'Full'},
                ]}
              />
              <SelectorRow
                label="Icon"
                value={config.topNavHeadingIconStyle}
                onChange={v =>
                  onChange({
                    topNavHeadingIconStyle:
                      v as ShellConfig['topNavHeadingIconStyle'],
                  })
                }
                options={[
                  {value: 'navicon', label: 'NavIcon'},
                  {value: 'icon', label: 'Icon (24px)'},
                  {value: 'none', label: 'None'},
                ]}
              />
              <ToggleRow
                label="Superheading"
                value={config.showTopNavSuperheading}
                onChange={v => onChange({showTopNavSuperheading: v})}
              />
              <ToggleRow
                label="Subheading"
                value={config.showTopNavSubheading}
                onChange={v => onChange({showTopNavSubheading: v})}
              />
            </>
          )}
          <SelectorRow
            label="Alignment"
            value={config.topNavAlignment}
            onChange={v =>
              onChange({topNavAlignment: v as ShellConfig['topNavAlignment']})
            }
            options={[
              {value: 'none', label: 'None'},
              {value: 'start', label: 'Start'},
              {value: 'center', label: 'Center'},
              {value: 'end', label: 'End'},
            ]}
          />
          <SelectorRow
            label="Style"
            value={config.topNavStyle}
            onChange={v =>
              onChange({topNavStyle: v as ShellConfig['topNavStyle']})
            }
            options={[
              {value: 'items', label: 'Items'},
              {value: 'menus', label: 'Menus'},
              {value: 'mega', label: 'Mega'},
            ]}
          />
        </XDSVStack>

        <XDSDivider />

        {/* Mobile Nav */}
        <XDSVStack gap={3}>
          <XDSText type="label" weight="bold">
            Mobile Nav
          </XDSText>
          <SelectorRow
            label="Mode"
            value={config.mobileNavMode}
            onChange={v =>
              onChange({mobileNavMode: v as ShellConfig['mobileNavMode']})
            }
            options={[
              {value: 'auto', label: 'Auto'},
              {value: 'customContent', label: 'Custom Content'},
              {value: 'customToggle', label: 'Custom Toggle'},
              {value: 'disabled', label: 'Disabled'},
            ]}
          />
          {config.mobileNavMode !== 'disabled' && (
            <SelectorRow
              label="Breakpoint"
              value={config.sideNavBreakpoint}
              onChange={v =>
                onChange({
                  sideNavBreakpoint: v as ShellConfig['sideNavBreakpoint'],
                })
              }
              options={[
                {value: 'sm', label: 'SM'},
                {value: 'md', label: 'MD'},
                {value: 'lg', label: 'LG'},
                {value: 'none', label: 'None'},
              ]}
            />
          )}
          {config.mobileNavMode === 'customContent' && (
            <SelectorRow
              label="Side"
              value={config.mobileNavSide}
              onChange={v =>
                onChange({mobileNavSide: v as 'auto' | 'start' | 'end'})
              }
              options={[
                {value: 'auto', label: 'Auto'},
                {value: 'start', label: 'Start'},
                {value: 'end', label: 'End'},
              ]}
            />
          )}
        </XDSVStack>
      </XDSVStack>
    </XDSCard>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <XDSHStack gap={4} vAlign="center" hAlign="between">
      <XDSText type="body">{label}</XDSText>
      <XDSSwitch value={value} onChange={onChange} label={label} />
    </XDSHStack>
  );
}

function SelectorRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: {value: string; label: string}[];
}) {
  return (
    <XDSHStack gap={4} vAlign="center">
      <XDSText type="body" style={{width: 140, flexShrink: 0}}>
        {label}
      </XDSText>
      <XDSSelector
        label={label}
        isLabelHidden
        value={value}
        onChange={onChange}
        options={options.map(o => o.value)}
      />
    </XDSHStack>
  );
}

// =============================================================================
// Sample Nav Content
// =============================================================================

function SampleSideNav({
  config,
  externalCollapsed,
  setExternalCollapsed,
}: {
  config: ShellConfig;
  externalCollapsed?: boolean;
  setExternalCollapsed?: (v: boolean) => void;
}) {
  const sidebar = useXDSResizable({
    defaultSize: 260,
    minSizePx: 180,
    maxSizePx: 480,
  });

  const appNavIcon = (
    <XDSNavIcon
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="16"
          height="16">
          <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.36.2-.8.2-1.14 0l-7.9-4.44A.991.991 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.36-.2.8-.2 1.14 0l7.9 4.44c.32.17.53.5.53.88v9z" />
        </svg>
      }
    />
  );

  const appBareIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width="24"
      height="24">
      <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.36.2-.8.2-1.14 0l-7.9-4.44A.991.991 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.36-.2.8-.2 1.14 0l7.9 4.44c.32.17.53.5.53.88v9z" />
    </svg>
  );

  const appIcon =
    config.headingIconStyle === 'navicon'
      ? appNavIcon
      : config.headingIconStyle === 'icon'
        ? appBareIcon
        : undefined;

  const headingMenu = (
    <>
      <XDSNavMenuItem label="Sibling Product 1" onClick={() => {}} />
      <XDSNavMenuItem label="Sibling Product 2" onClick={() => {}} />
      <XDSNavMenuItem label="Sibling Product 3" onClick={() => {}} />
    </>
  );

  const heading =
    config.sideNavHeadingStyle === 'none' ? undefined : (
      <XDSSideNavHeading
        icon={appIcon}
        heading="Shell Lab"
        headingHref={
          config.sideNavHeadingStyle === 'link' ||
          config.sideNavHeadingStyle === 'full'
            ? '#'
            : undefined
        }
        superheading={config.showSuperheading ? 'Acme Suite' : undefined}
        superheadingHref={config.showSuperheading ? '#' : undefined}
        subheading={config.showSubheading ? 'Business Account' : undefined}
        menu={
          config.sideNavHeadingStyle === 'menu' ||
          config.sideNavHeadingStyle === 'full'
            ? headingMenu
            : undefined
        }
      />
    );

  return (
    <>
      <XDSSideNav
        collapsible={
          config.isCollapsible
            ? config.collapseToggleLocation === 'topnav'
              ? {
                  isCollapsed: externalCollapsed,
                  onCollapsedChange: setExternalCollapsed,
                  hasButton: false,
                }
              : true
            : false
        }
        resizable={config.isResizable ? sidebar.props : false}
        header={heading}
        topContent={
          config.showTopContent ? (
            <XDSSideNavItem label="Create New" />
          ) : undefined
        }
        footer={
          config.showFooter ? (
            <XDSSideNavSection title="Account">
              <XDSSideNavItem label="Jane Smith" />
              <XDSSideNavItem label="Upgrade to Pro" />
            </XDSSideNavSection>
          ) : undefined
        }
        footerIcons={
          config.showFooterIcons ? (
            <>
              <XDSButton
                label="Help"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    width="16"
                    height="16">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                    <circle cx="12" cy="17" r=".5" fill="currentColor" />
                  </svg>
                }
                variant="ghost"
                isIconOnly
              />
              <XDSButton
                label="Settings"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    width="16"
                    height="16">
                    <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                }
                variant="ghost"
                isIconOnly
              />
            </>
          ) : undefined
        }>
        <XDSSideNavSection title="Navigation">
          <XDSSideNavItem
            label="Dashboard"
            isSelected
            href="#"
            icon={DashboardIcon}
          />
          <XDSSideNavItem
            label="Projects"
            href="#"
            icon={ProjectsIcon}
            endContent={<XDSBadge label={3} />}
          />
          <XDSSideNavItem label="Messages" href="#" icon={MessagesIcon} />
          {config.showNestedItems && (
            <XDSSideNavItem label="Settings" href="#" icon={SettingsIcon}>
              <XDSSideNavItem label="General" href="#" />
              <XDSSideNavItem label="Security" href="#" />
              <XDSSideNavItem label="Notifications" href="#" />
            </XDSSideNavItem>
          )}
        </XDSSideNavSection>
        <XDSSideNavSection title="Resources">
          <XDSSideNavItem label="Documentation" href="#" icon={DocsIcon} />
          <XDSSideNavItem label="API Reference" href="#" />
          <XDSSideNavItem label="Support" href="#" />
        </XDSSideNavSection>
      </XDSSideNav>
    </>
  );
}

function SampleTopNav({
  config,
  onToggleCollapse,
}: {
  config: ShellConfig;
  onToggleCollapse?: () => void;
}) {
  const plainItems = (
    <>
      <XDSTopNavItem label="Home" href="#" isSelected />
      <XDSTopNavItem label="Products" href="#" />
      <XDSTopNavItem label="Team" href="#" />
      <XDSTopNavItem label="Reports" href="#" />
    </>
  );

  const menuItems = (
    <>
      <XDSTopNavItem label="Home" href="#" isSelected />
      <XDSTopNavMenu
        label="Products"
        items={[
          {
            title: 'Analytics',
            description: 'View metrics and dashboards',
            href: '#',
          },
          {
            title: 'Reports',
            description: 'Generate and export reports',
            href: '#',
          },
          {
            title: 'Pipelines',
            description: 'Data processing workflows',
            href: '#',
          },
        ]}
      />
      <XDSTopNavItem label="Team" href="#" />
    </>
  );

  const megaItems = (
    <>
      <XDSTopNavItem label="Home" href="#" isSelected />
      <XDSTopNavMegaMenu
        label="Products"
        items={
          <>
            <XDSTopNavMegaMenuItem
              title="Analytics"
              description="View metrics and dashboards"
              href="#"
            />
            <XDSTopNavMegaMenuItem
              title="Reports"
              description="Generate and export reports"
              href="#"
            />
            <XDSTopNavMegaMenuItem
              title="Pipelines"
              description="Data processing workflows"
              href="#"
            />
            <XDSTopNavMegaMenuItem
              title="Integrations"
              description="Connect your tools"
              href="#"
            />
          </>
        }
        featured={
          <XDSTopNavMegaMenuFeaturedCard
            title="New: AI Features"
            description="Explore our latest AI-powered analytics tools for faster insights."
            linkLabel="Learn more"
            linkHref="#"
          />
        }
      />
      <XDSTopNavItem label="Team" href="#" />
    </>
  );

  const navItems =
    config.topNavStyle === 'mega'
      ? megaItems
      : config.topNavStyle === 'menus'
        ? menuItems
        : plainItems;

  const topNavNavIcon = (
    <XDSNavIcon
      icon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="16"
          height="16">
          <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.36.2-.8.2-1.14 0l-7.9-4.44A.991.991 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.36-.2.8-.2 1.14 0l7.9 4.44c.32.17.53.5.53.88v9z" />
        </svg>
      }
    />
  );

  const topNavBareIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width="24"
      height="24">
      <path d="M21 16.5c0 .38-.21.71-.53.88l-7.9 4.44c-.36.2-.8.2-1.14 0l-7.9-4.44A.991.991 0 013 16.5v-9c0-.38.21-.71.53-.88l7.9-4.44c.36-.2.8-.2 1.14 0l7.9 4.44c.32.17.53.5.53.88v9z" />
    </svg>
  );

  const topNavLogo =
    config.topNavHeadingIconStyle === 'navicon'
      ? topNavNavIcon
      : config.topNavHeadingIconStyle === 'icon'
        ? topNavBareIcon
        : undefined;

  const topNavHeadingMenu = (
    <>
      <XDSNavMenuItem label="Sibling Product 1" onClick={() => {}} />
      <XDSNavMenuItem label="Sibling Product 2" onClick={() => {}} />
      <XDSNavMenuItem label="Sibling Product 3" onClick={() => {}} />
    </>
  );

  const topNavHeading =
    config.showTopNavHeading && config.topNavHeadingStyle !== 'none' ? (
      <XDSTopNavHeading
        logo={topNavLogo}
        heading="Shell Lab"
        headingHref={
          config.topNavHeadingStyle === 'link' ||
          config.topNavHeadingStyle === 'full'
            ? '#'
            : undefined
        }
        superheading={config.showTopNavSuperheading ? 'Acme Suite' : undefined}
        superheadingHref={config.showTopNavSuperheading ? '#' : undefined}
        subheading={
          config.showTopNavSubheading ? 'Business Account' : undefined
        }
        menu={
          config.topNavHeadingStyle === 'menu' ||
          config.topNavHeadingStyle === 'full'
            ? topNavHeadingMenu
            : undefined
        }
      />
    ) : config.showTopNavHeading ? (
      <XDSTopNavHeading logo={topNavLogo} />
    ) : undefined;

  return (
    <XDSTopNav
      label="Shell Lab Navigation"
      heading={topNavHeading}
      startContent={config.topNavAlignment === 'start' ? navItems : undefined}
      centerContent={config.topNavAlignment === 'center' ? navItems : undefined}
      endContent={
        <>
          {config.topNavAlignment === 'end' && navItems}
          {onToggleCollapse && (
            <XDSButton
              label="Toggle sidebar"
              variant="ghost"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  width={16}
                  height={16}>
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              }
              onClick={onToggleCollapse}
              isIconOnly
            />
          )}
        </>
      }
    />
  );
}

// =============================================================================
// Main Page
// =============================================================================

const styles = stylex.create({
  configOverlay: {
    position: 'fixed',
    top: '16px',
    right: '16px',
    width: 360,
    maxHeight: 'calc(100vh - 32px)',
    overflowY: 'auto',
    zIndex: 10000,
  },
  content: {
    maxWidth: 800,
  },
  toggleButton: {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    zIndex: 10001,
  },
  padding4: {
    padding: 16,
  },
  customSearchBar: {
    paddingInline: 8,
    paddingBlock: 4,
  },
});

export default function ShellLabPage() {
  const [config, setConfig] = useState<ShellConfig>(DEFAULT_CONFIG);
  const [showConfig, setShowConfig] = useState(true);
  const [externalCollapsed, setExternalCollapsed] = useState(false);

  const handleConfigChange = useCallback((update: Partial<ShellConfig>) => {
    setConfig(prev => ({...prev, ...update}));
  }, []);

  // Build the mobileNav prop based on config
  const mobileNav: false | XDSMobileNavConfig | React.ReactNode | undefined =
    config.mobileNavMode === 'disabled'
      ? false
      : config.mobileNavMode === 'customContent'
        ? {
            breakpoint: config.sideNavBreakpoint,
            content: (
              <XDSMobileNav header="Custom Nav" side={config.mobileNavSide}>
                <XDSVStack gap={2} xstyle={styles.customSearchBar}>
                  <input
                    type="search"
                    placeholder="Search navigation..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-background-body)',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </XDSVStack>
                <XDSSideNavSection title="Quick Links">
                  <XDSSideNavItem label="Docs" href="#" />
                  <XDSSideNavItem label="Help Center" href="#" />
                </XDSSideNavSection>
                <XDSSideNavSection title="Navigation">
                  <XDSSideNavItem
                    label="Dashboard"
                    isSelected
                    href="#"
                    icon={DashboardIcon}
                  />
                  <XDSSideNavItem
                    label="Projects"
                    href="#"
                    icon={ProjectsIcon}
                  />
                  <XDSSideNavItem
                    label="Messages"
                    href="#"
                    icon={MessagesIcon}
                  />
                </XDSSideNavSection>
              </XDSMobileNav>
            ),
          }
        : config.mobileNavMode === 'customToggle'
          ? {hasToggle: false, breakpoint: config.sideNavBreakpoint} // auto drawer content, but no auto toggle
          : {breakpoint: config.sideNavBreakpoint}; // auto with breakpoint

  return (
    <>
      <XDSAppShell
        variant={config.variant}
        height={config.height}
        contentPadding={6}
        topNav={
          config.topNavMode === 'show' ? (
            <SampleTopNav
              config={config}
              onToggleCollapse={
                config.isCollapsible &&
                config.collapseToggleLocation === 'topnav'
                  ? () => setExternalCollapsed(v => !v)
                  : undefined
              }
            />
          ) : config.topNavMode === 'empty-component' ? (
            <EmptySlot />
          ) : undefined
        }
        sideNav={
          config.sideNavMode === 'show' ? (
            <SampleSideNav
              config={config}
              externalCollapsed={externalCollapsed}
              setExternalCollapsed={setExternalCollapsed}
            />
          ) : config.sideNavMode === 'empty-component' ? (
            <EmptySlot />
          ) : undefined
        }
        mobileNav={mobileNav}
        banner={
          config.showBanner ? (
            <XDSBanner
              status="info"
              title="Shell Lab — System announcement banner"
              container="section"
              isDismissable
            />
          ) : undefined
        }>
        <XDSVStack gap={6} xstyle={styles.content}>
          <XDSVStack gap={2}>
            <XDSHStack gap={3} vAlign="center">
              {config.mobileNavMode === 'customToggle' && (
                <XDSMobileNavToggle label="Open navigation" />
              )}
              <XDSHeading level={1}>Shell Lab</XDSHeading>
            </XDSHStack>
            <XDSText type="body" color="secondary">
              Use the configuration panel to experiment with different shell and
              navigation setups. Resize the browser to test responsive behavior
              and collapse breakpoints.
            </XDSText>
          </XDSVStack>

          <XDSCard>
            <XDSVStack gap={3} xstyle={styles.padding4}>
              <XDSHeading level={3}>Active Config</XDSHeading>
              <pre
                style={{
                  fontSize: 12,
                  overflow: 'auto',
                  padding: 12,
                  borderRadius: 8,
                  background: 'var(--color-background-body)',
                }}>
                {JSON.stringify(config, null, 2)}
              </pre>
            </XDSVStack>
          </XDSCard>

          {Array.from({length: 10}, (_, i) => (
            <XDSCard key={i}>
              <XDSVStack gap={2} xstyle={styles.padding4}>
                <XDSHeading level={4}>Content Block {i + 1}</XDSHeading>
                <XDSText type="body" color="secondary">
                  Sample content to test scroll behavior in fill vs auto height
                  mode. The shell should handle overflow correctly regardless of
                  content length.
                </XDSText>
              </XDSVStack>
            </XDSCard>
          ))}
        </XDSVStack>
      </XDSAppShell>

      {/* Floating config panel */}
      {showConfig && (
        <div
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            width: 360,
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto' as const,
            zIndex: 10000,
          }}>
          <ConfigPanel config={config} onChange={handleConfigChange} />
        </div>
      )}

      {/* Toggle config visibility */}
      <div style={{position: 'fixed', bottom: 16, right: 16, zIndex: 10001}}>
        <button
          onClick={() => setShowConfig(v => !v)}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--color-accent)',
            color: 'white',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
          }}>
          {showConfig ? '✕ Hide Config' : '⚙ Config'}
        </button>
      </div>
    </>
  );
}
