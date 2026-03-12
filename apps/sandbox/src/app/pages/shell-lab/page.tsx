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
import {XDSTopNav, XDSTopNavHeading, XDSTopNavItem} from '@xds/core/TopNav';
import {XDSMobileNav} from '@xds/core/MobileNav';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSSelector, XDSSelectorOption} from '@xds/core/Selector';
import {XDSCard} from '@xds/core/Card';
import {XDSDivider} from '@xds/core/Divider';
import {XDSBadge} from '@xds/core/Badge';

// =============================================================================
// Configuration types
// =============================================================================

interface ShellConfig {
  background: 'wash' | 'surface';
  height: 'fill' | 'auto';
  sideNavBreakpoint: 'sm' | 'md' | 'lg' | 'xl';
  sideNavWidth: number;
  showSideNav: boolean;
  showTopNav: boolean;
  showBanner: boolean;
  showFooterIcons: boolean;
  showTopContent: boolean;
  showNestedItems: boolean;
  defaultCollapsed: boolean;
  controlledCollapse: boolean;
  isCollapsed: boolean;
  mobileNavMode: 'auto' | 'custom' | 'none';
  mobileNavSide: 'start' | 'end';
  topNavAlignment: 'start' | 'center' | 'end';
  showTopNavHeading: boolean;
}

const DEFAULT_CONFIG: ShellConfig = {
  background: 'wash',
  height: 'fill',
  sideNavBreakpoint: 'md',
  sideNavWidth: 260,
  showSideNav: true,
  showTopNav: true,
  showBanner: false,
  showFooterIcons: true,
  showTopContent: true,
  showNestedItems: true,
  defaultCollapsed: false,
  controlledCollapse: false,
  isCollapsed: false,
  mobileNavMode: 'auto',
  mobileNavSide: 'start',
  topNavAlignment: 'start',
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
      <XDSVStack gap={5} padding={4}>
        <XDSHeading level={3}>Shell Configuration</XDSHeading>

        {/* AppShell */}
        <XDSVStack gap={3}>
          <XDSText type="label" weight="bold">
            AppShell
          </XDSText>
          <SelectorRow
            label="Background"
            value={config.background}
            onChange={v => onChange({background: v as 'wash' | 'surface'})}
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
              onChange({sideNavBreakpoint: v as 'sm' | 'md' | 'lg' | 'xl'})
            }
            options={[
              {value: 'sm', label: 'sm'},
              {value: 'md', label: 'md'},
              {value: 'lg', label: 'lg'},
              {value: 'xl', label: 'xl'},
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
      <XDSSwitch isSelected={value} onChange={onChange} label={label} />
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
      <XDSSelector value={value} onChange={onChange}>
        {options.map(o => (
          <XDSSelectorOption key={o.value} value={o.value} label={o.label} />
        ))}
      </XDSSelector>
    </XDSHStack>
  );
}

// =============================================================================
// Sample Nav Content
// =============================================================================

function SampleSideNav({config}: {config: ShellConfig}) {
  return (
    <XDSSideNav
      header={<XDSSideNavHeading heading="Shell Lab" headingHref="#" />}
      topContent={
        config.showTopContent ? (
          <XDSSideNavItem label="Create New" />
        ) : undefined
      }
      footerIcons={
        config.showFooterIcons ? (
          <>
            <XDSSideNavItem label="Help" />
            <XDSSideNavItem label="Settings" />
          </>
        ) : undefined
      }>
      <XDSSideNavSection heading="Navigation">
        <XDSSideNavItem label="Dashboard" isSelected href="#" />
        <XDSSideNavItem
          label="Projects"
          href="#"
          endContent={<XDSBadge label="3" />}
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
      <XDSSideNavSection heading="Resources">
        <XDSSideNavItem label="Documentation" href="#" />
        <XDSSideNavItem label="API Reference" href="#" />
        <XDSSideNavItem label="Support" href="#" />
      </XDSSideNavSection>
    </XDSSideNav>
  );
}

function SampleTopNav({config}: {config: ShellConfig}) {
  const navItems = (
    <>
      <XDSTopNavItem label="Home" href="#" isSelected />
      <XDSTopNavItem label="Products" href="#" />
      <XDSTopNavItem label="Team" href="#" />
      <XDSTopNavItem label="Reports" href="#" />
    </>
  );

  return (
    <XDSTopNav
      label="Shell Lab Navigation"
      heading={
        config.showTopNavHeading ? (
          <XDSTopNavHeading heading="Shell Lab" />
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

const pageStyles = stylex.create({
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
    padding: '24px',
    maxWidth: '800px',
  },
  toggleButton: {
    position: 'fixed',
    bottom: 16,
    right: 16,
    zIndex: 1001,
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
        <XDSSideNavSection heading="Navigation">
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
        background={config.background}
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
            <div
              style={{
                padding: '8px 16px',
                background: 'var(--color-accent)',
                color: 'white',
                textAlign: 'center',
                fontSize: 14,
              }}>
              🔬 Shell Lab — System announcement banner
            </div>
          ) : undefined
        }
        {...collapseProps}>
        <div {...stylex.props(pageStyles.content)}>
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
              <XDSVStack gap={3} padding={4}>
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
                <XDSVStack gap={2} padding={4}>
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
        <div {...stylex.props(pageStyles.configOverlay)}>
          <ConfigPanel config={config} onChange={handleConfigChange} />
        </div>
      )}

      {/* Toggle config visibility */}
      <div {...stylex.props(pageStyles.toggleButton)}>
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
