'use client';

import {useState, useCallback} from 'react';
import * as stylex from '@stylexjs/stylex';

import {XDSAppShell} from '@xds/core/AppShell';
import {
  XDSSideNav,
  XDSSideNavHeading,
  XDSSideNavItem,
  XDSSideNavSection,
} from '@xds/core/SideNav';
import {
  XDSTopNav,
  XDSTopNavHeading,
  XDSTopNavItem,
  XDSTopNavMenu,
  XDSTopNavMegaMenu,
} from '@xds/core/TopNav';
import {XDSMobileNav} from '@xds/core/MobileNav';
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

// =============================================================================
// Configuration types
// =============================================================================

interface ShellConfig {
  variant: 'wash' | 'surface' | 'section' | 'elevated';
  height: 'fill' | 'auto';
  sideNavBreakpoint: 'sm' | 'md' | 'lg' | 'none';
  sideNavWidth: number;
  showSideNav: boolean;
  showTopNav: boolean;
  showBanner: boolean;
  showFooterIcons: boolean;
  showTopContent: boolean;
  showSideNavHeading: boolean;
  showNestedItems: boolean;
  defaultCollapsed: boolean;
  controlledCollapse: boolean;
  isCollapsed: boolean;
  mobileNavMode: 'auto' | 'custom' | 'none';
  mobileNavSide: 'start' | 'end';
  topNavAlignment: 'start' | 'center' | 'end';
  topNavStyle: 'items' | 'menus' | 'mega';
  showTopNavHeading: boolean;
}

const DEFAULT_CONFIG: ShellConfig = {
  variant: 'section',
  height: 'fill',
  sideNavBreakpoint: 'md',
  sideNavWidth: 260,
  showSideNav: true,
  showTopNav: true,
  showBanner: false,
  showFooterIcons: true,
  showTopContent: true,
  showSideNavHeading: true,
  showNestedItems: true,
  defaultCollapsed: false,
  controlledCollapse: false,
  isCollapsed: false,
  mobileNavMode: 'auto',
  mobileNavSide: 'start',
  topNavAlignment: 'start',
  topNavStyle: 'items',
  showTopNavHeading: true,
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
            onChange={v => onChange({variant: v as 'wash' | 'surface' | 'section' | 'elevated'})}
            options={[
              {value: 'wash', label: 'Wash'},
              {value: 'surface', label: 'Surface'},
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
          <SelectorRow
            label="Breakpoint"
            value={config.sideNavBreakpoint}
            onChange={v =>
              onChange({sideNavBreakpoint: v as 'sm' | 'md' | 'lg' | 'none'})
            }
            options={[
              {value: 'sm', label: 'sm'},
              {value: 'md', label: 'md'},
              {value: 'lg', label: 'lg'},
              {value: 'none', label: 'none'},
            ]}
          />
        </XDSVStack>

        <XDSDivider />

        {/* Visibility */}
        <XDSVStack gap={3}>
          <XDSText type="label" weight="bold">
            Visibility
          </XDSText>
          <ToggleRow
            label="Side Nav"
            value={config.showSideNav}
            onChange={v => onChange({showSideNav: v})}
          />
          <ToggleRow
            label="Top Nav"
            value={config.showTopNav}
            onChange={v => onChange({showTopNav: v})}
          />
          <ToggleRow
            label="SideNav Heading"
            value={config.showSideNavHeading}
            onChange={v => onChange({showSideNavHeading: v})}
          />
          <ToggleRow
            label="Banner"
            value={config.showBanner}
            onChange={v => onChange({showBanner: v})}
          />
          <ToggleRow
            label="Footer Icons"
            value={config.showFooterIcons}
            onChange={v => onChange({showFooterIcons: v})}
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
            label="TopNav Heading"
            value={config.showTopNavHeading}
            onChange={v => onChange({showTopNavHeading: v})}
          />
        </XDSVStack>

        <XDSDivider />

        {/* Collapse */}
        <XDSVStack gap={3}>
          <XDSText type="label" weight="bold">
            Collapse
          </XDSText>
          <ToggleRow
            label="Default Collapsed"
            value={config.defaultCollapsed}
            onChange={v => onChange({defaultCollapsed: v})}
          />
          <ToggleRow
            label="Controlled"
            value={config.controlledCollapse}
            onChange={v => onChange({controlledCollapse: v})}
          />
          {config.controlledCollapse && (
            <ToggleRow
              label="Is Collapsed"
              value={config.isCollapsed}
              onChange={v => onChange({isCollapsed: v})}
            />
          )}
        </XDSVStack>

        <XDSDivider />

        {/* Mobile */}
        <XDSVStack gap={3}>
          <XDSText type="label" weight="bold">
            Mobile Nav
          </XDSText>
          <SelectorRow
            label="Mode"
            value={config.mobileNavMode}
            onChange={v =>
              onChange({mobileNavMode: v as 'auto' | 'custom' | 'none'})
            }
            options={[
              {value: 'auto', label: 'Auto'},
              {value: 'custom', label: 'Custom'},
              {value: 'none', label: 'None'},
            ]}
          />
          {config.mobileNavMode === 'custom' && (
            <SelectorRow
              label="Drawer Side"
              value={config.mobileNavSide}
              onChange={v => onChange({mobileNavSide: v as 'start' | 'end'})}
              options={[
                {value: 'start', label: 'Start'},
                {value: 'end', label: 'End'},
              ]}
            />
          )}
        </XDSVStack>

        <XDSDivider />

        {/* TopNav */}
        <XDSVStack gap={3}>
          <XDSText type="label" weight="bold">
            TopNav
          </XDSText>
          <SelectorRow
            label="Nav Alignment"
            value={config.topNavAlignment}
            onChange={v =>
              onChange({topNavAlignment: v as 'start' | 'center' | 'end'})
            }
            options={[
              {value: 'start', label: 'Start'},
              {value: 'center', label: 'Center'},
              {value: 'end', label: 'End'},
            ]}
          />
          <SelectorRow
            label="Nav Style"
            value={config.topNavStyle}
            onChange={v =>
              onChange({topNavStyle: v as 'items' | 'menus' | 'mega'})
            }
            options={[
              {value: 'items', label: 'Items'},
              {value: 'menus', label: 'Menus'},
              {value: 'mega', label: 'Mega'},
            ]}
          />
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

function SampleSideNav({config}: {config: ShellConfig}) {
  return (
    <XDSSideNav
      header={
        config.showSideNavHeading ? (
          <XDSSideNavHeading
            icon={
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
            }
            heading="Shell Lab"
            headingHref="#"
          />
        ) : undefined
      }
      topContent={
        config.showTopContent ? (
          <XDSSideNavItem label="Create New" />
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
                  width="20"
                  height="20">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                  <circle cx="12" cy="17" r=".5" fill="currentColor" />
                </svg>
              }
              variant="ghost"
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
                  width="20"
                  height="20">
                  <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              }
              variant="ghost"
            />
          </>
        ) : undefined
      }>
      <XDSSideNavSection title="Navigation">
        <XDSSideNavItem label="Dashboard" isSelected href="#" />
        <XDSSideNavItem
          label="Projects"
          href="#"
          endContent={<XDSBadge>3</XDSBadge>}
        />
        <XDSSideNavItem label="Messages" href="#" />
        {config.showNestedItems && (
          <XDSSideNavItem label="Settings" href="#">
            <XDSSideNavItem label="General" href="#" />
            <XDSSideNavItem label="Security" href="#" />
            <XDSSideNavItem label="Notifications" href="#" />
          </XDSSideNavItem>
        )}
      </XDSSideNavSection>
      <XDSSideNavSection title="Resources">
        <XDSSideNavItem label="Documentation" href="#" />
        <XDSSideNavItem label="API Reference" href="#" />
        <XDSSideNavItem label="Support" href="#" />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

function SampleTopNav({config}: {config: ShellConfig}) {
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
          {title: 'Integrations', description: 'Connect your tools', href: '#'},
        ]}
        featured={{
          title: 'New: AI Features',
          description:
            'Explore our latest AI-powered analytics tools for faster insights.',
          linkText: 'Learn more →',
          linkHref: '#',
        }}
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

  return (
    <XDSTopNav
      label="Shell Lab Navigation"
      heading={
        config.showTopNavHeading ? (
          <XDSTopNavHeading
            heading="Shell Lab"
            logo={
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
            }
          />
        ) : undefined
      }
      startContent={config.topNavAlignment === 'start' ? navItems : undefined}
      centerContent={config.topNavAlignment === 'center' ? navItems : undefined}
      endContent={config.topNavAlignment === 'end' ? navItems : undefined}
    />
  );
}

// =============================================================================
// Main Page
// =============================================================================

const styles = stylex.create({
  configOverlay: {
    position: 'fixed',
    top: 16,
    right: 16,
    width: 360,
    maxHeight: 'calc(100vh - 32px)',
    overflowY: 'auto',
    zIndex: 1000,
  },
  content: {
    padding: 24,
    maxWidth: 800,
  },
  toggleButton: {
    position: 'fixed',
    bottom: 16,
    right: 16,
    zIndex: 1001,
  },
  padding4: {
    padding: 16,
  },
});

export default function ShellLabPage() {
  const [config, setConfig] = useState<ShellConfig>(DEFAULT_CONFIG);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showConfig, setShowConfig] = useState(true);

  const handleConfigChange = useCallback((update: Partial<ShellConfig>) => {
    setConfig(prev => ({...prev, ...update}));
  }, []);

  const collapseProps = config.controlledCollapse
    ? {
        isSideNavCollapsed: config.isCollapsed,
        onSideNavCollapsedChange: (v: boolean) =>
          handleConfigChange({isCollapsed: v}),
      }
    : {defaultIsSideNavCollapsed: config.defaultCollapsed};

  const mobileNav =
    config.mobileNavMode === 'custom' ? (
      <XDSMobileNav
        isOpen={isMobileNavOpen}
        onOpenChange={setIsMobileNavOpen}
        title="Navigation"
        side={config.mobileNavSide}>
        <XDSSideNavSection title="Navigation">
          <XDSSideNavItem label="Dashboard" isSelected href="#" />
          <XDSSideNavItem label="Projects" href="#" />
          <XDSSideNavItem label="Messages" href="#" />
        </XDSSideNavSection>
      </XDSMobileNav>
    ) : config.mobileNavMode === 'none' ? (
      <></>
    ) : undefined;

  return (
    <>
      <XDSAppShell
        variant={config.variant}
        height={config.height}
        sideNavBreakpoint={config.sideNavBreakpoint}
        sideNavWidth={config.sideNavWidth}
        topNav={
          config.showTopNav ? <SampleTopNav config={config} /> : undefined
        }
        sideNav={
          config.showSideNav ? <SampleSideNav config={config} /> : undefined
        }
        mobileNav={mobileNav}
        banner={
          config.showBanner ? (
            <XDSBanner
              status="info"
              title="Shell Lab — System announcement banner"
              variant="section"
              isDismissable
            />
          ) : undefined
        }
        {...collapseProps}>
        <div {...stylex.props(styles.content)}>
          <XDSVStack gap={6}>
            <XDSVStack gap={2}>
              <XDSHeading level={1}>Shell Lab</XDSHeading>
              <XDSText type="body" color="secondary">
                Use the configuration panel to experiment with different shell
                and navigation setups. Resize the browser to test responsive
                behavior and collapse breakpoints.
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
                    background: 'var(--color-wash)',
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
                    Sample content to test scroll behavior in fill vs auto
                    height mode. The shell should handle overflow correctly
                    regardless of content length.
                  </XDSText>
                </XDSVStack>
              </XDSCard>
            ))}
          </XDSVStack>
        </div>
      </XDSAppShell>

      {/* Floating config panel */}
      {showConfig && (
        <div {...stylex.props(styles.configOverlay)}>
          <ConfigPanel config={config} onChange={handleConfigChange} />
        </div>
      )}

      {/* Toggle config visibility */}
      <div {...stylex.props(styles.toggleButton)}>
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
